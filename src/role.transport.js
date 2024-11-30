module.exports = {
     /** @param {Creep} creep **/
    run: function(creep) {
        creep.switchWorkState();
        // if creep is supposed to transfer energy to the spawn
        if (creep.memory.state) {
            
            var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION || 
                                structure.structureType == STRUCTURE_SPAWN || 
                                structure.structureType == STRUCTURE_TOWER) &&
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                    }
            });
            if(targets.length == 0){
                targets[0] = creep.room.storage;
            }
            if(targets.length > 0) {
                if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        }
        // if creep is supposed to harvest energy from source
        else {
            if(creep.memory.pickup === undefined){
                for(let job in creep.room.memory.pickups){
                    if(!creep.room.memory.pickups[job].isAssigned){
                        creep.memory.pickup = {target: creep.room.memory.pickups[job].target, job: creep.room.memory.pickups[job].name};
                        creep.room.memory.pickups[job].isAssigned = true;
                        break;
                    }
                }
            } else {
                const target = Game.getObjectById(creep.memory.pickup.target);
                if(creep.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE){
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#00FFFF'}});
                }else if(creep.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_ENOUGH_ENERGY){
                    delete creep.room.memory.pickups[creep.memory.pickup.job];
                    delete creep.memory.pickup;
                }
            }
        }
	}
};