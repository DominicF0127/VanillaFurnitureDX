import { system } from "@minecraft/server";
import { BlockStateSuperset } from "@minecraft/vanilla-data";
import { dyeList } from "dyeList";
import { NAMESPACE } from "globalConst";
import { getPlayerSelectedItem } from "utils";

system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent(`${NAMESPACE}:open_and_close`, {
        onPlayerInteract({ block, player, dimension }) {
            const selectedItem = getPlayerSelectedItem(player);
            // check if player is holding a dye OR a wooden_axe item, if so, then exit
            if (selectedItem && (dyeList.has(selectedItem.typeId) || selectedItem.typeId == "minecraft:wooden_axe")) return;
            // playsound
            dimension.playSound("open_trapdoor.copper", block.center());
            // get block state
            const isOpen = block.permutation.getState(<keyof BlockStateSuperset>`${NAMESPACE}:open`);
            // change block state
            block.setPermutation(
                block.permutation.withState(<keyof BlockStateSuperset>`${NAMESPACE}:open`, isOpen ? false : true)
            );
        }
    });
});