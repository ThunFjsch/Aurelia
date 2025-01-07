module.exports = {
   visualiseUpgraderSpots: function(roomName){
        const room = Game.rooms[roomName];
        if(room.memory != undefined && room.memory.upgraderInfo != undefined){
            let centerSpot = room.memory.upgraderInfo;
            new RoomVisual(room.name).text('1', centerSpot.center.x, centerSpot.center.y);
            new RoomVisual(room.name).rect(centerSpot.center.x - 1.5, centerSpot.center.y - 1.7, 3, 3, {fill: 'transparent', opaity: 1, stroke: '#FFFF00'})
        }
    }
}