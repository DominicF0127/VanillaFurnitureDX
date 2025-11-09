import { system } from "@minecraft/server";
import { NAMESPACE } from "globalConst";
import { getPlayerSelectedItem } from "utils";
import { pickupBlock } from "./pickupBlock";

system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent(`${NAMESPACE}:mug`, {
        onPlayerInteract({ block, player, dimension }) {
            const selectedItem = getPlayerSelectedItem(player);
            if (selectedItem && selectedItem.typeId == `${NAMESPACE}:tea_kettle`) {
                const cardinalDirection = block.permutation.getState("minecraft:cardinal_direction");
                // playsound of pouring tea
                dimension.playSound(`${NAMESPACE}:drinking_glass.pour_water`, block.center());
                // update the block
                block.setType(`${NAMESPACE}:mug_of_tea`);
                block.setPermutation(
                    block.permutation.withState("minecraft:cardinal_direction", cardinalDirection)
                );
            } else {
                pickupBlock(block, player);
            }
        },
    });
});