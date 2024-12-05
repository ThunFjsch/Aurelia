Room.prototype.remoteMining = function(){
    if(this.memory.remoteMining === undefined){
        const sources = this.find(FIND_SOURCES);
        this.memory.remoteMining = {
            isMined: false,
            sourceAmmount: sources.length,
            sources: sources
        }
        
        // Gets the available mining Spots
        for(let i = 0; i < this.memory.remoteMining.sources.length; i++){
            let resource = this.memory.remoteMining.sources[i];
            const temp = this.lookForAtArea(LOOK_TERRAIN,resource.pos.y-1,resource.pos.x-1,resource.pos.y+1,resource.pos.x+1,true)
            let foo = _.map(temp, function(t){ return t.terrain != 'wall'});
            
            let miningSpots = 0;
            for(let i = 0; i < foo.length; i++){
                if(foo[i]){
                    miningSpots++;
                }
            }
            console.log(miningSpots)
            this.memory.remoteMining.sources[i].avialableSpots = miningSpots;
        }
    } else if(this.memory.remoteMining.isMined === true && this.memory.remoteMining.assignedToo === undefined){
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
                
                for(let name in remoteMine.memory.remoteMining.sources){
                    const sourcePos = remoteMine.memory.remoteMining.sources[name].pos;
                    
                    let from = new RoomPosition(spawnPos.x, spawnPos.y, spawnRoom);
                    let to = new RoomPosition(sourcePos.x, sourcePos.y, remoteMine.name.toString())
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
                    routeCost += ret.cost;
                    remoteMine.memory.remoteMining.sources[name].pathCost = ret.cost;
                }
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
            this.memory.remoteMining.assignedToo = assignee.toString();
        }
    } else if(this.memory.remoteMining.assignedToo != undefined){
        console.log('foo')
        const miningWorkParts = Math.floor((this.memory.remoteMining.sources[0].energyCapacity / 300) / 2);
        const miners = this.find(FIND_MY_CREEPS, {
            filter: (c) => c.memory.role = 'miner'
        });
        for(let i = 0; i < this.memory.remoteMining.sources.length; i++){
            workPartAmount = getSpecificBodyPartCountForSource(miners, 'miner', WORK, source);
            console.log('remote try to spawn miner');
            Game.rooms[this.memory.remoteMining.assignedToo].find(FIND_MY_SPAWNS)[0].spawnMiner(
                this.memory.remoteMining.sources, 
                workPartAmount, 
                this.name, 
                miners,
                Math.floor(source.pathCost / 5));
        }
    }
}