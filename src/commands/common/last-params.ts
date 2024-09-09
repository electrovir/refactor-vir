import type {AnyObject, JsonCompatibleObject} from '@augment-vir/common';
import {appendJsonFile, readJsonFile} from '@augment-vir/node';
import {mkdir} from 'node:fs/promises';
import {dirname} from 'node:path';
import {lastParamsPath} from '../../repo-paths.js';

export async function loadLastParams<T extends AnyObject>(
    commandName: string,
): Promise<T | undefined> {
    const contents = (await readJsonFile(lastParamsPath)) as undefined | JsonCompatibleObject;

    const lastCommandParams = contents?.[commandName];

    if (!lastCommandParams) {
        return undefined;
    }

    return lastCommandParams as T;
}

export async function saveLastParams(
    commandName: string,
    data: Readonly<AnyObject>,
): Promise<void> {
    await mkdir(dirname(lastParamsPath), {recursive: true});

    await appendJsonFile(lastParamsPath, {[commandName]: data});
}
