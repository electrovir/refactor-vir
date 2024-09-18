import {assert} from '@augment-vir/assert';
import {toEnsuredNumber, type Logger} from '@augment-vir/common';
import {CliFlags} from '../../cli/cli-flags.js';
import {gatherParams} from '../common/gather-params.js';

export type ToPackageImportParams = {
    cwd: string;
    maxParentCount: number;
};

export async function gatherToPackageImportParams(
    log: Readonly<Logger>,
    flags: Readonly<CliFlags>,
    commandName: string,
): Promise<ToPackageImportParams> {
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
        flags,
        commandName,
    );

    return {
        cwd: params.cwd,
        maxParentCount: toEnsuredNumber(params.maxParentCount),
    };
}
