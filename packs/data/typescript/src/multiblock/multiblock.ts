import { Block, EntityComponentTypes, GameMode, ItemStack, system, Vector3, world } from "@minecraft/server";
import { BlockStateSuperset } from "@minecraft/vanilla-data";
import { NAMESPACE } from "globalConst";

export class Multiblock {
    private block: Block;
    private signNumber: number;
    private multiblocks: Map<string, Block>;
    public readonly blockTypeId: string;
    public readonly cardinalDirection: string;

    // Static method
    public static isMultiblock(block: Block): boolean {
        return block.getTags().some(tag => tag.includes(`${NAMESPACE}:multiblock:`));
    }

    // Constructor
    constructor(block: Block, signNumber: number = 1) {
        this.block = block;
        this.signNumber = signNumber;
        this.blockTypeId = block.typeId;
        this.cardinalDirection = block.permutation.getState("minecraft:cardinal_direction") as string;

        this.multiblocks = ((): Map<string, Block> => {
            const tag = block.getTags().filter(tag => tag.includes(`${NAMESPACE}:multiblock:`))[0];
            const patterns = tag.slice(11 + NAMESPACE.length).match(/_\d+/g)!;

            const multiblockLocations = new Map<string, Vector3>();

            patterns.forEach((pattern) => {
                const key = pattern.slice(1, -3);
                const [x, y, z] = pattern.slice(-3);
                const vector = {x: +x, y: +y, z: +z};

                multiblockLocations.set(key, vector);
            });

            if (signNumber === -1) {
                const state = block.permutation.getState(<keyof BlockStateSuperset>`${NAMESPACE}:part`);
                this.block = this.getRelativeBlock(block, multiblockLocations.get(String(state))!, this.cardinalDirection, signNumber)!;
                this.signNumber = 1;
            }

            const multiblocks = new Map<string, Block>();

            multiblockLocations.forEach((location, key) => {
                const block = this.getRelativeBlock(this.block, location, this.cardinalDirection, this.signNumber)!;
                multiblocks.set(key, block);
            });

            return multiblocks;
        })();
    }

    // Get multiblocks map
    public getMultiblocks(): Map<string, Block> {
        return this.multiblocks;
    }

    // Set multiblock state
    public setMultiblockState(stateName: keyof BlockStateSuperset, stateValue: string | number | boolean, ...keys: string[]): void {
        if (keys.length !== 0) {
            keys.forEach((key) => {
                const block = this.multiblocks.get(key)!;
                block.setPermutation(block.permutation.withState(stateName, stateValue));
            });
            return;
        } else {
            this.multiblocks.forEach((block) => {
                block.setPermutation(block.permutation.withState(stateName, stateValue));
            });
        }
    }

    public hasEnoughSpace(): boolean {
        for (const [key, block] of this.multiblocks) {
            if (key !== "1") {
                if (block.typeId !== "minecraft:air")
                    return false;
            }
        }
        return true;
    }

    public placeMultiblock(): void {
        this.multiblocks.forEach((block, key) => {
            if (key !== "1") {
                block.setType(this.blockTypeId);
                if (block.permutation.getState("minecraft:cardinal_direction")) {
                    block.setPermutation(
                        block.permutation.withState("minecraft:cardinal_direction", this.cardinalDirection)
                    );
                }
                block.setPermutation(
                    block.permutation.withState(<keyof BlockStateSuperset>`${NAMESPACE}:part`, Number(key))
                );
                // block.setPermutation(block.permutation.withState(`${NAMESPACE}:multiblock_part` as keyof BlockStateSuperset, Number(key)));
            }
        });
    }

    public breakMultiblock(): void {
        system.run(() => {
            this.multiblocks.forEach((block) => {
                block.setType("minecraft:air");
            });
        });
    }

    private getRelativeBlock(block: Block, location: Vector3, direction: string, signNum: number): Block | undefined {
        let offset: Vector3 = {x: 0, y: 0, z: 0};

        if (location.z !== 0) {
            if (direction == "north")
                offset = {x: (location.x * signNum), y: (location.y * signNum), z: (-location.z * signNum)};
            else if (direction == "east")
                offset = {x: (location.z * signNum), y: (location.y * signNum), z: (location.x * signNum)};
            else if (direction == "south")
                offset = {x: (-location.x * signNum), y: (location.y * signNum), z: (location.z * signNum)};
            else if (direction == "west")
                offset = {x: (-location.z * signNum), y: (location.y * signNum), z: (-location.x * signNum)};
            else
                offset = {x: (location.x * signNum), y: (location.y * signNum), z: (location.z * signNum)};
        } else {
            if (direction == "north")
                offset = {x: (location.x * signNum), y: (location.y * signNum), z: (location.z * signNum)};
            else if (direction == "east")
                offset = {x: (location.z * signNum), y: (location.y * signNum), z: (location.x * signNum)};
            else if (direction == "south")
                offset = {x: (-location.x * signNum), y: (location.y * signNum), z: (location.z * signNum)};
            else if (direction == "west")
                offset = {x: (location.z * signNum), y: (location.y * signNum), z: (-location.x * signNum)};
            else
                offset = {x: (location.x * signNum), y: (location.y * signNum), z: (location.z * signNum)};
        }

        return block.offset(offset);
    }
}

// ------------------------------------------------
// EVENTS
// ------------------------------------------------
world.afterEvents.playerPlaceBlock.subscribe(({block, player}) => {
    // check if multiblock
    if (!Multiblock.isMultiblock(block)) return;

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

world.beforeEvents.playerBreakBlock.subscribe(({block}) => {

    if (!Multiblock.isMultiblock(block)) return;
    // Breaking process of multiblock
    new Multiblock(block, -1).breakMultiblock();
});

world.afterEvents.blockExplode.subscribe(({block, explodedBlockPermutation}) => {
    if (explodedBlockPermutation.getTags().some(tag => tag.includes(`${NAMESPACE}:multiblock:`))) {
        new Multiblock(block, )
    }
}); 
