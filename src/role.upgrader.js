module.exports = {
    /** @param {Creep} creep **/
    run: function(creep) {
        const upgrading = creep.upgradeController(creep.room.controller)
	    if(upgrading ===  ERR_NOT_IN_RANGE || upgrading === ERR_NOT_ENOUGH_RESOURCES){
            creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
        } 
	}
};