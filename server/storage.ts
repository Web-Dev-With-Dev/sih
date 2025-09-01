import { type TeamMember, type InsertTeamMember, type Task, type InsertTask, type Upload, type InsertUpload } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Team Members
  getTeamMembers(): Promise<TeamMember[]>;
  getTeamMember(id: string): Promise<TeamMember | undefined>;
  createTeamMember(member: InsertTeamMember): Promise<TeamMember>;

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
    // Initialize team members
    const members = [
      { name: "Dev", role: "Team Lead & Developer", avatar: "D", color: "primary" },
      { name: "Krisha", role: "UI/UX Designer", avatar: "K", color: "secondary" },
      { name: "Dhruvi", role: "Backend Developer", avatar: "D", color: "accent" },
      { name: "Keval", role: "Frontend Developer", avatar: "K", color: "primary" },
      { name: "Param", role: "Data Analyst", avatar: "P", color: "secondary" },
      { name: "Mysterious", role: "Role TBD", avatar: "?", color: "muted" },
    ];

    members.forEach(member => {
      const id = randomUUID();
      this.teamMembers.set(id, { ...member, id });
    });

    // Initialize some sample tasks
    const sampleTasks = [
      {
        title: "Problem Statement Research",
        description: "Research and identify key problem areas for our hackathon solution",
        assignees: ["Dev", "Krisha"],
        status: "in-progress",
        category: "problem-recognition",
        progress: 75,
        dueDate: "2024-12-28"
      },
      {
        title: "UI Wireframe Creation",
        description: "Create initial wireframes for the user interface design",
        assignees: ["Krisha"],
        status: "completed",
        category: "problem-recognition",
        progress: 100,
        dueDate: "2024-12-25"
      },
      {
        title: "Database Schema Design",
        description: "Design the database structure for the application",
        assignees: ["Dhruvi", "Keval"],
        status: "pending",
        category: "solution-development",
        progress: 0,
        dueDate: "2024-12-30"
      }
    ];

    sampleTasks.forEach(task => {
      const id = randomUUID();
      this.tasks.set(id, { ...task, id, createdAt: new Date() });
    });

    // Initialize some sample uploads
    const sampleUploads = [
      {
        filename: "problem_statement_dev.pdf",
        originalName: "problem_statement_dev.pdf",
        memberName: "Dev",
        fileSize: 2400000,
        fileType: "application/pdf"
      },
      {
        filename: "problem_analysis_krisha.docx",
        originalName: "problem_analysis_krisha.docx",
        memberName: "Krisha",
        fileSize: 1800000,
        fileType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      },
      {
        filename: "market_research_keval.pdf",
        originalName: "market_research_keval.pdf",
        memberName: "Keval",
        fileSize: 3100000,
        fileType: "application/pdf"
      }
    ];

    sampleUploads.forEach(upload => {
      const id = randomUUID();
      this.uploads.set(id, { ...upload, id, uploadedAt: new Date() });
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
