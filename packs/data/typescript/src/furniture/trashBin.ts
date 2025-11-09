import { EntityComponentTypes, EquipmentSlot, system } from "@minecraft/server";
import { BlockStateSuperset } from "@minecraft/vanilla-data";
import { dyeList } from "dyeList";
import { NAMESPACE } from "globalConst";
import { getPlayerSelectedItem } from "utils";

system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent(`${NAMESPACE}:trash_bin`, {
        onPlayerInteract({ block, player, dimension }) {
            const selectedItem = getPlayerSelectedItem(player);
            // check if player is holding a dye OR a wooden_axe item, if so, then exit
            if (selectedItem && dyeList.has(selectedItem.typeId)) return;
            // get block state
            const isTrashBinOpen = block.permutation.getState(<keyof BlockStateSuperset>`${NAMESPACE}:trash_bin_open`);
            // check if the state
            if (isTrashBinOpen) {
                // playsound
                dimension.playSound("open_trapdoor.copper", block.center());
                // remove mainhand item stack
                player.getComponent(EntityComponentTypes.Equippable).getEquipmentSlot(EquipmentSlot.Mainhand).setItem(undefined);
                // update block state
                block.setPermutation(
                    block.permutation.withState(<keyof BlockStateSuperset>`${NAMESPACE}:trash_bin_open`, false)
                );
            } else {
                // playsound
                block.dimension.playSound("open_trapdoor.copper", block.center());
                // update block state
                block.setPermutation(
                    block.permutation.withState(<keyof BlockStateSuperset>`${NAMESPACE}:trash_bin_open`, true)
                );
            }
        }
    });
});