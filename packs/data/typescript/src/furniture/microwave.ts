import { ItemStack, system, world, WorldLoadAfterEvent } from "@minecraft/server";
import { BlockStateSuperset } from "@minecraft/vanilla-data";
import { NAMESPACE } from "globalConst";
import { rawFoodList } from "rawFoodList";
import { blockGeneratedDynamicPropertyId, decrementPlayerStack, getPlayerSelectedItem } from "utils";

type Cooking = {
    status: number;
    input: string;
    output: string;
}

system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent(`${NAMESPACE}:microwave`, {
        onPlace({ block }) {
            world.setDynamicProperty(
                blockGeneratedDynamicPropertyId(block),
                JSON.stringify(<Cooking>{status: 0, input: "", output: ""})
            );
        },
        onPlayerInteract({ block, player }) {
            const dynamicPropertyId = blockGeneratedDynamicPropertyId(block);
            const cooking = <Cooking>JSON.parse(<string>world.getDynamicProperty(dynamicPropertyId));

            if (cooking.status !== 0) return;

            const isMicrowaveOpen = <boolean>block.permutation.getState(<keyof BlockStateSuperset>`${NAMESPACE}:microwave_open`);
            const selectedItem = getPlayerSelectedItem(player);
            // check the microwave status
            if (cooking.status == 0 && (!isMicrowaveOpen || !selectedItem || !rawFoodList.has(selectedItem.typeId))) {
                // playsound
                block.dimension.playSound("open_trapdoor.copper", block.center());
                // update block state
                block.setPermutation(
                    block.permutation.withState(
                        <keyof BlockStateSuperset>`${NAMESPACE}:microwave_open`,
                        isMicrowaveOpen ? false : true
                    )
                );
                return;
            }

            // update cooking status
            cooking.status = 1;
            cooking.input = selectedItem.typeId;
            cooking.output = rawFoodList.get(selectedItem.typeId);
            // decrement player holding item stack
            decrementPlayerStack(player);
            // update block state
            block.setPermutation(
                    block.permutation.withState(<keyof BlockStateSuperset>`${NAMESPACE}:microwave_open`, false)
            );
            // save updated cooking data
            world.setDynamicProperty(dynamicPropertyId, JSON.stringify(cooking));
        },
        onTick({ block, dimension }) {
            const dynamicPropertyId = blockGeneratedDynamicPropertyId(block);
            const cooking = <Cooking>JSON.parse(<string>world.getDynamicProperty(dynamicPropertyId));
            if (cooking.status == 0) return;
            if (cooking.status !== 10) {
                // play sound
                dimension.playSound(`${NAMESPACE}:microwave.on`, block.center());
                // update oven data then save
                cooking.status += 1;
                world.setDynamicProperty(dynamicPropertyId, JSON.stringify(cooking));
            } else {
                // play sound
                block.dimension.playSound(`${NAMESPACE}:microwave.ding`, block.center());
                // spawn output item
                dimension.spawnItem(new ItemStack(cooking.output), block.above().bottomCenter());
                // update block state
                block.setPermutation(block.permutation.withState(<keyof BlockStateSuperset>`${NAMESPACE}:microwave_open`, true));
                // update oven data then save
                cooking.status = 0;
                cooking.input = "";
                cooking.output = "";
                world.setDynamicProperty(dynamicPropertyId, JSON.stringify(cooking));
            }
        },
        onPlayerBreak({block, dimension}) {
            const dynamicPropertyId = blockGeneratedDynamicPropertyId(block);
            const cooking = <Cooking>JSON.parse(<string>world.getDynamicProperty(dynamicPropertyId));
            if (cooking.status == 0) return;
            // spawn input item
            dimension.spawnItem(new ItemStack(cooking.input), block.center());
            // set null
            world.setDynamicProperty(dynamicPropertyId, null);
        }
    });
});

world.afterEvents.blockExplode.subscribe(({ block, dimension, explodedBlockPermutation }) => {
    if (explodedBlockPermutation.getTags().includes(`${NAMESPACE}:microwave`)) {
        const dynamicPropertyId = blockGeneratedDynamicPropertyId(block);
        const cooking = <Cooking>JSON.parse(<string>world.getDynamicProperty(dynamicPropertyId));
        if (cooking.status == 0) return;
        // spawn input item
        dimension.spawnItem(new ItemStack(cooking.input), block.center());
        // set null
        world.setDynamicProperty(dynamicPropertyId, null);
    }
});