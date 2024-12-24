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
                
               if(workersAssignToSource < source.miningSpots.length & currentWorkParts < miningWorkParts){
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
                    let energy = Game.rooms[source.assignedTo].energyAvailable;
                    if(workersAssignToSource != undefined){
                        if(containerNearSource === true && workersAssignToSource >= 1){
                            console.log('should abort')
                            // 'source has container and miner';
                            continue;
                        }
                    }
                    let assignedPath;
                    let assignedSpot;
                    for(let spot in source.miningSpots){
                        if(!source.miningSpots[spot].isAssigned){
                            const containers = Game.rooms[source.room].memory.containers;
                            for(let name in containers){
                                const container = Game.getObjectById(containers[name].id);
                                if(container != undefined && container.pos.x === source.miningSpots[spot].x && container.pos.x === source.miningSpots[spot].x){
                                    assignedPath = source.miningSpots[spot];
                                    assignedSpot = spot;
                                    break;      
                                }
                            }
                        }
                    }
                    if(assignedSpot === undefined){
                        for(let spot in source.miningSpots){
                                if(!source.miningSpots[spot].isAssigned){
                                    assignedPath = source.miningSpots[spot];
                                    assignedSpot = spot;
                                    break;      
                            }
                        }
                    }
                    if(assignedPath != undefined && source.room === Game.rooms[source.assignedTo].find(FIND_MY_SPAWNS)[0].room.name && source.owned){
                        let foo = Game.rooms[source.assignedTo].find(FIND_MY_SPAWNS)[0].spawnMiner(energy, source.id, this.name, miningWorkParts, 1, sourceContainer, assignedPath);
                        if(foo === OK){
                            source.miningSpots[assignedSpot].isAssigned = true;
                        }
                        console.log(foo)
                    }
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