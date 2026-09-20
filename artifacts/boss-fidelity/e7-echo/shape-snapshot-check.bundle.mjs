import * as THREE from 'three';
/** Own the geometry, borrow only the caller's material. Bake source transforms before it can unload. */
export function buildingShapeSnapshot(source, origin, material, index, slots = {}) {
    source.updateWorldMatrix(true, true);
    const group = new THREE.Group();
    const local = new THREE.Matrix4().makeTranslation(-origin.x, 0, -origin.z);
    const instance = new THREE.Matrix4();
    source.traverse(node => {
        const mesh = node;
        if (!mesh.isMesh || !mesh.visible || /(?:Sign$|PortraitSign|SteamPlume)/.test(mesh.name))
            return;
        const instanced = mesh;
        const count = instanced.isInstancedMesh ? (slots[mesh.name] ?? 1) : 1;
        for (let part = 0; part < count; part++) {
            const transform = mesh.matrixWorld.clone();
            if (instanced.isInstancedMesh) {
                if (index === undefined || index * count + part >= instanced.count)
                    continue;
                instanced.getMatrixAt(index * count + part, instance);
                if (Math.abs(instance.determinant()) < 1e-10)
                    continue;
                transform.multiply(instance);
            }
            const geometry = mesh.geometry.clone().applyMatrix4(local.clone().multiply(transform));
            const copy = new THREE.Mesh(geometry, material);
            copy.name = mesh.name;
            group.add(copy);
        }
    });
    // Keep each source's internal offsets, with the captured lowest support on the new ground.
    const bounds = new THREE.Box3().setFromObject(group);
    if (!bounds.isEmpty())
        for (const child of group.children)
            child.geometry.translate(0, -bounds.min.y, 0);
    return group;
}
