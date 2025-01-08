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
                        delete miningSpots[spot];
                    }
                }
            }
        }
        miningSpots = miningSpots.filter(elm => elm);
        for(let i = 0; i < miningSpots.length; i++){
            if(miningSpots[i] != null && !_.isEmpty(miningSpots[i])){
                const assignee = Game.rooms[assignedSpawn].find(FIND_MY_SPAWNS)[0].pos;
                let to = new RoomPosition(miningSpots[i].x, miningSpots[i].y, source.room.name);
                let from = new RoomPosition(assignee.x, assignee.y, assignedSpawn);
                const generatedPath = createPathToMiningSpot(from, to, miningSpots, miningSpots[i]);
                
                miningSpots[i].isAssigned = false;
                miningSpots[i].path = generatedPath.path;
                miningSpots[i].pathCost = generatedPath.cost;
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
    },

    spawnMinerForSources: function(){
       if(Memory.sourceInfo != undefined){
            for(let index in Memory.sourceInfo.sources){
                const source = Memory.sourceInfo.sources[index]
                let roomName = source.room;
                const miners = _.map(Game.creeps, function(c){ if(c.memory.role === 'miner' && c.memory.target === roomName){return c}});
                let currentWorkParts = Game.rooms[roomName].getSpecificBodyPartCountForSource(miners, 'miner', WORK, source);
                
                let energyCapacity;
                if(source.reserved || source.owned){
                    energyCapacity = 3000;
                } else {energyCapacity = 1500;}
                const miningWorkParts = Math.ceil((energyCapacity / 300) / 2);
                
                let workersAssignToSource = 0;
                for(let i = 0; i < miners.length; i++){
                    if(miners[i] != undefined && miners[i].memory.sourceId === source.id){
                        workersAssignToSource++;
                    }
                }
                
               if(workersAssignToSource < source.miningSpots.length & currentWorkParts < miningWorkParts){
                    let energy = Game.rooms[source.assignedTo].energyAvailable;
                    let assignedPath;
                    let assignedSpot;
                    for(let spot in source.miningSpots){
                        if(source.miningSpots[spot].isAssigned){
                            const mineSpot = source.miningSpots[spot];
                            const assignedCreep = mineSpot.assignee;
                            if(Game.creeps[assignedCreep] === undefined){
                                source.miningSpots[spot].isAssigned = false;
                                delete source.miningSpots[spot].assignee;
                            }
                        }
                    }
                    for(let spot in source.miningSpots){
                        if(!source.miningSpots[spot].isAssigned){
                            const containers = Game.rooms[source.room].memory.containers;
                            for(let name in containers){
                                const container = Game.getObjectById(containers[name].id);
                                if(container != undefined && container.pos.x === source.miningSpots[spot].x && container.pos.y === source.miningSpots[spot].y){
                                    assignedPath = source.miningSpots[spot];
                                    assignedSpot = spot;
                                    break;      
                                }
                            }
                        }
                    }
                    if(assignedSpot === undefined){
                        for(let spot in source.miningSpots){
                                if(!source.miningSpots[spot].isAssigned){
                                    assignedPath = source.miningSpots[spot];
                                    assignedSpot = spot;
                                    break;      
                            }
                        }
                    }
                    if(assignedPath != undefined && source.room === Game.rooms[source.assignedTo].find(FIND_MY_SPAWNS)[0].room.name && source.owned){
                        const spawn = Game.rooms[source.assignedTo].find(FIND_MY_SPAWNS)[0];
                        const name =  spawn.generateName('miner');
                        let foo = spawn.spawnMiner(energy, source.id, this.name, miningWorkParts, 1, assignedPath, name);
                        if(foo === OK){
                            source.miningSpots[assignedSpot].isAssigned = true;
                            source.miningSpots[assignedSpot].assignee = name;
                        }
                    }
                }
            }
        }

    }
};

function createPathToMiningSpot(fromPos, toPos, miningSpots, currentSpot) {
  var settings = require("settings");

  let allowedRooms = {
    [fromPos.roomName]: true,
  };

  let route = Game.map.findRoute(fromPos.roomName, toPos.roomName, {
    routeCallback(roomName) {
      let parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(roomName);
      let isHighway = parsed[1] % 10 === 0 || parsed[2] % 10 === 0;

      if (isHighway) {
        return 1;
      } else if (settings.avoidedRooms.includes(roomName)) {
        return Infinity;
      } else {
        return 1.5;
      }
    },
  });

  // Didn't find a path!
  if (route == ERR_NO_PATH) {
    console.log(
      `Error finding path to ${toPos.roomName} from ${fromPos.roomName}`,
    );
    return;
  }

  route.forEach(function (info) {
    allowedRooms[info.room] = true;
  });

  // Invoke PathFinder, allowing access only to rooms from `findRoute`
  let ret = PathFinder.search(fromPos, toPos, {
    plainCost: 1,
    swampCost: 3,
    roomCallback(roomName) {
      if (allowedRooms[roomName] === undefined) {
        return false;
      }
      let room = Game.rooms[roomName];
      // In this example `room` will always exist, but since PathFinder
      // supports searches which span multiple rooms you should be careful!
      if (!room) return;

      let costs = new PathFinder.CostMatrix();

      room.find(FIND_STRUCTURES).forEach(function (structure) {
        if (structure.structureType === STRUCTURE_ROAD) {
          // Favor roads over plain tiles
          costs.set(structure.pos.x, structure.pos.y, 1);
        } else if (
          structure.structureType !== STRUCTURE_CONTAINER &&
          (structure.structureType !== STRUCTURE_RAMPART || !structure.my)
        ) {
          // Can't walk through non-walkable buildings
          costs.set(structure.pos.x, structure.pos.y, 0xff);
        }
      });
      
      room.find(FIND_CONSTRUCTION_SITES).forEach(function (structure) {
        if (structure.structureType === STRUCTURE_ROAD) {
          // Favor roads over plain tiles
          costs.set(structure.pos.x, structure.pos.y, 1);
        } else if (
          structure.structureType !== STRUCTURE_CONTAINER &&
          (structure.structureType !== STRUCTURE_RAMPART || !structure.my)
        ) {
          // Can't walk through non-walkable buildings
          costs.set(structure.pos.x, structure.pos.y, 0xff);
        }
      });
      
      for(let spot in miningSpots){
        spotPos = miningSpots[spot];
        if(currentSpot.x != spotPos.x && currentSpot.y != spotPos.y){
            costs.set(spotPos.x, spotPos.y, 0xff);
        }
      }
      
      return costs;
    },
  });

  return ret;
}
