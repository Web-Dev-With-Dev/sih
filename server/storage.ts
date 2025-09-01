import { type TeamMember, type InsertTeamMember, type Task, type InsertTask, type Upload, type InsertUpload } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Team Members
  getTeamMembers(): Promise<TeamMember[]>;
  getTeamMember(id: string): Promise<TeamMember | undefined>;
  createTeamMember(member: InsertTeamMember): Promise<TeamMember>;
  updateTeamMember(id: string, updates: Partial<TeamMember>): Promise<TeamMember>;

  // Tasks
  getTasks(): Promise<Task[]>;
  getTask(id: string): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, updates: Partial<Task>): Promise<Task>;
  deleteTask(id: string): Promise<boolean>;

  // Uploads
  getUploads(): Promise<Upload[]>;
  getUpload(id: string): Promise<Upload | undefined>;
  createUpload(upload: InsertUpload): Promise<Upload>;
  deleteUpload(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private teamMembers: Map<string, TeamMember>;
  private tasks: Map<string, Task>;
  private uploads: Map<string, Upload>;

  constructor() {
    this.teamMembers = new Map();
    this.tasks = new Map();
    this.uploads = new Map();
    this.initializeData();
  }

  private initializeData() {
    // Initialize team members with no default roles
    const members = [
      { name: "Dev", role: "", avatar: "D", color: "primary" },
      { name: "Krisha", role: "", avatar: "K", color: "secondary" },
      { name: "Dhruvi", role: "", avatar: "D", color: "accent" },
      { name: "Keval", role: "", avatar: "K", color: "primary" },
      { name: "Param", role: "", avatar: "P", color: "secondary" },
      { name: "Mysterious", role: "", avatar: "?", color: "muted" },
    ];

    members.forEach(member => {
      const id = randomUUID();
      this.teamMembers.set(id, { ...member, id });
    });
  }

  // Team Members
  async getTeamMembers(): Promise<TeamMember[]> {
    return Array.from(this.teamMembers.values());
  }

  async getTeamMember(id: string): Promise<TeamMember | undefined> {
    return this.teamMembers.get(id);
  }

  async createTeamMember(insertMember: InsertTeamMember): Promise<TeamMember> {
    const id = randomUUID();
    const member: TeamMember = { ...insertMember, id };
    this.teamMembers.set(id, member);
    return member;
  }

  async updateTeamMember(id: string, updates: Partial<TeamMember>): Promise<TeamMember> {
    const existingMember = this.teamMembers.get(id);
    if (!existingMember) {
      throw new Error("Team member not found");
    }
    const updatedMember = { ...existingMember, ...updates };
    this.teamMembers.set(id, updatedMember);
    return updatedMember;
  }

  // Tasks
  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async getTask(id: string): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = randomUUID();
    const task: Task = { 
      ...insertTask, 
      id, 
      createdAt: new Date(),
      progress: insertTask.progress ?? 0
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const existingTask = this.tasks.get(id);
    if (!existingTask) {
      throw new Error("Task not found");
    }
    const updatedTask = { ...existingTask, ...updates };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: string): Promise<boolean> {
    return this.tasks.delete(id);
  }

  // Uploads
  async getUploads(): Promise<Upload[]> {
    return Array.from(this.uploads.values());
  }

  async getUpload(id: string): Promise<Upload | undefined> {
    return this.uploads.get(id);
  }

  async createUpload(insertUpload: InsertUpload): Promise<Upload> {
    const id = randomUUID();
    const upload: Upload = { ...insertUpload, id, uploadedAt: new Date() };
    this.uploads.set(id, upload);
    return upload;
  }

  async deleteUpload(id: string): Promise<boolean> {
    return this.uploads.delete(id);
  }
}

export const storage = new MemStorage();
