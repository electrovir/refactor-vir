import {check} from '@augment-vir/assert';
import {awaitedBlockingMap, type Logger} from '@augment-vir/common';
import {toPosixPath} from '@augment-vir/node';
import {readFile, writeFile} from 'node:fs/promises';
import {basename} from 'node:path';
import {dirname, relative} from 'node:path/posix';
import {getRelativeImportPath, removeExtension} from '../../augments/path.js';
import {grep} from '../common/grep.js';
import {removeSingleImport} from '../common/remove-single-import.js';
import type {RemoveImportParams} from './gather-remove-import-params.js';

export async function performRemoveImport(
    {cwd, importPath, importVarName}: Readonly<RemoveImportParams>,
    log: Readonly<Logger>,
) {
    const potentialFilePaths = await grep(cwd, removeExtension(basename(importPath)));

    const importReplacementRegExp = importVarName
        ? new RegExp(`[\\s\\n]*\\b${importVarName}\\b,?[\\s\\n]*`, 'g')
        : undefined;

    async function fixFile(filePath: string): Promise<boolean> {
        if (filePath === importPath) {
            return false;
        }

        const contents = String(await readFile(filePath));
        const relativeOldVarImportPath = getRelativeImportPath({
            from: dirname(filePath),
            to: importPath,
            cwd,
        });

        const hasImport =
            contents.includes(`'${toPosixPath(relativeOldVarImportPath)}`) ||
            contents.includes(`"${toPosixPath(relativeOldVarImportPath)}`);

        if (
            !hasImport ||
            !(importReplacementRegExp ? contents.match(importReplacementRegExp) : true)
        ) {
            log.faint(`Skipping ${relative(cwd, filePath)}`);
            return false;
        }

        log.faint(`Refactoring ${relative(cwd, filePath)}...`);

        const fixedContents = removeSingleImport(relativeOldVarImportPath, importVarName, contents);

        await writeFile(filePath, fixedContents);

        return true;
    }

    const count = (await awaitedBlockingMap(potentialFilePaths, fixFile)).filter(
        check.isTruthy,
    ).length;

    log.success(`Successfully refactored ${count} files.`);

    return count;
}
