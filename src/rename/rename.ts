import {log} from '@augment-vir/common';
import {performTheRename} from './perform-rename.js';
import {gatherParams} from './rename-params.js';

/**
 * Asks the user for input and renames all variables within all relevant found files that match the
 * user's inputs. Note that this requires a tty session so the user can provide the requested
 * responses.
 */
export async function rename() {
    const params = await gatherParams();
    await performTheRename(params, log);
}
