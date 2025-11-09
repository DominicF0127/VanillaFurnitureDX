import { MolangVariableMap, system } from "@minecraft/server";
import { NAMESPACE } from "globalConst";
import { getCardinalDirectionVector } from "utils";
system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent(`${NAMESPACE}:exhaust_particle`, {
        onTick({ block }) {
            const molang = new MolangVariableMap();
            molang.setSpeedAndDirection(`${NAMESPACE}`, 0, getCardinalDirectionVector(block));
            block.dimension.spawnParticle(`${NAMESPACE}:exhaust_particle`, block.center(), molang);
            // block.dimension.playSound(`${NAMESPACE}:air_conditioner`, block.center(), {volume: 0.2});
        } // onTick
    });
});
