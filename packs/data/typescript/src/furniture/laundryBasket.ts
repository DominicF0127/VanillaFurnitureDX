import { system } from "@minecraft/server";
import { NAMESPACE } from "globalConst";
import { decrementPlayerStack, getPlayerSelectedItem } from "utils";
import { BlockStateSuperset } from "@minecraft/vanilla-data";

system.beforeEvents.startup.subscribe(({blockComponentRegistry}) => {
    blockComponentRegistry.registerCustomComponent(`${NAMESPACE}:laundry_basket`, {
        onPlayerInteract({ block, player, dimension }) {
            const selectedItem = getPlayerSelectedItem(player);
            const hasLuandry = <number>block.permutation.getState(<keyof BlockStateSuperset>`${NAMESPACE}:laundry`);

            if (selectedItem && selectedItem.typeId == "maca_vf:laundry" && !hasLuandry) {
                // update block state
                block.setPermutation(block.permutation.withState(<keyof BlockStateSuperset>`${NAMESPACE}:laundry`, true));
                // decrement player held item stack
                decrementPlayerStack(player);
                // playsound
                dimension.playSound("block.decorated_pot.insert", block.location);
                return;
            }
        }
    });
});
