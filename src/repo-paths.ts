import {join, resolve} from 'node:path';

export const monoRepoPath = resolve(import.meta.dirname, '..');
export const testFilesPath = join(monoRepoPath, 'test-files');
export const lastParamsPath = join(monoRepoPath, 'node_modules', '.vir', 'last-params.json');
