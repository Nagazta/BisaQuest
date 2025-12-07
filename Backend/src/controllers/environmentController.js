import { supabase } from "../config/supabaseClient.js";

export const initializeEnvironment = async (req, res) => {
  try {
    const { envType } = req.body;
    // Try to get from token first, fallback to body
    const studentId = req.user?.student_id || req.body.studentId;

    if (!studentId || !envType) {
      return res.status(400).json({
        success: false,
        error: "Missing studentId or envType"
      });
    }

    console.log("Initialize environment:", { studentId, envType });

    const { data: studentData, error: studentError } = await supabase
      .from("student")
      .select("*")
      .eq("student_id", studentId)
      .single();

    if (studentError || !studentData) {
      return res.status(400).json({
        success: false,
        error: `Student not found`,
      });
    }

    const insertPayload = {
      student_id: studentId,
      is_first_visit: true,
      unlocked_areas: []
    };

    const { data, error } = await supabase
      .from("environment_state")
      .insert([insertPayload])
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: "Environment initialized",
      session: data,
    });
  } catch (err) {
    console.error("Error initializing environment:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const logInstructionEntry = async (req, res) => {
  try {
    const { firstTime } = req.body;
    const studentId = req.user.student_id; // Get from token

    if (!studentId) {
      return res.status(400).json({ success: false, error: "Missing studentId" });
    }

    console.log("Logging instruction entry for student:", studentId);

    const { data, error } = await supabase
      .from("instruction_log")
      .insert([
        {
          student_id: studentId,
          first_time: firstTime ?? true,
        }
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase error inserting instruction_log:", error);
      throw error;
    }

    console.log("Instruction entry logged:", data);

    res.json({
      success: true,
      message: "Instruction entry logged",
      entry: data,
    });
  } catch (err) {
    console.error("Error in logInstructionEntry:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const logNPCInteraction = async (req, res) => {
  try {
    const { npcName } = req.body;
    const studentId = req.user.student_id; // Get from token

    if (!npcName) {
      return res.status(400).json({ success: false, error: "Missing npcName" });
    }

    console.log("Logging NPC interaction:", { studentId, npcName });

    const { data: studentData, error: studentError } = await supabase
      .from("student")
      .select("*")
      .eq("student_id", studentId)
      .single();

    if (studentError || !studentData) {
      return res.status(400).json({ 
        success: false, 
        error: `Student not found` 
      });
    }

    const { data, error } = await supabase
      .from("instruction_log")
      .insert([
        {
          student_id: studentId,
          npc_name: npcName,
          first_time: true,
        }
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      throw error;
    }

    console.log("NPC interaction logged:", data);

    return res.json({ 
      success: true, 
      message: "NPC interaction logged", 
      entry: data 
    });
  } catch (err) {
    console.error("Error in logNPCInteraction:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};