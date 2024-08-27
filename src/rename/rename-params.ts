import {log, wait} from '@augment-vir/common';
import {askQuestion as baseAskQuestion} from '@augment-vir/node';
import {existsSync} from 'node:fs';
import {resolvePath} from '../augments/path.js';

export type RenameParams = {
    cwd: string;
    oldVarName: string;
    oldVarPath: string;
    newVarName: string | undefined;
    newVarPath: string | undefined;
};

async function askQuestion(question: string) {
    return baseAskQuestion(`\n${question}`, {
        timeout: {
            minutes: 5,
        },
    });
}

export async function gatherParams(): Promise<RenameParams> {
    const cwd = resolvePath(
        process.cwd(),
        await askQuestion(
            'Enter the project path for refactoring (start with ./ for relative paths):',
        ),
    );

    if (!existsSync(cwd)) {
        throw new Error(`Base path does not exist: '${cwd}'`);
    }
    log.faint(cwd);

    const oldVarName = await askQuestion('Enter the current var name:');
    const oldVarPath = await askQuestion(
        'Enter the current var file path (start with ./ for relative paths):',
    );
    log.faint(resolvePath(cwd, oldVarPath));

    log.if(!existsSync(oldVarPath)).warning(
        `Warning: current var path does not exist: '${oldVarPath}'`,
    );

    const newVarName =
        (await askQuestion('Enter the new var name, or leave empty to skip renaming:')) ||
        undefined;
    const newVarPath =
        (await askQuestion(
            'Enter the new var file path, or leave empty to skip updating import paths (start with ./ for relative paths):',
        )) || undefined;

    const resolvedNewVarPath = newVarPath ? resolvePath(cwd, newVarPath) : undefined;

    log.if(!!resolvedNewVarPath && !existsSync(resolvedNewVarPath)).warning(
        `Warning: new var path does not exist: '${resolvedNewVarPath}'`,
    );
    log.if(newVarPath === oldVarPath).warning(
        'Warning: new var path is identical to the old var path.',
    );
    if (newVarPath) {
        log.faint(resolvePath(cwd, newVarPath));
    }

    if (!newVarPath && !newVarName) {
        throw new Error("No new var name or path provided: there's nothing to refactor.");
    }

    log.info(`\n\nproject path: ${cwd}\n`);
    log.info(`old var name: ${oldVarName}`);
    log.info(`old var path: ${oldVarPath}\n`);
    log.if(!!newVarName).info(`new var name: ${newVarName}`);
    log.if(!!newVarPath).info(`new var path: ${newVarPath}\n`);

    await wait({seconds: 2});

    const shouldProceed = (await askQuestion('Does this look right? Should we proceed? (y/N):'))
        .toLowerCase()
        .startsWith('y');

    if (!shouldProceed) {
        throw new Error('Aborted by user.');
    }

    return {
        cwd,
        newVarName,
        newVarPath,
        oldVarName,
        oldVarPath,
    };
}
