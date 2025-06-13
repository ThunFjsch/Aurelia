// import './role.upgrader'

export class Builder {
    constructor(){}
    /** @param {Creep} creep **/
    run(creep) {
    if(creep != undefined){
        if(creep.room.name === creep.memory.target){
            var constructionSite = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
            if(constructionSite != undefined) {
                if(creep.build(constructionSite) === ERR_NOT_IN_RANGE){
                    creep.moveTo(constructionSite, {visualizePathStyle: {stroke: '#ffffff'}});
                } else if(creep.build(constructionSite) === OK) {
                    creep.say('🛠️');
                }
                creep.giveWay();
            } else{
                // roleUpgrader.run(creep);
            }
        } else {
            // delete creep.memory.dropOff;
            var exit = creep.room.findExitTo(creep.memory.target);
            creep.moveTo(creep.pos.findClosestByPath(exit), {visualizePathStyle: {stroke: '#ffffff'}});
            }
            creep.giveWay();
        }
    }
}
