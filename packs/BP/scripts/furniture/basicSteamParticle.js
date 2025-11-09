import { system } from "@minecraft/server";
import { NAMESPACE } from "globalConst";
system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent(`${NAMESPACE}:basic_steam_particle`, {
        onTick({ block, dimension }) {
            const { x, y, z } = block.bottomCenter();
            if (Math.random() < 0.5) {
                dimension.spawnParticle(`${NAMESPACE}:basic_steam_particle`, { x: x, y: y + 0.3, z: z });
            }
        }
    });
});
