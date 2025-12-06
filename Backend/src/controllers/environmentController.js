import { supabase } from "../config/supabaseClient.js";
import { v4 as uuidv4 } from "uuid";

export const initializeEnvironment = async (req, res) => {
  try {
    const { studentId, envType } = req.body;
    if (!envType) {
      return res.status(400).json({
        success: false,
        error: "Missing envType"
      });
    }


    console.log("Received initialize request:", { studentId, envType });

    // 1️⃣ Check if the student exists
    const { data: studentData, error: studentError } = await supabase
      .from("student")
      .select("*")
      .eq("student_id", studentId)
      .single();

    console.log("Student lookup result:", { studentData, studentError });

    if (studentError || !studentData) {
      return res.status(400).json({
        success: false,
        error: `Student with ID ${studentId} does not exist.`,
      });
    }

    // 2️⃣ Log the type of studentId and envType
    console.log("Payload types:", {
      studentIdType: typeof studentId,
      envTypeType: typeof envType,
    });

    // 3️⃣ Attempt insert into environment_state
    const insertPayload = {
      student_id: studentData.user_id,
      is_first_visit: true,
      unlocked_areas: []
    };


    console.log("Insert payload:", insertPayload);

    const { data, error } = await supabase
      .from("environment_state")
      .insert([insertPayload])
      .select()
      .single();

    if (error) {
      console.error("Insert error:", error);
      throw error;
    }

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


/**
 * Log student entering instructions.
 * Creates a new row in instruction_log.
 */
export const logInstructionEntry = async (req, res) => {
  try {
    const { studentId, firstTime } = req.body;

    if (!studentId) {
      return res.status(400).json({ success: false, error: "Missing studentId" });
    }

    console.log("Logging instruction entry for student:", studentId);

    const { data, error } = await supabase
      .from("instruction_log")
      .insert([
        {
          student_id: studentId,
          first_time: firstTime ?? true, // default to true
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
    const { studentId, npcName } = req.body;

    if (!studentId || !npcName) {
      return res.status(400).json({ success: false, error: "Missing studentId or npcName" });
    }

    console.log("Backend: Logging NPC interaction for student:", studentId, "NPC:", npcName);

    // ✅ Check if student exists
    const { data: studentData, error: studentError } = await supabase
      .from("student")
      .select("*")
      .eq("student_id", studentId)
      .single();

    if (studentError || !studentData) {
      console.error("Student not found:", studentError);
      return res.status(400).json({ success: false, error: `Student with ID ${studentId} does not exist` });
    }

    // ✅ Insert into instruction_log
    const { data, error } = await supabase
      .from("instruction_log")
      .insert([
        {
          student_id: studentData.user_id,
          npc_name: npcName,
          first_time: true,
        }
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(500).json({ success: false, error: error.message });
    }

    console.log("Backend: NPC interaction logged successfully:", data);

    return res.json({ success: true, message: "NPC interaction logged", entry: data });

  } catch (err) {
    console.error("Unexpected error in logNPCInteraction:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};