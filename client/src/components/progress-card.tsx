import { ReactNode } from "react";

interface ProgressCardProps {
  title: string;
  status: string;
  statusColor: "accent" | "secondary" | "muted";
  progress: number;
  description: string;
  icon?: ReactNode;
}

export default function ProgressCard({ 
  title, 
  status, 
  statusColor, 
  progress, 
  description, 
  icon 
}: ProgressCardProps) {
  const getStatusColorClasses = (color: string) => {
    switch (color) {
      case "accent":
        return "bg-accent/10 text-accent";
      case "secondary":
        return "bg-secondary/10 text-secondary";
      case "muted":
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getProgressBarColor = (color: string) => {
    switch (color) {
      case "accent":
        return "bg-accent";
      case "secondary":
        return "bg-secondary";
      case "muted":
      default:
        return "bg-muted";
    }
  };

  return (
    <div className="bg-card p-6 rounded-lg border border-border" data-testid={`progress-card-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground" data-testid={`text-title-${title.toLowerCase().replace(/\s+/g, '-')}`}>
          {title}
        </h3>
        <div className="flex items-center space-x-2">
          {icon}
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColorClasses(statusColor)}`} data-testid={`status-${status.toLowerCase().replace(/\s+/g, '-')}`}>
            {status}
          </div>
        </div>
      </div>
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium" data-testid={`text-progress-${progress}`}>{progress}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${getProgressBarColor(statusColor)}`}
            style={{ width: `${progress}%` }}
            data-testid={`progress-bar-${progress}`}
          />
        </div>
      </div>
      <p className="text-sm text-muted-foreground" data-testid={`text-description-${title.toLowerCase().replace(/\s+/g, '-')}`}>
        {description}
      </p>
    </div>
  );
}
