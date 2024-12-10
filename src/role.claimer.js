module.exports = {
    // TODO: Clean up this mess and make it usuable for fighter or do something similar. 
    // a function to run the logic for this role
    run: function(creep) {
            console.log(creep.name)
            
        // if in target room
        if (creep.room.name != creep.memory.target) {
            // find exit to target room
            var exit = creep.room.findExitTo(creep.memory.target);
            // move to exit
            creep.moveTo(creep.pos.findClosestByRange(exit));
        }
        else {
            let roomController =  creep.room.controller;
            const temp = creep.room.lookForAtArea(LOOK_TERRAIN,roomController.pos.y-1,roomController.pos.x-1,roomController.pos.y+1,roomController.pos.x+1,true)
            let foo = _.map(temp, function(t){ if(t.terrain != 'wall') return t});
            let claimerSpot;
            for(let i = 0; i < foo.length; i++){
                if(foo[i] != undefined){
                    
                    claimerSpot = foo[i]
                }
            }

            new RoomVisual(creep.room.name).line(claimerSpot.x, claimerSpot.y, creep.pos.x, creep.pos.y)
            //JSON.stringify(new RoomPosition(23, 4, 'E47S3').findPathTo(11, 13), null, 2)
            if (creep.claimController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(claimerSpot.x, claimerSpot.y,  {visualizePathStyle: {stroke: '#ffaa00'}, ignoreDestructibleStructures: false, maxOps: 10000});
            }
            creep.signController(creep.room.controller, 'Bob Bobbington')
        }
    }
};