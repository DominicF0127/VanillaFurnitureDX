import { Block, EquipmentSlot, ItemStack, Player, system } from "@minecraft/server";
import { NAMESPACE } from "globalConst";
import { getPlayerSelectedItem } from "utils";

system.beforeEvents.startup.subscribe(({blockComponentRegistry}) => {
    blockComponentRegistry.registerCustomComponent(`${NAMESPACE}:pickup_block`, {
        onPlayerInteract({ block, player}) {
            pickupBlock(block, player);
        }
    });
});

export function pickupBlock(block: Block, player: Player): void {
    const selectedItem = getPlayerSelectedItem(player);
    // check if the player hand is empty
    if (!selectedItem) {
        // play sound
        block.dimension.playSound("block.itemframe.add_item", block.location);
        // give player itemStack the same as interacted block.typeId
        player.getComponent("equippable").setEquipment(EquipmentSlot.Mainhand, new ItemStack(block.typeId));
        // set the new type of interacted block
        block.setType("minecraft:air");
    }
}
