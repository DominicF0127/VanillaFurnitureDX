import { EquipmentSlot, GameMode, EntityComponentTypes } from "@minecraft/server";
import { NAMESPACE } from "globalConst";
export function getPlayerSelectedItem(player) {
    const inventory = player.getComponent("equippable");
    const selectedItem = inventory.getEquipment(EquipmentSlot.Mainhand);
    return selectedItem;
}
export function getPlayerInventory(player) {
    const inventory = player.getComponent(EntityComponentTypes.Inventory);
    // const selectedItem = inventory.getEquipment(EquipmentSlot.Mainhand);
    return inventory;
}
export function decrementPlayerStack(player) {
    const inventory = player.getComponent("equippable");
    const selectedItem = inventory.getEquipment(EquipmentSlot.Mainhand);
    if (selectedItem != undefined && player.getGameMode() !== GameMode.Creative) {
        if (selectedItem.amount === 1) {
            inventory.setEquipment(EquipmentSlot.Mainhand, undefined);
        }
        else {
            selectedItem.amount -= 1;
            inventory.setEquipment(EquipmentSlot.Mainhand, selectedItem);
        }
    }
}
export function getRelevantEnchantments(item) {
    let unbreakingLevel = 0;
    let hasSilkTouch = false;
    let fortuneLevel = 0;
    try {
        const enchantableComponent = item.getComponent("minecraft:enchantable");
        if (enchantableComponent) {
            const enchantments = enchantableComponent.getEnchantments();
            for (const enchant of enchantments) {
                if (enchant.type.id === "unbreaking") {
                    unbreakingLevel = enchant.level;
                }
                else if (enchant.type.id === "silk_touch") {
                    hasSilkTouch = true;
                }
                else if (enchant.type.id === "fortune") {
                    fortuneLevel = enchant.level;
                }
            }
        }
    }
    catch (error) {
    }
    return { unbreakingLevel, hasSilkTouch, fortuneLevel };
}
export function blockGeneratedDynamicPropertyId(block) {
    const { x, y, z } = block.center();
    return `${NAMESPACE}:${x}${y}${z}`;
}
export function getCardinalDirectionVector(block) {
    const cardinalDir = block.permutation.getState("minecraft:cardinal_direction");
    let directionVec;
    switch (cardinalDir) {
        case "north":
            directionVec = { x: 0, y: 0, z: 1 };
            break;
        case "east":
            directionVec = { x: -1, y: 0, z: 0 };
            break;
        case "south":
            directionVec = { x: 0, y: 0, z: -1 };
            break;
        case "west":
            directionVec = { x: 1, y: 0, z: 0 };
            break;
        default:
            directionVec = { x: 0, y: 0, z: 0 };
            break;
    }
    return directionVec;
}
export function numberCardinalDirection(cardinalDirection) {
    return { north: 0, east: 90, south: 180, west: 270 }[cardinalDirection];
}
export function getBlockPermState(block, stateName) {
    return block.permutation.getState(stateName);
}
export function setBlockPermState(block, ...states) {
    states.forEach((state) => {
        block.setPermutation(block.permutation.withState(state.name, state.value));
    });
}
