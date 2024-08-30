import {wrapString, type Logger} from '@augment-vir/common';
import {glob} from 'node:fs/promises';
import {join, sep} from 'node:path';
import {prependToFile} from '../../augments/fs.js';
import type {AddImportParams} from './gather-add-import-params.js';

async function toArray<T>(asyncIterator: AsyncIterableIterator<T>): Promise<T[]> {
    const arr = [];
    for await (const i of asyncIterator) arr.push(i);
    return arr;
}

export async function performAddImport(params: Readonly<AddImportParams>, log: Readonly<Logger>) {
    const filePaths = await toArray(
        glob(params.fileGlob, {
            cwd: params.cwd,
            exclude(fileName) {
                return fileName.includes(wrapString({value: 'node_modules', wrapper: sep}));
            },
        }),
    );

    log.info(`Found ${filePaths.length} files to refactor...\n\n`);

    filePaths.forEach((filePath) => {
        log.faint(`Adding import to ${filePath}...`);
        prependToFile(join(params.cwd, filePath), params.importString + '\n');
    });

    log.success(`Successfully refactored ${filePaths.length} files.`);
}
