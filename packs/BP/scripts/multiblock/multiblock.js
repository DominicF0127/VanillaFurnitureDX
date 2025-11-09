import { EntityComponentTypes, GameMode, ItemStack, system, world } from "@minecraft/server";
import { NAMESPACE } from "globalConst";
export class Multiblock {
    // Static method
    static isMultiblock(block) {
        return block.getTags().some(tag => tag.includes(`${NAMESPACE}:multiblock:`));
    }
    // Constructor
    constructor(block, signNumber = 1) {
        this.block = block;
        this.signNumber = signNumber;
        this.blockTypeId = block.typeId;
        this.cardinalDirection = block.permutation.getState("minecraft:cardinal_direction");
        this.multiblocks = (() => {
            const tag = block.getTags().filter(tag => tag.includes(`${NAMESPACE}:multiblock:`))[0];
            const patterns = tag.slice(11 + NAMESPACE.length).match(/_\d+/g);
            const multiblockLocations = new Map();
            patterns.forEach((pattern) => {
                const key = pattern.slice(1, -3);
                const [x, y, z] = pattern.slice(-3);
                const vector = { x: +x, y: +y, z: +z };
                multiblockLocations.set(key, vector);
            });
            if (signNumber === -1) {
                const state = block.permutation.getState(`${NAMESPACE}:part`);
                this.block = this.getRelativeBlock(block, multiblockLocations.get(String(state)), this.cardinalDirection, signNumber);
                this.signNumber = 1;
            }
            const multiblocks = new Map();
            multiblockLocations.forEach((location, key) => {
                const block = this.getRelativeBlock(this.block, location, this.cardinalDirection, this.signNumber);
                multiblocks.set(key, block);
            });
            return multiblocks;
        })();
    }
    // Get multiblocks map
    getMultiblocks() {
        return this.multiblocks;
    }
    // Set multiblock state
    setMultiblockState(stateName, stateValue, ...keys) {
        if (keys.length !== 0) {
            keys.forEach((key) => {
                const block = this.multiblocks.get(key);
                block.setPermutation(block.permutation.withState(stateName, stateValue));
            });
            return;
        }
        else {
            this.multiblocks.forEach((block) => {
                block.setPermutation(block.permutation.withState(stateName, stateValue));
            });
        }
    }
    hasEnoughSpace() {
        for (const [key, block] of this.multiblocks) {
            if (key !== "1") {
                if (block.typeId !== "minecraft:air")
                    return false;
            }
        }
        return true;
    }
    placeMultiblock() {
        this.multiblocks.forEach((block, key) => {
            if (key !== "1") {
                block.setType(this.blockTypeId);
                if (block.permutation.getState("minecraft:cardinal_direction")) {
                    block.setPermutation(block.permutation.withState("minecraft:cardinal_direction", this.cardinalDirection));
                }
                block.setPermutation(block.permutation.withState(`${NAMESPACE}:part`, Number(key)));
                // block.setPermutation(block.permutation.withState(`${NAMESPACE}:multiblock_part` as keyof BlockStateSuperset, Number(key)));
            }
        });
    }
    breakMultiblock() {
        system.run(() => {
            this.multiblocks.forEach((block) => {
                block.setType("minecraft:air");
            });
        });
    }
    getRelativeBlock(block, location, direction, signNum) {
        let offset = { x: 0, y: 0, z: 0 };
        if (location.z !== 0) {
            if (direction == "north")
                offset = { x: (location.x * signNum), y: (location.y * signNum), z: (-location.z * signNum) };
            else if (direction == "east")
                offset = { x: (location.z * signNum), y: (location.y * signNum), z: (location.x * signNum) };
            else if (direction == "south")
                offset = { x: (-location.x * signNum), y: (location.y * signNum), z: (location.z * signNum) };
            else if (direction == "west")
                offset = { x: (-location.z * signNum), y: (location.y * signNum), z: (-location.x * signNum) };
            else
                offset = { x: (location.x * signNum), y: (location.y * signNum), z: (location.z * signNum) };
        }
        else {
            if (direction == "north")
                offset = { x: (location.x * signNum), y: (location.y * signNum), z: (location.z * signNum) };
            else if (direction == "east")
                offset = { x: (location.z * signNum), y: (location.y * signNum), z: (location.x * signNum) };
            else if (direction == "south")
                offset = { x: (-location.x * signNum), y: (location.y * signNum), z: (location.z * signNum) };
            else if (direction == "west")
                offset = { x: (location.z * signNum), y: (location.y * signNum), z: (-location.x * signNum) };
            else
                offset = { x: (location.x * signNum), y: (location.y * signNum), z: (location.z * signNum) };
        }
        return block.offset(offset);
    }
}
// ------------------------------------------------
// EVENTS
// ------------------------------------------------
world.afterEvents.playerPlaceBlock.subscribe(({ block, player }) => {
    // check if multiblock
    if (!Multiblock.isMultiblock(block))
        return;
    const multiblock = new Multiblock(block);
    if (!multiblock.hasEnoughSpace()) {
        if (player.getGameMode() !== GameMode.Creative) {
            player.getComponent(EntityComponentTypes.Inventory)?.container?.addItem(new ItemStack(multiblock.blockTypeId));
        }
        block.setType("minecraft:air");
        // Show a message
        player?.onScreenDisplay.setActionBar("No enough space to place this furniture.");
        return;
    }
    multiblock.placeMultiblock();
});
world.beforeEvents.playerBreakBlock.subscribe(({ block }) => {
    if (!Multiblock.isMultiblock(block))
        return;
    // Breaking process of multiblock
    new Multiblock(block, -1).breakMultiblock();
});
world.afterEvents.blockExplode.subscribe(({ block, explodedBlockPermutation }) => {
    if (explodedBlockPermutation.getTags().some(tag => tag.includes(`${NAMESPACE}:multiblock:`))) {
        new Multiblock(block);
    }
});
