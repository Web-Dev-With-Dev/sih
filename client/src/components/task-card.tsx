import { Calendar } from "lucide-react";
import type { Task } from "@shared/schema";

interface TaskCardProps {
  task: Task;
  onStatusUpdate?: (taskId: string, status: string) => void;
}

export default function TaskCard({ task, onStatusUpdate }: TaskCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-secondary/10 text-secondary";
      case "in-progress":
        return "bg-accent/10 text-accent";
      case "pending":
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "in-progress":
        return "In Progress";
      case "pending":
      default:
        return "Pending";
    }
  };

  const getProgressBarColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-secondary";
      case "in-progress":
        return "bg-accent";
      case "pending":
      default:
        return "bg-muted";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="bg-card p-4 rounded-lg border border-border" data-testid={`card-task-${task.id}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-foreground" data-testid={`text-task-title-${task.id}`}>
            {task.title}
          </h3>
          <p className="text-sm text-muted-foreground" data-testid={`text-task-assignees-${task.id}`}>
            Assigned to: {task.assignees.join(", ")}
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`} data-testid={`status-task-${task.id}`}>
          {getStatusText(task.status)}
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-3" data-testid={`text-task-description-${task.id}`}>
        {task.description}
      </p>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span data-testid={`text-task-due-date-${task.id}`}>
            Due: {formatDate(task.dueDate)}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-16 bg-muted rounded-full h-1">
            <div 
              className={`h-1 rounded-full ${getProgressBarColor(task.status)}`}
              style={{ width: `${task.progress}%` }}
              data-testid={`progress-bar-task-${task.id}`}
            />
          </div>
          <span className="text-xs text-muted-foreground" data-testid={`text-task-progress-${task.id}`}>
            {task.progress}%
          </span>
        </div>
      </div>
    </div>
  );
}
