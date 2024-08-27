import {check} from '@augment-vir/assert';
import {extractRelevantArgs} from 'cli-args-vir';
import {commands, type Command} from '../command.js';

/**
 * Extracts a valid command name from the given raw args.
 *
 * @param rawArgs The raw list of raw args passed to the CLI command.
 */
export function extractCommandName(rawArgs: ReadonlyArray<string>, fileName: string): Command {
    const args = extractRelevantArgs({
        binName: 'rv',
        fileName,
        rawArgs,
    });

    const commandName = args[0];

    if (!commandName) {
        throw new Error(`Missing command. Expected one of: '${Object.keys(commands).join(',')}'.`);
    } else if (!check.isKeyOf(commandName, commands)) {
        throw new Error(
            `Invalid command given: '${commandName}'. Expected one of: '${Object.keys(commands).join(',')}'.`,
        );
    }

    return commandName;
}
