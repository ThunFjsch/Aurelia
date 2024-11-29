var roleUpgrader = require('role.upgrader');

var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.target != creep.room.name){
             creep.changeRoom();
        } else {
    	    if(creep.memory.state && creep.store[RESOURCE_ENERGY] == 0) {
                creep.memory.state = false;
                creep.say('🔄 harvest');
    	    }
    	    if(!creep.memory.state && creep.store.getFreeCapacity() == 0) {
    	        creep.memory.state = true;
    	        creep.say('🚧 build');
    	    }
    	    if(creep.memory.state) {
    	        var constructionSite = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
                if(constructionSite != undefined) {
                    if(creep.build(constructionSite) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(constructionSite, {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                }
                else{
                    roleUpgrader.run(creep);
                }
    	    }
    	    else {
    	        creep.getEnergy(false);
    	    }
        }

        
	}
};

module.exports = roleBuilder;