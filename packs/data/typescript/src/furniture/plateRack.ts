import { EquipmentSlot, ItemStack, system, world } from "@minecraft/server";
import { NAMESPACE } from "globalConst";
import { decrementPlayerStack, getPlayerSelectedItem } from "utils";
import { BlockStateSuperset } from "@minecraft/vanilla-data";

system.beforeEvents.startup.subscribe(({blockComponentRegistry}) => {
    blockComponentRegistry.registerCustomComponent(`${NAMESPACE}:plate_rack`, {
        onPlayerInteract({ block, player, dimension }) {
            const selectedItem = getPlayerSelectedItem(player);
            const plateStack = <number>block.permutation.getState(<keyof BlockStateSuperset>`${NAMESPACE}:plate_stack`);

            if (selectedItem && selectedItem.typeId == `${NAMESPACE}:plate` && plateStack < 4) {
                // update block state
                block.setPermutation(block.permutation.withState(<keyof BlockStateSuperset>`${NAMESPACE}:plate_stack`, plateStack + 1));
                // decrement player held item stack
                decrementPlayerStack(player);
                // playsound
                dimension.playSound("block.decorated_pot.insert", block.location);
                return;
            }

            if (!selectedItem) {
                const typeId = block.typeId;
                if (plateStack > 0) {
                    // update block state
                    block.setPermutation(block.permutation.withState(<keyof BlockStateSuperset>`${NAMESPACE}:plate_stack`, plateStack - 1));
                    // give player itemStack the same as interacted block.typeId
                    player.getComponent("equippable").setEquipment(EquipmentSlot.Mainhand, new ItemStack(`${NAMESPACE}:plate`));
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
            const plateStack = <number>brokenBlockPermutation.getState(<keyof BlockStateSuperset>`${NAMESPACE}:plate_stack`);
            // spawn loot
            if (plateStack > 0)
                dimension.spawnItem(new ItemStack(`${NAMESPACE}:plate`, plateStack), block.center());
            // dimension.spawnItem(new ItemStack(brokenBlockPermutation.type.id), block.center());
        }
    });
});

world.afterEvents.blockExplode.subscribe(({ block, explodedBlockPermutation, dimension }) => {
    if (explodedBlockPermutation.type.id == `${NAMESPACE}:plate_rack`) {
        const plateStack = <number>explodedBlockPermutation.getState(<keyof BlockStateSuperset>`${NAMESPACE}:plate_stack`);
        // spawn loot
        if (plateStack > 0)
            dimension.spawnItem(new ItemStack(`${NAMESPACE}:plate`, plateStack), block.center());

        // dimension.spawnItem(new ItemStack(explodedBlockPermutation.type.id), block.center());
    }
});