import type {Logger} from '@augment-vir/common';
import {gatherRemoveImportParams} from './gather-remove-import-params.js';
import {performRemoveImport} from './perform-remove-import.js';

/** Removes imports from files. */
export async function removeImport(log: Readonly<Logger>) {
    const params = await gatherRemoveImportParams();
    await performRemoveImport(params, log);
}
