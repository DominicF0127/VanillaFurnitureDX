import { Entity, EntityRideableComponent, EntityComponentTypes, system } from "@minecraft/server";
import { dyeList } from "dyeList";
import { NAMESPACE } from "globalConst";
import { getPlayerSelectedItem } from "utils";

system.beforeEvents.startup.subscribe(({blockComponentRegistry}) => {
    blockComponentRegistry.registerCustomComponent(`${NAMESPACE}:sittable`, {
        onPlayerInteract({block, dimension, player}) {
            const selectedItem = getPlayerSelectedItem(player);
            // check if the player is holding a dye OR a wooden axe item, if so, then exit
            if (selectedItem && (dyeList.has(selectedItem.typeId) || selectedItem.typeId == "minecraft:wooden_axe")) return;
            // get set position
            const cardinalDirection = block.permutation.getState("minecraft:cardinal_direction")! as string;
            const seatPosition = block.getTags().filter(tag => tag.includes("seat_position"))[0];
            const seatRotation = (<{[key: string]: number}>{north: 0, east: 90, south: 180, west: 270})[cardinalDirection];
            // spawn sittable entity
            const sittable: Entity = dimension.spawnEntity(`${NAMESPACE}:sittable`, block.bottomCenter());
            sittable.setRotation({x: 0, y: seatRotation});
            // trigger an event
            if (seatPosition) sittable.triggerEvent(`${seatPosition}`);
            // add player as the rider of sittable entity
            (<EntityRideableComponent>sittable.getComponent(EntityComponentTypes.Rideable))?.addRider(player as Entity);
            // playsound
            dimension.playSound("block.itemframe.add_item", block.location);
        },
    });
});