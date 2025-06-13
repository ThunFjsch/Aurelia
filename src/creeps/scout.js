export class Scout {
    constructor(){}
    /** @param {Creep} creep **/
    run(creep) {
    if(creep.memory.state === undefined){
        creep.memory.state = true;
    }
    if(creep != undefined){
        if(creep.room.name === creep.memory.target && creep.memory.state){
            let source = creep.room.find(FIND_SOURCES);
            for(let name in source){
                sourceManager.addSource(source[name]);
            }
            creep.memory.state = false;
        } else {
            // delete creep.memory.dropOff;
            var exit = creep.room.findExitTo(creep.memory.target);
            creep.moveTo(creep.pos.findClosestByPath(exit), {visualizePathStyle: {stroke: '#ffffff'}});
            creep.giveWay();
            }
        }
    }
}
