export class Upgrader {
    constructor(){}
    /** @param {Creep} creep **/
    run(creep) {
        if(creep.memory.spot != undefined){
            const path = creep.memory.spot.path.path;
            const spot = creep.memory.spot.path;
            const center = creep.room.memory.upgraderInfo.center;
            if(creep.memory.storage === undefined){
                let centerTile = creep.room.lookAt(center.x, center.y)
                if(!_.isEmpty(centerTile)){
                    for(let name in centerTile){
                        if(centerTile[name].type === 'structure'){
                            if(centerTile[name].structure.structureType === 'container'){
                                creep.memory.storage = centerTile[name].structure.id;
                            }
                        }
                    }
                }
            }

            if(creep.pos.x === spot.x && creep.pos.y === spot.y){
                if(creep.memory.storage != undefined){
                    creep.withdraw(Game.getObjectById(creep.memory.storage), RESOURCE_ENERGY);
                }
                creep.upgradeController(creep.room.controller);
                creep.giveWay();
                return;
            }
            if(path[0] === undefined){
                creep.moveTo(spot.x, spot.y);
            } else if(creep.pos.x === path[0].x && creep.pos.y === path[0].y){
                creep.memory.spot.path.path.shift();
            }

            if(creep.moveByPath(path) === ERR_NOT_FOUND){
                if(!_.isEmpty(path)){
                    creep.moveTo(path[0].x, path[0].y, { visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            creep.giveWay();
        } else {
            if(creep.upgradeController(creep.room.controller) != OK){
                creep.moveTo(creep.room.controller.pos, {range: 3})
            }
        }
	}
};
