import { Direction, EntityComponentTypes, ItemStack, system } from "@minecraft/server";
import { NAMESPACE } from "globalConst";
import { decrementPlayerStack, getPlayerSelectedItem } from "utils";
system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent(`${NAMESPACE}:sink_vanity`, {
        onPlayerInteract({ block, dimension, player, face }) {
            const isSinkOpen = block.permutation.getState(`${NAMESPACE}:sink_open`);
            const selectedItem = getPlayerSelectedItem(player);
            if (face == Direction.Up) {
                if (selectedItem && isSinkOpen && selectedItem.typeId == `${NAMESPACE}:drinking_glass`) {
                    // playsound
                    dimension.playSound(`${NAMESPACE}:drinking_glass.pour_water`, block.center());
                    // decrement player item stack
                    decrementPlayerStack(player);
                    // give player water_drinking_glass
                    player.getComponent(EntityComponentTypes.Inventory).container.addItem(new ItemStack(`${NAMESPACE}:water_drinking_glass`));
                }
                else {
                    block.setPermutation(block.permutation.withState(`${NAMESPACE}:sink_open`, isSinkOpen ? false : true));
                }
            }
        }
    });
});
