import {closeSync, openSync, readFileSync, writeSync} from 'node:fs';

export function prependToFile(filePath: string, prepend: string): void {
    const data = readFileSync(filePath);
    const file = openSync(filePath, 'w+');
    const insert = Buffer.from(prepend);
    writeSync(file, insert, 0, insert.length, 0);
    writeSync(file, data, 0, data.length, insert.length);
    closeSync(file);
}
