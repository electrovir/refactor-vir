import {
    oldVarA,
    oldVarBSuperDuperLongImportNameSoItForcesAWrapInTheImportLineBecauseItJustKeepsGoingOnAndOn,
} from './a';

export const b = `${oldVarA} + b`;

console.log(
    oldVarA,
    oldVarBSuperDuperLongImportNameSoItForcesAWrapInTheImportLineBecauseItJustKeepsGoingOnAndOn,
);
