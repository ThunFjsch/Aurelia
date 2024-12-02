module.exports = {
     /** @param {Creep} creep **/
    run: function(creep) {
        creep.switchWorkState();
        // if creep is supposed to transfer energy to the spawn
        if (creep.memory.state) {
            creep.getDropOff();
        }
        // if creep is supposed to harvest energy from source
        else {
            if(creep.memory.pickup === undefined){
                for(let job in creep.room.memory.pickups){
                    if(!creep.room.memory.pickups[job].isAssigned){
                        creep.memory.pickup = {
                            target: creep.room.memory.pickups[job].target, 
                            job: creep.room.memory.pickups[job].name
                        };
                        creep.room.memory.pickups[job] = {
                            isAssigned: true,
                            assignee: creep.name
                        }
                        break;
                    }
                }
            } else if(creep.memory.pickup.target === undefined){
                delete creep.memory.pickup;
            } else if(creep.room.memory.pickups[creep.memory.pickup.target]){
                delete creep.memory.pickup;
                delete creep.room.memory.pickups[creep.memory.pickup.job];
            } else {
                const target = Game.getObjectById(creep.memory.pickup.target);
                if(creep.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE || creep.pickup(target) === ERR_NOT_IN_RANGE){
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#00FFFF'}});
                }else if(creep.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_ENOUGH_ENERGY || ERR_INVALID_TARGET){
                    //console.log('Err: Job was outdated');
                    delete creep.room.memory.pickups[creep.memory.pickup.job];
                    delete creep.memory.pickup;
                }
            }
	    }
    }
}