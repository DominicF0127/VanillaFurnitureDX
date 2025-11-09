import { Block, EntityComponentTypes, Player, system, Vector2, Vector3, world } from "@minecraft/server";
import { NAMESPACE } from "globalConst";
import { numberCardinalDirection } from "utils";
import { BlockStateSuperset } from "@minecraft/vanilla-data";
import { Multiblock } from "multiblock/multiblock";

system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent(`${NAMESPACE}:container_block`, {
        onPlace({ block, dimension }) {
            // block cardinal direction
            const cardinalDirection = block.permutation.getState("minecraft:cardinal_direction");
            // cardinal direction as rotation
            const rotation = numberCardinalDirection(cardinalDirection);

            // check block typeId for some specific count and location of container
            if (block.getTags().includes("maca_vf:container_block.multiblock")) {
                const multiblocks = new Multiblock(block, -1).getMultiblocks();
                const skipPart = [];
                // 
                if (block.typeId == "maca_vf:tv_table" || 
                    block.typeId == "maca_vf:fireplace" || 
                    block.typeId == "maca_vf:drawer_bookshelf" || 
                    block.typeId == "maca_vf:drawer_scrollrack"
                ) {
                    skipPart.push("2");
                }
                // 
                multiblocks.forEach((block, key) => {
                    if (!skipPart.includes(key)) {
                        spawnContainerEntity(block);
                    }
                });
                return;
            }

            // spawn container entity at one block
            spawnContainerEntity(block);

            // function to spawn the container entity
            function spawnContainerEntity(block: Block) {
                // spawn container entity
                const containerEntity = dimension.spawnEntity(`${NAMESPACE}:container_util`, block.above(50).location);
                // set rotation and trigger events to container entity
                containerEntity.setRotation({ x: 0, y: rotation });
                containerEntity.triggerEvent(`${NAMESPACE}:${cardinalDirection}`);
                containerEntity.triggerEvent(`${NAMESPACE}:kill`);
                // teleport the container entity to its right position
                system.runTimeout(() => {
                    containerEntity.teleport(block.bottomCenter());
                }, 5);
            }
        },
        // onPlayerBreak({ block }) {
        //     breakContainerBlock(block);
        // }
    });
});

// world.afterEvents.blockExplode.subscribe(({ block, explodedBlockPermutation }) => {
//     if (explodedBlockPermutation.getTags().includes("container_block")) {
//         breakContainerBlock(block);
//     }
// });

system.afterEvents.scriptEventReceive.subscribe(({ sourceEntity, message }) => {
    // if the sourceEntity is not container_util, then exit
    if (sourceEntity.typeId !== "maca_vf:container_util") return;
    // 
    const container = sourceEntity.getComponent(EntityComponentTypes.Inventory).container;
    for (let i = 0; i < container.size; i++) {
        const item = container?.getItem(i);
        if (item) {
            sourceEntity.dimension.spawnItem(item, sourceEntity.location);
        }
    }
    sourceEntity.remove();
});

// function breakContainerBlock(block: Block) {
//     const dimension = block.dimension;
//     const containerEntity = dimension.getEntitiesAtBlockLocation(block.center()).shift();
//     if (containerEntity.typeId !== `${NAMESPACE}:container_util`) return;

//     const container = containerEntity.getComponent(EntityComponentTypes.Inventory).container;
//     for (let i = 0; i < container.size; i++) {
//         const item = container?.getItem(i);
//         if (item) {
//             dimension.spawnItem(item, block.center());
//         }
//     }
//     containerEntity.remove();
// }

// --- Configuration ---
const CHECK_INTERVAL_TICKS = 5; // Check every 5 ticks (4 times per second)
const MOVEMENT_THRESHOLD_SQUARED = 0.01; // Movement > 0.1 blocks triggers close
const ROTATION_THRESHOLD_SQUARED = 0.01; // Rotation change > 0.1 degrees triggers close
// --- Tracking Map ---
// Tracks player state: entity ID, location, and rotation when tracking started.
interface PlayerTrackingData {
    entityId: string;
    location: Vector3;
    rotation: Vector2;
}

