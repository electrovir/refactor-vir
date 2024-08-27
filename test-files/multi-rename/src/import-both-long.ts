import {
    bSuperDuperLongImportNameSoItForcesAWrapInTheImportLineBecauseItJustKeepsGoingOnAndOn,
    oldVarA,
    oldVarBSuperDuperLongImportNameSoItForcesAWrapInTheImportLineBecauseItJustKeepsGoingOnAndOn,
} from './a';

export const b = `${oldVarA} + b`;

console.log(
    bSuperDuperLongImportNameSoItForcesAWrapInTheImportLineBecauseItJustKeepsGoingOnAndOn,
    oldVarA,
    oldVarBSuperDuperLongImportNameSoItForcesAWrapInTheImportLineBecauseItJustKeepsGoingOnAndOn,
);
