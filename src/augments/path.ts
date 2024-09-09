import {resolve} from 'node:path';
import {relative, sep} from 'node:path/posix';
import type {Tagged} from 'type-fest';

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
    return (
        path.startsWith('./') ||
        path.startsWith('../') ||
        path.startsWith('.\\') ||
        path.startsWith('..\\')
    );
}

export function getRelativeImportPath({
    cwd,
    from,
    to,
}: {
    from: string;
    to: string;
    cwd: string;
}): string {
    const truncatedTo = removeExtension(to);

    if (!isRelativePath(truncatedTo)) {
        return truncatedTo;
    }

    const rawRelativeOldVarImportPath = relative(from, resolve(cwd, truncatedTo));

    if (isRelativePath(rawRelativeOldVarImportPath)) {
        return rawRelativeOldVarImportPath;
    } else {
        return [
            '.',
            rawRelativeOldVarImportPath,
        ].join(sep);
    }
}

export function removeExtension(path: string): string {
    return path.replace(/\.(?:ts|js|tsx|jsx|mjs|cjs|mts|cts)$/, '');
}

/**
 * A path in the current computer's file system. The format for this path is operating system
 * dependent.
 */
export type SystemPath = Tagged<string, 'system-path'>;
/** A path in the TS import system. This is always posix. */
export type ImportPath = Tagged<string, 'import-path'>;
