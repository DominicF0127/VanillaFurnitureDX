import { system } from "@minecraft/server";
import { BlockStateSuperset } from "@minecraft/vanilla-data";
import { dyeList } from "dyeList";
import { NAMESPACE } from "globalConst";
import { Multiblock } from "multiblock/multiblock";
import { getPlayerSelectedItem } from "utils";

system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent(`${NAMESPACE}:color_variants`, {
        onPlayerInteract({ block, player, dimension }) {
            // get player selected item
            const selectedItem = getPlayerSelectedItem(player);
            // check if the player holding a dye item
            if (selectedItem && dyeList.has(selectedItem.typeId)) {
                if (Multiblock.isMultiblock(block)) {
                    new Multiblock(block, -1).setMultiblockState(<keyof BlockStateSuperset>`${NAMESPACE}:color_variant`, dyeList.get(selectedItem.typeId));
                } else {
                    // update block state
                    block.setPermutation(
                        block.permutation.withState(<keyof BlockStateSuperset>`${NAMESPACE}:color_variant`, dyeList.get(selectedItem.typeId))
                    );
                }
                // playsound
                dimension.playSound("sign.dye.use", block.location);
            }
        }
    });
});