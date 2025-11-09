import { system } from "@minecraft/server";
import { BlockStateSuperset } from "@minecraft/vanilla-data";
import { NAMESPACE } from "globalConst";
import { getPlayerSelectedItem } from "utils";

system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent(`${NAMESPACE}:lights`, {
        onPlayerInteract({ block, player, dimension }) {
            const selectedItem = getPlayerSelectedItem(player);
            if (selectedItem && selectedItem.typeId == "minecraft:wooden_axe") return;
            // playsound
            dimension.playSound("random.lever_click", block.center());
            // get block state
            const isLightOn = block.permutation.getState(<keyof BlockStateSuperset>`${NAMESPACE}:light_on`);
            // change block state
            block.setPermutation(
                block.permutation.withState(<keyof BlockStateSuperset>`${NAMESPACE}:light_on`, isLightOn ? false : true)
            );
        }
    });
});