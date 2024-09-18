import {Logger} from '@augment-vir/common';
import {CliFlags} from '../../cli/cli-flags.js';
import {gatherToPackageImportParams} from './gather-to-package-import-params.js';
import {performToPackageImport} from './perform-to-package-import.js';

export async function toPackageImport(
    log: Readonly<Logger>,
    flags: Readonly<CliFlags>,
    commandName: string,
) {
    const params = await gatherToPackageImportParams(log, flags, commandName);
    await performToPackageImport(params, log);
}
