import { storage } from "../storage";

export async function POST(req, res) {
  try {
    const member = req.body; // Should match InsertTeamMember type
    const newMember = await storage.createTeamMember(member);
    res.status(201).json(newMember);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}