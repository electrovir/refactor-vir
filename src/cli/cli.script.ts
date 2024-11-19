import {log} from '@augment-vir/common';
import {cli} from './run-cli.js';

await cli(process.argv, log, import.meta.filename);
