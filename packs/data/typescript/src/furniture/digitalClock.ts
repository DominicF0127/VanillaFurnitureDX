import { system, world } from "@minecraft/server";
import { BlockStateSuperset } from "@minecraft/vanilla-data";
import { NAMESPACE } from "globalConst";
// register custom components
system.beforeEvents.startup.subscribe(({blockComponentRegistry}) => {
    blockComponentRegistry.registerCustomComponent(`${NAMESPACE}:digital_clock`, {
        onTick({block}) {
            const timeOfDay = world.getTimeOfDay();
            const adjustedTime = (timeOfDay + 6000) % 12000;
            const hour = Math.floor(adjustedTime / 1000);
            block.setPermutation(block.permutation.withState(<keyof BlockStateSuperset>`${NAMESPACE}:time`, hour));
        }
    });
});