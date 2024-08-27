import {join, resolve} from 'node:path';

export const monoRepoPath = resolve(import.meta.dirname, '..');
export const testFilesPath = join(monoRepoPath, 'test-files');
