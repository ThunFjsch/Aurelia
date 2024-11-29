module.exports = {
    /** @param {Creep} creep **/
    run: function(creep) {
        const target = creep.pos.findClosestByRange(FIND_MY_CREEPS, {
                            filter: function(object) {
                                return object.hits < object.hitsMax;
                            }
        });
        if(target) {
            if(creep.heal(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        } else if(creep.room.name != creep.memory.attackRoom){
                var exit = creep.room.findExitTo(creep.memory.attackRoom);
                creep.moveTo(creep.pos.findClosestByPath(exit), {visualizePathStyle: {stroke: '#ffffff'}});
        } else {
            creep.moveTo(creep.room.controller);
        }
    }
}