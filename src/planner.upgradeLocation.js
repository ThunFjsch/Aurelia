const pathUtil = require('util.path');

module.exports = {
    createUpgradeLocations: function(roomName){
        const room = Game.rooms[roomName];
        const controller = room.controller;
        let controllerSpots = room.lookAtArea(controller.pos.y - 3, controller.pos.x - 3, controller.pos.y + 3, controller.pos.x + 3, true);
        controllerSpots = _.map(controllerSpots, function(spot) {if(spot.type === 'terrain' && (spot.terrain === TERRAIN_MASK_SWAMP || spot.terrain === "plain")){return spot}});
        controllerSpots = controllerSpots.filter(elm => elm);
        let centerSpot = {};
        let highestNeighbour = 0;
        // finds a center location TODO: find the best center location regarding to spawn
        for(let i = 0; i < controllerSpots.length;i++){
            let spot = controllerSpots[i];
            let spotsOfSpots = room.lookAtArea(spot.y -1, spot.x - 1, spot.y + 1, spot.x + 1, true);
            spotsOfSpots = _.map(spotsOfSpots, function(spot) {
                if(spot.type === 'terrain' && 
                    (spot.x <= controller.pos.x + 3 && spot.x >= controller.pos.x -3) &&
                    (spot.y <= controller.pos.y + 3 && spot.y >= controller.pos.y -3) && 
                    (spot.terrain === "plain" || spot.terrain === 'swamp')
                ) {return spot}});
            spotsOfSpots = spotsOfSpots.filter(elm => elm);
            if(highestNeighbour < spotsOfSpots.length){
                centerSpot = spot;
                highestNeighbour = spotsOfSpots.length;
            }
            
        }
        
        let upgraderSpots = room.lookAtArea(centerSpot.y - 1, centerSpot.x - 1, centerSpot.y + 1, centerSpot.x + 1, true);
        upgraderSpots = _.map(upgraderSpots, function(spot) {if(spot.type === 'terrain' && (spot.terrain === TERRAIN_MASK_SWAMP || spot.terrain === "plain")){return spot}});
        upgraderSpots = upgraderSpots.filter(elm => elm);
        const assignedSpawn = room.find(FIND_MY_SPAWNS)[0];
        for(let i = 0; i < upgraderSpots.length; i++){
            if(upgraderSpots[i] != null && !_.isEmpty(upgraderSpots[i])){
                const assignee = room.find(FIND_MY_SPAWNS)[0].pos;
                let to = new RoomPosition(upgraderSpots[i].x, upgraderSpots[i].y, room.name);
                let from = new RoomPosition(assignee.x, assignee.y, room.name);
                const generatedPath = pathUtil.createPathToSpot(from, to, upgraderSpots, upgraderSpots[i]);
                
                upgraderSpots[i].isAssigned = false;
                upgraderSpots[i].path = generatedPath.path;
                upgraderSpots[i].pathCost = generatedPath.cost;
            }
        }

        const upgraderInfo = {
            spots: upgraderSpots,
            center: centerSpot
        }
        
        room.memory.upgraderInfo = upgraderInfo;
    },
    visualiseUpgraderSpots: function(roomName){
        const room = Game.rooms[roomName];
        if(room.memory != undefined && room.memory.upgraderInfo != undefined){
            let centerSpot = room.memory.upgraderInfo;
            new RoomVisual(room.name).text('1', centerSpot.center.x, centerSpot.center.y);
            new RoomVisual(room.name).rect(centerSpot.center.x - 1.5, centerSpot.center.y - 1.7, 3, 3, {fill: 'transparent', opaity: 1, stroke: '#FFFF00'})
        }
    }
}