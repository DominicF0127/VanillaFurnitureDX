import { system } from "@minecraft/server";
import { NAMESPACE } from "globalConst";
import { getPlayerSelectedItem } from "utils";
system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent(`${NAMESPACE}:lamp_stand`, {
        onPlayerInteract({ block, player, dimension }) {
            const selectedItem = getPlayerSelectedItem(player);
            if (selectedItem && selectedItem.typeId == "minecraft:wooden_axe")
                return;
            if (block.permutation.getState(`${NAMESPACE}:part`) == 1)
                return;
            // playsound
            dimension.playSound("random.lever_click", block.center());
            // get block state
            const isLightOn = block.permutation.getState(`${NAMESPACE}:light_on`);
            // change block state
            block.setPermutation(block.permutation.withState(`${NAMESPACE}:light_on`, isLightOn ? false : true));
        }
    });
});
