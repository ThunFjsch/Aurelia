let listOfRoles = ['harvester', 'claimer', 'transporter', 'claimer', 'upgrader', 'maintainer', 'builder', 'wallRepairer', 'miner', 'longDistanceHarvester', 'fighter', 'healer', 'fighterRanged'];
let minCreeps ={
    harvester: 0,
    miner: 2,
    builder: 2,
    upgrader: 0,
    transporter: 4,
    maintainer: 0,
    wallRepairer: 0
};

StructureSpawn.prototype.spawnCreepWhenNeeded = function(){
    if(this.memory.minCreeps == undefined){
        this.memory.minCreeps = minCreeps;
    }
    let room = this.room;
    // find all creeps in room
    let creepsInRoom = room.find(FIND_MY_CREEPS);
    
    // count the number of creeps alive for each role in this room
    // _.sum will count the number of properties in Game.creeps filtered by the
    //  arrow function, which checks for the creep being a specific role
    let numberOfCreeps = {};
    for (let role of listOfRoles) {
        numberOfCreeps[role] = _.sum(creepsInRoom, (c) => c.memory.role == role);
    }
    let maxEnergy = room.energyAvailable;
    let name = undefined;
    
    // if no harvesters are left AND either no miners or no lorries are left
    //  create a backup creep
    if (numberOfCreeps['harvester'] == 0 && numberOfCreeps['transporter'] == 0) {
        // if there are still miners or enough energy in Storage left
        if (numberOfCreeps['miner'] > 0 || (room.storage != undefined && room.storage.store[RESOURCE_ENERGY] >= 150 + 550)) {
            // create a transporter
            name = this.createTransporter(150);
        }
        // if there is no miner and not enough energy in Storage left
        else {
            // create a harvester because it can work on its own
            name = this.createCustomCreep(maxEnergy, 'harvester');
        }
    }
    else {
        // check if all sources have miners
        let sources = room.find(FIND_SOURCES);
        let sourceId;
        let allMiners = [];
        let minerCount = 0
        for(let i = 0; i < sources.length; i++){
            let foo =this.room.find(FIND_MY_CREEPS, {
                filter: (c) => c.memory.role == 'miner' && c.memory.sourceId == sources[i].id
            });
            allMiners.push(foo)
            
        }
        if(sources.length == 2){
            if(allMiners[0].length < allMiners[1].length){
                sourceId = sources[0].id;
                minerCount = allMiners[0].length;
            } else {
                sourceId = sources[1].id;
                minerCount = allMiners[1].length;
            }
        }
        console.log(allMiners[0].length)
        const hasContainers = this.room.find(FIND_STRUCTURES, {
            filter: (s) => s.structureType == STRUCTURE_CONTAINER
        });
        if(!_.isEmpty(_.isEmpty(hasContainers)) && minerCount <= 3){
            //name = this.createMiner(maxEnergy, sourceId, 'miner');
        } else{
            for (let source of sources) {
            var foo = _.some(creepsInRoom, c => c.memory.role == 'miner' && c.memory.sourceId == source.id);
            const containers = source.pos.findInRange(FIND_STRUCTURES, 1, {
                filter: s => s.structureType == STRUCTURE_CONTAINER
            });
            
            // if the source has no miner
            if (!_.some(creepsInRoom, c => c.memory.role == 'miner' && c.memory.sourceId == source.id)) {
                // check whether or not the source has a container
                /** @type {Array.StructureContainer} */
                const containers = source.pos.findInRange(FIND_STRUCTURES, 1, {
                    filter: s => s.structureType == STRUCTURE_CONTAINER
                });
                // if there is a container next to the source
                if (containers.length > 0) {
                    // spawn a miner
                   name = this.createMiner(maxEnergy, source.id, 'miner');
                   break;
                }
            }
        }
        }
    }
    // if none of the above caused a spawn command check for other roles
    if (name == undefined) {
        for (let role of listOfRoles) {
            // check for claim order
            if (role == 'claimer' && this.memory.claimRoom != undefined) {
                // try to spawn a claimer
                name = this.createClaimer(this.memory.claimRoom, 'claimer');
                // if that worked
                if (name != undefined && _.isString(name)) {
                    // delete the claim order
                    delete this.memory.claimRoom;
                }
            }
            
            // if no claim order was found, check other roles
            else if (numberOfCreeps[role] < this.memory.minCreeps[role]) {
                if (role == 'transporter') {
                    name = this.createTransporter(150, role);
                }
                else {
                    name = this.createCustomCreep(maxEnergy, role);
                }
                break;
            }
        }
    }
        
    // if none of the above caused a spawn command check for LongDistanceHarvesters
    /** @type {Object.<string, number>} */
    let numberOfLongDistanceHarvesters = {};
    
    //console.log(name)
    if (name == undefined && this.memory.targetRoom != undefined) {
        if(this.memory.minLongDistanceHarvesters.targetRoom){
            numberOfLongDistanceHarvesters[this.memory.minLongDistanceHarvesters] = 
                _.sum(Game.creeps, (c) => c.memory.role == 'longDistanceHarvester' && 
                c.memory.target == this.memory.minLongDistanceHarvesters.targetRoom);
            
            if (numberOfLongDistanceHarvesters[this.memory.minLongDistanceHarvesters] < this.memory.minLongDistanceHarvesters.min) {
                name = this.createLongDistanceHarvester(maxEnergy, 'longDistanceHarvester', 2, this.room.name, this.memory.minLongDistanceHarvesters.targetRoom);
            }
        }
    }
    
    /*
    Attack Spawn Logic
    */
    let numberOfAttacker = {};
    if(name==undefined && this.memory.attackRoom){
        if(this.memory.attackRoom){
            numberOfAttacker[this.memory.attackRoom] = _.sum(Game.creeps, (c) =>
                    c.memory.role == 'fighter');
            if (numberOfAttacker[this.memory.attackRoom] < 1) {
                    name = this.createAttacker(maxEnergy, 'fighter', this.room.name, this.memory.attackRoom);
                }
        }
    }
    /*
    let numberOfRangedFighter = {};
    if(name==undefined && this.memory.attackRoom){
        if(this.memory.attackRoom){
            numberOfRangedFighter[this.memory.attackRoom] = _.sum(Game.creeps, (c) =>
                    c.memory.role == 'rangedFighter');
            if (numberOfRangedFighter[this.memory.attackRoom] < 0) {
                name = this.createRangedFighter(maxEnergy, 'rangedFighter', this.room.name, this.memory.attackRoom);
            }
        }
    }
    
    let numberOfHealer = {};
    if(name==undefined && this.memory.attackRoom){
        console.log('ff')
        if(this.memory.attackRoom){
            numberOfHealer[this.memory.attackRoom] = _.sum(Game.creeps, (c) =>
                    c.memory.role == 'healer');
            if (numberOfHealer[this.memory.attackRoom] < 0) {
                name = this.createHealer(maxEnergy, 'healer', this.room.name, this.memory.attackRoom);
            }
        }
    }*/

    // print name to console if spawning was a success
    if (name != undefined && _.isString(name)) {
        console.log(this.name + " spawned new creep: " + name + " (" + Game.creeps[name].memory.role + ")");
        for (let role of listOfRoles) {
            console.log(role + ": " + numberOfCreeps[role]);
        }
        for (let roomName in numberOfLongDistanceHarvesters) {
            console.log("LongDistanceHarvester" + roomName + ": " + numberOfLongDistanceHarvesters[roomName]);
        }
    }
}

