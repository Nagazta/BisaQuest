export const environmentCollisions = {
    // Quest 1 - Village Environment
    village: {
        // Houses
        houses: [
            { x: 5, y: 25, width: 15, height: 35, name: "Vicente's House" },
            { x: 33, y: 0, width: 15, height: 35, name: "Nando's House" },
            { x: 50, y: 54, width: 15, height: 25, name: "Bottom Right House" },
            { x: 2, y: 75, width: 17, height: 25, name: "Market Stall" },
            { x: 81, y: 50, width: 17, height: 30, name: "Bottom right-right House" },

        ],

        // Natural obstacles
        obstacles: [
            // Trees
            { x: 38, y: 52, width: 9, height: 23, name: "Tree" },
            { x: 85, y: 45, width: 5, height: 6, name: "Bush" },

            // Well
            { x: 54, y: 15, width: 8, height: 13, name: "Well" },

            // Farm plots
            { x: 69, y: 30, width: 22, height: 15, name: "Farm Plot" },
        ],

        playerSize: 1, // Player hitbox size
        boundaries: { minX: 0, maxX: 95, minY: 0, maxY: 90 },
    },

    // Quest 2 - Forest Environment (Synonyms & Antonyms)
    forest: {
        houses: [
            // Add forest huts/buildings here
            { x: 4, y: 12, width: 18, height: 34, name: "Pond" },
            { x: 70, y: 53, width: 8, height: 12, name: "Rock" },
        ],

        obstacles: [
            // Dense trees
            { x: 17, y: 65, width: 13, height: 20, name: "Large Tree" },
            { x: 45, y: 40, width: 8, height: 8, name: "Large Tree" },
            { x: 77, y: 32, width: 15, height: 12, name: "Cart" },

            // Rocks
            { x: 30, y: 65, width: 6, height: 20, name: "Tree" },
            { x: 55, y: 25, width: 6, height: 5, name: "Rock Formation" },


        ],

        playerSize: 5,
        boundaries: { minX: 0, maxX: 90, minY: 0, maxY: 85 },
    },

    // Quest 3 - Castle Environment (Compound Words)
    castle: {
        houses: [
            // Castle building — top-left corner of the map
            { x: 10, y: 0, width: 24, height: 50, name: "Castle Building" },
        ],

        obstacles: [
            // Trees — bottom-left
            { x: 4, y: 72, width: 14, height: 18, name: "Trees Left" },
            // Trees — bottom-right
            { x: 82, y: 65, width: 14, height: 22, name: "Trees Right" },
        ],

        playerSize: 5,
        boundaries: { minX: 5, maxX: 92, minY: 5, maxY: 88 },
    },

    // Quest 4 - Kingdom Environment (Narrative/Problem Solving)
    kingdom: {
        houses: [
            // Shops and buildings
            { x: 15, y: 35, width: 15, height: 18, name: "Market" },
            { x: 50, y: 25, width: 15, height: 18, name: "Town Hall" },
            { x: 75, y: 45, width: 15, height: 18, name: "Library" },
        ],

        obstacles: [
            // Market stalls
            { x: 25, y: 60, width: 8, height: 6, name: "Market Stall" },
            { x: 40, y: 60, width: 8, height: 6, name: "Market Stall" },

            // Trees and decorations
            { x: 65, y: 35, width: 6, height: 8, name: "Tree" },
            { x: 85, y: 55, width: 6, height: 8, name: "Tree" },

            // Plaza fountain
            { x: 48, y: 55, width: 12, height: 12, name: "Plaza Fountain" },
        ],

        playerSize: 5,
        boundaries: { minX: 0, maxX: 95, minY: 0, maxY: 90 },
    },
};

// Helper function to get all collision zones for an environment
export const getCollisionZones = (environmentType) => {
    const env = environmentCollisions[environmentType];
    if (!env) {
        console.warn(`No collision data for environment: ${environmentType}`);
        return { zones: [], playerSize: 5, boundaries: { minX: 0, maxX: 95, minY: 0, maxY: 90 } };
    }

    // Combine houses and obstacles into one array
    const zones = [...env.houses, ...env.obstacles];

    return {
        zones,
        playerSize: env.playerSize,
        boundaries: env.boundaries,
    };
};

// Helper function to check if position collides with any zone
export const checkCollisionWithZones = (x, y, zones, playerSize, boundaries) => {
    // Check boundaries
    if (
        x < boundaries.minX ||
        x > boundaries.maxX ||
        y < boundaries.minY ||
        y > boundaries.maxY
    ) {
        return true;
    }

    // Check each collision zone
    for (const zone of zones) {
        if (
            x < zone.x + zone.width &&
            x + playerSize > zone.x &&
            y < zone.y + zone.height &&
            y + playerSize > zone.y
        ) {
            return true;
        }
    }

    return false;
};

export default environmentCollisions;