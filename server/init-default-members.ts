import { storage } from "./storage";

const defaultMembers = [
  { name: "dev", role: "Member", avatar: "D", color: "blue" },
  { name: "dhruvi", role: "Member", avatar: "D", color: "green" },
  { name: "krisha", role: "Member", avatar: "K", color: "purple" },
  { name: "keval", role: "Member", avatar: "K", color: "orange" },
  { name: "param", role: "Member", avatar: "P", color: "red" },
  { name: "vivek", role: "Member", avatar: "V", color: "teal" },
];

export async function addDefaultMembers() {
  const existing = await storage.getTeamMembers();
  for (const member of defaultMembers) {
    if (!existing.some(m => m.name === member.name)) {
      await storage.createTeamMember(member);
    }
  }
}