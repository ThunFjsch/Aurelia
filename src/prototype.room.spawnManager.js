Room.prototype.spawnManager = function(){
    if(this.memory.pickups != undefined && this.memory.dropOffs != undefined){
        const spawns = this.find(FIND_MY_SPAWNS);
        const transportRequests = Object.keys(this.memory.pickups).length;
        let requiredTransports = Math.floor(transportRequests / 2);
        
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
        
        if(this.memory.remoteMining.isMined === true && this.memory.remoteMining.assignedToo != undefined){
            let roomName = this.name;
            /// transporter
            let foo = _.map(Game.creeps, function(c){ return c.memory.role === 'transporter' && c.memory.target === roomName})
            let transporterAssigned = 0;
            for(let i = 0; i < foo.length; i++){
                if(foo[i]){
                    transporterAssigned++;
                }
            }
            
            const assignedSpawn = Game.rooms[this.memory.remoteMining.assignedToo].find(FIND_MY_SPAWNS)[0];
            const spawnEnergy = assignedSpawn.room.energyAvailable;
            if(transporterAssigned < requiredTransports){
                assignedSpawn.createTransporter(spawnEnergy, 'transporter', this.name);
            }
            
            // miner
            this.isMinerNeeded(assignedSpawn);
            
            /// builder
            let roomBuilders = _.map(Game.creeps, function(c){ return c.memory.role === 'builder' && c.memory.target === roomName})
            let builderAssigned = 0;
            for(let i = 0; i < roomBuilders.length; i++){
                if(foo[i]){
                    builderAssigned++;
                }
            }
            if(builderAssigned < requiredBuilder){
                assignedSpawn.createCustomCreep('builder', this.name);
            }
            
        } else if(!_.isEmpty(spawns)){
            for(let name in spawns){
                spawns[name].memory.minCreeps['transporter'] = requiredTransports;
                spawns[name].memory.minCreeps['builder'] = requiredBuilder;
                this.isMinerNeeded(spawns[name]);
            }
        }
    }
}

Room.prototype.isMinerNeeded = function(assignedSpawn){
    // TODO: Get all miners with the room as target
    const miners = this.find(FIND_MY_CREEPS, {
        filter: (c) => c.memory.role === 'miner'
    });
    for(let i = 0; i < this.memory.remoteMining.sources.length; i++){
        let source = this.memory.remoteMining.sources[i];
        let currentWorkParts = this.getSpecificBodyPartCountForSource(miners, 'miner', WORK, this.memory.remoteMining.sources[i]);
        const miningWorkParts = Math.floor((source.energyCapacity / 300) / 2);
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
                        console.log(containerNearSource)
                        console.log(sourceContainer)
                        sourceContainer = container;
                    }
                }
            }

            let energy = 0;
            if(workersAssignToSource != undefined){
                if(containerNearSource === true && workersAssignToSource >= 1){
                    return 'source has container and miner';
                }
                energy = this.energyCapacityAvailable;
            } else if(containerNearSource === true){
                energy = this.energyCapacityAvailable;
            } else{
                energy = this.energyAvailable;
            }
            assignedSpawn.spawnMiner(energy, source.id, this.name, miningWorkParts, 1, sourceContainer.pos);
        }
    }
}