import { system } from "@minecraft/server";
import { BlockStateSuperset } from "@minecraft/vanilla-data";
import { NAMESPACE } from "globalConst";
import { pickupBlock } from "./pickupBlock";

system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent(`${NAMESPACE}:kitchen_timer`, {
        onPlayerInteract({ block, player, dimension }) {
            const isTimerOn = <boolean>block.permutation.getState(<keyof BlockStateSuperset>`${NAMESPACE}:timer_on`);
            if (player.isSneaking && !isTimerOn) {
                // update timer_on state
                block.setPermutation(
                    block.permutation.withState(<keyof BlockStateSuperset>`${NAMESPACE}:timer_on`, true)
                );
                // set a run timeout
                system.runTimeout(() => {
                    // check if the block is still the kitchen timer
                    if (block.typeId !== `${NAMESPACE}:kitchen_timer`) return;
                    // update timer state
                    block.setPermutation(
                        block.permutation.withState(<keyof BlockStateSuperset>`${NAMESPACE}:timer_on`, false)
                    );
                    // playsound
                    dimension.playSound(`${NAMESPACE}:microwave.ding`, block.center());
                }, 20 * 30);
            } else {
                pickupBlock(block, player);
            }
        },
    });
});