import {Logger} from '@augment-vir/common';
import {CliFlags} from '../../cli/cli-flags.js';
import {gatherToPackageImportParams} from './gather-to-package-import-params.js';
import {performToPackageImport} from './perform-to-package-import.js';

export async function toPackageImport(log: Readonly<Logger>, flags: Readonly<CliFlags>) {
    const params = await gatherToPackageImportParams(log, flags);
    await performToPackageImport(params, log);
}
