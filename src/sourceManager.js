/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('sourceManager');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
    init: function() {
        if(Memory.sourceInfo === undefined){
            Memory.sourceInfo = {
                sources: []
            };
            for(let index in Game.spawns){
                let source = Game.spawns[index].room.find(FIND_SOURCES);
                for(let name in source){
                    module.exports.addSource(source[name]);
                }
            }
        }
    },

    addSource: function(source){
        let assignedSpawn;
        let availableSpawns = [];
        let availableSpawnsPathCost = [];
        for(let index in Game.spawns){
            availableSpawns.push(Game.spawns[index].room.name);
        }
        
        if(!_.isEmpty(availableSpawns)){
            for(let i = 0; i < availableSpawns.length; i++){
                const spawnRoom = availableSpawns[i];
                const spawnPos = Game.rooms[spawnRoom].find(FIND_MY_SPAWNS)[0].pos;
                const remoteMine = Game.rooms[this.name];
                const route = Game.map.findRoute(spawnRoom, remoteMine);
                let routeCost = 0;
                
                
                    const sourcePos = source.pos;
                    
                    let from = new RoomPosition(spawnPos.x, spawnPos.y, spawnRoom);
                    let to = new RoomPosition(sourcePos.x, sourcePos.y, source.room.name)
                    // Use `findRoute` to calculate a high-level plan for this path,
                    // prioritizing highways and owned rooms
                    let allowedRooms = { [ from.roomName ]: true };
                    Game.map.findRoute(from.roomName, to.roomName, {
                        routeCallback(roomName) {
                            let parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(roomName);
                            let isHighway = (parsed[1] % 10 === 0) || 
                                            (parsed[2] % 10 === 0);
                            let isMyRoom = Game.rooms[roomName] &&
                                Game.rooms[roomName].controller &&
                                Game.rooms[roomName].controller.my;
                            if (isHighway || isMyRoom) {
                                return 1;
                            } else {
                                return 2.5;
                            }
                        }
                    }).forEach(function(info) {
                        allowedRooms[info.room] = true;
                    });
                    
                    // Invoke PathFinder, allowing access only to rooms from `findRoute`
                    let ret = PathFinder.search(from, to, {
                        roomCallback(roomName) {
                            if (allowedRooms[roomName] === undefined) {
                                return false;
                            }
                        }
                    });
                    routeCost = ret.cost;
                
                availableSpawnsPathCost.push({target: spawnRoom, pathCost: routeCost})
            }
    

            let assignee = '';
            let lowestCost = 1000;
            for(let i = 0; i < availableSpawnsPathCost.length; i++){
                if(availableSpawnsPathCost[i].pathCost < lowestCost){
                    lowestCost = availableSpawnsPathCost[i].pathCost;
                    assignee = availableSpawnsPathCost[i].target;
                }
            }
            assignedSpawn = assignee.toString();
        }
        
        const temp = source.room.lookForAtArea(LOOK_TERRAIN,source.pos.y-1,source.pos.x-1,source.pos.y+1,source.pos.x+1,true)
        let miningSpots = _.map(temp, function(t){ if(t.terrain != 'wall'){return t}});
        miningSpots = miningSpots.filter(elm => elm);
        for(let spot in miningSpots){
            let hasStructure = source.room.lookAt(miningSpots[spot].x, miningSpots[spot].y);
            if(hasStructure != undefined){
                for(let struc in hasStructure){
                    
                    if(hasStructure[struc].structure != undefined && hasStructure[struc].structure.structureType != 'container' && hasStructure[struc].structure.structureType != 'road'){
                        console.log(hasStructure[struc].structure.structureType)
                        delete miningSpots[spot];
                        console.log(miningSpots[spot])
                    }
                }
            }
        }
        miningSpots = miningSpots.filter(elm => elm);
        for(let i = 0; i < miningSpots.length; i++){
            if(miningSpots[i] != null && !_.isEmpty(miningSpots[i])){
                
            const assignee = Game.rooms[assignedSpawn].find(FIND_MY_SPAWNS)[0].pos;
            const sourcePos = source.pos;
            let to = new RoomPosition(miningSpots[i].x, miningSpots[i].y, source.room.name);
                    let from = new RoomPosition(assignee.x + 1, assignee.y, assignedSpawn)
                    // Use `findRoute` to calculate a high-level plan for this path,
                    // prioritizing highways and owned rooms
                    let allowedRooms = { [ from.roomName ]: true };
                    Game.map.findRoute(from.roomName, to.roomName, {
                        routeCallback(roomName) {
                            let parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(roomName);
                            let isHighway = (parsed[1] % 10 === 0) || 
                                            (parsed[2] % 10 === 0);
                            let isMyRoom = Game.rooms[roomName] &&
                                Game.rooms[roomName].controller &&
                                Game.rooms[roomName].controller.my;
                                
                            roomName.find(FIND_STRUCTURES).forEach(function(struct) {
                              if (struct.structureType === STRUCTURE_ROAD) {
                                // Favor roads over plain tiles
                                costs.set(struct.pos.x, struct.pos.y, 1);
                              } else if (struct.structureType !== STRUCTURE_CONTAINER &&
                                         (struct.structureType !== STRUCTURE_RAMPART)) {
                                // Can't walk through non-walkable buildings
                                costs.set(struct.pos.x, struct.pos.y, 255);
                              }
                            });
                            if (isHighway || isMyRoom) {
                                return 1;
                            } else {
                                return 2.5;
                            }
                        }
                    }).forEach(function(info) {
                        allowedRooms[info.room] = true;
                    });
                    
                    // Invoke PathFinder, allowing access only to rooms from `findRoute`
                    let ret = PathFinder.search(from, to, {
                        roomCallback(roomName) {
                            if (allowedRooms[roomName] === undefined) {
                                return false;
                            }
                        }
                    });
                    miningSpots[i].isAssigned = false;
                    miningSpots[i].path = ret.path;
                    miningSpots[i].pathCost = ret.cost;
            }
        }
        let reserve;
        let isOwned;
        if( Game.rooms[source.room.name].controller.reservation != undefined){
            
            reserve = true;
        } else { reserve = false;}
        
        if(Game.rooms[source.room.name].controller.owner != undefined){
            isOwned = true;
        } else{isOwned = false}
        
        let newSource = {
            id: source.id,
            assignedTo: assignedSpawn,
            construction: false,
            reserved: reserve,
            owned: isOwned,
            pos: source.pos,
            room: source.room.name,
            miningSpots: miningSpots
        };
        
        Memory.sourceInfo.sources.push(newSource);
    }
    
    
};