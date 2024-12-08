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
                    if(creep.harvest(source) === ERR_NOT_IN_RANGE) {
                        // move towards it
                        creep.moveTo(source);
                    }
                }
            }
        }
       
    }
};