import { system } from "@minecraft/server";
import { NAMESPACE } from "globalConst";
import { decrementPlayerStack, getPlayerSelectedItem } from "utils";
system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent(`${NAMESPACE}:laundry_basket`, {
        onPlayerInteract({ block, player, dimension }) {
            const selectedItem = getPlayerSelectedItem(player);
            const hasLuandry = block.permutation.getState(`${NAMESPACE}:laundry`);
            if (selectedItem && selectedItem.typeId == "maca_vf:laundry" && !hasLuandry) {
                // update block state
                block.setPermutation(block.permutation.withState(`${NAMESPACE}:laundry`, true));
                // decrement player held item stack
                decrementPlayerStack(player);
                // playsound
                dimension.playSound("block.decorated_pot.insert", block.location);
                return;
            }
        }
    });
});
