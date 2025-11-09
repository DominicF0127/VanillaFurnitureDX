import { world, system } from "@minecraft/server";
import { NAMESPACE } from "globalConst";
import { Multiblock } from "multiblock/multiblock";
// --- Configuration ---
const CHECK_INTERVAL_TICKS = 5; // Check every 5 ticks (4 times per second)
const MOVEMENT_THRESHOLD_SQUARED = 0.01; // Movement > 0.1 blocks triggers close
const ROTATION_THRESHOLD_SQUARED = 0.01; // Rotation change > 0.1 degrees triggers close
const openContainerMap = new Map();
// --- Helper Functions ---
/** Calculates the squared distance between two Vector3 locations. */
function getDistanceSquared(a, b) {
    return (a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2;
}
/** Calculates the squared difference between two Vector2 rotations (pitch and yaw). */
function getRotationDifferenceSquared(a, b) {
    return (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
}
// --- 1. Detect Container Entity OPEN Event ---
world.afterEvents.playerInteractWithEntity.subscribe(event => {
    const { player, target } = event;
    // Only proceed if the entity has a container component
    if (target.typeId == "maca_vf:storage") {
        // playsound
        player.dimension.playSound("open_trapdoor.copper", player.location);
        // get the block
        const block = target.dimension.getBlock(target.location);
        // check if multiblock
        if (Multiblock.isMultiblock(block)) {
            // check block typeId
            if (block.typeId == "maca_vf:fridge") {
                const partId = block.permutation.getState("maca_vf:part");
            }
        }
        else {
            block.setPermutation(block.permutation.withState(`${NAMESPACE}:storage_open`, true));
        }
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
    const playersToStopTracking = [];
    for (const [playerId, trackingData] of openContainerMap.entries()) {
        try {
            const player = world.getEntity(playerId);
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
        }
        catch (error) {
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
function onContainerExit(player, entityId, reason) {
    // --- Your final script logic when a container entity is EXITED goes here ---
    player.dimension.playSound("open_trapdoor.copper", player.location);
    const entity = world.getEntity(entityId);
    const block = entity.dimension.getBlock(entity.location);
    block.setPermutation(block.permutation.withState(`${NAMESPACE}:storage_open`, false));
}
