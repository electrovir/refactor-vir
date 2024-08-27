import {log, wait} from '@augment-vir/common';
import {askQuestion as baseAskQuestion} from '@augment-vir/node';
import {existsSync} from 'node:fs';
import {resolve} from 'node:path';

export type RenameParams = {
    cwd: string;
    oldVarName: string;
    oldVarPath: string;
    newVarName: string | undefined;
    newVarPath: string | undefined;
};

export function resolvePathParams(params: Readonly<RenameParams>): RenameParams {
    return {
        ...params,
        newVarPath: params.newVarPath ? resolve(params.cwd, params.newVarPath) : undefined,
        oldVarPath: resolve(params.cwd, params.oldVarPath),
    };
}

async function askQuestion(question: string) {
    return baseAskQuestion(`\n${question}`, {
        timeout: {
            minutes: 5,
        },
    });
}

export async function gatherParams(): Promise<RenameParams> {
    const cwd = resolve(await askQuestion('Enter the project path for refactoring:'));
    if (!existsSync(cwd)) {
        throw new Error(`Base path does not exist: '${cwd}'`);
    }
    log.faint(cwd);

    const oldVarName = await askQuestion('Enter the current var name:');
    const oldVarPath = resolve(cwd, await askQuestion('Enter the current var file path:'));
    log.faint(oldVarPath);

    log.if(!existsSync(oldVarPath)).warning(
        `Warning: current var path does not exist: '${oldVarPath}'`,
    );

    const newVarName =
        (await askQuestion('Enter the new var name (or leave empty to skip renaming):')) ||
        undefined;
    const newVarPath =
        resolve(
            cwd,
            await askQuestion(
                'Enter the new var file path (or leave empty to skip updating imports):',
            ),
        ) || undefined;

    log.if(!!newVarPath && !existsSync(newVarPath)).warning(
        `Warning: new var path does not exist: '${newVarPath}'`,
    );
    log.if(newVarPath === oldVarPath).warning(
        'Warning: new var path is identical to the old var path.',
    );

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
