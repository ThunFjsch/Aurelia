module.exports = {
    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.target != undefined && creep.memory.target != creep.room.name){
             creep.changeRoom();
        } else {
            let source = Game.getObjectById(creep.memory.sourceId);
            const hasContainer = creep.memory.containerPos;
            
            if(hasContainer != undefined){
                if(creep.harvest(source) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(hasContainer.x, hasContainer.y);
                }
            } else {
                if(source != undefined){
                    const target = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE, {
                        filter: (s) => s.id === source.id
                    });
                     //console.log(source)
                     if(target === null){
                         target === source
                     }
                    //console.log(creep.moveTo(source))
                    if(target) {
                        if(creep.harvest(target) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(target);
                        }
                    }

                   
                    if(creep.harvest(source) === ERR_NOT_IN_RANGE) {
                        // move towards it
                        creep.moveTo(source);
                    }
                }
            }
        }
       
    }
};