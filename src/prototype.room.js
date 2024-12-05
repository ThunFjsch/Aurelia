require('prototype.room.jobManager');
require('prototype.room.remoteMining');

let containerMemmory = {
    id: undefined,
    stored: 0
}

Room.prototype.roomManager = function(){
    // Executes after a certain amount of ticks
    let currentTick = Game.time;
    if(this.memory.lastExecution === undefined){
        this.memory.lastExecution = currentTick;
    } else if(this.memory.lastExecution + 1 < currentTick){
        this.memory.lastExecution = currentTick;
        this.jobManager();
        this.remoteMining();
    }
}

Room.prototype.getSpecificBodyPartCountForSource = function(creeps, role, bodyPart, source){
    const roleFilter = this.find(FIND_MY_CREEPS, {
        filter: (c) => c.memory.role === role
    });
    let partAmount = 0;
    for(let i = 0; i < creeps.length; i++){
        const creepWorkParts = _.map(creeps[i].body, function(b) {return b.type === bodyPart });
        if(creeps[i].memory.sourceId === source.id){
            for(let i = 0; i < creepWorkParts.length; i++){
                if(creepWorkParts[i]){
                    porkPartAmount++;
                }
            }    
        }
    }
    return partAmount;
}