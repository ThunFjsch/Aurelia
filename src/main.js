//require('prototype.spawn')();
var costumCreep = require('prototype.spawn');
var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleMiner = require('role.miner');
var roleMaintenance = require('role.maintenance');
var roleWallRepairer = require('role.wallRepairer');
var roleLongDistanceHarvester = require('role.longDistanceHarvester');
var roleTransporter = require('role.transport');
var roleClaimer = require('role.claimer');
//var structureTower = require('structure.tower');

const { forEach } = require('lodash');

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