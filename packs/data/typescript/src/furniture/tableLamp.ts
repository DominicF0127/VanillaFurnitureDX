import { system } from "@minecraft/server";
import { NAMESPACE } from "globalConst";
import { BlockStateSuperset } from "@minecraft/vanilla-data";

system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent(`${NAMESPACE}:table_lamp`, {
        onPlayerInteract({ block, dimension }) {
            // playsound
            dimension.playSound("random.lever_click", block.center());
            const isLightOn = <boolean>block.permutation.getState(<keyof BlockStateSuperset>`${NAMESPACE}:light_on`);
            block.setPermutation(
                block.permutation.withState(<keyof BlockStateSuperset>`${NAMESPACE}:light_on`, isLightOn ? false : true)
            );
        },
    });
});