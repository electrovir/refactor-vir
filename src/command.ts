import {addImport} from './commands/add-import/add-import.command.js';
import {removeImport} from './commands/remove-import/remove-import.command.js';
import {rename} from './commands/rename/rename.command.js';

/** All supported refactor-vir commands. */
export const commands = {
    /** Renames imports and updates their import paths. */
    rename,
    /** Removes imports from files. */
    removeImport,
    /** Adds an import to files. */
    addImport,
} as const;

/** All supported refactor-vir command names. */
export type Command = keyof typeof commands;
