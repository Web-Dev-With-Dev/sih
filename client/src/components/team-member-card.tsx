import type { TeamMember } from "@shared/schema";

interface TeamMemberCardProps {
  member: TeamMember;
  problemStatementStatus: "submitted" | "in-review" | "pending";
  tasksAssigned: number;
  tasksCompleted: number;
}

export default function TeamMemberCard({ 
  member, 
  problemStatementStatus, 
  tasksAssigned, 
  tasksCompleted 
}: TeamMemberCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
        return "bg-secondary/10 text-secondary";
      case "in-review":
        return "bg-accent/10 text-accent";
      case "pending":
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "submitted":
        return "Submitted";
      case "in-review":
        return "In Review";
      case "pending":
      default:
        return "Pending";
    }
  };

  return (
    <div className="bg-card p-6 rounded-lg border border-border hover:shadow-lg transition-shadow" data-testid={`card-member-${member.name.toLowerCase()}`}>
      <div className="flex items-center mb-4">
        <div className={`w-12 h-12 avatar-${member.color} rounded-full flex items-center justify-center font-semibold text-lg`} data-testid={`avatar-${member.name.toLowerCase()}`}>
          {member.avatar}
        </div>
        <div className="ml-4">
          <h3 className="font-semibold text-foreground" data-testid={`text-name-${member.name.toLowerCase()}`}>
            {member.name}
          </h3>
          <p className="text-sm text-muted-foreground" data-testid={`text-role-${member.name.toLowerCase()}`}>
            {member.role}
          </p>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Problem Statement</span>
          <div className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(problemStatementStatus)}`} data-testid={`status-problem-${member.name.toLowerCase()}`}>
            {getStatusText(problemStatementStatus)}
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Tasks Assigned</span>
          <span className="text-sm font-medium" data-testid={`text-tasks-assigned-${member.name.toLowerCase()}`}>
            {tasksAssigned}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Completed</span>
          <span className="text-sm font-medium" data-testid={`text-tasks-completed-${member.name.toLowerCase()}`}>
            {tasksCompleted}
          </span>
        </div>
      </div>
    </div>
  );
}
