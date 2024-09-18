import {ArrayElement, MaybePromise, awaitedForEach, wait, type Logger} from '@augment-vir/common';
import {askQuestion as baseAskQuestion} from '@augment-vir/node';
import {existsSync} from 'node:fs';
import {CliFlags} from '../../cli/cli-flags.js';
import {loadLastParams, saveLastParams} from './last-params.js';

export type GatherParamConfig = {
    key: string;
    question: string;
    assertValidInput(input: string, cwd: string): MaybePromise<void>;
};

export type GatheredParams<Config extends ReadonlyArray<Readonly<GatherParamConfig>>> = Record<
    ArrayElement<Config>['key'] | 'cwd',
    string
>;

async function askQuestion(question: string) {
    return baseAskQuestion(`\n${question}`, {
        timeout: {
            minutes: 5,
        },
    });
}

export async function gatherParams<const Configs extends GatherParamConfig[]>(
    configs: Configs,
    log: Readonly<Logger>,
    flags: Readonly<CliFlags>,
    commandName: string,
): Promise<GatheredParams<Configs>> {
    if (flags.last) {
        const lastParams = await loadLastParams(commandName);

        if (lastParams) {
            log.faint('Using last params', lastParams);
            return lastParams as GatheredParams<Configs>;
        }
    }

    const cwd = await getParam('', {
        question: 'Enter the project path for refactoring (start with ./ for relative paths):',
        assertValidInput(input) {
            if (!existsSync(input)) {
                throw new Error(`Base path does not exist: '${cwd}'`);
            }
            log.faint(input);
        },
    });

    const results: Record<string, string> = {cwd};

    await awaitedForEach(configs, async (config) => {
        results[config.key] = await getParam(cwd, config);
    });

    await saveLastParams(commandName, results);

    return results as GatheredParams<Configs>;
}

export async function getParam(cwd: string, config: Readonly<Omit<GatherParamConfig, 'key'>>) {
    const result = await askQuestion(config.question);
    await config.assertValidInput(result, cwd);
    return result;
}

export async function approveParams<const Params extends Record<string, string>>(
    params: Readonly<Params>,
    labels: ReadonlyArray<Readonly<{key: Exclude<keyof Params, 'cwd'>; label: string}>>,
    log: Readonly<Logger>,
) {
    log.info(`\n\nproject path: ${params.cwd}\n`);

    const labelLength = labels.reduce((longest, {label}) => {
        if (label.length > longest) {
            return label.length;
        } else {
            return longest;
        }
    }, 0);

    labels.forEach(({key, label}) => {
        const value = params[key] || '<blank>';

        const paddedLabel = `${label}: `.padEnd(labelLength + 2, ' ');

        log.info(`${paddedLabel} ${value}`);
    });

    await wait({seconds: 2});

    await getParam('', {
        question: 'Does this look right? Should we proceed? (y/N):',
        assertValidInput(input) {
            if (!input.toLowerCase().startsWith('y')) {
                throw new Error('Aborted by user.');
            }
        },
    });
}
