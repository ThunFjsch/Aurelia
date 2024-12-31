module.exports = {
    startMiner: {body: [WORK,WORK, MOVE], cost: 250},
    claimedMiner: {body: [WORK,WORK,WORK,WORK,WORK,MOVE], cost: 550},
    unclaimedMiner: {body: [WORK,WORK,WORK, MOVE], cost: 350},
    startBuilder: {body: [MOVE,WORK,CARRY,CARRY,CARRY], cost: 300},
    startUpgrader: {body: [MOVE,WORK,WORK,CARRY], cost: 300},
    startHauler: {body: [MOVE,CARRY], cost: 100}
};