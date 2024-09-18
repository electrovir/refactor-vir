import type {Logger, MaybePromise} from '@augment-vir/common';
import type {CliFlags} from './cli/cli-flags.js';
import {addImport} from './commands/add-import/add-import.command.js';
import {listDependents} from './commands/list-dependents/list-dependents.command.js';
import {removeImport} from './commands/remove-import/remove-import.command.js';
import {rename} from './commands/rename/rename.command.js';
import {toPackageImport} from './commands/to-package-import/to-package-import.command.js';

/** All supported refactor-vir commands. */
export const commands = {
    /** Renames imports and updates their import paths. */
    rename,
    /** Removes imports from files. */
    removeImport,
    /** Adds an import to files. */
    addImport,
    /** Replaces relative imports with package imports. */
    toPackageImport,
    /** Prints all dependents of a given file to the command line. */
    listDependents,
} as const satisfies Record<
    string,
    (log: Readonly<Logger>, flags: Readonly<CliFlags>, commandName: string) => MaybePromise<void>
>;

/** All supported refactor-vir command names. */
export type Command = keyof typeof commands;
