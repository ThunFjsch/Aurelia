
const creepBodies = require('creep.body');

module.exports = {
    theoNetIndome: function(){
         if(Memory.sourceInfo != undefined){
            let sourceIncomesTheo = [];
            for(let i = 0; i < Memory.sourceInfo.sources.length; i++){
                const source = Memory.sourceInfo.sources[i];
                if(source.assignedTo != undefined){
                    const pathCost = source.miningSpots[0].pathCost;
                    let minerBody = creepBodies.unclaimedMiner;
                    
                    if(Game.rooms[source.room].controller.level < 3){
                        minerBody = creepBodies.startMiner;
                    }
                    let EperTick = 5;
                    if(source.reserved){
                        EperTick = 10;
                        minerBody = creepBodies.claimedMiner;
                    } else if(source.owned){
                        EperTick = 10;
                        minerBody = creepBodies.claimedMiner;
                    }
                    const roi = minerBody.cost / EperTick;
                    // TODO: TravelTime doesen't account for fatige.
                    const travelTime = CREEP_LIFE_TIME - pathCost; 
                    const minerCost = roi / travelTime;
                    
                    const neededCarry = EperTick * 22 * pathCost / CARRY_CAPACITY;
                    const haulerCost = neededCarry * pathCost / CREEP_LIFE_TIME;

                    // TODO: Add container Upkeep and when needed Claimer Cost
                    const netIncome = Math.floor(EperTick - minerCost - haulerCost);

                    const SourceEco = {
                        net: netIncome,
                        carryParts: neededCarry,
                        room: source.room,
                        id: source.id
                    }
                    sourceIncomesTheo.push(SourceEco);
                }
            }
            Memory.sourceEco = sourceIncomesTheo;
        } else{
            Memory.sourceEco = [];
        }
    }
}