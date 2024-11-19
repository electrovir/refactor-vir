#!/usr/bin/env node

import {runCliScript} from '@augment-vir/node';
import {join} from 'node:path';

const cliPath = join(import.meta.dirname, 'src', 'cli', 'cli.script.ts');

await runCliScript(cliPath, import.meta.filename, 'rv');
