import {resolve} from 'node:path';

export function resolvePath(cwd: string, rawPath: string): string {
    if (!rawPath) {
        return '';
    } else if (isRelativePath(rawPath)) {
        return resolve(cwd, rawPath);
    } else {
        return rawPath;
    }
}

export function isRelativePath(path: string): boolean {
    return path.startsWith('./') || path.startsWith('../');
}
