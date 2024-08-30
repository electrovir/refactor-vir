import {
    bSuperDuperLongImportNameSoItForcesAWrapInTheImportLineBecauseItJustKeepsGoingOnAndOn,
    oldVarA,
} from './a';

export const b = `${oldVarA} + b`;

console.log(
    bSuperDuperLongImportNameSoItForcesAWrapInTheImportLineBecauseItJustKeepsGoingOnAndOn,
    oldVarA,
);
