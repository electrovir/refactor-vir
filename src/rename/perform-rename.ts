import {check} from '@augment-vir/assert';
import {awaitedBlockingMap, wrapString, type Logger} from '@augment-vir/common';
import {joinFilesToDir, runShellCommand, toPosixPath} from '@augment-vir/node';
import {readFile, writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {dirname, relative, sep} from 'node:path/posix';
import {isRelativePath} from '../augments/path.js';
import type {RenameParams} from './rename-params.js';

export async function performTheRename(params: Readonly<RenameParams>, log: Logger) {
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
                removeOldImport(relativeOldVarImportPath, importReplacementRegExp, contents),
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

function getRelativeImportPath({cwd, from, to}: {from: string; to: string; cwd: string}): string {
    const truncatedTo = to.replace(/\.(?:ts|js|tsx|jsx|mjs|cjs|mts|cts)$/, '');

    if (!isRelativePath(truncatedTo)) {
        return truncatedTo;
    }

    const rawRelativeOldVarImportPath = relative(from, resolve(cwd, truncatedTo));

    if (isRelativePath(rawRelativeOldVarImportPath)) {
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
