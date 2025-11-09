import { system } from "@minecraft/server";
import { BlockStateSuperset } from "@minecraft/vanilla-data";
import { NAMESPACE } from "globalConst";
import { Multiblock } from "multiblock/multiblock";
import { getPlayerSelectedItem } from "utils";

system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent(`${NAMESPACE}:wood_variants`, {
        onPlayerInteract({ block, player, dimension }) {
            // get player selected item
            const selectedItem = getPlayerSelectedItem(player);
            // check if player holding a wooden axe item
            if (selectedItem && selectedItem.typeId == "minecraft:wooden_axe") {
                // get wood_variant state
                const woodVariant = <number>block.permutation.getState(<keyof BlockStateSuperset>`${NAMESPACE}:wood_variant`);
                // check if multiblock
                if (Multiblock.isMultiblock(block)) {
                    new Multiblock(block, -1).setMultiblockState(<keyof BlockStateSuperset>`${NAMESPACE}:wood_variant`, woodVariant == 11 ? 0 : woodVariant + 1);
                } else {
                    block.setPermutation(
                        block.permutation.withState(<keyof BlockStateSuperset>`${NAMESPACE}:wood_variant`, woodVariant == 11 ? 0 : woodVariant + 1)
                    );
                }
                // playsound
                dimension.playSound("block.decorated_pot.insert", block.location);
            }
        }
    });
});