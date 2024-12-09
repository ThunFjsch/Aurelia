Room.prototype.spawnManager = function(){
    if(this.memory.pickups != undefined && this.memory.dropOffs != undefined){
        const spawns = this.find(FIND_MY_SPAWNS);
        
        if(this.memory.remoteMining.isMined === true && this.memory.remoteMining.assignedToo != undefined){            
            const assignedSpawn = Game.rooms[this.memory.remoteMining.assignedToo].find(FIND_MY_SPAWNS)[0];
            const energyAvailable = assignedSpawn.room.energyAvailable;

            this.isMinerNeeded(assignedSpawn);
            this.isTransportNeeded(assignedSpawn, energyAvailable);
            this.remoteBuilderTransport(assignedSpawn, energyAvailable)
            this.isBuilderNeeded(assignedSpawn);
        } else if(!_.isEmpty(spawns)){
            for(let name in spawns){
                let currentSpawn = spawns[name];
                let spawnState;
                spawnState = this.isMinerNeeded(currentSpawn);
                if(spawnState != undefined){
                    this.isTransportNeeded(currentSpawn, currentSpawn.room.energyAvailable)
                }
                if(spawnState != undefined){
                    this.isBuilderNeeded(currentSpawn);
                }
            }
        }
    }
}

Room.prototype.isTransportNeeded = function(assignedSpawn, energyAvailable){
    const transportRequests = Object.keys(this.memory.pickups).length;
    let requiredTransports = Math.floor(transportRequests / 4);
    let roomName = this.name;
    let foo = _.map(Game.creeps, function(c){ return c.memory.role === 'transporter' && c.memory.target === roomName})
    let transporterAssigned = 0;
    for(let i = 0; i < foo.length; i++){
        if(foo[i]){
            
            transporterAssigned++;
        }
    }
    if(transporterAssigned < requiredTransports){
        assignedSpawn.createTransporter(energyAvailable, 'transporter', this.name);
    }
}

Room.prototype.remoteBuilderTransport = function(){
    let foo = _.map(Game.creeps, function(c){ return c.memory.role === 'transporter' && c.memory.target === this.name && c.memory.home === this.name})
    let transporterAssigned = 0;
    for(let i = 0; i < foo.length; i++){
        if(foo[i]){
            transporterAssigned++;
        }
    }
    let builderAssigned = numberOfBuilders();
    if(transporterAssigned < builderAssigned){
        console.log('transport builder')
        assignedSpawn.createTransporter(energyAvailable, 'transporter', this.name, this.name);
    }
}

Room.prototype.isBuilderNeeded = function(assignedSpawn){
    const constructionSites = this.find(FIND_MY_CONSTRUCTION_SITES);
    let requiredBuilder = 0;
    if(constructionSites != undefined){
        let totalConstructionProgress = 0;
        for(let name in constructionSites){
            totalConstructionProgress += constructionSites[name].progressTotal
        }
        if(totalConstructionProgress > 0){
            requiredBuilder = Math.floor(totalConstructionProgress / 2000);
        }
        if(requiredBuilder > 5){
            requiredBuilder = 5;
        }
    }

    /// builder
    let builderAssigned = numberOfBuilders();
    if(builderAssigned < requiredBuilder){
        assignedSpawn.createCustomCreep('builder', this.name);
    }
}

function numberOfBuilders(){
    let roomBuilders = _.map(Game.creeps, function(c){ return c.memory.role === 'builder' && c.memory.target === this.name})
    let builderAssigned = 0;
    for(let i = 0; i < roomBuilders.length; i++){
        if(roomBuilders[i]){
            builderAssigned++;
        }
    }
    return builderAssigned
}

Room.prototype.isMinerNeeded = function(assignedSpawn){
    // TODO: Get all miners with the room as target
    const miners = this.find(FIND_MY_CREEPS, {
        filter: (c) => c.memory.role === 'miner'
    });
    let name;
    for(let i = 0; i < this.memory.remoteMining.sources.length; i++){
            name = this.spawnForSource(this.memory.remoteMining.sources[i], miners, assignedSpawn);
    }
    return name;
}


Room.prototype.spawnForSource = function(source, miners, assignedSpawn){
    let currentWorkParts = this.getSpecificBodyPartCountForSource(miners, 'miner', WORK, source);
        const miningWorkParts = Math.ceil((source.energyCapacity / 300) / 2);
        let workersAssignToSource = 0;
        
        for(let i = 0; i < miners.length; i++){
            if(miners[i].memory.sourceId === source.id){
                workersAssignToSource++;
            }
        }
        if(workersAssignToSource < source.avialableSpots && currentWorkParts < miningWorkParts){
            // container block auslagern wegen remote mining
            let containers = this.memory.containers
            let containerNearSource = false;
            let sourceContainer;
            if(containers != undefined){
                for(let name in containers){
                    let container = Game.getObjectById(containers[name].id);
                    if(container.pos.inRangeTo(source.pos.x, source.pos.y, 1, source) === true){
                        
                        containerNearSource = container.pos.inRangeTo(container.pos.x, container.pos.y, 1, source);
                        sourceContainer = container.pos;
                    }
                }
            }

            let energy = 0;
            if(workersAssignToSource != undefined){
                if(containerNearSource === true && workersAssignToSource >= 1){
                    return 'source has container and miner';
                }
                energy = assignedSpawn.room.energyAvailable;
            } else if(containerNearSource === true){
                energy = assignedSpawn.room.energyAvailable;
            } else{
                energy = assignedSpawn.room.energyAvailable;
            }
            return assignedSpawn.spawnMiner(energy, source.id, this.name, miningWorkParts, 1, sourceContainer);
} }
