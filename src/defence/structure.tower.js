// create a new function for StructureTower
StructureTower.prototype.defend = function () {
        /*const closestDamagedStructure = this.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < structure.hitsMax 
        });
        if(closestDamagedStructure){
            this.repair(closestDamagedStructure);
        }*/
        
        const closestHostile = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(closestHostile){
            this.attack(closestHostile);
        }
    };