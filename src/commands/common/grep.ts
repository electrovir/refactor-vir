import {wrapString} from '@augment-vir/common';
import {joinFilesToDir, runShellCommand} from '@augment-vir/node';

export async function grep(cwd: string, searchString: string) {
    const command = [
        'grep',
        '-rl',
        '--include',
        "'*/src/*.ts'",
        '--exclude',
        '*/node_modules/*',
        wrapString({value: searchString, wrapper: "'"}),
    ].join(' ');

    const {stdout, exitCode} = await runShellCommand(command, {cwd});

    if (exitCode === 0) {
        return joinFilesToDir(cwd, stdout.trim().split('\n')).sort();
    } else {
        return [];
    }
}
