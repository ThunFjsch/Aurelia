var roles = {
    upgrader: require('role.upgrader'),
    builder: require('role.builder'),
    maintainer: require('role.maintenance'),
    wallRepairer: require('role.wallRepairer'),
    claimer: require('role.claimer'),
    miner: require('role.miner'),
    transporter: require('role.transport'),
    fighter: require('role.fighter'),
    healer: require('role.healer'),
    rangedFighter: require('role.fighterRanged'),
    scout: require('role.scout')
};

Creep.prototype.runRole = function(){
    if(roles[this.memory.role] != undefined){
        roles[this.memory.role].run(this);
    } else { this.suicide() }
}

Creep.prototype.getDropOff = function(){
    if(this.memory.dropOff === undefined){
        for(let job in this.room.memory.dropOffs){
            if(!this.room.memory.dropOffs[job].isAssigned){
                this.memory.dropOff = {
                    target: this.room.memory.dropOffs[job].target, 
                    job: this.room.memory.dropOffs[job].name
                };
                this.room.memory.dropOffs[job] = {
                    target: this.room.memory.dropOffs[job].target,
                    isAssigned: true,
                    assignee: this.name,
                    name: this.room.memory.dropOffs[job].name
                }
                break;
            }
        }
    } else if(this.memory.dropOff.target === undefined){
        delete this.memory.dropOffs;
    } else if(this.room.memory.dropOffs[this.memory.dropOff.target]){
        delete this.memory.dropOff;
        delete this.room.memory.dropOffs[this.memory.dropOff.job];
    } else {
        
        const target = Game.getObjectById(this.memory.dropOff.target);
        
        if(this.transfer(target, RESOURCE_ENERGY) === OK){
            delete this.room.memory.dropOffs[this.memory.dropOff.job];
        }
        if(this.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE){
            this.moveTo(target, {reusePath: 50, visualizePathStyle: {stroke: '#c0ffc3'}});
        } else if(this.transfer(target, RESOURCE_ENERGY) === ERR_NOT_ENOUGH_RESOURCES){
            delete this.memory.dropOff;
        } else if(this.transfer(target, RESOURCE_ENERGY) === ERR_INVALID_TARGET || ERR_FULL){
            delete this.memory.dropOff;
            //delete this.room.memory.dropOffs[this.memory.dropOff.job];
        }
    }
}

Creep.prototype.getPickUp = function(){
   if(this.memory.pickup === undefined){
        for(let job in this.room.memory.pickups){
            if(!this.room.memory.pickups[job].isAssigned){
                this.memory.pickup = {
                    target: this.room.memory.pickups[job].target, 
                        job: this.room.memory.pickups[job].name
                    };
                    this.room.memory.pickups[job] = {
                        target: this.room.memory.pickups[job].target,
                        isAssigned: true,
                        assignee: this.name
                    }
                    break;
                }
            }
    } else if(this.memory.pickup.target === undefined){
        delete this.memory.pickup;
    } /* else if(this.room.memory.pickups[this.memory.pickup.job] === undefined){
        console.log(this.room.memory.pickups[this.memory.pickup.job])
        console.log('job outdatd')
        delete this.memory.pickup;
    } */else {
        const target = Game.getObjectById(this.memory.pickup.target);
        if(this.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE || this.pickup(target) === ERR_NOT_IN_RANGE){
            //console.log(this.moveTo(target, {visualizePathStyle: {stroke: '#00FFFF'}}))
            this.moveTo(target, {reusePath: 50, visualizePathStyle: {stroke: '#00FFFF'}});
        } else if(this.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_ENOUGH_ENERGY || ERR_INVALID_TARGET){
            //console.log('Err: Job was outdated');
            delete this.memory.pickup;
        }
    }
}

// changes the state to work depending on the carry energy
Creep.prototype.switchWorkState = function(){
    // if creep is bringing energy to the spawn but has no energy left
    if (this.memory.state === true && this.carry.energy === 0) {
        // switch state
        this.memory.state = false;
        delete this.memory.dropOff;
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