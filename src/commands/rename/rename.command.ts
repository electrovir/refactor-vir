import {type Logger} from '@augment-vir/common';
import {CliFlags} from '../../cli/cli-flags.js';
import {gatherRenameParams} from './gather-rename-params.js';
import {performRename} from './perform-rename.js';

/** Renames imports and updates their import paths. */
export async function rename(
    log: Readonly<Logger>,
    flags: Readonly<CliFlags>,
    commandName: string,
) {
    const params = await gatherRenameParams(log, flags, commandName);
    await performRename(params, log);
}
