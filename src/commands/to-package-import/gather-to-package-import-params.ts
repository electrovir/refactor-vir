import {assert} from '@augment-vir/assert';
import {toEnsuredNumber, type Logger} from '@augment-vir/common';
import {CliFlags} from '../../cli/cli-flags.js';
import {gatherParams} from '../common/gather-params.js';
import {loadLastParams, saveLastParams} from '../common/last-params.js';

export type ToPackageImportParams = {
    cwd: string;
    maxParentCount: number;
};

export async function gatherToPackageImportParams(
    log: Readonly<Logger>,
    flags: Readonly<CliFlags>,
): Promise<ToPackageImportParams> {
    if (flags.last) {
        const lastParams = await loadLastParams<ToPackageImportParams>('toPackageImport');

        if (lastParams) {
            log.faint('Using last params', lastParams);
            return lastParams;
        }
    }

    const params = await gatherParams(
        [
            {
                key: 'maxParentCount',
                question: "What's your desired max allowed '../' count? (enter a number)",
                assertValidInput(input) {
                    assert.isNumber(Number(input));
                },
            },
        ],
        log,
    );

    const toPackageImportParams = {
        cwd: params.cwd,
        maxParentCount: toEnsuredNumber(params.maxParentCount),
    };

    await saveLastParams('toPackageImport', toPackageImportParams);

    return toPackageImportParams;
}
