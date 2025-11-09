import { Direction, EntityComponentTypes, ItemStack, system } from "@minecraft/server";
import { NAMESPACE } from "globalConst";
import { decrementPlayerStack, getPlayerSelectedItem } from "utils";
system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent(`${NAMESPACE}:kitchen_sink`, {
        onPlayerInteract({ block, dimension, player, face }) {
            const isSinkOpen = block.permutation.getState(`${NAMESPACE}:sink`);
            const multiblockPart = block.permutation.getState(`${NAMESPACE}:part`);
            const selectedItem = getPlayerSelectedItem(player);
            if (face == Direction.Up && multiblockPart == "2") {
                if (selectedItem && isSinkOpen && selectedItem.typeId == `${NAMESPACE}:drinking_glass`) {
                    // playsound
                    dimension.playSound(`${NAMESPACE}:drinking_glass.pour_water`, block.center());
                    // decrement player item stack
                    decrementPlayerStack(player);
                    // give player water_drinking_glass
                    player.getComponent(EntityComponentTypes.Inventory).container.addItem(new ItemStack(`${NAMESPACE}:water_drinking_glass`));
                }
                else {
                    block.setPermutation(block.permutation.withState(`${NAMESPACE}:sink`, isSinkOpen ? false : true));
                }
            }
        }
    });
});
