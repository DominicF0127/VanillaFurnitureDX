import { Entity, EntityRideableComponent, EntityComponentTypes, system } from "@minecraft/server";
import { BlockStateSuperset } from "@minecraft/vanilla-data";
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
            let seatRotation = (<{[key: string]: number}>{north: 0, east: 90, south: 180, west: 270})[cardinalDirection];

            // chenk if picnic_table
            if (block.typeId == "maca_vf:picnic_table") {
                const multiblockPart = block.permutation.getState(<keyof BlockStateSuperset>`${NAMESPACE}:part`);
                if (multiblockPart == 2 || multiblockPart == 3) return;
                if (multiblockPart == 1) {
                    seatRotation = (<{[key: string]: number}>{north: 180, east: 270, south: 0, west: 90})[cardinalDirection];
                }
            }
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