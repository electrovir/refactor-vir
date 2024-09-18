import type {Logger} from '@augment-vir/common';
import {existsSync} from 'node:fs';
import {resolvePath} from '../../augments/path.js';
import {CliFlags} from '../../cli/cli-flags.js';
import {gatherParams} from '../common/gather-params.js';

export type ListDependentsParams = Awaited<ReturnType<typeof gatherListDependentsParams>>;

export async function gatherListDependentsParams(
    log: Readonly<Logger>,
    flags: Readonly<CliFlags>,
    commandName: string,
) {
    return await gatherParams(
        [
            {
                key: 'rootFile',
                question: 'Enter a file to find dependents of (start with ./ for relative paths):',
                assertValidInput(rootFile, cwd) {
                    const resolvedPath = resolvePath(cwd, rootFile);
                    log.faint(resolvedPath);

                    log.if(!existsSync(resolvedPath)).warning(
                        `Warning: file does not exist: '${rootFile}'`,
                    );
                },
            },
        ],
        log,
        flags,
        commandName,
    );
}
