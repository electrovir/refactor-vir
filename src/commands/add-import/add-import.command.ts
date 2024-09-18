import type {Logger} from '@augment-vir/common';
import {CliFlags} from '../../cli/cli-flags.js';
import {gatherAddImportParams} from './gather-add-import-params.js';
import {performAddImport} from './perform-add-import.js';

/** Adds an import to files. */
export async function addImport(
    log: Readonly<Logger>,
    flags: Readonly<CliFlags>,
    commandName: string,
) {
    const params = await gatherAddImportParams(log, flags, commandName);
    await performAddImport(params, log);
}