const openContainerMap = new Map<string, PlayerTrackingData>(); 

// --- Helper Functions ---
/** Calculates the squared distance between two Vector3 locations. */
function getDistanceSquared(a: Vector3, b: Vector3): number {
    return (a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2;
}
/** Calculates the squared difference between two Vector2 rotations (pitch and yaw). */
function getRotationDifferenceSquared(a: Vector2, b: Vector2): number {
    return (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
}

// --- 1. Detect Container Entity OPEN Event ---
world.afterEvents.playerInteractWithEntity.subscribe(event => {
    const { player, target } = event;
    // Only proceed if the entity is a container
    if (target.typeId == "maca_vf:container_util") {
        // playsound
        player.dimension.playSound("open_trapdoor.copper", player.location);
        // get the block
        const block = target.dimension.getBlock(target.location);
        // update block state
        block.setPermutation(
            block.permutation.withState(<keyof BlockStateSuperset>`${NAMESPACE}:open`, true)
        );
        // Save the current state of the player
        openContainerMap.set(player.id, { 
            entityId: target.id, 
            location: player.location,
            rotation: player.getRotation()
        });
    }
});

// --- 2. Detect Container UI EXIT (Consolidated Workaround) ---
system.runInterval(() => {
    const playersToStopTracking: string[] = [];

    for (const [playerId, trackingData] of openContainerMap.entries()) {
        try {
            const player = world.getEntity(playerId) as Player | undefined;
            // A. Safety/Disconnect Check
            if (!player || !player.isValid) {
                playersToStopTracking.push(playerId);
                continue;
            }
            // B. Entity Destruction Check
            const entity = world.getEntity(trackingData.entityId);
            if (!entity || !entity.isValid) {
                onContainerExit(player, trackingData.entityId, "Entity Destroyed");
                playersToStopTracking.push(playerId);
                continue;
            }
            // C. Consolidated Detection (Movement OR Viewpoint Change)
            let exitDetected = false;
            // Check 1: Movement Check
            const distanceMovedSq = getDistanceSquared(player.location, trackingData.location);
            if (distanceMovedSq > MOVEMENT_THRESHOLD_SQUARED) {
                onContainerExit(player, trackingData.entityId, "Movement Detected");
                exitDetected = true;
            }
            // Check 2: Viewpoint Check (Only if movement wasn't already detected)
            if (!exitDetected) {
                const rotationChangeSq = getRotationDifferenceSquared(player.getRotation(), trackingData.rotation);
                if (rotationChangeSq > ROTATION_THRESHOLD_SQUARED) {
                    onContainerExit(player, trackingData.entityId, "Viewpoint Change Detected");
                    exitDetected = true;
                }
            }

            if (exitDetected) {
                playersToStopTracking.push(playerId);
            }

        } catch (error) {
            console.error(`Error in consolidated check for player ${playerId}: ${error}`);
            playersToStopTracking.push(playerId);
        }
    }
    // Clean up the tracking map
    for (const playerId of playersToStopTracking) {
        openContainerMap.delete(playerId);
    }

}, CHECK_INTERVAL_TICKS);

// --- 3. The Exit Logic Function ---
function onContainerExit(player: Player, entityId: string, reason: string) {
    // --- Your final script logic when a container entity is EXITED goes here ---

    // play sound
    player.dimension.playSound("open_trapdoor.copper", player.location);
    // get the container entity
    const entity = world.getEntity(entityId);
    // get the block linked to the contianer
    const block = entity.dimension.getBlock(entity.location);
    // update block state
    block.setPermutation(
        block.permutation.withState(<keyof BlockStateSuperset>`${NAMESPACE}:open`, false)
    );

}