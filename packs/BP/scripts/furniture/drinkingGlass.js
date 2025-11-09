import { EquipmentSlot, ItemStack, system, world } from "@minecraft/server";
import { NAMESPACE } from "globalConst";
import { decrementPlayerStack, getPlayerSelectedItem } from "utils";
system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent(`${NAMESPACE}:drinking_glass_stack`, {
        onPlayerInteract({ block, player, dimension }) {
            const selectedItem = getPlayerSelectedItem(player);
            const drinkingGlassStack = block.permutation.getState(`${NAMESPACE}:drinking_glass_stack`);
            if (selectedItem && selectedItem.typeId == `${NAMESPACE}:drinking_glass` && drinkingGlassStack < 3) {
                // update block state
                block.setPermutation(block.permutation.withState(`${NAMESPACE}:drinking_glass_stack`, drinkingGlassStack + 1));
                // decrement player held item stack
                decrementPlayerStack(player);
                // playsound
                dimension.playSound("block.decorated_pot.insert", block.location);
                return;
            }
            if (selectedItem && drinkingGlassStack == 1) {
                // check if the selected item is water_pitcher or juice
                if (!(selectedItem.typeId == `${NAMESPACE}:water_pitcher` || selectedItem.typeId == `${NAMESPACE}:juice`))
                    return;
                // playsound like pouring water to a glass
                dimension.playSound(`${NAMESPACE}:drinking_glass.pour_water`, block.center());
                // change block type
                const cardinalDirection = block.permutation.getState("minecraft:cardinal_direction");
                if (selectedItem.typeId == `${NAMESPACE}:water_pitcher`)
                    block.setType(`${NAMESPACE}:water_drinking_glass`);
                if (selectedItem.typeId == `${NAMESPACE}:juice`)
                    block.setType(`${NAMESPACE}:juice_drinking_glass`);
                block.setPermutation(block.permutation.withState("minecraft:cardinal_direction", cardinalDirection));
                return;
            }
            if (!selectedItem) {
                const typeId = block.typeId;
                if (drinkingGlassStack > 1) {
                    // update block state
                    block.setPermutation(block.permutation.withState(`${NAMESPACE}:drinking_glass_stack`, drinkingGlassStack - 1));
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
            const drinkingGlassStack = brokenBlockPermutation.getState(`${NAMESPACE}:drinking_glass_stack`);
            // spawn loot
            dimension.spawnItem(new ItemStack(brokenBlockPermutation.type.id, drinkingGlassStack), block.center());
        }
    });
});
world.afterEvents.blockExplode.subscribe(({ block, explodedBlockPermutation, dimension }) => {
    if (explodedBlockPermutation.type.id == `${NAMESPACE}:drinking_glass`) {
        const drinkingGlassStack = explodedBlockPermutation.getState(`${NAMESPACE}:drinking_glass_stack`);
        // spawn loot
        dimension.spawnItem(new ItemStack(explodedBlockPermutation.type.id, drinkingGlassStack), block.center());
    }
});
