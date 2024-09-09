import {check} from '@augment-vir/assert';
import {awaitedBlockingMap, type Logger} from '@augment-vir/common';
import {toPosixPath} from '@augment-vir/node';
import {readFile, writeFile} from 'node:fs/promises';
import {dirname, relative} from 'node:path/posix';
import {getRelativeImportPath} from '../../augments/path.js';
import {grep} from '../common/grep.js';
import {removeSingleImport} from '../common/remove-single-import.js';
import type {RenameParams} from './gather-rename-params.js';

export async function performRename(params: Readonly<RenameParams>, log: Logger) {
    const {cwd, newVarName, oldVarName, oldVarPath} = params;
    const potentialFilePaths = await grep(cwd, oldVarName);

    log.info(`Found potentially ${potentialFilePaths.length} files to refactor...\n\n`);

    const replacementRegExp = new RegExp(`\\b${oldVarName}\\b`, 'g');

    async function fixFile(filePath: string) {
        if (filePath === oldVarPath) {
            return false;
        }

        const contents = String(await readFile(filePath));
        const relativeOldVarImportPath = getRelativeImportPath({
            from: dirname(filePath),
            to: oldVarPath,
            cwd,
        });

        const hasImport =
            contents.includes(`'${toPosixPath(relativeOldVarImportPath)}`) ||
            contents.includes(`"${toPosixPath(relativeOldVarImportPath)}`);

        if (!hasImport || !contents.match(replacementRegExp)) {
            log.faint(`Skipping ${relative(cwd, filePath)}`);
            return false;
        }

        log.faint(`Refactoring ${relative(cwd, filePath)}...`);

        const fixedContents = addNewImport(
            filePath,
            params,
            replaceVarName(
                params,
                !newVarName || newVarName === oldVarName ? undefined : replacementRegExp,
                removeSingleImport(relativeOldVarImportPath, oldVarName, contents),
            ),
        );

        await writeFile(filePath, fixedContents);

        return true;
    }

    const count = (await awaitedBlockingMap(potentialFilePaths, fixFile)).filter(
        check.isTruthy,
    ).length;

    log.success(`Successfully refactored ${count} files.`);

    return count;
}

function addNewImport(
    currentFilePath: string,
    {cwd, newVarName, newVarPath, oldVarName, oldVarPath}: Readonly<RenameParams>,
    contents: string,
): string {
    return (
        `import {${newVarName || oldVarName}} from '${getRelativeImportPath({from: dirname(currentFilePath), to: newVarPath || oldVarPath, cwd})}';\n` +
        contents
    );
}

function replaceVarName(
    {newVarName}: Readonly<Pick<RenameParams, 'newVarName'>>,
    replacementRegExp: RegExp | undefined,
    contents: string,
): string {
    if (!replacementRegExp || !newVarName) {
        return contents;
    }

    return contents.replaceAll(replacementRegExp, newVarName);
}
