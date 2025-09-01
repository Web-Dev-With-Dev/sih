import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, TrendingUp, Calendar, Users, CheckCircle, Clock, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
import ActivityFeed from "@/components/activity-feed";
import StatsCard from "@/components/stats-card";
import BackgroundAnimation from "@/components/background-animation";
import { z } from "zod";

const taskFormSchema = insertTaskSchema.extend({
  assignees: z.array(z.string()).min(1, "At least one assignee is required"),
  dueDate: z.string().min(1, "Due date is required"),
});

type TaskFormData = z.infer<typeof taskFormSchema>;

export default function Dashboard() {
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [taskFilter, setTaskFilter] = useState<"all" | "pending" | "in-progress" | "completed">("all");
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

  // Filter tasks based on selected filter
  const filteredTasks = tasks.filter(task => {
    if (taskFilter === "all") return true;
    return task.status === taskFilter;
  });

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
  const inProgressTasks = tasks.filter(task => task.status === "in-progress").length;
  const pendingTasks = tasks.filter(task => task.status === "pending").length;
  const totalTasks = tasks.length;
  const membersWithRoles = teamMembers.filter(member => member.role && member.role.trim() !== "").length;

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
            <motion.p 
              className="text-muted-foreground" 
              data-testid="loading-dashboard"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Loading dashboard...
            </motion.p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-background relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <BackgroundAnimation />
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
                <DialogContent aria-describedby="dialog-desc" className="max-w-md">
                  <div id="dialog-desc">Describe what this dialog does here.</div>
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

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <StatsCard
              title="Total Tasks"
              value={totalTasks}
              description="All project tasks"
              icon={Calendar}
              color="primary"
            />
            <StatsCard
              title="Completed"
              value={completedTasks}
              description="Finished tasks"
              icon={CheckCircle}
              color="secondary"
            />
            <StatsCard
              title="In Progress"
              value={inProgressTasks}
              description="Active tasks"
              icon={Clock}
              color="accent"
            />
            <StatsCard
              title="Team Members"
              value={`${membersWithRoles}/6`}
              description="With assigned roles"
              icon={Users}
              color="muted"
            />
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
            {teamMembers.map((member, index) => {
              const stats = getMemberStats(member.name);
              return (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <TeamMemberCard
                    member={member}
                    problemStatementStatus={stats.problemStatementStatus}
                    tasksAssigned={stats.tasksAssigned}
                    tasksCompleted={stats.tasksCompleted}
                  />
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Tasks & Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Task Management */}
          <section id="tasks" className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground" data-testid="text-tasks-title">
                Current Tasks
              </h2>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={taskFilter} onValueChange={(value: any) => setTaskFilter(value)}>
                  <SelectTrigger className="w-32" data-testid="task-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tasks</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-4">
              <AnimatePresence mode="wait">
                {filteredTasks.length === 0 ? (
                  <motion.div 
                    className="text-center py-8" 
                    data-testid="empty-tasks"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <p className="text-muted-foreground">
                      {taskFilter === "all" ? "No tasks yet. Create your first task!" : `No ${taskFilter} tasks found.`}
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {filteredTasks.map((task, index) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <TaskCard task={task} />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button 
                className="w-full mt-4 border-2 border-dashed border-border rounded-lg p-4 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                onClick={() => setAddTaskOpen(true)}
                data-testid="button-add-task-inline"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Plus className="mr-2 h-4 w-4 inline" />
                Add New Task
              </motion.button>
            </div>
          </section>

          {/* Activity Feed */}
          <ActivityFeed />
        </div>

        {/* File Upload Section */}
        <section className="mb-8">
          <FileUpload />
        </section>

        {/* Upcoming Tasks Preview */}
        <section className="mt-8 bg-muted/50 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Calendar className="text-primary mr-3 h-6 w-6" />
            <h2 className="text-xl font-bold text-foreground" data-testid="text-upcoming-title">
              SIH 2025 Phases
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card p-4 rounded-lg border border-accent border-2" data-testid="card-current-phase">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-foreground">Problem Statement Choose & Register</h3>
                <div className="px-2 py-1 bg-accent/10 text-accent rounded text-xs font-medium">
                  Current Phase
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-2">Select your problem statement and complete team registration</p>
              <div className="text-xs text-accent font-medium">
                <Calendar className="mr-1 h-3 w-3 inline" />
                Registration Deadline: September 19, 2025
              </div>
            </div>
            <div className="bg-card p-4 rounded-lg border border-border" data-testid="card-upcoming-solution">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-foreground">Solution Development Phase</h3>
                <div className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs font-medium">
                  Upcoming
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-2">Technical implementation and prototype development</p>
              <div className="text-xs text-muted-foreground">
                <Calendar className="mr-1 h-3 w-3 inline" />
                Coming Soon
              </div>
            </div>
            <div className="bg-card p-4 rounded-lg border border-border" data-testid="card-upcoming-testing">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-foreground">Internal Hackathon</h3>
                <div className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs font-medium">
                  Upcoming
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-2">Internal evaluation and selection process</p>
              <div className="text-xs text-muted-foreground">
                <Calendar className="mr-1 h-3 w-3 inline" />
                Coming Soon
              </div>
            </div>
            <div className="bg-card p-4 rounded-lg border border-border" data-testid="card-upcoming-final">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-foreground">Grand Finale</h3>
                <div className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs font-medium">
                  Upcoming
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-2">Final presentation and judging at national level</p>
              <div className="text-xs text-muted-foreground">
                <Calendar className="mr-1 h-3 w-3 inline" />
                Coming Soon
              </div>
            </div>
          </div>
        </section>
      </div>
    </motion.div>
  );
}
