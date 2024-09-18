import {awaitedForEach, escapeStringForRegExp, type Logger} from '@augment-vir/common';
import {readFile} from 'node:fs/promises';
import {basename, join, relative} from 'node:path';
import {dirname} from 'node:path/posix';
import {PackageCache, findParentPackage} from '../../augments/npm.js';
import {
    extensionsForRegExp,
    isRelativePath,
    removeExtension,
    resolvePath,
} from '../../augments/path.js';
import {grep} from '../common/grep.js';
import type {ListDependentsParams} from './gather-list-dependents-params.js';

export async function performListDependents(
    {cwd, rootFile}: Readonly<ListDependentsParams>,
    log: Logger,
) {
    const packageCache: PackageCache = {};

    log.faint(`\nFinding all files depending on '${relative(cwd, resolvePath(cwd, rootFile))}'\n`);

    await listDependents({currentFile: resolvePath(cwd, rootFile), cwd}, 0, log, [], packageCache);
}

async function listDependents(
    {cwd, currentFile}: {cwd: string; currentFile: string},
    currentIndent: number,
    log: Logger,
    visitedFiles: string[],
    packageCache: PackageCache,
) {
    if (visitedFiles.includes(currentFile)) {
        log.error(`Circular dependency detected to '${currentFile}'`);
    }

    const baseFileName = basename(removeExtension(currentFile));
    const parentPackage = await findParentPackage(currentFile, packageCache);
    const currentFilePackagePath = join(
        parentPackage.name,
        relative(parentPackage.path, removeExtension(currentFile)),
    );

    const potentialDependents = await grep(cwd, baseFileName);

    await awaitedForEach(potentialDependents, async (dependentFilePath) => {
        const rawRelativeImportPath = relative(
            dirname(dependentFilePath),
            removeExtension(currentFile),
        );
        const relativeImportPath = isRelativePath(rawRelativeImportPath)
            ? rawRelativeImportPath
            : './' + rawRelativeImportPath;

        const fileContents = String(await readFile(dependentFilePath));
        const importRegExps = [
            /** Static, direct import. */
            new RegExp(
                `from ['"]${escapeStringForRegExp(relativeImportPath)}(?:\\.(?:${extensionsForRegExp}))?['"]`,
            ),
            /** Static, package import. */
            new RegExp(
                `from ['"]${escapeStringForRegExp(currentFilePackagePath)}(?:\\.(?:${extensionsForRegExp}))?['"]`,
            ),
            /** Dynamic, direct import. */
            new RegExp(
                `\\bimport\\(\\s*['"]${escapeStringForRegExp(relativeImportPath)}(?:\\.(?:${extensionsForRegExp}))?['"]\\\\s*\\)`,
            ),
            /** Dynamic, package import. */
            new RegExp(
                `\\bimport\\(\\s*['"]${escapeStringForRegExp(currentFilePackagePath)}(?:\\.(?:${extensionsForRegExp}))?['"]\\\\s*\\)`,
            ),
        ];

        if (!importRegExps.some((regExp) => regExp.exec(fileContents))) {
            // this file is not actually part of the dependency chain
            return;
        }

        log.plain(' '.repeat(4).repeat(currentIndent) + relative(cwd, dependentFilePath));

        await listDependents(
            {cwd, currentFile: dependentFilePath},
            currentIndent + 1,
            log,
            [
                ...visitedFiles,
                currentFile,
            ],
            packageCache,
        );
    });
}
