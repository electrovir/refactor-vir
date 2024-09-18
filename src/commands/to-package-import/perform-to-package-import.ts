import {assert} from '@augment-vir/assert';
import {
    awaitedForEach,
    escapeStringForRegExp,
    Logger,
    safeMatch,
    wrapString,
} from '@augment-vir/common';
import {toPosixPath} from '@augment-vir/node';
import {readFile, writeFile} from 'node:fs/promises';
import {dirname, join, relative, resolve} from 'node:path';
import {findParentPackage, type PackageCache, type PackageCacheEntry} from '../../augments/npm.js';
import type {ImportPath} from '../../augments/path.js';
import {grep} from '../common/grep.js';
import {ToPackageImportParams} from './gather-to-package-import-params.js';

/** Replaces relative imports with package imports. */
export async function performToPackageImport(
    {cwd, maxParentCount}: Readonly<ToPackageImportParams>,
    log: Readonly<Logger>,
) {
    const potentialFilePaths = await grep(cwd, '../');

    log.info(`Found potentially ${potentialFilePaths.length} files to refactor...\n\n`);

    const packageCache: PackageCache = {};

    let count = 0;

    await awaitedForEach(potentialFilePaths, async (filePath) => {
        const originalContents = String(await readFile(filePath));

        let newContents = originalContents;
        const parentImports = safeMatch(originalContents, /from ["']\.\.\/[^;]*['"];/g);

        if (!parentImports.length) {
            return;
        }

        const parentPackage = await findParentPackage(filePath, packageCache);

        await awaitedForEach(parentImports, async (parentImport) => {
            const [
                ,
                relativeImport,
            ] = safeMatch(parentImport, /from ['"]([^;]+?)['"];/);
            assert.isDefined(
                relativeImport,
                `Failed to extract import path from '${parentImport}'`,
            );

            const newPath = await calculateNewPath({
                filePath,
                maxParentCount,
                packageCache,
                parentPackage,
                relativeImport,
            });

            if (newPath) {
                const replacementRegExp = new RegExp(
                    `['"]${escapeStringForRegExp(toPosixPath(relativeImport))}['"]`,
                    'g',
                );
                newContents = newContents.replaceAll(
                    replacementRegExp,
                    wrapString({value: newPath, wrapper: "'"}),
                );
            }
        });

        if (newContents !== originalContents) {
            count++;
            log.faint(`Refactoring ${relative(cwd, filePath)}...`);
            await writeFile(filePath, newContents);
        }
    });

    log.success(`Successfully refactored ${count} files.`);
}

async function calculateNewPath({
    filePath,
    relativeImport,
    parentPackage,
    maxParentCount,
    packageCache,
}: {
    filePath: string;
    relativeImport: string;
    parentPackage: Readonly<PackageCacheEntry>;
    maxParentCount: number;
    packageCache: PackageCache;
}): Promise<ImportPath | undefined> {
    const importedFilePath = resolve(dirname(filePath), relativeImport);
    const isInCurrentPackage = !relative(parentPackage.path, importedFilePath).startsWith('..');

    if (isInCurrentPackage) {
        const parentCount = relativeImport.split('..').length - 1;
        if (parentCount > maxParentCount) {
            return toPosixPath(
                join(parentPackage.name, relative(parentPackage.path, importedFilePath)),
            ) as ImportPath;
        }
    } else {
        const importedPackage = await findParentPackage(importedFilePath, packageCache);

        return toPosixPath(
            join(importedPackage.name, relative(importedPackage.path, importedFilePath)),
        ) as ImportPath;
    }

    return undefined;
}
