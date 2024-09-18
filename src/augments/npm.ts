import {assert} from '@augment-vir/assert';
import {getOrSet} from '@augment-vir/common';
import {findAncestor, readPackageJson} from '@augment-vir/node';
import {existsSync} from 'node:fs';
import {dirname, join} from 'node:path';

export type PackageCacheEntry = {
    /** Path to the package. */
    path: string;
    /** Npm name of the package. */
    name: string;
};

export type PackageCache = {
    [PackagePath in string]: PackageCacheEntry;
};

export async function findParentPackage(
    startPath: string,
    packageCache: PackageCache,
): Promise<{path: string; name: string}> {
    const parentPackagePath = findAncestor(dirname(startPath), (path) => {
        return existsSync(join(path, 'package.json'));
    });

    assert.isDefined(parentPackagePath, 'Failed to find a parent `package.json`');

    return await getOrSet(packageCache, parentPackagePath, async () => {
        const parentPackageJson = await readPackageJson(parentPackagePath);
        const parentName = parentPackageJson.name;
        assert.isTruthy(parentName, `Parent package has no "name" at '${parentPackagePath}'`);
        return {path: parentPackagePath, name: parentName};
    });
}
