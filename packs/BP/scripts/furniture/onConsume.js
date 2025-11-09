import { EntityComponentTypes, EquipmentSlot, ItemStack, system } from "@minecraft/server";
import { NAMESPACE } from "globalConst";
system.beforeEvents.startup.subscribe(({ itemComponentRegistry }) => {
    itemComponentRegistry.registerCustomComponent(`${NAMESPACE}:on_consume`, {
        onConsume({ source, itemStack }) {
            const mainhand = source.getComponent(EntityComponentTypes.Equippable)?.getEquipmentSlot(EquipmentSlot.Mainhand);
            if (!mainhand.hasItem()) {
                if (itemStack.typeId == `${NAMESPACE}:mug_of_tea`) {
                    mainhand.setItem(new ItemStack(`${NAMESPACE}:mug`));
                    return;
                }
                if (itemStack.typeId.includes("drinking_glass")) {
                    mainhand.setItem(new ItemStack(`${NAMESPACE}:drinking_glass`));
                    return;
                }
            }
        },
    });
});
