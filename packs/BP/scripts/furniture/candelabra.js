import { MolangVariableMap, system } from "@minecraft/server";
import { NAMESPACE } from "globalConst";
import { getPlayerSelectedItem } from "utils";
// register custom component
system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent(`${NAMESPACE}:candelabra`, {
        onTick({ block, dimension }) {
            const isLit = block.permutation.getState(`${NAMESPACE}:lit`);
            if (isLit == true) {
                const molang = new MolangVariableMap();
                if (block.typeId == `${NAMESPACE}:chandelier_candelabra`) {
                    molang.setVector3(`${NAMESPACE}`, { x: 0, y: 0.4, z: 0.29 }); //[0, 0.4, 0.29]
                    dimension.spawnParticle("maca_vf:candelabrum_flame_particle", block.bottomCenter(), molang);
                    molang.setVector3(`${NAMESPACE}`, { x: -0.29, y: 0.4, z: -0.25 }); //[-0.29, 0.4, -0.25]
                    dimension.spawnParticle("maca_vf:candelabrum_flame_particle", block.bottomCenter(), molang);
                    molang.setVector3(`${NAMESPACE}`, { x: 0.29, y: 0.4, z: -0.25 }); //[0.29, 0.4, -0.25]
                    dimension.spawnParticle("maca_vf:candelabrum_flame_particle", block.bottomCenter(), molang);
                }
                if (block.typeId == `${NAMESPACE}:five_arm_candelabra`) {
                    molang.setVector3(`${NAMESPACE}`, { x: 0, y: 0.3, z: 0 });
                    dimension.spawnParticle("maca_vf:candelabrum_flame_particle", block.center(), molang);
                    molang.setVector3(`${NAMESPACE}`, { x: 0.25, y: 0.22, z: 0 });
                    dimension.spawnParticle("maca_vf:candelabrum_flame_particle", block.center(), molang);
                    molang.setVector3(`${NAMESPACE}`, { x: -0.25, y: 0.22, z: 0 });
                    dimension.spawnParticle("maca_vf:candelabrum_flame_particle", block.center(), molang);
                    molang.setVector3(`${NAMESPACE}`, { x: 0, y: 0.22, z: 0.25 });
                    dimension.spawnParticle("maca_vf:candelabrum_flame_particle", block.center(), molang);
                    molang.setVector3(`${NAMESPACE}`, { x: 0, y: 0.22, z: -0.25 });
                    dimension.spawnParticle("maca_vf:candelabrum_flame_particle", block.center(), molang);
                }
                if (block.typeId == `${NAMESPACE}:three_arm_candelabra`) {
                    const cardinalDirection = block.permutation.getState("minecraft:cardinal_direction");
                    molang.setVector3(`${NAMESPACE}`, { x: 0, y: 0.3, z: 0 });
                    dimension.spawnParticle("maca_vf:candelabrum_flame_particle", block.center(), molang);
                    if (cardinalDirection == "north" || cardinalDirection == "south") {
                        molang.setVector3(`${NAMESPACE}`, { x: 0.25, y: 0.22, z: 0 });
                        dimension.spawnParticle("maca_vf:candelabrum_flame_particle", block.center(), molang);
                        molang.setVector3(`${NAMESPACE}`, { x: -0.25, y: 0.22, z: 0 });
                        dimension.spawnParticle("maca_vf:candelabrum_flame_particle", block.center(), molang);
                    }
                    else {
                        molang.setVector3(`${NAMESPACE}`, { x: 0, y: 0.22, z: 0.25 });
                        dimension.spawnParticle("maca_vf:candelabrum_flame_particle", block.center(), molang);
                        molang.setVector3(`${NAMESPACE}`, { x: 0, y: 0.22, z: -0.25 });
                        dimension.spawnParticle("maca_vf:candelabrum_flame_particle", block.center(), molang);
                    }
                }
            }
        },
        onPlayerInteract({ block, player, dimension }) {
            const playerSelectedItem = getPlayerSelectedItem(player);
            if (playerSelectedItem && playerSelectedItem.typeId == "minecraft:flint_and_steel") {
                // get block state
                const isLit = block.permutation.getState(`${NAMESPACE}:lit`);
                // update state
                block.setPermutation(block.permutation.withState(`${NAMESPACE}:lit`, isLit ? false : true));
                // playsoun
                dimension.playSound("fire.ignite", block.center());
            }
        },
    });
});
system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent(`${NAMESPACE}:big_candle`, {
        onPlayerInteract({ block, player, dimension }) {
            const playerSelectedItem = getPlayerSelectedItem(player);
            if (playerSelectedItem && playerSelectedItem.typeId == "minecraft:flint_and_steel") {
                // update state
                const isLit = block.permutation.getState(`${NAMESPACE}:lit`);
                block.setPermutation(block.permutation.withState(`${NAMESPACE}:lit`, isLit ? false : true));
                // playsound
                dimension.playSound("fire.ignite", block.center());
            }
        },
        onTick({ block, dimension }) {
            const isLit = block.permutation.getState(`${NAMESPACE}:lit`);
            if (isLit == true) {
                const molang = new MolangVariableMap();
                const cardinalDirection = block.permutation.getState("minecraft:cardinal_direction");
                // check in what direction
                if (cardinalDirection == "north") {
                    molang.setVector3(`${NAMESPACE}`, { x: 0, y: 0.4, z: -0.255 });
                }
                else if (cardinalDirection == "south") {
                    molang.setVector3(`${NAMESPACE}`, { x: 0, y: 0.4, z: 0.255 });
                }
                else if (cardinalDirection == "east") {
                    molang.setVector3(`${NAMESPACE}`, { x: 0.255, y: 0.4, z: 0 });
                }
                else if (cardinalDirection == "west") {
                    molang.setVector3(`${NAMESPACE}`, { x: -0.255, y: 0.4, z: 0 });
                }
                dimension.spawnParticle("maca_vf:candelabrum_flame_particle", block.bottomCenter(), molang);
            }
        }
    });
});
