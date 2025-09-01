import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
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
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [newRole, setNewRole] = useState(member.role);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateMemberMutation = useMutation({
    mutationFn: async (updates: Partial<TeamMember>) => {
      const response = await apiRequest("PATCH", `/api/team-members/${member.id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team-members"] });
      setIsEditingRole(false);
      toast({
        title: "Success",
        description: "Role updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setNewRole(member.role); // Reset to original value
    },
  });

  const handleSaveRole = () => {
    if (newRole.trim() !== member.role) {
      updateMemberMutation.mutate({ role: newRole.trim() });
    } else {
      setIsEditingRole(false);
    }
  };

  const handleCancelEdit = () => {
    setNewRole(member.role);
    setIsEditingRole(false);
  };
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
    <motion.div 
      className="bg-card p-6 rounded-lg border border-border hover:shadow-lg transition-shadow" 
      data-testid={`card-member-${member.name.toLowerCase()}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
    >
      <div className="flex items-center mb-4">
        <div className={`w-12 h-12 avatar-${member.color} rounded-full flex items-center justify-center font-semibold text-lg`} data-testid={`avatar-${member.name.toLowerCase()}`}>
          {member.avatar}
        </div>
        <div className="ml-4 flex-1">
          <h3 className="font-semibold text-foreground" data-testid={`text-name-${member.name.toLowerCase()}`}>
            {member.name}
          </h3>
          <div className="flex items-center space-x-2">
            {isEditingRole ? (
              <div className="flex items-center space-x-1">
                <Input
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  placeholder="Enter role"
                  className="text-sm h-7 w-32"
                  data-testid={`input-role-${member.name.toLowerCase()}`}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleSaveRole}
                  disabled={updateMemberMutation.isPending}
                  className="h-7 w-7 p-0"
                  data-testid={`button-save-role-${member.name.toLowerCase()}`}
                >
                  <Check className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCancelEdit}
                  className="h-7 w-7 p-0"
                  data-testid={`button-cancel-role-${member.name.toLowerCase()}`}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <p className="text-sm text-muted-foreground" data-testid={`text-role-${member.name.toLowerCase()}`}>
                  {member.role || "No role assigned"}
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditingRole(true)}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                  data-testid={`button-edit-role-${member.name.toLowerCase()}`}
                >
                  <Edit className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
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
    </motion.div>
  );
}
