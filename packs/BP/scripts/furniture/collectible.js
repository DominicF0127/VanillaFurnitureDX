import { EquipmentSlot, ItemStack, system } from "@minecraft/server";
import { NAMESPACE } from "globalConst";
import { getPlayerSelectedItem } from "utils";
system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent(`${NAMESPACE}:collectible`, {
        onPlayerInteract(event) {
            collectibleBlock(event.block, event.player);
        }
    });
});
export function collectibleBlock(block, player) {
    const selectedItem = getPlayerSelectedItem(player);
    const isCollectible = block.getTags().includes(`${NAMESPACE}:collectible`);
    // check if the player hand is empty and the interacted block has collectible tag
    if (!selectedItem && isCollectible) {
        // play sound
        block.dimension.playSound("block.itemframe.add_item", block.location);
        // give player itemStack the same as interacted block.typeId
        player.getComponent("equippable").setEquipment(EquipmentSlot.Mainhand, new ItemStack(block.typeId));
        // set the new type of interacted block
        block.setType("minecraft:air");
    }
}
