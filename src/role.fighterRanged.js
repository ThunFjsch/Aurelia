module.exports = {
    /** @param {Creep} creep **/
    run: function(creep) {
        const target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        const structure = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES);
        
        if(target) {
            //console.log(target.pos.inRangeTo(creep.pos.x, creep.pos.y, 2, target, 2));
            if(creep.rangedAttack(target) == ERR_NOT_IN_RANGE) {
                
                creep.moveTo(target);
            }
        } else if(target == undefined | null&& structure != undefined) {
            if(creep.rangedAttack(structure) == ERR_NOT_IN_RANGE){
                creep.moveTo(structure, {visualizePathStyle: {stroke: '#ffffff'}})
            }
        } else if(creep.room.name != creep.memory.attackRoom && structure == undefined | null){
                var exit = creep.room.findExitTo(creep.memory.attackRoom);
                creep.moveTo(creep.pos.findClosestByPath(exit), {visualizePathStyle: {stroke: '#ffffff'}});
        } else {
            creep.moveTo(creep.room.controller);
        }
    }
}
