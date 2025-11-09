import { EntityComponentTypes, system, world } from "@minecraft/server";
import { NAMESPACE } from "globalConst";
system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent(`${NAMESPACE}:storage_block`, {
        onPlace({ block, dimension }) {
            // const cardinalDirection = block.permutation.getState("minecraft:cardinal_direction");
            // const rotation = (<{[key: string]: number}>{north: 0, east: 90, south: 180, west: 270})[cardinalDirection];
            // const storage = dimension.spawnEntity(`${NAMESPACE}:storage`, block.above(50).location);
            // storage.setRotation({ x: 0, y: rotation });
            // storage.triggerEvent(`${NAMESPACE}:${cardinalDirection}`);
            // storage.triggerEvent(`${NAMESPACE}:kill`);
            // system.runTimeout(() => {
            //     storage.teleport(block.bottomCenter());
            // }, 5);
        },
        onPlayerBreak({ block }) {
            breakStorageBlock(block);
        }
    });
});
world.afterEvents.blockExplode.subscribe(({ block, explodedBlockPermutation }) => {
    if (explodedBlockPermutation.getTags().includes("storage_block")) {
        breakStorageBlock(block);
    }
});
export function breakStorageBlock(block) {
    const dimension = block.dimension;
    const storage = dimension.getEntitiesAtBlockLocation(block.center()).shift();
    if (storage.typeId !== `${NAMESPACE}:storage`)
        return;
    const container = storage.getComponent(EntityComponentTypes.Inventory).container;
    for (let i = 0; i < container.size; i++) {
        const item = container?.getItem(i);
        if (item) {
            dimension.spawnItem(item, block.center());
        }
    }
    storage.remove();
}
