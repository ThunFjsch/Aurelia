let listOfRoles = [
    'harvester',
    'claimer',
    'transporter',
    'claimer',
    'upgrader',
    'maintainer',
    'builder',
    'wallRepairer',
    'miner',
    'longDistanceHarvester',
    'fighter',
    'healer',
    'fighterRanged'
];

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
    if (numberOfCreeps['transporter'] === 0) {
        console.log('tock why')
        // if there are still miners or enough energy in Storage left
        if (numberOfCreeps['miner'] > 0) {
            // create a transporter
            name = this.createTransporter(maxEnergy, 'transporter');
        }
    } else {
        console.log('tock')
        let miners = this.room.find(FIND_MY_CREEPS, {
        filter: (c) => c.memory.role === 'miner'
        });
        if(this.room.memory.remoteMining != undefined){
            for(let i = 0; i < this.room.memory.remoteMining.sources.length; i++){
                console.log('spawn miner?')
                workPartAmount = this.room.getSpecificBodyPartCountForSource(miners, 'miner', WORK, this.room.memory.remoteMining.sources[i]);
                name = this.spawnMiner(
                    this.room.memory.remoteMining.sources, 
                    workPartAmount, 
                    this.name, 
                    miners,
                    1);
                console.log(name)
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
                    name = this.createTransporter(maxEnergy, role);
                }
                else if(role != 'miner'){
                    name = this.createCustomCreep(maxEnergy, role);
                }
                break;
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
            if (numberOfAttacker[this.memory.attackRoom] < 3) {
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
    return this.spawnCreep(body, generateName(roleName), {memory: {role: roleName, state: false, target: this.room.name}});
};

StructureSpawn.prototype.spawnMiner = function(source, currentWorkParts, target, miners, moveParts){
    const miningWorkParts = Math.floor((source.energyCapacity / 300) / 2);
    let workersAssignToSource = 0;
       
    for(let i = 0; i < miners.length; i++){
       if(miners[i].memory.sourceId === source.id){
           workersAssignToSource++;
       }
    }
    
    console.log('fpp '+ workersAssignToSource)
    if(workersAssignToSource < source.avialableSpots && currentWorkparts < miningWorkParts){
        console.log('in spawn miner')
        return this.createMiner(source.id, 'miner', target, miningWorkParts - currentWorkParts, moveParts); 
    }
}

// create a new function for StructureSpawn
StructureSpawn.prototype.createMiner = function (sourceId, roleName, target, workPartsNeeded, movePartsNeeded) {
    const extensions = this.room.find(FIND_STRUCTURES, {
        filter: (s) => s.structureType === STRUCTURE_EXTENSION
    });
    var body = [];
    let energy = 0;
    
    if(_.isEmpty(extensions) === false){
        energy = this.room.energyCapacityAvailable;
    } else{
        energy = this.room.energyAvailable;
    }
    
    
    
    
     // create a balanced body as big as possible with the given energy
    var numberOfParts = Math.floor((energy - BODYPART_COST[MOVE]) / BODYPART_COST[WORK] * workPartsNeeded);
    // make sure the creep is not too big (more than 50 parts)
    
    if(numberOfParts === 0){
        return ERR_INVALID_ARGS;
    }
    
    for (let i = 0; i < numberOfParts; i++) {
        body.push(WORK);
        if(i === workPartsNeeded){
            break;
        }
    }
    
    body.push(MOVE);
    
    return this.spawnCreep(body, generateName(roleName), {memory: { role: roleName, sourceId: sourceId, target: target }});
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
    return this.spawnCreep(body, generateName(roleName), {memory: { role: roleName, state: false }});
};

StructureSpawn.prototype.createClaimer = function (target, roleName) {
    return this.spawnCreep([CLAIM, MOVE], generateName(roleName), {memory: { role: roleName, target: target }});
};


function generateName(roleName){
    return roleName + '_' + Math.random().toString(36).slice(2, 7).toString();
}