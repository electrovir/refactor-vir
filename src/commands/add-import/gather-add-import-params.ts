import {assert} from '@augment-vir/assert';
import type {Logger} from '@augment-vir/common';
import {approveParams, gatherParams} from '../common/gather-params.js';

export type AddImportParams = Awaited<ReturnType<typeof gatherAddImportParams>>;

export async function gatherAddImportParams(log: Readonly<Logger>) {
    const params = await gatherParams(
        [
            {
                key: 'fileGlob',
                question: 'Enter a glob for files to match (leave empty to match all .ts files):',
                verifyInput() {},
            },
            {
                key: 'importString',
                question: 'Enter the import string to add:',
                verifyInput(importPath) {
                    assert.isTruthy(importPath, 'No import string given.');
                },
            },
        ],
        log,
    );

    await approveParams(
        params,
        [
            {
                key: 'fileGlob',
                label: 'file glob',
            },
            {
                key: 'importString',
                label: 'import string',
            },
        ],
        log,
    );

    return params;
}
