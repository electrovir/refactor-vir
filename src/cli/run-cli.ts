import {type Logger} from '@augment-vir/common';
import {commands} from '../command.js';
import {extractCommandName} from './cli-args.js';

/**
 * Run the CLI.
 *
 * @param args The raw list of raw args passed to the CLI command.
 */
export async function cli(args: ReadonlyArray<string>, log: Readonly<Logger>) {
    try {
        const commandName = extractCommandName(args, import.meta.filename);

        await commands[commandName](log);
    } catch (error) {
        log.error(error);
        process.exit(1);
    }
}