StructureSpawn.prototype.createCustomCreep = function (energy, roleName) {
    // create a balanced body as big as possible with the given energy
    var numberOfParts = Math.floor(energy / 200);
    // make sure the creep is not too big (more than 50 parts)
    numberOfParts = Math.min(numberOfParts, Math.floor(50 / 3));
    var body = [];
    for (let i = 0; i < numberOfParts; i++) {
        body.push(WORK);
    }
    for (let i = 0; i < numberOfParts; i++) {
        body.push(CARRY);
    }
    for (let i = 0; i < numberOfParts; i++) {
        body.push(MOVE);
    }
    // create creep with the created body and the given role
    return this.spawnCreep(body, generateName(roleName), {memory: {role: roleName, state: false}});
};

StructureSpawn.prototype.createLongDistanceHarvester = function (energy, roleName, numberOfWorkParts, home, target) {
    // create a body with the specified number of WORK parts and one MOVE part per non-MOVE part
    var body = [];
    for (let i = 0; i < numberOfWorkParts; i++) {
        body.push(WORK);
    }

    // 150 = 100 (cost of WORK) + 50 (cost of MOVE)
    energy -= numberOfWorkParts * BODYPART_COST[WORK];
//console.log(energy);
    var numberOfParts = Math.floor(energy/(BODYPART_COST[MOVE] + BODYPART_COST[CARRY]));
    for (let i = 0; i < numberOfParts; i++) {
        body.push(CARRY);
    }
    for (let i = 0; i < numberOfParts + numberOfWorkParts; i++) {
        body.push(MOVE);
    }

    // create creep with the created body
    return this.spawnCreep([WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE], generateName(roleName), {memory: {
        role: roleName,
        home: home,
        target: target,
        state: false}})
};

