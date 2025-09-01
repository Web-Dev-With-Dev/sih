import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTaskSchema, insertUploadSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF, DOC, and DOCX files are allowed."));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Team Members Routes
  app.get("/api/team-members", async (req, res) => {
    try {
      const members = await storage.getTeamMembers();
      res.json(members);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch team members" });
    }
  });

  app.get("/api/team-members/:id", async (req, res) => {
    try {
      const member = await storage.getTeamMember(req.params.id);
      if (!member) {
        return res.status(404).json({ message: "Team member not found" });
      }
      res.json(member);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch team member" });
    }
  });

  app.patch("/api/team-members/:id", async (req, res) => {
    try {
      const updates = req.body;
      const member = await storage.updateTeamMember(req.params.id, updates);
      res.json(member);
    } catch (error) {
      if (error instanceof Error && error.message === "Team member not found") {
        res.status(404).json({ message: "Team member not found" });
      } else {
        res.status(500).json({ message: "Failed to update team member" });
      }
    }
  });

  // Tasks Routes
  app.get("/api/tasks", async (req, res) => {
    try {
      const tasks = await storage.getTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const validatedTask = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(validatedTask);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to create task" });
      }
    }
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    try {
      const updates = req.body;
      const task = await storage.updateTask(req.params.id, updates);
      res.json(task);
    } catch (error) {
      if (error instanceof Error && error.message === "Task not found") {
        res.status(404).json({ message: "Task not found" });
      } else {
        res.status(500).json({ message: "Failed to update task" });
      }
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteTask(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json({ message: "Task deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // File Upload Routes
  app.get("/api/uploads", async (req, res) => {
    try {
      const uploads = await storage.getUploads();
      res.json(uploads);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch uploads" });
    }
  });

  app.post("/api/uploads", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const { memberName } = req.body;
      if (!memberName) {
        return res.status(400).json({ message: "Member name is required" });
      }

      const uploadData = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        memberName,
        fileSize: req.file.size,
        fileType: req.file.mimetype,
      };

      const validatedUpload = insertUploadSchema.parse(uploadData);
      const upload = await storage.createUpload(validatedUpload);
      res.status(201).json(upload);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to upload file" });
      }
    }
  });

  app.delete("/api/uploads/:id", async (req, res) => {
    try {
      const upload = await storage.getUpload(req.params.id);
      if (!upload) {
        return res.status(404).json({ message: "Upload not found" });
      }

      // Delete the physical file
      const filePath = path.join("uploads", upload.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      const deleted = await storage.deleteUpload(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Upload not found" });
      }
      res.json({ message: "File deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete file" });
    }
  });

  app.get("/api/uploads/:id/download", async (req, res) => {
    try {
      const upload = await storage.getUpload(req.params.id);
      if (!upload) {
        return res.status(404).json({ message: "Upload not found" });
      }

      const filePath = path.join("uploads", upload.filename);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "File not found on disk" });
      }

      res.download(filePath, upload.originalName);
    } catch (error) {
      res.status(500).json({ message: "Failed to download file" });
    }
  });

  app.get("/api/uploads/:id", async (req, res) => {
    try {
      const upload = await storage.getUpload(req.params.id);
      if (!upload) return res.status(404).json({ message: "File not found" });
      // send file logic here
    } catch (error) {
      console.error("Download error:", error);
      res.status(500).json({ message: "Failed to download file" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
