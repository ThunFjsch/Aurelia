module.exports = {
    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.path != undefined){
            let path = creep.memory.path.path;
            let spot = creep.memory.path;
            if(path.length < 1 || path[0] === null){
                creep.harvest(Game.getObjectById(creep.memory.sourceId));
                return;
            }
            if(creep.pos.x === path[0].x && creep.pos.y === path[0].y){
                creep.memory.path.path.shift();
            }
            if(creep.moveByPath(path) === ERR_NOT_FOUND){
                if(path[0] != undefined){
                    creep.moveTo(path[0].x, path[0].y, { visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            
            /*
            new RoomVisual(creep.room.name).line(spot.x, spot.y, creep.pos.x, creep.pos.y)
            console.log(creep.name)
            console.log(creep.pos.x + ' ' + creep.pos.y)
            console.log(JSON.stringify(path))
            console.log(creep.moveByPath(path));*/
           // console.log(creep.moveTo(path[0].x,path[0].y, {maxOps: 10000, visualizePathStyle: {stroke: '#ffffff'}}));
        
            return;
        }
    }
};