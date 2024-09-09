import {assert} from '@augment-vir/assert';
import {type Logger} from '@augment-vir/common';
import {existsSync} from 'node:fs';
import {resolvePath} from '../../augments/path.js';
import {approveParams, gatherParams} from '../common/gather-params.js';

export type RemoveImportParams = Awaited<ReturnType<typeof gatherRemoveImportParams>>;

export async function gatherRemoveImportParams(log: Readonly<Logger>) {
    const params = await gatherParams(
        [
            {
                key: 'importPath',
                question: 'Enter the import path (start with ./ for relative paths):',
                assertValidInput(importPath, cwd) {
                    assert.isTruthy(importPath, 'No import path given.');
                    log.faint(resolvePath(cwd, importPath));

                    log.if(!existsSync(importPath)).warning(
                        `Warning: import does not exist: '${importPath}'`,
                    );
                },
            },
            {
                key: 'importVarName',

                question:
                    'Enter the imported var name to remove (leave blank to remove all imports from the path):',
                assertValidInput() {},
            },
        ],
        log,
    );

    await approveParams(
        params,
        [
            {
                key: 'importPath',
                label: 'import path',
            },
            {
                key: 'importVarName',
                label: 'import var name',
            },
        ],
        log,
    );

    return params;
}
