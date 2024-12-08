Room.prototype.jobManager = function(){
        const containers = this.find(FIND_STRUCTURES, {
            filter: (s) => s.structureType == STRUCTURE_CONTAINER
        });
        const droppedEnergy = this.find(FIND_DROPPED_RESOURCES, {
            filter: (e) => e.resourceType === RESOURCE_ENERGY
        });
        
        // creates new pick up requests
        if(droppedEnergy != undefined){
            for(let index in droppedEnergy){
                let drop = droppedEnergy[index];
                this.generateDeletePickUpRequest(drop.amount, drop.id)
            }
        }
        if(containers != undefined){
            this.generateContainerPickUps(containers);
        }
        
        // creates drop off requests
        const towers = this.find(FIND_MY_STRUCTURES, {
            filter: (s) => s.structureType === STRUCTURE_TOWER
        });
        if(towers != undefined){
            this.manageDropOffs(towers);
        }
        
        const extensions = this.find(FIND_MY_STRUCTURES, {
            filter: (s) => s.structureType === STRUCTURE_EXTENSION
        });
        if(extensions != undefined){
            this.manageDropOffs(extensions);
        }
        
        const workerCreeps = this.find(FIND_MY_CREEPS, {
            filter: (c) => (c.memory.role === 'builder' || 
                           c.memory.role === 'upgrader' || 
                           c.memory.role === 'maintainer' || 
                           c.memory.role === 'wallRepairer') && c.store.getUsedCapacity(RESOURCE_ENERGY) < 20 && c.memory.target === this.name
        });
        if(workerCreeps != undefined){
            this.manageDropOffs(workerCreeps);
        }
        
        const roomSpawns = this.find(FIND_MY_SPAWNS, {
            filter: (s) => s.store.getCapacity(RESOURCE_ENERGY)
        });
        if(roomSpawns != undefined){
            this.manageDropOffs(roomSpawns);
        }
        
        const roomStorage = this.find(FIND_MY_STRUCTURES, {
            filter: (s) => s.structureType === STRUCTURE_STORAGE
        });
        if(roomStorage != undefined){
            this.manageDropOffs(roomStorage);
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
        let currentPickUpRequests = this.getCurrentPickUps(targetId);
        // if current Requests are not enough create new ones
        if(currentPickUpRequests < pickUpRequests){
            this.generatePickUp(targetId, (pickUpRequests - currentPickUpRequests));
        }
        // delete outdated jobs
        if(currentPickUpRequests > pickUpRequests){
            let entriesToDelete = currentPickUpRequests - pickUpRequests;
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

Room.prototype.getCurrentPickUps = function(targetId) {
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
        if(currentPickUp.target === targetId){
            currentRequests++;
        }
    }
    return currentRequests;
}

Room.prototype.calculatePickUpRequests = function(ResourceAmount){
    // TODO: change the static number 100 by the avg transport capacity or so
    return Math.floor(ResourceAmount / 100)
}

Room.prototype.generatePickUp = function (target, pickUpRequests){
    for(let i = 0; i <= pickUpRequests; i++){
        let name = generateName('pickup');
        this.memory.pickups[name] = {target: target, isAssigned: false, name: name, assignee: undefined };
    }
}

Room.prototype.manageDropOffs = function(dropOffTargets){
    if(this.memory.dropOffs === undefined) {
        this.memory.dropOffs = {};
    } else{
        
        for(let index in dropOffTargets){
            const target = dropOffTargets[index];
            if(target.store.getUsedCapacity(RESOURCE_ENERGY) < target.store.getCapacity(RESOURCE_ENERGY)){
                this.generateDropOff(target);
            }
        }
    }
}

Room.prototype.generateDropOff = function (target){
    let hasJob = false;
    for(let dropOff in this.memory.dropOffs){
        let currentDropOff = this.memory.dropOffs[dropOff];
        if(currentDropOff.target === target.id){
            hasJob = true
            break;
        } if(currentDropOff.isAssigned && Game.creeps[currentDropOff.assignee] != undefined){
            if(Game.creeps[currentDropOff.assignee].dropOff === undefined){
                delete this.memory.dropOffs[dropOff];
            }
        }
    }
    if(hasJob){
        return;
    } else{
        let name = generateName('dropOff');
        if(target.id != undefined){
            this.memory.dropOffs[name] = {target: target.id, isAssigned: false, name: name, assignee: undefined };
        }
    }
    
}

function generateName(jobName){
    return jobName + '_' + Math.random().toString(36).slice(2, 7).toString();
}