let containerMemmory = {
    id: undefined,
    stored: 0
}

Room.prototype.createJobs = function(){
    // let containers = this.room.find(STRUCTURE_CONTAINER);
    console.log(Game.time % 1000)
    let currentTick = Game.time;
    if(this.memory.lastExecution === undefined){
        this.memory.lastExecution = currentTick;
    } else if(this.memory.lastExecution + 5 < currentTick){
        this.memory.lastExecution = currentTick;

        let containers = this.find(FIND_STRUCTURES, {
            filter: (s) => s.structureType == STRUCTURE_CONTAINER
        });
        if(containers != undefined){
            for(let index in containers){
                let container = containers[index];
                
                if(this.memory.containers === undefined){
                    this.memory.containers = {};
                } else if (this.memory.containers[container] === undefined){
                    const containerMemory = {id: container.id, stored: container.store.getUsedCapacity(RESOURCE_ENERGY)};
                    this.memory.containers[container] = containerMemory;
                }
                else{
                    const pickUpRequests = Math.floor(container.store.getUsedCapacity(RESOURCE_ENERGY) / 100);
                    console.log('requests: ' + pickUpRequests)
                    if(this.memory.pickups === undefined){
                        this.memory.pickups = {};
                        this.generatePickUp(container.id, pickUpRequests)
                    } else {
                        let currentRequests = 0;
                        for(let pickUp in this.memory.pickups){
                            if(this.memory.pickups[pickUp].target === container.id){
                                currentRequests++;
                            }
                        }
                        if(currentRequests <= pickUpRequests){
                            this.generatePickUp(container.id, pickUpRequests - currentRequests)
                        }
                    }
                }
            }
        }
    }
}

Room.prototype.generatePickUp = function (target, pickUpRequests){
    for(let i = 0; i <= pickUpRequests; i++){
        let name = generateName('pickup');
        this.memory.pickups[name] = {target: target, isAssigned: false}
    }
}

function generateName(jobName){
    return jobName + '_' + Math.random().toString(36).slice(2, 7).toString();
}