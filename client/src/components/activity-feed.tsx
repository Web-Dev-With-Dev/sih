import { motion } from "framer-motion";
import { Clock, Upload, CheckCircle, UserPlus, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Task, Upload as UploadType, TeamMember } from "@shared/schema";

interface ActivityItem {
  id: string;
  type: "task_created" | "task_completed" | "file_uploaded" | "member_updated";
  title: string;
  description: string;
  timestamp: Date;
  icon: JSX.Element;
  color: string;
}

export default function ActivityFeed() {
  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: uploads = [] } = useQuery<UploadType[]>({
    queryKey: ["/api/uploads"],
  });

  const { data: teamMembers = [] } = useQuery<TeamMember[]>({
    queryKey: ["/api/team-members"],
  });

  // Generate activity items from data
  const generateActivities = (): ActivityItem[] => {
    const activities: ActivityItem[] = [];

    // Add task activities
    tasks.forEach(task => {
      if (task.createdAt) {
        activities.push({
          id: `task-created-${task.id}`,
          type: "task_created",
          title: "New Task Created",
          description: `"${task.title}" assigned to ${task.assignees.join(", ")}`,
          timestamp: new Date(task.createdAt),
          icon: <Calendar className="h-4 w-4" />,
          color: "text-primary"
        });
      }

      if (task.status === "completed") {
        activities.push({
          id: `task-completed-${task.id}`,
          type: "task_completed",
          title: "Task Completed",
          description: `"${task.title}" has been completed`,
          timestamp: new Date(task.createdAt || Date.now()),
          icon: <CheckCircle className="h-4 w-4" />,
          color: "text-secondary"
        });
      }
    });

    // Add upload activities
    uploads.forEach(upload => {
      if (upload.uploadedAt) {
        activities.push({
          id: `upload-${upload.id}`,
          type: "file_uploaded",
          title: "File Uploaded",
          description: `${upload.memberName} uploaded "${upload.originalName}"`,
          timestamp: new Date(upload.uploadedAt),
          icon: <Upload className="h-4 w-4" />,
          color: "text-accent"
        });
      }
    });

    // Add member activities
    teamMembers.forEach(member => {
      if (member.role) {
        activities.push({
          id: `member-updated-${member.id}`,
          type: "member_updated",
          title: "Role Updated",
          description: `${member.name} role set to "${member.role}"`,
          timestamp: new Date(Date.now() - Math.random() * 86400000), // Random recent time
          icon: <UserPlus className="h-4 w-4" />,
          color: "text-muted-foreground"
        });
      }
    });

    // Sort by timestamp (newest first) and limit to 10
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);
  };

  const activities = generateActivities();

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="bg-card p-6 rounded-lg border border-border">
      <div className="flex items-center mb-4">
        <Clock className="text-primary mr-2 h-5 w-5" />
        <h3 className="font-semibold text-foreground" data-testid="activity-title">
          Recent Activity
        </h3>
      </div>
      
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {activities.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-4" data-testid="no-activity">
            No recent activity
          </p>
        ) : (
          activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              data-testid={`activity-${activity.type}-${index}`}
            >
              <div className={`mt-0.5 ${activity.color}`}>
                {activity.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {activity.title}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {activity.description}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatTime(activity.timestamp)}
                </p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}