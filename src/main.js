
import './room/room';
import './structure.spawn';
import './defence/structure.tower';
import './creeps/prototype.creep';
import './utils/giveWay';
import './utils/stuckRepath';
import {sourceManager} from './economy/sourceManager';
import profiler from './utils/screeps-profiler';
import {Economy} from './economy/ecoCalculator';


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

        const SourceManager = new sourceManager();
        if(Memory.sourceInfo === undefined){
            SourceManager.init();
        } else{
            SourceManager.spawnMinerForSources();
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

        if(Game.time % 32){
            const eco = new Economy();
            eco.theoNetIndome();
        }

        //currently displays some eco info. Will be handled better
        if(Memory.sourceEco != undefined){
            let totalNetincome = 0;
            let totalCarry = 0;
            for(let i = 0; i < Memory.sourceEco.length; i++){
                const info = Memory.sourceEco[i];
                totalNetincome += info.net;
                totalCarry += info.carryParts;
                new RoomVisual(info.room).text(`Room: ${info.room} | Netincome: ${info.net} | CarryParts: ${info.carryParts}`, 10, 15 + i, {color: 'green', font: 0.8});
            }
          //  console.log('total net income: ' + totalNetincome);
        //    console.log('total carry: ' + totalCarry);
        }
    });
}
