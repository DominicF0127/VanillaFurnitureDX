import { system } from "@minecraft/server";
import { NAMESPACE } from "globalConst";
import { getPlayerSelectedItem } from "utils";
// register custom component for bread basket
system.beforeEvents.startup.subscribe((beforeEvents) => {
    beforeEvents.blockComponentRegistry.registerCustomComponent(`${NAMESPACE}:fire_pit`, {
        onTick({ block, dimension }) {
            const isLit = block.permutation.getState(`${NAMESPACE}:lit`);
            if (isLit == true) {
                const { x, y, z } = block.center();
                dimension.spawnParticle("maca_vf:fire_pit_flame_particle", { x: x, y: y + 0.2, z: z });
                dimension.spawnParticle("minecraft:campfire_smoke_particle", block.center());
                dimension.playSound("block.campfire.crackle", block.center());
            }
        },
        onPlayerInteract({ block, player, dimension }) {
            const playerSelectedItem = getPlayerSelectedItem(player);
            if (!playerSelectedItem || playerSelectedItem.typeId !== "minecraft:flint_and_steel")
                return;
            const isLit = block.permutation.getState(`${NAMESPACE}:lit`);
            block.setPermutation(block.permutation.withState(`${NAMESPACE}:lit`, isLit ? false : true));
            dimension.playSound("fire.ignite", block.center());
        },
    });
});
