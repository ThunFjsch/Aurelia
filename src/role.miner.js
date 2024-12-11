module.exports = {
    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.target != undefined && creep.memory.target != creep.room.name){
             creep.changeRoom();
        } else {
            let source = Game.getObjectById(creep.memory.sourceId);
            const hasContainer = creep.memory.containerPos;
            
            if(hasContainer != undefined){
                // Ignore doesent work idk why need to look into costMatrix
                new RoomVisual(creep.room.name).line(hasContainer.x, hasContainer.y, creep.pos.x, creep.pos.y)
                if(creep.harvest(source) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(hasContainer.x, hasContainer.y, {maxOps: 20000,  ignoreDestructibleStructures: true}); // , ignore: [hasContainer]
                }
            } else {
                if(source != undefined){
                    
                    const target = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE, {
                        filter: (s) => s.id === source.id
                    });
                    
                    
                    console.log(creep.name)
                    new RoomVisual(creep.room.name).line(target.pos.x, target.pos.y, creep.pos.x, creep.pos.y)
                console.log( creep.moveTo(target, {maxOps: 20000, range: 1, ignoreDestructibleStructures: true}))
                    console.log(JSON.stringify(new RoomPosition(creep.pos.x, creep.pos.y, creep.room.name).findPathTo(target.pos.x, target.pos.y, {maxOps: 20000,  ignoreDestructibleStructures: true})))
                
                    
                     //console.log(source)
                     if(target === null){
                         target === source
                     }
                    //console.log(creep.moveTo(source))
                    if(target) {
                        if(creep.harvest(target) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(target, {maxOps: 20000, range: 1, ignoreDestructibleStructures: true});
                        }
                    }

                   
                    if(creep.harvest(source) === ERR_NOT_IN_RANGE) {
                        // move towards it
                        creep.moveTo(source, {maxOps: 20000, range: 1, ignoreDestructibleStructures: true});
                    }
                }
            }
        }
       
    }
};