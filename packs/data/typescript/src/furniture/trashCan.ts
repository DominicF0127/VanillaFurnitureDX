import { EntityComponentTypes, EquipmentSlot, system } from "@minecraft/server";
import { BlockStateSuperset } from "@minecraft/vanilla-data";
import { NAMESPACE } from "globalConst";

system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent(`${NAMESPACE}:trash_can`, {
        onPlayerInteract({ block, player, dimension }) {
            const isTrashCanOpen = block.permutation.getState(<keyof BlockStateSuperset>`${NAMESPACE}:trash_can_open`);
            // check if the state
            if (isTrashCanOpen) {
                // playsound
                block.dimension.playSound("open_trapdoor.copper", block.center());
                // remove mainhand item stack
                player.getComponent(EntityComponentTypes.Equippable).getEquipmentSlot(EquipmentSlot.Mainhand).setItem(undefined);
                // update block state
                block.setPermutation(
                    block.permutation.withState(<keyof BlockStateSuperset>`${NAMESPACE}:trash_can_open`, false)
                );
            } else {
                // playsound
                block.dimension.playSound("open_trapdoor.copper", block.center());
                // update block state
                block.setPermutation(
                    block.permutation.withState(<keyof BlockStateSuperset>`${NAMESPACE}:trash_can_open`, true)
                );
            }
        }
    });
});