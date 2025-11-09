import { system } from "@minecraft/server";
import { NAMESPACE } from "globalConst";
import { pickupBlock } from "./pickupBlock";
system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent(`${NAMESPACE}:kitchen_timer`, {
        onPlayerInteract({ block, player, dimension }) {
            const isTimerOn = block.permutation.getState(`${NAMESPACE}:timer_on`);
            if (player.isSneaking && !isTimerOn) {
                // update timer_on state
                block.setPermutation(block.permutation.withState(`${NAMESPACE}:timer_on`, true));
                // set a run timeout
                system.runTimeout(() => {
                    // check if the block is still the kitchen timer
                    if (block.typeId !== `${NAMESPACE}:kitchen_timer`)
                        return;
                    // update timer state
                    block.setPermutation(block.permutation.withState(`${NAMESPACE}:timer_on`, false));
                    // playsound
                    dimension.playSound(`${NAMESPACE}:microwave.ding`, block.center());
                }, 20 * 30);
            }
            else {
                pickupBlock(block, player);
            }
        },
    });
});
