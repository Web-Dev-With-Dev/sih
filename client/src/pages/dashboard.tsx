import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, TrendingUp, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTaskSchema, type TeamMember, type Task, type Upload } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/header";
import ProgressCard from "@/components/progress-card";
import TeamMemberCard from "@/components/team-member-card";
import TaskCard from "@/components/task-card";
import FileUpload from "@/components/file-upload";
import { z } from "zod";

const taskFormSchema = insertTaskSchema.extend({
  assignees: z.array(z.string()).min(1, "At least one assignee is required"),
  dueDate: z.string().min(1, "Due date is required"),
});

type TaskFormData = z.infer<typeof taskFormSchema>;

export default function Dashboard() {
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: teamMembers = [], isLoading: membersLoading } = useQuery<TeamMember[]>({
    queryKey: ["/api/team-members"],
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: uploads = [] } = useQuery<Upload[]>({
    queryKey: ["/api/uploads"],
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: TaskFormData) => {
      const response = await apiRequest("POST", "/api/tasks", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setAddTaskOpen(false);
      toast({
        title: "Success",
        description: "Task created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      assignees: [],
      status: "pending",
      category: "problem-recognition",
      progress: 0,
      dueDate: "",
    },
  });

  const onSubmit = (data: TaskFormData) => {
    createTaskMutation.mutate(data);
  };

  // Calculate statistics
  const problemRecognitionTasks = tasks.filter(task => task.category === "problem-recognition");
  const problemRecognitionProgress = problemRecognitionTasks.length > 0 
    ? Math.round(problemRecognitionTasks.reduce((sum, task) => sum + task.progress, 0) / problemRecognitionTasks.length)
    : 0;

  const solutionTasks = tasks.filter(task => task.category === "solution-development");
  const solutionProgress = solutionTasks.length > 0 
    ? Math.round(solutionTasks.reduce((sum, task) => sum + task.progress, 0) / solutionTasks.length)
    : 0;

  const completedTasks = tasks.filter(task => task.status === "completed").length;

  // Get member statistics
  const getMemberStats = (memberName: string) => {
    const memberTasks = tasks.filter(task => task.assignees.includes(memberName));
    const completedTasks = memberTasks.filter(task => task.status === "completed").length;
    const memberUploads = uploads.filter(upload => upload.memberName === memberName);
    
    let problemStatementStatus: "submitted" | "in-review" | "pending" = "pending";
    if (memberUploads.length > 0) {
      problemStatementStatus = "submitted";
    }

    return {
      tasksAssigned: memberTasks.length,
      tasksCompleted: completedTasks,
      problemStatementStatus,
    };
  };

  if (membersLoading || tasksLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground" data-testid="loading-dashboard">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Overview */}
        <section id="dashboard" className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground" data-testid="text-dashboard-title">
                Team Dashboard
              </h2>
              <p className="text-muted-foreground mt-1" data-testid="text-dashboard-subtitle">
                Track progress and manage your hackathon team
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <Dialog open={addTaskOpen} onOpenChange={setAddTaskOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90" data-testid="button-add-task">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Task
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Task</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-task-title" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea {...field} data-testid="textarea-task-description" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-task-category">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="problem-recognition">Problem Recognition</SelectItem>
                                <SelectItem value="solution-development">Solution Development</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="dueDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Due Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} data-testid="input-task-due-date" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setAddTaskOpen(false)} data-testid="button-cancel-task">
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createTaskMutation.isPending} data-testid="button-submit-task">
                          {createTaskMutation.isPending ? "Creating..." : "Create Task"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Progress Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <ProgressCard
              title="Problem Recognition"
              status="In Progress"
              statusColor="accent"
              progress={problemRecognitionProgress}
              description={`${uploads.length} out of 6 members have submitted their problem statements`}
            />
            <ProgressCard
              title="Solution Development"
              status={solutionProgress > 0 ? "In Progress" : "Pending"}
              statusColor={solutionProgress > 0 ? "accent" : "muted"}
              progress={solutionProgress}
              description={solutionProgress > 0 ? "Solution development in progress" : "Waiting for problem recognition phase to complete"}
            />
            <ProgressCard
              title="Team Activity"
              status="Active"
              statusColor="secondary"
              progress={100}
              description={`${completedTasks} tasks completed this week`}
              icon={<TrendingUp className="h-5 w-5 text-secondary" />}
            />
          </div>
        </section>

        {/* Team Members Section */}
        <section id="team" className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground" data-testid="text-team-title">
              Team Members
            </h2>
            <span className="text-muted-foreground" data-testid="text-team-count">
              {teamMembers.length} members
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member) => {
              const stats = getMemberStats(member.name);
              return (
                <TeamMemberCard
                  key={member.id}
                  member={member}
                  problemStatementStatus={stats.problemStatementStatus}
                  tasksAssigned={stats.tasksAssigned}
                  tasksCompleted={stats.tasksCompleted}
                />
              );
            })}
          </div>
        </section>

        {/* Tasks & File Upload Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Task Management */}
          <section id="tasks">
            <h2 className="text-2xl font-bold text-foreground mb-6" data-testid="text-tasks-title">
              Current Tasks
            </h2>
            
            <div className="space-y-4">
              {tasks.length === 0 ? (
                <div className="text-center py-8" data-testid="empty-tasks">
                  <p className="text-muted-foreground">No tasks yet. Create your first task!</p>
                </div>
              ) : (
                tasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))
              )}

              <button 
                className="w-full mt-4 border-2 border-dashed border-border rounded-lg p-4 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                onClick={() => setAddTaskOpen(true)}
                data-testid="button-add-task-inline"
              >
                <Plus className="mr-2 h-4 w-4 inline" />
                Add New Task
              </button>
            </div>
          </section>

          {/* File Upload Section */}
          <FileUpload />
        </div>

        {/* Upcoming Tasks Preview */}
        <section className="mt-8 bg-muted/50 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Calendar className="text-primary mr-3 h-6 w-6" />
            <h2 className="text-xl font-bold text-foreground" data-testid="text-upcoming-title">
              Upcoming Phases
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card p-4 rounded-lg border border-border" data-testid="card-upcoming-solution">
              <h3 className="font-semibold text-foreground mb-2">Solution Development Phase</h3>
              <p className="text-sm text-muted-foreground mb-2">Technical implementation and prototype development</p>
              <div className="text-xs text-muted-foreground">
                <Calendar className="mr-1 h-3 w-3 inline" />
                Expected Start: Jan 2, 2025
              </div>
            </div>
            <div className="bg-card p-4 rounded-lg border border-border" data-testid="card-upcoming-testing">
              <h3 className="font-semibold text-foreground mb-2">Testing & Refinement</h3>
              <p className="text-sm text-muted-foreground mb-2">Quality assurance and final adjustments</p>
              <div className="text-xs text-muted-foreground">
                <Calendar className="mr-1 h-3 w-3 inline" />
                Expected Start: Jan 15, 2025
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
