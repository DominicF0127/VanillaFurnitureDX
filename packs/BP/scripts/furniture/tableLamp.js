import { system } from "@minecraft/server";
import { NAMESPACE } from "globalConst";
system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent(`${NAMESPACE}:table_lamp`, {
        onPlayerInteract({ block, dimension }) {
            // playsound
            dimension.playSound("random.lever_click", block.center());
            const isLightOn = block.permutation.getState(`${NAMESPACE}:light_on`);
            block.setPermutation(block.permutation.withState(`${NAMESPACE}:light_on`, isLightOn ? false : true));
        },
    });
});
