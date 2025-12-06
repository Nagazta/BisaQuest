const BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

export const environmentApi = {
  initializeEnvironment: async (environmentType, studentId) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${BASE_URL}/environment/initialize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ studentId, envType: environmentType }),
      });

      return await response.json();
    } catch (err) {
      console.error("Fetch error in initializeEnvironment:", err);
      throw err;
    }
  },

  // Log NPC entry
  logNPCInteraction: async ({ studentId, npcName }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${BASE_URL}/npc/log`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ studentId, npcName })
      });

      const data = await response.json();
      console.log("Frontend: Response from logNPCInteraction:", data);

      if (!data.success) throw new Error(data.error);
      return data;
    } catch (err) {
      console.error("Frontend: Error logging NPC interaction:", err);
      throw err;
    }
  },

  // Start interaction
  startNPCInteraction: async ({ npcId, challengeType }) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${BASE_URL}/npc/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ npcId, challengeType })
      });

      return await response.json();
    } catch (err) {
      console.error("Error starting NPC interaction:", err);
      throw err;
    }
  }
};
