import { ItemStack, MolangVariableMap, system } from "@minecraft/server";
import { NAMESPACE } from "globalConst";
// register custom component for bread basket
system.beforeEvents.startup.subscribe((beforeEvents) => {
    beforeEvents.blockComponentRegistry.registerCustomComponent(`${NAMESPACE}:garden_lanterns`, {
        onPlace({ block }) {
            if (block.typeId == `${NAMESPACE}:garden_lantern` && block.above().typeId.includes("_chain")) {
                block.setPermutation(block.permutation.withState(`${NAMESPACE}:hanging`, true));
            }
        },
        onTick({ block, dimension }) {
            let loc = block.center();
            // if garden_lantern
            if (block.typeId == `${NAMESPACE}:garden_lantern`) {
                // get block state
                const isHanging = block.permutation.getState(`${NAMESPACE}:hanging`);
                // set loc
                loc = { x: loc.x, y: loc.y - 0.3, z: loc.z };
                // check if true
                if (isHanging == true) {
                    if (!block.above().typeId.includes("_chain")) {
                        dimension.spawnItem(new ItemStack(block.typeId), block.center());
                        block.setType("minecraft:air");
                        return;
                    }
                    // set loc
                    loc = { x: loc.x, y: loc.y + 0.2, z: loc.z };
                }
                // spawn particles
                dimension.spawnParticle(`${NAMESPACE}:garden_lantern_sparkle_particle`, loc);
            }
            // if garden_concrete_lantern
            if (block.typeId == `${NAMESPACE}:garden_concrete_lantern`) {
                dimension.spawnParticle(`${NAMESPACE}:garden_lantern_sparkle_particle`, { x: loc.x, y: loc.y + 0.75, z: loc.z });
            }
            // if garden_wall_mounted_lantern
            if (block.typeId == `${NAMESPACE}:garden_wall_mounted_lantern`) {
                const direction = block.permutation.getState("minecraft:cardinal_direction");
                const molang = new MolangVariableMap();
                if (direction == "north")
                    molang.setVector3(`${NAMESPACE}`, { x: 0, y: 0.1, z: -0.17 });
                else if (direction == "east")
                    molang.setVector3(`${NAMESPACE}`, { x: 0.17, y: 0.1, z: 0 });
                else if (direction == "south")
                    molang.setVector3(`${NAMESPACE}`, { x: 0, y: 0.1, z: 0.17 });
                else if (direction == "west")
                    molang.setVector3(`${NAMESPACE}`, { x: -0.17, y: 0.1, z: 0 });
                dimension.spawnParticle(`${NAMESPACE}:garden_wall_mounted_lantern_sparkle_particle`, loc, molang);
            }
        },
    });
});
