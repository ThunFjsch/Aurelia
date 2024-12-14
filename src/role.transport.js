module.exports = {
     /** @param {Creep} creep **/
    run: function(creep) {
        creep.switchWorkState();
        // if creep is supposed to transfer energy to the spawn
        creep.closeToDeath();
        if (creep.memory.state) {
            if(creep.room.name === creep.memory.home){
                creep.getDropOff();
            } else {
               // delete creep.memory.dropOff;
                var exit = creep.room.findExitTo(creep.memory.home);
                creep.moveTo(creep.pos.findClosestByPath(exit), {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
        // if creep is supposed to harvest energy from source
        else {
            if(creep.room.name === creep.memory.target){
                creep.getPickUp();
            } else {
               // delete creep.memory.pickup;
                var exit = creep.room.findExitTo(creep.memory.target);
                creep.moveTo(creep.pos.findClosestByPath(exit));
            }
	    }
    }
}