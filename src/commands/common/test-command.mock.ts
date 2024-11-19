import {
    createArrayLogger,
    diffObjects,
    RuntimeEnv,
    type Logger,
    type MaybePromise,
} from '@augment-vir/common';
import {readAllDirContents, resetDirContents, toPosixPath} from '@augment-vir/node';
import {assertTestContext, type UniversalTestContext} from '@augment-vir/test';
import {relative} from 'node:path';
import {monoRepoPath} from '../../repo-paths.js';

export async function testCommand(
    context: Readonly<UniversalTestContext>,
    cwd: string,
    runCommand: (log: Logger) => MaybePromise<unknown>,
    skipReset = false,
) {
    assertTestContext(context, RuntimeEnv.Node);
    const {log, logs} = createArrayLogger({omitColors: true});
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
