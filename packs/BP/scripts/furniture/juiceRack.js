import { EquipmentSlot, ItemStack, system, world } from "@minecraft/server";
import { NAMESPACE } from "globalConst";
import { decrementPlayerStack, getPlayerSelectedItem } from "utils";
system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent(`${NAMESPACE}:juice_rack`, {
        onPlayerInteract({ block, player, dimension }) {
            const selectedItem = getPlayerSelectedItem(player);
            const juiceStack = block.permutation.getState(`${NAMESPACE}:juice_stack`);
            if (selectedItem && selectedItem.typeId == `${NAMESPACE}:juice` && juiceStack < 3) {
                // update block state
                block.setPermutation(block.permutation.withState(`${NAMESPACE}:juice_stack`, juiceStack + 1));
                // decrement player held item stack
                decrementPlayerStack(player);
                // playsound
                dimension.playSound("block.decorated_pot.insert", block.location);
                return;
            }
            if (!selectedItem) {
                const typeId = block.typeId;
                if (juiceStack > 0) {
                    // update block state
                    block.setPermutation(block.permutation.withState(`${NAMESPACE}:juice_stack`, juiceStack - 1));
                    // give player itemStack the same as interacted block.typeId
                    player.getComponent("equippable").setEquipment(EquipmentSlot.Mainhand, new ItemStack(`${NAMESPACE}:juice`));
                }
                else {
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
            const juiceStack = brokenBlockPermutation.getState(`${NAMESPACE}:juice_stack`);
            // spawn loot
            if (juiceStack > 0)
                dimension.spawnItem(new ItemStack(`${NAMESPACE}:juice`, juiceStack), block.center());
            // dimension.spawnItem(new ItemStack(brokenBlockPermutation.type.id), block.center());
        }
    });
});
world.afterEvents.blockExplode.subscribe(({ block, explodedBlockPermutation, dimension }) => {
    if (explodedBlockPermutation.type.id == `${NAMESPACE}:juice_rack`) {
        const juiceStack = explodedBlockPermutation.getState(`${NAMESPACE}:juice_stack`);
        // spawn loot
        if (juiceStack > 0)
            dimension.spawnItem(new ItemStack(`${NAMESPACE}:juice`, juiceStack), block.center());
        // dimension.spawnItem(new ItemStack(explodedBlockPermutation.type.id), block.center());
    }
});
