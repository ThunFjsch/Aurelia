module.exports = {
    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.target != undefined && creep.memory.target != creep.room.name){
             creep.changeRoom();
        } else {
            let source = Game.getObjectById(creep.memory.sourceId);
            const hasContainers = creep.room.find(FIND_STRUCTURES, {
                filter: (s) => s.structureType == STRUCTURE_CONTAINER
            });
            if(!_.isEmpty(_.isEmpty(hasContainers))){
                const target = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
                if(target) {
                    if(creep.harvest(target) == ERR_NOT_IN_RANGE) {
                     creep.moveTo(target);
                    }
                }
            } else {
                if(source != undefined){
                    // find container next to source
                    let container = source.pos.findInRange(FIND_STRUCTURES, 1, {
                        filter: s => s.structureType == STRUCTURE_CONTAINER
                    })[0];
                    if(container === undefined){
                            // try to harvest energy, if the source is not in range
                        if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                             // move towards it
                            creep.moveTo(source);
                        }
                    } else{
                        // if creep is on top of the container
                        if (creep.pos.isEqualTo(container.pos)) {
                            // harvest source
                            creep.harvest(source);
                        }
                        // if creep is not on top of the container
                        else {
                            // move towards it
                            creep.moveTo(container);
                        }
                    }
                }
            }
        }
       
    }
};