import type {Logger} from '@augment-vir/common';
import {CliFlags} from '../../cli/cli-flags.js';
import {gatherListDependentsParams} from './gather-list-dependents-params.js';
import {performListDependents} from './perform-list-dependents.js';

/** Adds an import to files. */
export async function listDependents(
    log: Readonly<Logger>,
    flags: Readonly<CliFlags>,
    commandName: string,
) {
    const params = await gatherListDependentsParams(log, flags, commandName);
    await performListDependents(params, log);
}
