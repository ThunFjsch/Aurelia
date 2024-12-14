var roleUpgrader = require('role.upgrader');

var roleBuilder = {
    /** @param {Creep} creep **/
    run: function(creep) {
    if(creep != undefined){
        if(creep.room.name === creep.memory.target){
            var constructionSite = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
            if(constructionSite != undefined) {
                if(creep.build(constructionSite) === ERR_NOT_IN_RANGE){
                    creep.moveTo(constructionSite, {visualizePathStyle: {stroke: '#ffffff'}});
                } else {
                    creep.moveTo(constructionSite, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            } else{
                roleUpgrader.run(creep);
            }
        } else {
            // delete creep.memory.dropOff;
            var exit = creep.room.findExitTo(creep.memory.target);
            creep.moveTo(creep.pos.findClosestByPath(exit), {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
    }
}



module.exports = roleBuilder;