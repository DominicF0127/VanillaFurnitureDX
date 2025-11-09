import { system } from "@minecraft/server";
import { BlockStateSuperset } from "@minecraft/vanilla-data";
import { NAMESPACE } from "globalConst";

system.beforeEvents.startup.subscribe(({blockComponentRegistry}) => {
    blockComponentRegistry.registerCustomComponent(`${NAMESPACE}:shower_head`, {
        onPlayerInteract({block}) {
            // state
            const isShowerOn = <boolean>block.permutation.getState(<keyof BlockStateSuperset>`${NAMESPACE}:shower_on`);
            // update state
            block.setPermutation(
                block.permutation.withState(<keyof BlockStateSuperset>`${NAMESPACE}:shower_on`, isShowerOn ? false : true)
            );
            // playsound
            block.dimension.playSound("open_trapdoor.copper", block.center());
        },
        onTick({block, dimension}) {
            // get state
            const isShowerOn = <boolean>block.permutation.getState(<keyof BlockStateSuperset>`${NAMESPACE}:shower_on`);
            // if isShowerOn is false, then exit
            if (!isShowerOn) return;
            // spawn particles
            dimension.spawnParticle(`${NAMESPACE}:shower_water_drop_particle`, block.center());
            // playsound
            dimension.playSound("liquid.water", block.center());
        },
    });
});