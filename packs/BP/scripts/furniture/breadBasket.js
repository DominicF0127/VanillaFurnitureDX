import { EquipmentSlot, ItemStack, system, world } from "@minecraft/server";
import { NAMESPACE } from "globalConst";
import { decrementPlayerStack, getPlayerSelectedItem } from "utils";
system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent(`${NAMESPACE}:bread_basket`, {
        onPlayerInteract({ block, player, dimension }) {
            const selectedItem = getPlayerSelectedItem(player);
            const breadStack = block.permutation.getState(`${NAMESPACE}:bread_stack`);
            if (selectedItem && selectedItem.typeId == "minecraft:bread" && breadStack < 5) {
                // update block state
                block.setPermutation(block.permutation.withState(`${NAMESPACE}:bread_stack`, breadStack + 1));
                // decrement player held item stack
                decrementPlayerStack(player);
                // playsound
                dimension.playSound("block.decorated_pot.insert", block.location);
                return;
            }
            if (!selectedItem) {
                const typeId = block.typeId;
                if (breadStack > 0) {
                    // update block state
                    block.setPermutation(block.permutation.withState(`${NAMESPACE}:bread_stack`, breadStack - 1));
                    // give player itemStack the same as interacted block.typeId
                    player.getComponent("equippable").setEquipment(EquipmentSlot.Mainhand, new ItemStack("minecraft:bread"));
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
            const breadStack = brokenBlockPermutation.getState(`${NAMESPACE}:bread_stack`);
            // spawn loot
            if (breadStack > 0)
                dimension.spawnItem(new ItemStack("minecraft:bread", breadStack), block.center());
            // dimension.spawnItem(new ItemStack(brokenBlockPermutation.type.id), block.center());
        }
    });
});
world.afterEvents.blockExplode.subscribe(({ block, explodedBlockPermutation, dimension }) => {
    if (explodedBlockPermutation.type.id == `${NAMESPACE}:bread_basket`) {
        const breadStack = explodedBlockPermutation.getState(`${NAMESPACE}:bread_stack`);
        // spawn loot
        if (breadStack > 0)
            dimension.spawnItem(new ItemStack("minecraft:bread", breadStack), block.center());
        // dimension.spawnItem(new ItemStack(explodedBlockPermutation.type.id), block.center());
    }
});
