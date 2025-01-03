module.exports = {
    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.spot != undefined){
            let path = creep.memory.spot.path.path;
            if(path.length < 1 || path[0] === null){
                creep.upgradeController(creep.room.controller)
                return;
            }
            if(creep.pos.x === path[0].x && creep.pos.y === path[0].y){
                creep.memory.spot.path.path.shift();
            }
            if(creep.moveByPath(path) === ERR_NOT_FOUND){
                if(path[0] != undefined){
                    let foo = creep.moveTo(path[0].x, path[0].y, { visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        }
	}
};