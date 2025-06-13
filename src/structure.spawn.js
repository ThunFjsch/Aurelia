import {CreepBodies} from './creeps/creepBodies';

const creepBodies = new CreepBodies();

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

StructureSpawn.prototype.spawnCreepWhenNeeded = function(){
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
        }
    }
}

StructureSpawn.prototype.generalCreep = function(target, role, maxParts, bodyBluePrint, predefinedMemory){
    const energy = this.room.energyAvailable;
    let numberOfParts = Math.floor(energy / bodyBluePrint.cost);
    numberOfParts = Math.min(numberOfParts, Math.floor(50/3));
    let body = [];
    for (let i = 0; i < numberOfParts; i++) {
        if(i > maxParts){
            break;
        }
        body.push(...bodyBluePrint.body.map(b => b));
    }
    return this.spawnCreep(body, this.generateName(role), {memory: predefinedMemory});

}

StructureSpawn.prototype.spawnUpgrader = function(target, name, maxUpgraderParts, spotInfo){
    const energy = this.room.energyAvailable;
    let numberOfParts = Math.floor(energy / creepBodies.startUpgrader.cost);
    numberOfParts = Math.min(numberOfParts, Math.floor(50/3));
    var body = [];
    for (let i = 0; i < numberOfParts; i++) {
        if(i > maxUpgraderParts){
            break;
        }
        body.push(...creepBodies.startUpgrader.body.map(b => b));
    }
    return this.spawnCreep(body, name, {memory: {role: 'upgrader', target: target, spot: spotInfo}});

}


StructureSpawn.prototype.createScout = function () {
    var body = [];
    body.push(MOVE)
    // create creep with the created body and the given role
    return this.spawnCreep(body, this.generateName('scout'), {memory: {role: 'scout'}});
};

StructureSpawn.prototype.spawnMiner = function(energy, sourceId, target, miningWorkParts, moveParts, assignedPath, name){
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

        return this.spawnCreep(body, name,{memory: { role: 'miner', sourceId: sourceId, target: target, path: assignedPath }});
};

// create a new function for StructureSpawn
StructureSpawn.prototype.createTransporter = function (energy, roleName, target, home, maxCarryParts) {
    if(home === undefined){
        home = this.room.name;
    }
    // create a body with twice as many CARRY as MOVE parts
    var numberOfParts = Math.floor(energy / creepBodies.startHauler.cost);
    // make sure the creep is not too big (more than 50 parts)
    numberOfParts = Math.min(numberOfParts, Math.floor(50 / 3));
    var body = [];
    for (let i = 0; i < numberOfParts; i++) {
        if(i > maxCarryParts){
            break;
        }
        body.push(...creepBodies.startHauler.body.map(b => b));
    }
    // create creep with the created body and the role 'lorry'
    if(!_.isEmpty(body)){
        return this.spawnCreep(
            body,
            this.generateName(roleName),
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

StructureSpawn.prototype.createClaimer = function(target, roleName) {
    return this.spawnCreep([CLAIM, MOVE], this.generateName(roleName), {memory: { role: roleName, target: target }});
};


StructureSpawn.prototype.generateName = function(roleName){
    return roleName + '_' + Math.random().toString(36).slice(2, 7).toString();
}

/**
 * StructureSpawn.prototype.createAttacker = function (energy, roleName, home, target) {
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
    return this.spawnCreep(body, this.generateName(roleName), {memory: {
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
    return this.spawnCreep(body, this.generateName(roleName), {memory: {
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
    return this.spawnCreep(body, this.generateName(roleName), {memory: {
        role: roleName,
        home: home,
        attackRoom: target,
        state: false}})
};
 */
