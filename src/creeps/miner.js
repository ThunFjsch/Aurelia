export class Miner {
    constructor(){}
    /** @param {Creep} creep **/
    run(creep) {
            if(creep.memory.path != undefined){
                let path = creep.memory.path.path;
            let spot = creep.memory.path;
            if(creep.pos.x === spot.x && creep.pos.y === spot.y){
                creep.harvest(Game.getObjectById(creep.memory.sourceId));
                creep.giveWay();
                return;
            }
            if(path[0] === undefined){
                creep.moveTo(spot.x, spot.y);
            } else if(creep.pos.x === path[0].x && creep.pos.y === path[0].y){
                creep.memory.path.path.shift();
            }

            if(creep.moveByPath(path) === ERR_NOT_FOUND){
                if(!_.isEmpty(path)){
                    creep.moveTo(path[0].x, path[0].y, { visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            creep.giveWay();

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
