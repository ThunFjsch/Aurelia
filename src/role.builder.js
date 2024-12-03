var roleUpgrader = require('role.upgrader');

var roleBuilder = {
    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep === undefined){
            return;
        }
        var constructionSite = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
        if(constructionSite != undefined) {
            if(creep.build(constructionSite) === ERR_NOT_IN_RANGE){
                creep.moveTo(constructionSite, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        } else{
            roleUpgrader.run(creep);
        }

        
	}
};

module.exports = roleBuilder;

