module.exports = {
    createPathToSpot(fromPos, toPos, miningSpots, currentSpot) {
        var settings = require("settings");

        let allowedRooms = {
            [fromPos.roomName]: true,
        };

        PathFinder.use(true);
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
            
            for(let spot in miningSpots){
                spotPos = miningSpots[spot];
                if(currentSpot.x != spotPos.x && currentSpot.y != spotPos.y){
                    costs.set(spotPos.x, spotPos.y, 10);
                }
            }
            
            return costs;
            },
        });

        return ret;
        }

}