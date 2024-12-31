Room.prototype.spawnManager = function(){
    if(this.memory.pickups != undefined && this.memory.dropOffs != undefined){
        const spawns = this.find(FIND_MY_SPAWNS);
        if(!_.isEmpty(spawns)){
            for(let name in spawns){
                let roomNetIncome = 0;
                for(let name in Memory.sourceEco){
                    let info = Memory.sourceEco[name];
                    if(info.room === this.name){
                        roomNetIncome += info.net;
                    }
                }

                const constructionSites = this.find(FIND_CONSTRUCTION_SITES);
                let upgraderParts = 0;
                let builderParts = 0;
                // allows for more precision for spawning upgraders. 
                let diff = 2
                if(_.isEmpty(constructionSites)){
                    upgraderParts = Math.floor(roomNetIncome / diff);
                } else {
                    const minUpgraderParts = 2;
                    builderParts = Math.floor((roomNetIncome - minUpgraderParts));
                    upgraderParts = Math.floor(minUpgraderParts / diff);
                }
                let currentSpawn = spawns[name];
                let spawnState;
                console.log(upgraderParts)
                
                if(spawnState === undefined){
                    spawnState = this.isTransportNeeded(currentSpawn, currentSpawn.room.energyAvailable);
                }
                if(spawnState === undefined){
                    this.isBuilderNeeded(currentSpawn, builderParts);
                }
                if(spawnState === undefined){
                    this.isUpgraderNeeded(currentSpawn, upgraderParts);
                }
            }
        } else if(this.memory.remoteMining.isMined === true && this.memory.remoteMining.assignedToo != undefined){            
            const assignedSpawn = Game.rooms[this.memory.remoteMining.assignedToo].find(FIND_MY_SPAWNS)[0];
            const hasMiners = !_.isEmpty(Game.rooms[this.memory.remoteMining.assignedToo].find(FIND_MY_CREEPS, {
                 filter: (c) =>  c.memory.role === 'miner'
            }));
            if(hasMiners){
                const energyAvailable = assignedSpawn.room.energyAvailable;
                let spawnState; //this.isMinerNeeded(assignedSpawn);
                if(spawnState === undefined){
                    this.isTransportNeeded(assignedSpawn, energyAvailable)
                }
                if(spawnState === undefined){
                    this.isBuilderNeeded(assignedSpawn);
                }
                if(spawnState === undefined){
                    this.remoteBuilderTransport(assignedSpawn, energyAvailable)
                }
            }
        }
    }
}

Room.prototype.isTransportNeeded = function(assignedSpawn, energyAvailable){
    const roomName = this.name;
    const transportRequests = Math.ceil(Object.keys(this.memory.pickups).length * 0.2);
    const haulers = _.map(Game.creeps, function(c){ return c.memory.role === 'transporter' && c.memory.target === roomName})
    for(let i = 0; i < Memory.sourceEco.length; i++){
        const info = Memory.sourceEco[i];
        if(info.room === this.name){
            const eco = Memory.sourceEco[i];
            const currentCarry = this.getSpecificBodyPartCountForSource(haulers, 'transporter', CARRY, info.id);
            if(currentCarry < (eco.carryParts + transportRequests)){
                const neededCarry = Math.ceil(eco.carryParts - currentCarry);
                assignedSpawn.createTransporter(energyAvailable, 'transporter', this.name, this.name, neededCarry);
            }
        }
    }
}

Room.prototype.remoteBuilderTransport = function(assignedSpawn, energyAvailable){
    let roomName = this.name;
    let foo = _.map(Game.creeps, function(c){ return c.memory.role === 'transporter' && c.memory.target === roomName && c.memory.home === roomName})
    let transporterAssigned = 0;
    for(let i = 0; i < foo.length; i++){
        if(foo[i]){
            transporterAssigned++;
        }
    }
    let builderAssigned = numberOfBuilders(this.name);
    
    if(transporterAssigned < builderAssigned){
        console.log('transport builder')
        assignedSpawn.createTransporter(energyAvailable, 'transporter', this.name, this.name);
    }
}

Room.prototype.isUpgraderNeeded = function(assignedSpawn, maxUpgraderParts){
    let assignedWorkParts = assignedRoleWorkParts(this.name, 'upgrader');
    if(assignedWorkParts < maxUpgraderParts){
        assignedSpawn.spawnUpgrader(this.name, maxUpgraderParts);
    }
}

Room.prototype.isBuilderNeeded = function(assignedSpawn, maxBuilderParts){
    let assignedWorkParts = assignedRoleWorkParts(this.name, 'builder');
    if(assignedWorkParts < maxBuilderParts){
        assignedSpawn.spawnBuilder(this.name, maxBuilderParts);
    }
}

function assignedRoleWorkParts(roomName, role){
    let roomBuilders = _.map(Game.creeps, function(c){ if(c.memory.role === role && c.memory.target === roomName){return c}})
    let assignedWorkParts = 0;
    for(let i = 0; i < roomBuilders.length; i++){
        if(roomBuilders[i] != null && roomBuilders[i] != undefined){
            for(let j = 0; i < roomBuilders[i].body.length; i++){
                if(roomBuilders.body[j] === WORK){
                    assignedWorkParts++;
                }
            }
        }
    }
    return assignedWorkParts;
}