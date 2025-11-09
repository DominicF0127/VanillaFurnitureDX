import { Player, ItemStack, EquipmentSlot, GameMode, Block, EntityInventoryComponent, EntityComponentTypes, Vector3 } from "@minecraft/server";
import { BlockStateSuperset } from "@minecraft/vanilla-data";
import { NAMESPACE } from "globalConst";

export function getPlayerSelectedItem(player: Player): ItemStack {
    const inventory = player.getComponent("equippable");
    const selectedItem = inventory.getEquipment(EquipmentSlot.Mainhand);

    return selectedItem;
}

export function getPlayerInventory(player: Player): EntityInventoryComponent {
    const inventory = player.getComponent(EntityComponentTypes.Inventory);
    // const selectedItem = inventory.getEquipment(EquipmentSlot.Mainhand);

    return inventory;
}

export function decrementPlayerStack(player: Player) {
    const inventory = player.getComponent("equippable");
    const selectedItem = inventory.getEquipment(EquipmentSlot.Mainhand);
    if (selectedItem != undefined && player.getGameMode() !== GameMode.Creative) {
    if (selectedItem.amount === 1) {
      inventory.setEquipment(EquipmentSlot.Mainhand, undefined);
    } else {
      selectedItem.amount -= 1;
      inventory.setEquipment(EquipmentSlot.Mainhand, selectedItem);
    }
  }
}

export function getRelevantEnchantments(item: ItemStack) {
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
                } else if (enchant.type.id === "silk_touch") {
                    hasSilkTouch = true;
                } else if (enchant.type.id === "fortune") {
                    fortuneLevel = enchant.level;
                }
            }
        }
    } catch (error) {
    }
    return { unbreakingLevel, hasSilkTouch, fortuneLevel };
}

export function blockGeneratedDynamicPropertyId(block: Block): string {
  const {x, y, z} = block.center();
  return `${NAMESPACE}:${x}${y}${z}`;
}

export function getCardinalDirectionVector(block: Block): Vector3 {
    const cardinalDir: string = block.permutation.getState("minecraft:cardinal_direction") as string;
    let directionVec: Vector3;
    switch (cardinalDir) {
        case "north":
            directionVec = {x: 0, y: 0, z: 1};
            break;
        case "east":
            directionVec = {x: -1, y: 0, z: 0};
            break;
        case "south":
            directionVec = {x: 0, y: 0, z: -1};
            break;
        case "west":
            directionVec = {x: 1, y: 0, z: 0};
            break;
        default:
            directionVec = {x: 0, y: 0, z: 0};
            break;
    }
    return directionVec;
}

export function numberCardinalDirection(cardinalDirection: string): number {
    return (<{[key: string]: number}>{ north: 0, east: 90, south: 180, west: 270 })[cardinalDirection];
}

export function getBlockPermState(block: Block, stateName: string) {
    return block.permutation.getState(<keyof BlockStateSuperset>stateName);
}

type State = {
    name: string;
    value: string | number | boolean
}
export function setBlockPermState(block: Block, ...states: State[]) {
    states.forEach((state) => {
        block.setPermutation(
            block.permutation.withState(<keyof BlockStateSuperset>state.name, state.value)
        );
    });
}