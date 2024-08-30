import type {Logger} from '@augment-vir/common';
import {gatherAddImportParams} from './gather-add-import-params.js';
import {performAddImport} from './perform-add-import.js';

/** Adds an import to files. */
export async function addImport(log: Readonly<Logger>) {
    const params = await gatherAddImportParams(log);
    await performAddImport(params, log);
}
