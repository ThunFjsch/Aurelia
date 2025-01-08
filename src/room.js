require('room.jobManager');
require('room.spawnManager');

const memoryManager = require('room.memoryManager');
const plannerUpgraderLocation = require('planner.upgradeLocation');

Room.prototype.roomManager = function(){
    // Executes after a certain amount of ticks
    let currentTick = Game.time;
    if(currentTick % 5){
        if(this.memory === undefined){
            memoryManager.init(this);
        } else if(currentTick % 500){
            memoryManager.update(this);
        }
        
        this.memory.lastExecution = currentTick;
        this.jobManager();
        this.spawnManager();
    }
    
    if(this.memory.upgraderInfo != undefined){
        plannerUpgraderLocation.visualiseUpgraderSpots(this.name);
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