import {escapeStringForRegExp} from '@augment-vir/common';

export function removeSingleImport(
    relativeImportPath: string,
    removeVarName: string | undefined,
    contents: string,
): string {
    if (removeVarName) {
        return contents
            .replaceAll(
                new RegExp(
                    `(import \\{[^}'"]*)\\b${removeVarName}\\b,?[\\s\\n]*([^}]*\\}[\\s\n]+from[\\s\n]+['"]${escapeStringForRegExp(relativeImportPath)}(?:\\.ts|\\.mts|\\.cts|\\.tsx|\\.js|\\.mjs|\\.cjs|\\.jsx)?['"];?\n?)`,
                    'g',
                ),
                '$1$2',
            )
            .replaceAll(/import \{[\s\n,]*\}[\s\n]+from[\s\n]+['"][^'";]+['"];?\n?/g, '')
            .replaceAll(/,[\s\n]*\}/g, '}');
    } else {
        return contents.replaceAll(
            new RegExp(
                `import[^}'"]+}?[\\s\n]*(?:from[\\s\n]+)?['"]${escapeStringForRegExp(relativeImportPath)}(?:\\.ts|\\.mts|\\.cts|\\.tsx|\\.js|\\.mjs|\\.cjs|\\.jsx)?['"];?\n?`,
                'g',
            ),
            '',
        );
    }
}
