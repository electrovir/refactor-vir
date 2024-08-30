import {describe, itCases} from '@augment-vir/test';
import {removeSingleImport} from './remove-single-import.js';

describe(removeSingleImport.name, () => {
    itCases(removeSingleImport, [
        {
            it: 'removes a bare import with no var name',
            inputs: [
                './a',
                undefined,
                [
                    "import {stuff} from './b';",
                    "import {stuff} from './a-new';",
                    "import {stuff} from './b';",
                    "import './a';",
                    "import {stuff} from './b';",
                ].join('\n'),
            ],
            expect: [
                "import {stuff} from './b';",
                "import {stuff} from './a-new';",
                "import {stuff} from './b';",
                "import {stuff} from './b';",
            ].join('\n'),
        },
        {
            it: 'removes a non-bare import with no var name',
            inputs: [
                './a',
                undefined,
                [
                    "import {stuff} from './b';",
                    "import {stuff} from './a-new';",
                    "import {stuff} from './b';",
                    "import {stuff1, stuff2} from './a';",
                    "import {stuff} from './b';",
                ].join('\n'),
            ],
            expect: [
                "import {stuff} from './b';",
                "import {stuff} from './a-new';",
                "import {stuff} from './b';",
                "import {stuff} from './b';",
            ].join('\n'),
        },
        {
            it: 'removes a mid import with a var name',
            inputs: [
                './a',
                'stuff2',
                [
                    "import {stuff} from './b';",
                    "import {stuff} from './a-new';",
                    "import {stuff} from './b';",
                    "import {stuff1, stuff2, stuff3} from './a';",
                    "import {stuff} from './b';",
                ].join('\n'),
            ],
            expect: [
                "import {stuff} from './b';",
                "import {stuff} from './a-new';",
                "import {stuff} from './b';",
                "import {stuff1, stuff3} from './a';",
                "import {stuff} from './b';",
            ].join('\n'),
        },
        {
            it: 'removes a start import with a var name',
            inputs: [
                './a',
                'stuff2',
                [
                    "import {stuff} from './b';",
                    "import {stuff} from './a-new';",
                    "import {stuff} from './b';",
                    "import {stuff2, stuff3} from './a';",
                    "import {stuff} from './b';",
                ].join('\n'),
            ],
            expect: [
                "import {stuff} from './b';",
                "import {stuff} from './a-new';",
                "import {stuff} from './b';",
                "import {stuff3} from './a';",
                "import {stuff} from './b';",
            ].join('\n'),
        },
        {
            it: 'removes a end import with a var name',
            inputs: [
                './a',
                'stuff2',
                [
                    "import {stuff} from './b';",
                    "import {stuff} from './a-new';",
                    "import {stuff} from './b';",
                    "import {stuff1, stuff2} from './a';",
                    "import {stuff} from './b';",
                ].join('\n'),
            ],
            expect: [
                "import {stuff} from './b';",
                "import {stuff} from './a-new';",
                "import {stuff} from './b';",
                "import {stuff1} from './a';",
                "import {stuff} from './b';",
            ].join('\n'),
        },
        {
            it: 'removes entire import with only the var name',
            inputs: [
                './a',
                'stuff2',
                [
                    "import {stuff} from './b';",
                    "import {stuff} from './a-new';",
                    "import {stuff} from './b';",
                    "import {stuff2} from './a';",
                    "import {stuff} from './b';",
                ].join('\n'),
            ],
            expect: [
                "import {stuff} from './b';",
                "import {stuff} from './a-new';",
                "import {stuff} from './b';",
                "import {stuff} from './b';",
            ].join('\n'),
        },
    ]);
});
