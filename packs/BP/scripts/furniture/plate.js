import { EquipmentSlot, ItemStack, system, world } from "@minecraft/server";
import { NAMESPACE } from "globalConst";
import { decrementPlayerStack, getPlayerSelectedItem } from "utils";
system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent(`${NAMESPACE}:plate_stack`, {
        onPlayerInteract({ block, player, dimension }) {
            const selectedItem = getPlayerSelectedItem(player);
            const plateStack = block.permutation.getState(`${NAMESPACE}:plate_stack`);
            if (selectedItem && selectedItem.typeId == `${NAMESPACE}:plate` && plateStack < 3) {
                // update block state
                block.setPermutation(block.permutation.withState(`${NAMESPACE}:plate_stack`, plateStack + 1));
                // decrement player held item stack
                decrementPlayerStack(player);
                // playsound
                dimension.playSound("block.decorated_pot.insert", block.location);
                return;
            }
            if (!selectedItem) {
                const typeId = block.typeId;
                if (plateStack > 1) {
                    // update block state
                    block.setPermutation(block.permutation.withState(`${NAMESPACE}:plate_stack`, plateStack - 1));
                }
                else {
                    // set the new type of interacted block
                    block.setType("minecraft:air");
                }
                // give player itemStack the same as interacted block.typeId
                player.getComponent("equippable").setEquipment(EquipmentSlot.Mainhand, new ItemStack(typeId));
                // play sound
                block.dimension.playSound("block.itemframe.add_item", block.location);
                return;
            }
        },
        onPlayerBreak({ block, brokenBlockPermutation, dimension }) {
            const plateStack = brokenBlockPermutation.getState(`${NAMESPACE}:plate_stack`);
            // spawn loot
            dimension.spawnItem(new ItemStack(brokenBlockPermutation.type.id, plateStack), block.center());
        }
    });
});
world.afterEvents.blockExplode.subscribe(({ block, explodedBlockPermutation, dimension }) => {
    if (explodedBlockPermutation.type.id == `${NAMESPACE}:plate`) {
        const plateStack = explodedBlockPermutation.getState(`${NAMESPACE}:plate_stack`);
        // spawn loot
        dimension.spawnItem(new ItemStack(explodedBlockPermutation.type.id, plateStack), block.center());
    }
});
