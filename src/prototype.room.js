require('prototype.room.jobManager');
require('prototype.room.remoteMining');
require('prototype.room.spawnManager');

let containerMemmory = {
    id: undefined,
    stored: 0
}

Room.prototype.roomManager = function(){
    // Executes after a certain amount of ticks
    let currentTick = Game.time;
    if(this.memory.lastExecution === undefined){
        this.memory.lastExecution = currentTick;
    } else if(this.memory.lastExecution + 5 < currentTick){
        this.memory.lastExecution = currentTick;
        this.jobManager();
        this.spawnManager();
        this.remoteMining();
    }
}

Room.prototype.getSpecificBodyPartCountForSource = function(creeps, role, bodyPart, source){
    const roleFilter = _.map(Game.creeps, function(c) {
        if(c.memory.role === role){ return c}
    })
    
    let workPartAmount = 0;
    for(let i = 0; i < roleFilter.length; i++){
        if(roleFilter[i] != undefined){
            const creepWorkParts = _.map(roleFilter[i].body, function(b) {return b.type === bodyPart });
            if(roleFilter[i].memory.sourceId === source.id){
                for(let i = 0; i < creepWorkParts.length; i++){
                    if(creepWorkParts[i]){
                        workPartAmount++;
                    }
                }    
            }   
        }
    }
    return workPartAmount;
}

