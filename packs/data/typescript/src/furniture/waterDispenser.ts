import { Direction, EntityComponentTypes, ItemStack, system } from "@minecraft/server";
import { BlockStateSuperset } from "@minecraft/vanilla-data";
import { NAMESPACE } from "globalConst";
import { decrementPlayerStack, getPlayerSelectedItem } from "utils";

system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent(`${NAMESPACE}:water_dispenser`, {
        onPlayerInteract({ block, dimension, player, face }) {
            const part = block.permutation.getState(<keyof BlockStateSuperset>`${NAMESPACE}:part`);
            const selectedItem = getPlayerSelectedItem(player);
            if (part == 1 && selectedItem && selectedItem.typeId == `${NAMESPACE}:drinking_glass`) {
                // playsound
                dimension.playSound(`${NAMESPACE}:drinking_glass.pour_water`, block.center());
                // decrement player item stack
                decrementPlayerStack(player);
                // give player water_drinking_glass
                player.getComponent(EntityComponentTypes.Inventory).container.addItem(new ItemStack(`${NAMESPACE}:water_drinking_glass`));
            }
        }
    });
});