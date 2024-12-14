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
        
        for(let i = 0; i < miningSpots.length; i++){
            if(miningSpots[i] != null){
                
            const assignee = Game.rooms[assignedSpawn].find(FIND_MY_SPAWNS)[0].pos;
            const sourcePos = source.pos;
            let from = new RoomPosition(miningSpots[i].x, miningSpots[i].y, source.room.name);
                    let to = new RoomPosition(assignee.x, assignee.y, assignedSpawn)
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
                    miningSpots[i].isAssigned = false;
                    miningSpots[i].path = ret.path;
            } else{
                delete miningSpots[i];
            }
        }
        let reserve;
        if( Game.rooms[source.room.name].controller.reservation != undefined ||
            Game.rooms[source.room.name].controller.owner != undefined){
            
            reserve = true;
        } else { reserve = false;}
        
        
        let newSource = {
            id: source.id,
            assignedTo: assignedSpawn,
            construction: false,
            reserved: reserve,
            miningSpots: miningSpots
        };
        
        Memory.sourceInfo.sources.push(newSource);
        console.log(Memory.sourceInfo.sources);
        //console.log(JSON.stringify(newSource, null, 2))
    }
    
    
};