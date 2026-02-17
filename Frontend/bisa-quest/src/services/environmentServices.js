// services/environmentServices.js
const BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

export const environmentApi = {

  initializeEnvironment: async (environmentType, studentId) => {
    try {
      const response = await fetch(`${BASE_URL}/environment/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, envType: environmentType }),
      });
      return await response.json();
    } catch (err) {
      console.error('Fetch error in initializeEnvironment:', err);
      throw err;
    }
  },

  logNPCInteraction: async ({ studentId, npcName }) => {
    try {
      const response = await fetch(`${BASE_URL}/npc/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, npcName }),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data;
    } catch (err) {
      console.error('Error logging NPC interaction:', err);
      throw err;
    }
  },

  startNPCInteraction: async ({ npcId, challengeType, studentId }) => {
    try {
      const response = await fetch(`${BASE_URL}/npc/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ npcId, challengeType, studentId }),
      });
      return await response.json();
    } catch (err) {
      console.error('Error starting NPC interaction:', err);
      throw err;
    }
  },
};