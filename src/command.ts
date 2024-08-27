import {rename} from './rename/rename.js';

/** All supported refactor-vir commands. */
export const commands = {
    /** The rename command. */
    rename,
} as const;

/** All supported refactor-vir command names. */
export type Command = keyof typeof commands;
