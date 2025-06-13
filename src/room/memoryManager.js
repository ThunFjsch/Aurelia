import {Pathing} from '../utils/pathing';

export class MemoryManager{
    init(room){
        this.initContainer(room);
        this.initUpgraderSpots(room);
    };

    update(room){
        this.updateContainer(room);
        this.updateUpgraderSpots(room);
    };

    initContainer(room){
        const containers = room.find(FIND_STRUCTURES, {
            filter: (s) => s.structureType === STRUCTURE_CONTAINER
        });
        if(_.isEmpty(containers) === true){
            return;
        }

        let containerMem = [];

        for(let name in containers){
            const container = containers[name];
            let containerType;
            let sourrindingSpots = container.room.lookAtArea(
                container.pos.y - 1,
                container.pos.x - 1,
                container.pos.y + 1,
                container.pos.x + 1,
                true
            );
            for(let i = 0; i < sourrindingSpots.length; i++){
                let spot = sourrindingSpots[i];
                let center = {x: -1, y: -1};
                if(room.memory.upgraderInfo != undefined){
                    center = room.memory.upgraderInfo.center;

                }
                if(spot.type === undefined || spot.type === null || spot === null){
                    continue;
                }
                if(spot.type === 'structure'){

                    const structure = Game.getObjectById(spot.structure.id);
                    if(structure.structureType === STRUCTURE_EXTENSION){
                        containerType = 'filler';
                    } else if(center.x === container.pos.x && center.y  === container.pos.y){
                        containerType = 'upgrade';
                    } else if(container.pos.findInRange(FIND_SOURCES, 1) != undefined){
                        containerType = 'dropper';
                    }
                }
            }
            if(containerType === undefined){
                continue;
            }
            let memory = {
                id: container.id,
                type: containerType,
                pos: container.pos
            }
            containerMem.push(memory);
            room.memory.containers = containerMem;
        }
    };

    updateContainer(room){
        const currentContainers = room.memory.containers;
        for(let name in currentContainers){
            const container = currentContainers[name];
            if(Game.getObjectById(container.id) === undefined){
                delete room.memory.containers[name];
            }
        }
        this.initContainer(room);
    };

    initUpgraderSpots(room){
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
                const pathUtil = new Pathing();
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
    };
    updateUpgraderSpots(room){
        if(room.memory.upgraderInfo === undefined){
            delete room.memory.upgraderInfo;
            this.initUpgraderSpots(room);
        }
    }
}
