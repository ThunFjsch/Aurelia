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
            creep.getEnergy(false);
        }
	}
};