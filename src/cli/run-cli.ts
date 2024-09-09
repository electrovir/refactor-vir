import {type Logger} from '@augment-vir/common';
import {commands} from '../command.js';
import {extractCliArgs} from './cli-args.js';

/** Run the CLI. */
export async function cli(
    /** The raw list of args passed to the CLI command. */
    rawArgs: ReadonlyArray<string>,
    log: Readonly<Logger>,
    /** Needed to determine where the args start in CLI mode. */
    cliFileName: string = '',
) {
    try {
        const {command, flags} = extractCliArgs(rawArgs, cliFileName);

        await commands[command](log, flags);
    } catch (error) {
        log.error(error);
        process.exit(1);
    }
}
