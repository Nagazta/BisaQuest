export const environmentCollisions = {
    // Quest 1 - Village Environment
    village: {
        // Houses
        houses: [
            { x: 9, y: 30, width: 15, height: 35, name: "Vicente's House" },
            { x: 33, y: 0, width: 15, height: 35, name: "Nando's House" },
            { x: 50, y: 54, width: 15, height: 25, name: "Bottom Right House" },
            { x: 6, y: 75, width: 17, height: 25, name: "Bottom left House" },
            { x: 75, y: 50, width: 17, height: 30, name: "Bottom right-right House" },

        ],

        // Natural obstacles
        obstacles: [
            // Trees
            { x: 38, y: 50, width: 9, height: 25, name: "Tree" },
            { x: 85, y: 45, width: 5, height: 6, name: "Bush" },

            // Well
            { x: 52, y: 15, width: 8, height: 13, name: "Well" },

            // Farm plots
            { x: 62, y: 30, width: 22, height: 15, name: "Farm Plot" },
        ],

        playerSize: 1, // Player hitbox size
        boundaries: { minX: 0, maxX: 95, minY: 0, maxY: 90 },
    },

    // Quest 2 - Forest Environment (Synonyms & Antonyms)
    forest: {
        houses: [
            // Add forest huts/buildings here
            { x: 20, y: 30, width: 12, height: 15, name: "Forest Hut" },
            { x: 65, y: 50, width: 12, height: 15, name: "Tree House" },
        ],

        obstacles: [
            // Dense trees
            { x: 15, y: 55, width: 8, height: 8, name: "Large Tree" },
            { x: 45, y: 40, width: 8, height: 8, name: "Large Tree" },
            { x: 75, y: 35, width: 8, height: 8, name: "Large Tree" },

            // Rocks
            { x: 30, y: 65, width: 6, height: 5, name: "Rock Formation" },
            { x: 55, y: 25, width: 6, height: 5, name: "Rock Formation" },

            // Pond
            { x: 40, y: 60, width: 15, height: 12, name: "Pond" },
        ],

        playerSize: 5,
        boundaries: { minX: 0, maxX: 95, minY: 0, maxY: 90 },
    },

    // Quest 3 - Castle Environment (Compound Words)
    castle: {
        houses: [
            // Castle walls and towers
            { x: 35, y: 20, width: 30, height: 35, name: "Main Castle" },
            { x: 15, y: 25, width: 12, height: 15, name: "Tower Left" },
            { x: 73, y: 25, width: 12, height: 15, name: "Tower Right" },
        ],

        obstacles: [
            // Statues
            { x: 28, y: 60, width: 5, height: 6, name: "Statue" },
            { x: 67, y: 60, width: 5, height: 6, name: "Statue" },

            // Garden features
            { x: 20, y: 70, width: 10, height: 8, name: "Garden" },
            { x: 70, y: 70, width: 10, height: 8, name: "Garden" },

            // Fountain
            { x: 45, y: 65, width: 10, height: 10, name: "Fountain" },
        ],

        playerSize: 5,
        boundaries: { minX: 0, maxX: 95, minY: 0, maxY: 90 },
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