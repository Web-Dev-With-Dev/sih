import { MongoClient, ObjectId } from "mongodb";
import { type TeamMember, type InsertTeamMember, type Task, type InsertTask, type Upload, type InsertUpload } from "@shared/schema";

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const client = new MongoClient(uri);
const dbName = "taskmaster";

export class MongoStorage {
  private dbPromise = client.connect().then(c => c.db(dbName));

  // Team Members
  async getTeamMembers(): Promise<TeamMember[]> {
    const db = await this.dbPromise;
    return db.collection<TeamMember>("teamMembers").find().toArray();
  }

  async getTeamMember(id: string): Promise<TeamMember | undefined> {
    const db = await this.dbPromise;
    return db.collection<TeamMember>("teamMembers").findOne({ _id: new ObjectId(id) }) ?? undefined;
  }

  async createTeamMember(member: InsertTeamMember): Promise<TeamMember> {
    const db = await this.dbPromise;
    const result = await db.collection("teamMembers").insertOne(member);
    return { ...member, id: result.insertedId.toString() };
  }

  async updateTeamMember(id: string, updates: Partial<TeamMember>): Promise<TeamMember> {
    const db = await this.dbPromise;
    await db.collection("teamMembers").updateOne({ _id: new ObjectId(id) }, { $set: updates });
    return (await this.getTeamMember(id))!;
  }

  // Tasks
  async getTasks(): Promise<Task[]> {
    const db = await this.dbPromise;
    return db.collection<Task>("tasks").find().toArray();
  }

  async getTask(id: string): Promise<Task | undefined> {
    const db = await this.dbPromise;
    return db.collection<Task>("tasks").findOne({ _id: new ObjectId(id) }) ?? undefined;
  }

  async createTask(task: InsertTask): Promise<Task> {
    const db = await this.dbPromise;
    const doc = { ...task, createdAt: new Date(), progress: task.progress ?? 0 };
    const result = await db.collection("tasks").insertOne(doc);
    return { ...doc, id: result.insertedId.toString() };
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const db = await this.dbPromise;
    await db.collection("tasks").updateOne({ _id: new ObjectId(id) }, { $set: updates });
    return (await this.getTask(id))!;
  }

  async deleteTask(id: string): Promise<boolean> {
    const db = await this.dbPromise;
    const result = await db.collection("tasks").deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount === 1;
  }

  // Uploads
  async getUploads(): Promise<Upload[]> {
    const db = await this.dbPromise;
    return db.collection<Upload>("uploads").find().toArray();
  }

  async getUpload(id: string): Promise<Upload | undefined> {
    const db = await this.dbPromise;
    return db.collection<Upload>("uploads").findOne({ _id: new ObjectId(id) }) ?? undefined;
  }

  async createUpload(upload: InsertUpload): Promise<Upload> {
    const db = await this.dbPromise;
    const doc = { ...upload, uploadedAt: new Date() };
    const result = await db.collection("uploads").insertOne(doc);
    return { ...doc, id: result.insertedId.toString() };
  }

  async deleteUpload(id: string): Promise<boolean> {
    const db = await this.dbPromise;
    const result = await db.collection("uploads").deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount === 1;
  }
}

// Use MongoStorage instead of MemStorage
export const storage = new MongoStorage();
