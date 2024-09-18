import {describe, it, UniversalTestContext} from '@augment-vir/test';
import {join} from 'node:path';
import {testFilesPath} from '../../repo-paths.js';
import {testCommand} from '../common/test-command.mock.js';
import type {RenameParams} from './gather-rename-params.js';
import {performRename} from './perform-rename.js';

describe(performRename.name, () => {
    async function testPerformTheRename(
        context: Readonly<UniversalTestContext>,
        params: RenameParams,
    ) {
        await testCommand(context, params.cwd, async (log) => performRename(params, log));
    }

    it('works on an easy rename', async (context) => {
        await testPerformTheRename(context, {
            cwd: join(testFilesPath, 'rename', 'easy-rename'),
            newVarName: 'newVarA',
            newVarPath: './src/a-new.ts',
            oldVarName: 'oldVarA',
            oldVarPath: './src/a.ts',
        });
    });
    it('works on harder renames', async (context) => {
        await testPerformTheRename(context, {
            cwd: join(testFilesPath, 'rename', 'multi-rename'),
            newVarName: 'newVarA',
            newVarPath: './src/a-new.ts',
            oldVarName: 'oldVarA',
            oldVarPath: './src/a.ts',
        });
    });
});
