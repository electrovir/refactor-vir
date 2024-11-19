import {check} from '@augment-vir/assert';
import {mapObjectValues} from '@augment-vir/common';
import {extractRelevantArgs} from '@augment-vir/node';
import {commands, type Command} from '../command.js';
import {defaultCliFlags, type CliFlags} from './cli-flags.js';

const expectedCommandMessage = `Expected one of: ${Object.keys(commands).join(',')}`;

/**
 * Extracts a valid command name from the given raw args.
 *
 * @param rawArgs The raw list of raw args passed to the CLI command.
 */
export function extractCliArgs(
    rawArgs: ReadonlyArray<string>,
    fileName: string,
): {command: Command; flags: CliFlags} {
    const args = extractRelevantArgs({
        binName: 'rv',
        fileName,
        rawArgs,
    });

    const commandName = args[0];

    if (!commandName) {
        throw new Error(`Missing command. ${expectedCommandMessage}.`);
    } else if (!check.isKeyOf(commandName, commands)) {
        throw new Error(`Invalid command given: '${commandName}'. ${expectedCommandMessage}.`);
    }

    const flags = mapObjectValues(defaultCliFlags, (key) => args.includes(key));

    return {command: commandName, flags};
}
