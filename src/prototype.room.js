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
        
        if(Memory.sourceInfo != undefined){
            for(let index in Memory.sourceInfo.sources){
                const source = Memory.sourceInfo.sources[index]
                let roomName = source.room;
                const miners = _.map(Game.creeps, function(c){ if(c.memory.role === 'miner' && c.memory.target === roomName){return c}});
                let currentWorkParts = this.getSpecificBodyPartCountForSource(miners, 'miner', WORK, source);
                
                let energyCapacity;
                if(source.reserved || source.owned){
                    energyCapacity = 3000;
                } else {energyCapacity = 1500;}
                const miningWorkParts = Math.ceil((energyCapacity / 300) / 2);
                
                let workersAssignToSource = 0;
                for(let i = 0; i < miners.length; i++){
                    if(miners[i] != undefined && miners[i].memory.sourceId === source.id){
                        workersAssignToSource++;
                    }
                }
                
                
                console.log(roomName);
                console.log(source.assignedTo)
                console.log(source.id)
                console.log(currentWorkParts)
                console.log(miningWorkParts)
                
                
                if(workersAssignToSource < source.miningSpots.length && currentWorkParts < miningWorkParts){
                    // container block auslagern wegen remote mining
                    let containers;
                    if(Game.rooms[roomName] != undefined){
                        containers = Game.rooms[roomName].memory.containers;
                    }
                    let containerNearSource = false;
                    let sourceContainer;
                    if(containers != undefined){
                        for(let name in containers){
                            let container = Game.getObjectById(containers[name].id);
                            if(container != null && container.pos.inRangeTo(source.pos.x, source.pos.y, 1, source) === true){
                                
                                containerNearSource = container.pos.inRangeTo(container.pos.x, container.pos.y, 1, source);
                                sourceContainer = container.pos;
                            }
                        }
                    }
                    let energy = 0;
                    if(workersAssignToSource != undefined){
                    
                        if(containerNearSource === true && workersAssignToSource >= 1){
                            console.log('should abort')
                            // 'source has container and miner';
                            continue;
                        }
                        energy = Game.rooms[source.assignedTo].energyAvailable;
                    } else if(containerNearSource === true){
                        energy = Game.rooms[source.assignedTo].energyAvailable;
                    } else{
                        energy = Game.rooms[source.assignedTo].energyAvailable;
                    }
                    let assignedPath;
                    for(let spot in source.miningSpots){
                        if(!source.miningSpots[spot].isAssigned){
                            assignedPath = source.miningSpots[spot];
                            break;
                        }
                    }
                    if(source.room === Game.rooms[source.assignedTo].find(FIND_MY_SPAWNS)[0].room.name && source.owned){
                        let foo = Game.rooms[source.assignedTo].find(FIND_MY_SPAWNS)[0].spawnMiner(energy, source.id, this.name, miningWorkParts, 1, sourceContainer, assignedPath);
                        console.log(foo)
                    }
                    /*
                    if(source.assignedTo != Game.rooms[source.assignedTo].find(FIND_MY_SPAWNS)[0].room.name){
                        let foo = Game.rooms[source.assignedTo].find(FIND_MY_SPAWNS)[0].spawnMiner(energy, source.id, source.room, miningWorkParts, 1, sourceContainer, assignedPath);
                        console.log(foo)
                    }*/
                   
                }
            }
        }
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