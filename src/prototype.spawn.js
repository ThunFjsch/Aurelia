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
            else if(role == 'scout'){
                name = this.createScout(50)
            }
            
            // if no claim order was found, check other roles
            else if (numberOfCreeps[role] < this.memory.minCreeps[role]) {
                if(role != 'miner' && role != 'transporter'){
                    name = this.createCustomCreep(role, this.room.name);
                }
                break;
            }
        }
    }
    
    /*
    Attack Spawn Logic
    *//*
    let numberOfAttacker = {};
    if(name==undefined && this.memory.attackRoom){
        if(this.memory.attackRoom){
            numberOfAttacker[this.memory.attackRoom] = _.sum(Game.creeps, (c) =>
                    c.memory.role === 'fighter' && c.memory.home === this.room.name);
            if (numberOfAttacker[this.memory.attackRoom] < 1) {
                name = this.createAttacker(maxEnergy, 'fighter', this.room.name, this.memory.attackRoom);
            }
        }
    }*/
    
    let numberOfRangedFighter = {};
    if(name==undefined && this.memory.attackRoom){
        if(this.memory.attackRoom){
            numberOfRangedFighter[this.memory.attackRoom] = _.sum(Game.creeps, (c) =>
                    c.memory.role == 'rangedFighter' && c.memory.home === this.room.name);
            if (numberOfRangedFighter[this.memory.attackRoom] < 1) {
                name = this.createRangedFighter(maxEnergy, 'rangedFighter', this.room.name, this.memory.attackRoom);
            }
        }
    }
    /*
    let numberOfHealer = {};
    if(name==undefined && this.memory.attackRoom){
        if(this.memory.attackRoom){
            numberOfHealer[this.memory.attackRoom] = _.sum(Game.creeps, (c) =>
                    c.memory.role == 'healer' && c.memory.home === this.room.name);
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

StructureSpawn.prototype.createCustomCreep = function (roleName, target) {
    let energy = this.room.energyAvailable;
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
    return this.spawnCreep(body, generateName(roleName), {memory: {role: roleName, state: false, target: target, home: this.room.name}});
};

StructureSpawn.prototype.createScout = function () {
    var body = [];
    body.push(MOVE)
    // create creep with the created body and the given role
    return this.spawnCreep(body, generateName('scout'), {memory: {role: 'scout'}});
};

StructureSpawn.prototype.spawnMiner = function(energy, sourceId, target, miningWorkParts, moveParts, sourceContainer){
    var body = [];
        // create a balanced body as big as possible with the given energy
        var numberOfParts = Math.floor((energy - BODYPART_COST[MOVE]) / BODYPART_COST[WORK]);
        // make sure the creep is not too big (more than 50 parts)
        if(numberOfParts === 0){
            return ERR_INVALID_ARGS;
        }
        for (let i = 0; i < numberOfParts; i++) {
            if(miningWorkParts <= i){
                break;
            }
            body.push(WORK);
        }
        body.push(MOVE);
        if(body.length === 1){
            return ERR_NOT_ENOUGH_ENERGY;
        }
        
        return this.spawnCreep(body, generateName('miner'), {memory: { role: 'miner', sourceId: sourceId, target: target, containerPos: sourceContainer }});
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
StructureSpawn.prototype.createTransporter = function (energy, roleName, target, home) {
    if(home === undefined){
        home = this.room.name;
    }
    // create a body with twice as many CARRY as MOVE parts
    var numberOfParts = Math.floor(energy / 150);
    // make sure the creep is not too big (more than 50 parts)
    numberOfParts = Math.min(numberOfParts, Math.floor(50 / 3));
    var body = [];
    for (let i = 0; i < numberOfParts; i++) {
        body.push(CARRY);
    }
    for (let i = 0; i < numberOfParts; i++) {
        body.push(MOVE);
    }
    // create creep with the created body and the role 'lorry'
    if(!_.isEmpty(body)){
        return this.spawnCreep(
            body, 
            generateName(roleName), 
            {memory: { 
                role: roleName, 
                state: false, 
                target: target,
                home: home }
            });
    } else{
        return ERR_NOT_ENOUGH_ENERGY
    }
};

StructureSpawn.prototype.createClaimer = function (target, roleName) {
    return this.spawnCreep([CLAIM, MOVE], generateName(roleName), {memory: { role: roleName, target: target }});
};


function generateName(roleName){
    return roleName + '_' + Math.random().toString(36).slice(2, 7).toString();
}