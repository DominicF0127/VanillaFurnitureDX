import { ItemStack, system, world } from "@minecraft/server";
import { BlockStateSuperset } from "@minecraft/vanilla-data";
import { NAMESPACE } from "globalConst";
import { rawFoodList } from "rawFoodList";
import { blockGeneratedDynamicPropertyId, decrementPlayerStack, getPlayerSelectedItem } from "utils";

type Cooking = {
    status: number;
    input: string;
    output: string;
}

system.beforeEvents.startup.subscribe(({blockComponentRegistry}) => {
    blockComponentRegistry.registerCustomComponent(`${NAMESPACE}:grill`, {
        onPlace({block}) {
            world.setDynamicProperty(
                blockGeneratedDynamicPropertyId(block), 
                JSON.stringify(<Cooking>{status: 0, input: "", output: ""})
            );
        },
        onPlayerBreak({block, dimension}) {
            // get data
            const cooking = <Cooking>JSON.parse(<string>world.getDynamicProperty(blockGeneratedDynamicPropertyId(block)));
            // check status
            if (cooking.status == 0) return;
            // spawn input item
            dimension.spawnItem(new ItemStack(cooking.input), block.center());
            // set null
            world.setDynamicProperty(blockGeneratedDynamicPropertyId(block), null);
        },
        onPlayerInteract({block, player, dimension}) {
            // get data
            const cooking = <Cooking>JSON.parse(<string>world.getDynamicProperty(blockGeneratedDynamicPropertyId(block)));
            // get state
            const isGrillOpen = <boolean>block.permutation.getState(<keyof BlockStateSuperset>`${NAMESPACE}:grill_open`);
            // get selected item of player
            const selectedItem = getPlayerSelectedItem(player);
            // check condition before proceeding
            if (cooking.status == 0 && (!isGrillOpen || !selectedItem || !rawFoodList.has(selectedItem.typeId))) {
                // play sound
                block.dimension.playSound("open_trapdoor.copper", block.center());
                // set true or false
                block.setPermutation(block.permutation.withState(<keyof BlockStateSuperset>`${NAMESPACE}:grill_open`, isGrillOpen ? false : true));
                return;
            } else if (cooking.status !== 0) {
                // play sound
                dimension.playSound("block.decorated_pot.insert_fail", block.center());
                return;
            }

            // updata cooking
            cooking.status = 1;
            cooking.input = selectedItem.typeId;
            cooking.output = rawFoodList.get(selectedItem.typeId);
            // spawn util
            const util = dimension.spawnEntity(`${NAMESPACE}:grill_util`, block.bottomCenter());
            util.setProperty(`${NAMESPACE}:food_index`, [...rawFoodList.keys()].indexOf(selectedItem.typeId) + 1);
            // decrement player selected item stack
            decrementPlayerStack(player);
            // save updated cooking
            world.setDynamicProperty(blockGeneratedDynamicPropertyId(block), JSON.stringify(cooking));
        },
        onTick({block, dimension}) {
            // get data
            const cooking = <Cooking>JSON.parse(<string>world.getDynamicProperty(blockGeneratedDynamicPropertyId(block)));
            if (cooking.status == 0) return;
            if (cooking.status !== 10) {
                // spawn particle and play sound
                dimension.spawnParticle("maca_vf:grill_basic_smoke_particle", block.above().bottomCenter());
                dimension.playSound("block.campfire.crackle", block.center());
                // update cooking then save
                cooking.status += 1;
                world.setDynamicProperty(blockGeneratedDynamicPropertyId(block), JSON.stringify(cooking));
            } else {
                // play sound
                // spawn output item
                dimension.spawnItem(new ItemStack(cooking.output), block.above().bottomCenter());
                // despawn util
                dimension.getEntitiesAtBlockLocation(block.bottomCenter()).shift().remove();
                // update cooking then save
                cooking.status = 0;
                cooking.input = "";
                cooking.output = "";
                world.setDynamicProperty(blockGeneratedDynamicPropertyId(block), JSON.stringify(cooking));
            }
        },
    });
});

// world event
world.afterEvents.blockExplode.subscribe(({block, dimension, explodedBlockPermutation}) => {
    if (explodedBlockPermutation.type.id == `${NAMESPACE}:grill`) {
        // get data
        const cooking = <Cooking>JSON.parse(<string>world.getDynamicProperty(blockGeneratedDynamicPropertyId(block)));
        if (cooking.status == 0) return;
        // spawn input item
        dimension.spawnItem(new ItemStack(cooking.input), block.center());
        // set undefined the dynamic property
        world.setDynamicProperty(blockGeneratedDynamicPropertyId(block), null);
    }
});