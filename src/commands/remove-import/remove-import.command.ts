import type {Logger} from '@augment-vir/common';
import {CliFlags} from '../../cli/cli-flags.js';
import {gatherRemoveImportParams} from './gather-remove-import-params.js';
import {performRemoveImport} from './perform-remove-import.js';

/** Removes imports from files. */
export async function removeImport(
    log: Readonly<Logger>,
    flags: Readonly<CliFlags>,
    commandName: string,
) {
    const params = await gatherRemoveImportParams(log, flags, commandName);
    await performRemoveImport(params, log);
}
