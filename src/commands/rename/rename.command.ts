import {type Logger} from '@augment-vir/common';
import {gatherRenameParams} from './gather-rename-params.js';
import {performTheRename} from './perform-rename.js';

/** Renames imports and updates their import paths. */
export async function rename(log: Readonly<Logger>) {
    const params = await gatherRenameParams(log);
    await performTheRename(params, log);
}
