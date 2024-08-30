import {
    createLoggerWithStoredLogs,
    diffObjects,
    type Logger,
    type MaybePromise,
} from '@augment-vir/common';
import {toPosixPath} from '@augment-vir/node';
import {NodeTestContext} from '@augment-vir/test';
import {readAllDirContents, resetDirContents} from '@virmator/plugin-testing';
import {relative} from 'node:path';
import {monoRepoPath} from '../../repo-paths.js';

export async function testCommand(
    context: Readonly<NodeTestContext>,
    cwd: string,
    runCommand: (log: Logger) => MaybePromise<unknown>,
    skipReset = false,
) {
    const {log, logs} = createLoggerWithStoredLogs({omitColors: true});
    const contentsBefore = await readAllDirContents(cwd, {
        recursive: true,
    });

    try {
        const result = await runCommand(log);

        const contentsAfter = await readAllDirContents(cwd, {
            recursive: true,
        });

        const contentsDiff = diffObjects(contentsBefore, contentsAfter)[1];

        context.assert.snapshot({
            result,
            cwd: toPosixPath(relative(monoRepoPath, cwd)),
            logs,
            contentsDiff,
        });
    } finally {
        if (!skipReset) {
            await resetDirContents(cwd, contentsBefore);
        }
    }
}
