import {createLoggerWithStoredLogs, diffObjects} from '@augment-vir/common';
import {toPosixPath} from '@augment-vir/node';
import {describe, it, type NodeTestContext} from '@augment-vir/test';
import {readAllDirContents, resetDirContents} from '@virmator/plugin-testing';
import {join, relative} from 'node:path';
import {monoRepoPath, testFilesPath} from '../repo-paths.js';
import {performTheRename} from './perform-rename.js';
import type {RenameParams} from './rename-params.js';

describe(performTheRename.name, () => {
    async function testPerformTheRename(context: Readonly<NodeTestContext>, params: RenameParams) {
        const {log, logs} = createLoggerWithStoredLogs({omitColors: true});
        const contentsBefore = await readAllDirContents(params.cwd, {
            recursive: true,
        });

        try {
            const result = await performTheRename(params, log);

            const contentsAfter = await readAllDirContents(params.cwd, {
                recursive: true,
            });

            const contentsDiff = diffObjects(contentsBefore, contentsAfter)[1];

            context.assert.snapshot({
                result,
                cwd: toPosixPath(relative(monoRepoPath, params.cwd)),
                logs,
                contentsDiff,
            });
        } finally {
            await resetDirContents(params.cwd, contentsBefore);
        }
    }

    it('works on an easy rename', async (context) => {
        await testPerformTheRename(context, {
            cwd: join(testFilesPath, 'easy-rename'),
            newVarName: 'newVarA',
            newVarPath: './src/a-new.ts',
            oldVarName: 'oldVarA',
            oldVarPath: './src/a.ts',
        });
    });
    it('works on harder renames', async (context) => {
        await testPerformTheRename(context, {
            cwd: join(testFilesPath, 'multi-rename'),
            newVarName: 'newVarA',
            newVarPath: './src/a-new.ts',
            oldVarName: 'oldVarA',
            oldVarPath: './src/a.ts',
        });
    });
});
