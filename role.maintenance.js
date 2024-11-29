module.exports = {
    // a function to run the logic for this role
    run: function(creep) {
        
        creep.switchWorkState();
        // if creep is supposed to repair something
        if (creep.memory.state == true) {
            // find closest structure with less than max hits
            // Exclude walls because they have way too many max hits and would keep
            // our repairers busy forever. We have to find a solution for that later.
            var structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                // the second argument for findClosestByPath is an object which takes
                // a property called filter which can be a function
                // we use the arrow operator to define it
                filter: (s) => s.hits < s.hitsMax && s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_RAMPART
            });

            // if we find one
            if (structure != undefined) {
                // try to repair it, if it is out of range
                if (creep.repair(structure) == ERR_NOT_IN_RANGE) {
                    // move towards it
                    creep.moveTo(structure);
                }
            }
            // if we can't fine one
            else {  
                // look for construction sites
                roleBuilder.run();
            }
        }
        // if creep is supposed to harvest energy from source
        else {
            creep.getEnergy(false);
        }
    }
};


/**
 * 
 * if(creep.memory.working == true && creep.carry.energy == 0) {
            creep.memory.working = false;
        }
        else if (creep.memory.working == false && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
        }
        if(creep.memory.working == true) {
            var Container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (s) => s.structureType == STRUCTURE_CONTAINER
                                && s.store[RESOURCE_ENERGY] > 0
        })
            if(creep.withdraw(Container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(Container)
            }
        }
        else {
            var EnergyStructures = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (s) => (s.structureType == STRUCTURE_SPAWN
                                || s.structureType == STRUCTURE_EXTENSION)
                                && s.energy < s.energyCapacity
        })
            if(creep.transfer(EnergyStructures) == ERR_NOT_IN_RANGE) {
                creep.moveTo(EnergyStructures)
            }
        }
    }
 */


	/**
	 * if(creep.store[RESOURCE_ENERGY] === 0) {
			var spawns = creep.pos.findClosestByPath(FIND_MY_SPAWNS);
			var moveResult = creep.moveTo(spawns);
			
			  check moveResult here
			
			console.log(spawns);
			if( spawns.store[RESOURCE_ENERGY] > 199) {
				var transferResult = spawns.transfer(creep);
				console.log(creep.store[RESOURCE_ENERGY])
				
					check transferResult here
				
		}
		else{
		
			var roadToRepair = creep.pos.findClosest(FIND_STRUCTURES, {
				filter: function(object){
					return object.structureType === STRUCTURE_ROAD && (object.hits > object.hitsMax / 3);
				} 
			});
		
			if (roadToRepair){
				creep.moveTo(roadToRepair);
				creep.repair(roadToRepair);
		
				// perhaps check the results again?
		
			} else {
		
				// nothing to repair, let's do something else?
		
			}
		} 
}}
 */