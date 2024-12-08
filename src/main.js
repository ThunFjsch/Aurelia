require('prototype.room');
require('prototype.spawn');
require('prototype.tower');
require('prototype.creep');
const profiler = require('screeps-profiler');

// This line monkey patches the global prototypes
profiler.enable();
module.exports.loop = function () {
    profiler.wrap(function() {
        // Executes the screep logic first
        for (let creep in Memory.creeps) {
            // and checking if the creep is still alive
            if (Game.creeps[creep] == undefined) {
                // if not, delete the memory entry
                delete Memory.creeps[creep];
            }
        }

        // find all towers
        var towers = _.filter(Game.structures, s => s.structureType == STRUCTURE_TOWER);
        // for each tower
        for (let tower of towers) {
            // run tower logic
            tower.defend();
        }
        
        for(let room in Memory.rooms){
            if(Game.rooms[room] != undefined){
                Game.rooms[room].roomManager();
            }
        }
        
        for (let spawnName in Game.spawns) {
            // run spawn logic
            Game.spawns[spawnName].spawnCreepWhenNeeded();
        }
    
        for (let name in Game.creeps) {
            // run creep logic
            Game.creeps[name].runRole();
        }
    });
}