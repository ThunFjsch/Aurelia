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
                const hasMiner = !_.isEmpty(this.find(FIND_MY_CREEPS, {
                    filter:(c) => c.memory.role === 'miner'
                }))
                let upgraderParts = 0;
                let builderParts = 0;
                // allows for more precision for spawning upgraders. 
                let diff = 1.3;
                if(_.isEmpty(constructionSites)){
                    upgraderParts = Math.floor(roomNetIncome * diff);
                } else {
                    const minUpgraderParts = 2;
                    builderParts = Math.floor((roomNetIncome - minUpgraderParts));
                    upgraderParts = Math.floor(minUpgraderParts * diff);
                }
                let currentSpawn = spawns[name];
                let spawnState;
                console.log(upgraderParts)
                
                if(spawnState === undefined && hasMiner){
                    spawnState = this.isTransportNeeded(currentSpawn, currentSpawn.room.energyAvailable);
                }
                if(spawnState === undefined && hasMiner){
                    this.isBuilderNeeded(currentSpawn, builderParts);
                }
                if(spawnState === undefined && hasMiner){
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
                if(spawnState === undefined && hasMiner){
                    this.isTransportNeeded(assignedSpawn, energyAvailable)
                }
                if(spawnState === undefined && hasMiner){
                    this.isBuilderNeeded(assignedSpawn);
                }
                if(spawnState === undefined && hasMiner){
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
        let assignedPath;
        let assignedSpot;
        const spots = this.memory.upgraderInfo.spots;
        if(spots === undefined){
            return;
        }
        for(let spot in  spots){
            if(spots[spot].isAssigned){
                const upgraderSpot = spots[spot];
                const assignedCreep = upgraderSpot.assignee;
                if(assignedCreep != undefined && Game.creeps[assignedCreep] === undefined){
                    upgraderSpot.isAssigned = false;
                    delete this.memory.upgraderInfo.spots[assignedSpot].assignee
                }
            }
        }
        if(assignedSpot === undefined){
            for(let spot in spots){
                    if(!spots[spot].isAssigned){
                        assignedPath = spots[spot];
                        assignedSpot = spot;
                        break;      
                }
            }
        }
        if(assignedPath != undefined){
            const spawn = this.find(FIND_MY_SPAWNS)[0];
            const name =  spawn.generateName('upgrader');
            let foo = spawn.spawnUpgrader(this.name, maxUpgraderParts, {path: assignedPath, targetSpot: this.memory.upgraderInfo.spots[assignedSpot]});
            if(foo === OK){
                this.memory.upgraderInfo.spots[assignedSpot].isAssigned = true;
                this.memory.upgraderInfo.spots[assignedSpot].assignee = name;
            }
        }
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
            for(let j = 0; j < roomBuilders[i].body.length; j++){
                if(roomBuilders[i].body[j] != undefined &&roomBuilders[i].body[j].type === WORK){
                    assignedWorkParts++;
                }
            }
        }
    }
    return assignedWorkParts;
}