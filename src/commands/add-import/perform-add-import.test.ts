import {describe, it, type UniversalTestContext} from '@augment-vir/test';
import {join} from 'node:path';
import {testFilesPath} from '../../repo-paths.js';
import {testCommand} from '../common/test-command.mock.js';
import type {AddImportParams} from './gather-add-import-params.js';
import {performAddImport} from './perform-add-import.js';

describe(performAddImport.name, () => {
    async function testPerformTheRename(
        context: Readonly<UniversalTestContext>,
        params: AddImportParams,
    ) {
        await testCommand(context, params.cwd, async (log) => performAddImport(params, log));
    }

    it('works', async (context) => {
        await testPerformTheRename(context, {
            cwd: join(testFilesPath, 'add-import', 'a'),
            fileGlob: './src/**/import-*.ts',
            importString: "import {stuff} from './a-new.ts'",
        });
    });
});
