module.exports = {
    /** @param {Creep} creep **/
    run: function(creep) {
        const target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        const structure = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES);
        if(target) {
            if(creep.attack(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        } else if(target == undefined && structure != undefined) {
            if(creep.attack(structure) == ERR_NOT_IN_RANGE){
                creep.moveTo(structure, {visualizePathStyle: {stroke: '#ffffff'}, maxOps: 10000})
            }
        } else if(creep.room.name != creep.memory.attackRoom && structure == undefined){
                var exit = creep.room.findExitTo(creep.memory.attackRoom);
                creep.moveTo(creep.pos.findClosestByPath(exit), {visualizePathStyle: {stroke: '#ffffff'}, maxOps: 10000});
        } else {
            creep.moveTo(creep.room.controller);
        }
    }
}