#!/usr/bin/env -S npx tsx

import {cli} from './run-cli.js';

await cli(process.argv);
