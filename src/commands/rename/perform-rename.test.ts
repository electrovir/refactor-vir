import {describe, it, type NodeTestContext} from '@augment-vir/test';
import {join} from 'node:path';
import {testFilesPath} from '../../repo-paths.js';
import {testCommand} from '../common/test-command.mock.js';
import type {RenameParams} from './gather-rename-params.js';
import {performTheRename} from './perform-rename.js';

describe(performTheRename.name, () => {
    async function testPerformTheRename(context: Readonly<NodeTestContext>, params: RenameParams) {
        await testCommand(context, params.cwd, async (log) => performTheRename(params, log));
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
