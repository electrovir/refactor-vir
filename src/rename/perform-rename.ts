import {check} from '@augment-vir/assert';
import {awaitedBlockingMap, wrapString, type Logger} from '@augment-vir/common';
import {joinFilesToDir, runShellCommand, toPosixPath} from '@augment-vir/node';
import {readFile, writeFile} from 'node:fs/promises';
import {dirname, relative, sep} from 'node:path';
import type {RenameParams} from './rename-params.js';
import {resolvePathParams} from './rename-params.js';

export async function performTheRename(renameParams: Readonly<RenameParams>, log: Logger) {
    const params = resolvePathParams(renameParams);
    const {cwd, newVarName, oldVarName, oldVarPath} = params;
    const command = [
        'grep',
        '-rl',
        '--include',
        "'*/src/*.ts'",
        '--exclude',
        '*/node_modules/*',
        wrapString({value: oldVarName, wrapper: "'"}),
    ].join(' ');

    const {stdout} = await runShellCommand(command, {rejectOnError: true, cwd: cwd});
    const potentialFilePaths = joinFilesToDir(cwd, stdout.trim().split('\n')).sort();

    log.info(`Found potentially ${potentialFilePaths.length} files to refactor...\n\n`);

    const replacementRegExp = new RegExp(`\\b${oldVarName}\\b`, 'g');
    const importReplacementRegExp = new RegExp(`[\\s\\n]*\\b${oldVarName}\\b,?[\\s\\n]*`, 'g');

    async function fixFile(filePath: string) {
        if (filePath === oldVarPath) {
            return false;
        }

        const contents = String(await readFile(filePath));
        const relativeOldVarImportPath = getRelativeImportPath(dirname(filePath), oldVarPath);

        const hasImport =
            contents.includes(`'${toPosixPath(relativeOldVarImportPath)}`) ||
            contents.includes(`"${toPosixPath(relativeOldVarImportPath)}`);

        if (!hasImport) {
            return false;
        }

        log.faint(`Refactoring ${relative(cwd, filePath)}...`);

        const fixedContents = addNewImport(
            filePath,
            params,
            replaceVarName(
                params,
                !newVarName || newVarName === oldVarName ? undefined : replacementRegExp,
                removeOldImport(relativeOldVarImportPath, importReplacementRegExp, contents),
            ),
        );

        await writeFile(filePath, fixedContents);

        return true;
    }

    const results = await awaitedBlockingMap(potentialFilePaths, fixFile);

    return results.filter(check.isTruthy).length;
}

function getRelativeImportPath(from: string, to: string): string {
    const rawRelativeOldVarImportPath = relative(from, to).replace(
        /\.(?:ts|js|tsx|jsx|mjs|cjs|mts|cts)$/,
        '',
    );
    if (rawRelativeOldVarImportPath.startsWith('.')) {
        return rawRelativeOldVarImportPath;
    } else {
        return [
            '.',
            rawRelativeOldVarImportPath,
        ].join(sep);
    }
}

function removeOldImport(
    relativeOldVarPath: string,
    importReplacementRegExp: RegExp,
    contents: string,
): string {
    const pathSplits = contents.split(relativeOldVarPath);

    return pathSplits
        .map((pathSplit, index): string => {
            if (index === pathSplits.length - 1 || !pathSplit.includes('import {')) {
                return pathSplit;
            }

            const importSplits = pathSplit.split('import {');

            return importSplits
                .map((importSplit, index) => {
                    if (index === importSplits.length - 1) {
                        return importSplit.replace(importReplacementRegExp, '');
                    } else {
                        return importSplit;
                    }
                })
                .join('import {');
        })
        .join(relativeOldVarPath)
        .replaceAll(/import \{[\s\n]*\}[\s\n]+from[\s\n]+['"][^'";]+['"];?\n?/g, '');
}

function addNewImport(
    currentFilePath: string,
    {newVarName, newVarPath, oldVarName, oldVarPath}: Readonly<Omit<RenameParams, 'cwd'>>,
    contents: string,
): string {
    return (
        `import {${newVarName || oldVarName}} from '${getRelativeImportPath(dirname(currentFilePath), newVarPath || oldVarPath)}';\n` +
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
