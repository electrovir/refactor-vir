import {removeImport} from './commands/remove-import/remove-import.js';
import {rename} from './commands/rename/rename.js';

/** All supported refactor-vir commands. */
export const commands = {
    /** {@inheritDoc rename} */
    rename,
    /** {@inheritDoc removeImport} */
    removeImport,
} as const;

/** All supported refactor-vir command names. */
export type Command = keyof typeof commands;
