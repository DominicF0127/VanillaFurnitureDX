import { ItemStack, system } from "@minecraft/server";
import { NAMESPACE } from "globalConst";
import { decrementPlayerStack, getPlayerSelectedItem } from "utils";
const musicDiscList = [
    "minecraft:music_disc_13",
    "minecraft:music_disc_cat",
    "minecraft:music_disc_blocks",
    "minecraft:music_disc_chirp",
    "minecraft:music_disc_far",
    "minecraft:music_disc_mall",
    "minecraft:music_disc_mellohi",
    "minecraft:music_disc_stal",
    "minecraft:music_disc_strad",
    "minecraft:music_disc_ward",
    "minecraft:music_disc_11",
    "minecraft:music_disc_wait",
    "minecraft:music_disc_5",
    "minecraft:music_disc_otherside",
    "minecraft:music_disc_pigstep"
];
system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent(`${NAMESPACE}:record_player`, {
        onPlayerInteract(event) {
            const { block, player, dimension } = event;
            const { x, y, z } = block.center();
            const playRecordState = block.permutation.getState(`${NAMESPACE}:play_record`);
            const selectedItem = getPlayerSelectedItem(player);
            if (playRecordState == 0 && (selectedItem == undefined || !musicDiscList.includes(selectedItem.typeId)))
                return;
            if (playRecordState == 0 && selectedItem !== undefined && musicDiscList.includes(selectedItem.typeId)) {
                const musicDisc = selectedItem.typeId;
                const musicDiscIndex = musicDiscList.indexOf(musicDisc) + 1;
                // update block state
                block.setPermutation(block.permutation.withState(`${NAMESPACE}:play_record`, musicDiscIndex));
                // decrement stack
                decrementPlayerStack(player);
                // play the record
                dimension.runCommand(`playsound record.${musicDisc.slice(21)} @a ${x} ${y} ${z}`);
            }
            else {
                // update block state
                block.setPermutation(block.permutation.withState(`${NAMESPACE}:play_record`, 0));
                const musicDisc = musicDiscList[playRecordState - 1];
                // return the music disc
                dimension.spawnItem(new ItemStack(musicDisc), block.center());
                // stop sound
                dimension.runCommand(`stopsound @a record.${musicDisc.slice(21)}`);
            }
        },
        onPlayerBreak({ block, brokenBlockPermutation, dimension }) {
            const playRecordState = brokenBlockPermutation.getState(`${NAMESPACE}:play_record`);
            if (playRecordState == 0)
                return;
            const musicDisc = musicDiscList[playRecordState - 1];
            // return the music disc
            dimension.spawnItem(new ItemStack(musicDisc), block.center());
            // stop sound
            dimension.runCommand(`stopsound @a record.${musicDisc.slice(21)}`);
        },
        onTick({ block, dimension }) {
            const playRecordState = block.permutation.getState(`${NAMESPACE}:play_record`);
            if (playRecordState == 0)
                return;
            dimension.spawnParticle(`${NAMESPACE}:musical_notes_particle`, block.bottomCenter());
        },
    });
});