StructureSpawn.prototype.createAttacker = function (energy, roleName, home, target) {
    // create a body with the specified number of WORK parts and one MOVE part per non-MOVE part
    var body = [];
            var numberOfParts = Math.floor(energy / 150);
            for (let i = 0; i < numberOfParts; i++) {
                body.push(TOUGH);
                body.push(TOUGH);
            }
            for (let i = 0; i < numberOfParts; i++) {
                body.push(MOVE);
            }
            for (let i = 0; i < numberOfParts; i++) {
                body.push(ATTACK);
            }
    // create creep with the created body
    return this.spawnCreep(body, generateName(roleName), {memory: {
        role: roleName,
        home: home,
        attackRoom: target,
        state: false}})
};
StructureSpawn.prototype.createHealer = function (energy, roleName, home, target) {
    // create a body with the specified number of WORK parts and one MOVE part per non-MOVE part
    var body = [];
            var numberOfParts = Math.floor(energy / ((BODYPART_COST[TOUGH] * 2) + BODYPART_COST[MOVE] + BODYPART_COST[HEAL]));
            for (let i = 0; i < numberOfParts; i++) {
                body.push(TOUGH);
                body.push(TOUGH);
            }
            for (let i = 0; i < numberOfParts; i++) {
                body.push(MOVE);
            }
            for (let i = 0; i < numberOfParts; i++) {
                body.push(HEAL);
            }
    // create creep with the created body
    return this.spawnCreep(body, generateName(roleName), {memory: {
        role: roleName,
        home: home,
        attackRoom: target,
        state: false}})
};

StructureSpawn.prototype.createRangedFighter = function (energy, roleName, home, target) {
    // create a body with the specified number of WORK parts and one MOVE part per non-MOVE part
    var body = [];
            var numberOfParts = Math.floor(energy / ((BODYPART_COST[TOUGH] * 2) + BODYPART_COST[MOVE] + BODYPART_COST[RANGED_ATTACK]));
            for (let i = 0; i < numberOfParts; i++) {
                body.push(TOUGH);
                body.push(TOUGH);
            }
            for (let i = 0; i < numberOfParts; i++) {
                body.push(MOVE);
            }
            for (let i = 0; i < numberOfParts; i++) {
                body.push(RANGED_ATTACK);
            }
    // create creep with the created body
    return this.spawnCreep(body, generateName(roleName), {memory: {
        role: roleName,
        home: home,
        attackRoom: target,
        state: false}})
};
    
    
// create a new function for StructureSpawn
StructureSpawn.prototype.createMiner = function (energy, sourceId, roleName) {
     // create a balanced body as big as possible with the given energy
    var numberOfParts = Math.floor((energy - BODYPART_COST[MOVE]) / BODYPART_COST[WORK]);
    // make sure the creep is not too big (more than 50 parts)
    var body = [];
    if(numberOfParts === 0){
        return ERR_NOT_ENOUGH_ENERGY;
    }
    for (let i = 0; i < numberOfParts; i++) {
        body.push(WORK);
        if(i === 4){
            break;
        }
    }
    body.push(MOVE);
    
    return this.createCreep(body, generateName(roleName),
    { role: roleName, sourceId: sourceId });
};

// create a new function for StructureSpawn
StructureSpawn.prototype.createTransporter = function (energy, roleName) {
    // create a body with twice as many CARRY as MOVE parts
    var numberOfParts = Math.floor(energy / 150);
    // make sure the creep is not too big (more than 50 parts)
    numberOfParts = Math.min(numberOfParts, Math.floor(50 / 3));
    var body = [];
    for (let i = 0; i < numberOfParts * 2; i++) {
        body.push(CARRY);
    }
    for (let i = 0; i < numberOfParts; i++) {
        body.push(MOVE);
    }
    // create creep with the created body and the role 'lorry'
    return this.createCreep(body, generateName(roleName), { role: 'transporter', state: false });
};

StructureSpawn.prototype.createClaimer = function (target, roleName) {
    return this.createCreep([CLAIM, MOVE], generateName(roleName), { role: roleName, target: target });
};


function generateName(roleName){
    return roleName + '_' + Math.random().toString(36).slice(2, 7).toString();
}