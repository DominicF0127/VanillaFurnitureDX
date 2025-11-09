import { world } from "@minecraft/server";
world.beforeEvents.playerInteractWithEntity.subscribe((event) => {
    // if not container_util then exit
    if (event.target.typeId !== "maca_vf:container_util")
        return;
    if (event.target.dimension.getBlock(event.target.location).typeId == "maca_vf:safe_box") {
        const dp = event.target.getDynamicProperty("maca_vf:safe_box");
        world.sendMessage(`${dp} = ${event.player.id}`);
        if (!dp) {
            event.target.setDynamicProperty("maca_vf:safe_box", event.player.id);
        }
        else {
            if (dp !== event.player.id) {
                event.cancel = true;
            }
        }
        // event.cancel = true;
    }
});
world.beforeEvents.playerBreakBlock.subscribe((event) => {
    if (event.block.typeId !== "maca_vf:safe_box")
        return;
    const dp = event.dimension.getEntitiesAtBlockLocation(event.block.bottomCenter()).shift().getDynamicProperty("maca_vf:safe_box");
    if (dp !== event.player.id) {
        event.cancel = true;
    }
});
