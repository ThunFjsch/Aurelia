let containerMemmory = {
    id: undefined,
    stored: 0
}

Room.prototype.createJobs = function(){
    let currentTick = Game.time;
    if(this.memory.lastExecution === undefined){
        this.memory.lastExecution = currentTick;
    } else if(this.memory.lastExecution + 50 < currentTick){
        this.memory.lastExecution = currentTick;
 
        let containers = this.find(FIND_STRUCTURES, {
            filter: (s) => s.structureType == STRUCTURE_CONTAINER
        });
        let droppedEnergy = this.find(FIND_DROPPED_RESOURCES, {
            filter: (e) => e.resourceType === RESOURCE_ENERGY
        });
        if(droppedEnergy != undefined){
            for(let index in droppedEnergy){
                let drop = droppedEnergy[index];
                console.log('generated requests for dropped energy');
                this.generateDeletePickUpRequest(drop.amount, drop.id)
            }
        }
        if(containers != undefined){
            this.generateContainerPickUps(containers);
        }
    }
}

Room.prototype.generateContainerPickUps = function(containers){
    for(let index in containers){
        let container = containers[index];
        
        // If container Memory entry doesent exist, 
        if(this.memory.containers === undefined){
            this.memory.containers = {};
        }
        // if container entries doesent exist, add them
        else if (this.memory.containers[container] === undefined){
            const containerMemory = {id: container.id, stored: container.store.getUsedCapacity(RESOURCE_ENERGY)};
            this.memory.containers[container] = containerMemory;
        }
        // Manage container PickUp requests
        else{
            this.generateDeletePickUpRequest(container.store.getUsedCapacity(RESOURCE_ENERGY), container.id);
        }   
    }
}

Room.prototype.generateDeletePickUpRequest = function(resourceCapacity, targetId){
    // Each transport can carry 100E so for each 100E one pickUp requests gets generated
    const pickUpRequests = this.calculatePickUpRequests(resourceCapacity);
            
    // if there are no pickUps, create the object and generate jobs 
    if(this.memory.pickups === undefined){
        this.memory.pickups = {};
        this.generatePickUp(targetId, pickUpRequests);
    } 
    // Create and delete container jobs
    else {
        let currentPickUpRequests = this.getCurrentContainerPickUps(targetId);

        // if current Requests are not enough create new ones
        if(currentPickUpRequests < pickUpRequests){
            console.log('new job amount: ' + (pickUpRequests - currentPickUpRequests))
            this.generatePickUp(targetId, (pickUpRequests - currentPickUpRequests))
        } 
        // delete outdated jobs
        else if(currentPickUpRequests > pickUpRequests){
            let entriesToDelete = currentPickUpRequests - pickUpRequests;
            console.log('Deleted ' + entriesToDelete + ' entries');
            for(let pickUp in this.memory.pickups){
                if(entriesToDelete != 0 && this.memory.pickups[pickUp].assignee != true){
                    delete this.memory.pickups[pickUp];
                    entriesToDelete--;
                } else{
                    break;
                }
            }
        }
    }
}

Room.prototype.generatePickUp = function (target, pickUpRequests){
    for(let i = 0; i <= pickUpRequests; i++){
        let name = generateName('pickup');
        this.memory.pickups[name] = {target: target, isAssigned: false, name: name, assignee: undefined }
    }
}

Room.prototype.getCurrentContainerPickUps = function(containerId) {
    let currentRequests = 0;
    for(let pickUp in this.memory.pickups){
        let currentPickUp = this.memory.pickups[pickUp];
        // In the case a job gets assigned to undefined
        if(currentPickUp.isAssigned === true && currentPickUp.assignee === undefined){
            this.memory.pickups[pickUp].isAssigned = false;
        }
        // If creep is dead and has a task, reset it. 
        else if(currentPickUp.isAssigned === true && Game.creeps[this.memory.pickups[pickUp].assignee] === undefined){
            currentPickUp.isAssigned = false;
            currentPickUp.assignee = undefined;
        }
        
        // current job has container id, add to the requests
        if(currentPickUp.target === containerId){
            currentRequests++;
        }
    }
    return currentRequests;
}

Room.prototype.calculatePickUpRequests = function(ResourceAmount){
    Math.floor(ResourceAmount / 100)
}

function generateName(jobName){
    return jobName + '_' + Math.random().toString(36).slice(2, 7).toString();
}