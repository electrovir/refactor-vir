import {log} from '@augment-vir/common';
import {existsSync} from 'node:fs';
import {resolvePath} from '../../augments/path.js';
import {approveParams, gatherParams} from '../common/gather-params.js';

export type RenameParams = Awaited<ReturnType<typeof gatherRenameParams>>;

export async function gatherRenameParams() {
    const params = await gatherParams([
        {
            key: 'oldVarName',
            question: 'Enter the current var name:',
            verifyInput() {},
        },
        {
            key: 'oldVarPath',
            question: 'Enter the current var file path (start with ./ for relative paths):',
            verifyInput(oldVarPath, cwd) {
                log.faint(resolvePath(cwd, oldVarPath));

                log.if(!existsSync(oldVarPath)).warning(
                    `Warning: current var path does not exist: '${oldVarPath}'`,
                );
            },
        },
        {
            key: 'newVarName',
            question: 'Enter the new var name, or leave empty to skip renaming:',
            verifyInput() {},
        },
        {
            key: 'newVarPath',
            question:
                'Enter the new var file path, or leave empty to skip updating import paths (start with ./ for relative paths):',
            verifyInput(newVarPath, cwd) {
                const resolvedNewVarPath = resolvePath(cwd, newVarPath);
                log.if(!!resolvedNewVarPath && !existsSync(resolvedNewVarPath)).warning(
                    `Warning: new var path does not exist: '${resolvedNewVarPath}'`,
                );
                if (newVarPath) {
                    log.faint(resolvePath(cwd, newVarPath));
                }
            },
        },
    ]);

    log.if(params.newVarPath === params.oldVarPath).warning(
        'Warning: new var path is identical to the old var path.',
    );

    if (!params.newVarPath && !params.newVarName) {
        throw new Error("No new var name or path provided: there's nothing to refactor.");
    }

    await approveParams(params, [
        {
            key: 'oldVarName',
            label: 'old var name',
        },
        {
            key: 'oldVarPath',
            label: 'old var path',
        },
        {
            key: 'newVarName',
            label: 'new var name',
        },
        {
            key: 'newVarPath',
            label: 'new var path',
        },
    ]);

    return params;
}
