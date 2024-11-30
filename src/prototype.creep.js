var roles = {
    harvester: require('role.harvester'),
    upgrader: require('role.upgrader'),
    builder: require('role.builder'),
    maintainer: require('role.maintenance'),
    wallRepairer: require('role.wallRepairer'),
    longDistanceHarvester: require('role.longDistanceHarvester'),
    claimer: require('role.claimer'),
    miner: require('role.miner'),
    transporter: require('role.transport'),
    fighter: require('role.fighter'),
    healer: require('role.healer'),
    rangedFighter: require('role.fighterRanged')
};

Creep.prototype.runRole = function(){
    
    if(roles[this.memory.role] != undefined){
        roles[this.memory.role].run(this);
    }
}

Creep.prototype.getEnergy = function(canMine){
    // find closest container with min 400 E
    let container = this.pos.findClosestByPath(FIND_STRUCTURES, {
                        filter: (s) => (s.structureType == STRUCTURE_CONTAINER) &&
                        s.store[RESOURCE_ENERGY] > 400
    });
        
    if(container != undefined && 
        (this.memory.role === 'transporter' 
        || this.memory.role === 'harvester' 
        || this.memory.role === 'longDistanceHarvester')){
        // if one was found
        if (container != undefined) {
            // try to withdraw energy, if the container is not in range
            if (this.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                // move towards it
                this.moveTo(container, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
    } else if(container == undefined && canMine) {
        // find closest source
        var source = this.pos.findClosestByPath(FIND_SOURCES_ACTIVE);

        // try to harvest energy, if the source is not in range
        if (this.harvest(source) == ERR_NOT_IN_RANGE) {
            // move towards it
            this.moveTo(source);
        }
    } else{
        const target = this.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
            filter: (r) => r.resourceType == RESOURCE_ENERGY && r.amount > 100
        });
        const roomStorage = this.room.storage;
        // wenn ernergy am boden diese nehmen
        if(target) {
            if(this.pickup(target) == ERR_NOT_IN_RANGE) {
                this.moveTo(target, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        } else if(roomStorage != undefined){
            if(roomStorage.store.getCapacity(RESOURCE_ENERGY) > 10000){
                if(this.withdraw(roomStorage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE){
                    this.moveTo(roomStorage, {visualizePathStyle: {stroke: '#ffaa00'}});
                }
            } else{
                if(this.withdraw(container, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE){
                    this.moveTo(container, {visualizePathStyle: {stroke: '#ffaa00'}});
                }
            }
        } 
    }
}

Creep.prototype.energyToStructure = function(){
    var target = this.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_EXTENSION || 
                structure.structureType == STRUCTURE_TOWER || 
                structure.structureType == STRUCTURE_SPAWN) &&
                structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
    }});
    if(!target){
        target = this.room.storage;
    }
    if(target) {
        if(this.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
        }
    } 
}

// changes the state to work depending on the carry energy
Creep.prototype.switchWorkState = function(){
    // if creep is bringing energy to the spawn but has no energy left
    if (this.memory.state === true && this.carry.energy === 0) {
        // switch state
        this.memory.state = false;
    }
    // if creep is harvesting energy but is full
    else if (this.memory.state === false && this.carry.energy === this.carryCapacity) {
        // switch state
        this.memory.state = true;
    }
}

Creep.prototype.changeRoom = function(){
    if (this.memory.target != undefined && this.room.name != this.memory.target) {
        // find exit to target room
        var exit = this.room.findExitTo(this.memory.target);
        // move to exit
        this.moveTo(this.pos.findClosestByRange(exit));
        // return the function to not do anything else
    }
}