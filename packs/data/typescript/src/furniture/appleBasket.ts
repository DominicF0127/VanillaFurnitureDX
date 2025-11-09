import { EquipmentSlot, ItemStack, system, world } from "@minecraft/server";
import { NAMESPACE } from "globalConst";
import { decrementPlayerStack, getPlayerSelectedItem } from "utils";
import { BlockStateSuperset } from "@minecraft/vanilla-data";

system.beforeEvents.startup.subscribe(({blockComponentRegistry}) => {
    blockComponentRegistry.registerCustomComponent(`${NAMESPACE}:apple_basket`, {
        onPlayerInteract({ block, player, dimension }) {
            const selectedItem = getPlayerSelectedItem(player);
            const appleStack = <number>block.permutation.getState(<keyof BlockStateSuperset>`${NAMESPACE}:apple_stack`);

            if (selectedItem && selectedItem.typeId == "minecraft:apple" && appleStack < 4) {
                // update block state
                block.setPermutation(block.permutation.withState(<keyof BlockStateSuperset>`${NAMESPACE}:apple_stack`, appleStack + 1));
                // decrement player held item stack
                decrementPlayerStack(player);
                // playsound
                dimension.playSound("block.decorated_pot.insert", block.location);
                return;
            }

            if (!selectedItem) {
                const typeId = block.typeId;
                if (appleStack > 0) {
                    // update block state
                    block.setPermutation(block.permutation.withState(<keyof BlockStateSuperset>`${NAMESPACE}:apple_stack`, appleStack - 1));
                    // give player itemStack the same as interacted block.typeId
                    player.getComponent("equippable").setEquipment(EquipmentSlot.Mainhand, new ItemStack("minecraft:apple"));
                } else {
                    // set the new type of interacted block
                    block.setType("minecraft:air");
                    // give player itemStack the same as interacted block.typeId
                    player.getComponent("equippable").setEquipment(EquipmentSlot.Mainhand, new ItemStack(typeId));
                }
                // play sound
                block.dimension.playSound("block.itemframe.add_item", block.location);
            }
        },
        onPlayerBreak({ block, brokenBlockPermutation, dimension }) {
            const appleStack = <number>brokenBlockPermutation.getState(<keyof BlockStateSuperset>`${NAMESPACE}:apple_stack`);
            // spawn loot
            if (appleStack > 0)
                dimension.spawnItem(new ItemStack("minecraft:apple", appleStack), block.center());
        }
    });
});

world.afterEvents.blockExplode.subscribe(({ block, explodedBlockPermutation, dimension }) => {
    if (explodedBlockPermutation.type.id == `${NAMESPACE}:apple_basket`) {
        const appleStack = <number>explodedBlockPermutation.getState(<keyof BlockStateSuperset>`${NAMESPACE}:apple_stack`);
        // spawn loot
        if (appleStack > 0)
            dimension.spawnItem(new ItemStack("minecraft:apple", appleStack), block.center());
    }
});