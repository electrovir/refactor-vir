import {describe, it, type UniversalTestContext} from '@augment-vir/test';
import {join} from 'node:path';
import {testFilesPath} from '../../repo-paths.js';
import {testCommand} from '../common/test-command.mock.js';
import type {RemoveImportParams} from './gather-remove-import-params.js';
import {performRemoveImport} from './perform-remove-import.js';

describe(performRemoveImport.name, () => {
    async function testPerformTheRename(
        context: Readonly<UniversalTestContext>,
        params: RemoveImportParams,
    ) {
        await testCommand(context, params.cwd, async (log) => performRemoveImport(params, log));
    }

    it('works on an single import var removal', async (context) => {
        await testPerformTheRename(context, {
            cwd: join(testFilesPath, 'remove-import', 'single-var'),
            importPath: './src/a.ts',
            importVarName: 'oldVarA',
        });
    });
    it('works on entire import removal', async (context) => {
        await testPerformTheRename(context, {
            cwd: join(testFilesPath, 'remove-import', 'entire-import'),
            importPath: './src/a.ts',
            importVarName: '',
        });
    });
});
