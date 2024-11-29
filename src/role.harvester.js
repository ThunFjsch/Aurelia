module.exports = {
    /** @param {Creep} creep **/
    run: function(creep) {
        creep.switchWorkState();
        
        // if creep is supposed to transfer energy to the spawn
        if (creep.memory.state) { 
            creep.energyToStructure(creep);
        } else {
            creep.getEnergy(true);
        }
	}
};