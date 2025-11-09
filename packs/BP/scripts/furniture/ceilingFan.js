import { system } from "@minecraft/server";
import { NAMESPACE } from "globalConst";
import { getPlayerSelectedItem } from "utils";
system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent(`${NAMESPACE}:ceiling_fan`, {
        onPlace({ block, dimension }) {
            dimension.spawnEntity(`${NAMESPACE}:ceiling_fan_util`, block.bottomCenter());
        },
        onPlayerInteract({ block, player, dimension }) {
            // get player selected item
            const selectedItem = getPlayerSelectedItem(player);
            // check if player holding a wooden axe item
            if (selectedItem && selectedItem.typeId == "minecraft:wooden_axe") {
                // get wood_variant state
                const woodVariant = block.permutation.getState(`${NAMESPACE}:wood_variant`);
                // get the ceiling fan util entity
                const ceilingFanUtil = dimension.getEntitiesAtBlockLocation(block.center()).shift();
                if (ceilingFanUtil.typeId !== `${NAMESPACE}:ceiling_fan_util`)
                    return;
                // update ceiling fan util property
                ceilingFanUtil.setProperty(`${NAMESPACE}:wood_variant`, woodVariant == 11 ? 0 : woodVariant + 1);
            }
        }
    });
});
