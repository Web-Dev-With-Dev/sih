import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CloudUpload, FileText, Download, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Upload, TeamMember } from "@shared/schema";

export default function FileUpload() {
  const [dragOver, setDragOver] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: teamMembers = [] } = useQuery<TeamMember[]>({
    queryKey: ["/api/team-members"],
  });

  const { data: uploads = [], isLoading: uploadsLoading } = useQuery<Upload[]>({
    queryKey: ["/api/uploads"],
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Upload failed");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/uploads"] });
      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
      setSelectedMember("");
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (uploadId: string) => {
      await apiRequest("DELETE", `/api/uploads/${uploadId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/uploads"] });
      toast({
        title: "Success",
        description: "File deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    if (!selectedMember) {
      toast({
        title: "Member required",
        description: "Please select a team member before uploading files",
        variant: "destructive",
      });
      return;
    }

    files.forEach(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 10MB limit`,
          variant: "destructive",
        });
        return;
      }

      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ];

      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported format`,
          variant: "destructive",
        });
        return;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("memberName", selectedMember);

      uploadMutation.mutate(formData);
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("pdf")) {
      return <FileText className="h-5 w-5 text-primary" />;
    }
    return <FileText className="h-5 w-5 text-secondary" />;
  };

  const handleDownload = (uploadId: string) => {
    window.open(`/api/uploads/${uploadId}/download`, '_blank');
  };

  return (
    <section id="uploads">
      <h2 className="text-2xl font-bold text-foreground mb-6" data-testid="text-uploads-title">
        Problem Statement Uploads
      </h2>
      
      {/* Member Selection */}
      <div className="mb-4">
        <Select value={selectedMember} onValueChange={setSelectedMember}>
          <SelectTrigger className="w-full max-w-xs" data-testid="select-member">
            <SelectValue placeholder="Select team member" />
          </SelectTrigger>
          <SelectContent>
            {teamMembers.map((member) => (
              <SelectItem key={member.id} value={member.name} data-testid={`option-member-${member.name.toLowerCase()}`}>
                {member.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Drag and Drop Upload Area */}
      <div 
        className={`border-2 border-dashed border-border rounded-lg p-8 text-center mb-6 hover:border-primary transition-colors cursor-pointer ${
          dragOver ? "drag-over" : ""
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        data-testid="dropzone-upload"
      >
        <CloudUpload className="mx-auto text-4xl text-muted-foreground mb-4 h-12 w-12" />
        <h3 className="text-lg font-semibold text-foreground mb-2" data-testid="text-upload-title">
          Upload Problem Statement
        </h3>
        <p className="text-muted-foreground mb-4" data-testid="text-upload-description">
          Drag and drop your files here or click to browse
        </p>
        <Button 
          type="button"
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          disabled={!selectedMember || uploadMutation.isPending}
          data-testid="button-choose-files"
        >
          {uploadMutation.isPending ? "Uploading..." : "Choose Files"}
        </Button>
        <p className="text-xs text-muted-foreground mt-2" data-testid="text-upload-info">
          Supported formats: PDF, DOC, DOCX (Max 10MB)
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx"
          onChange={handleFileSelect}
          className="hidden"
          data-testid="input-file-hidden"
        />
      </div>

      {/* Uploaded Files List */}
      <div className="space-y-3">
        <h3 className="font-semibold text-foreground" data-testid="text-recent-uploads">
          Recent Uploads
        </h3>
        
        {uploadsLoading ? (
          <div className="text-center py-4" data-testid="loading-uploads">
            <p className="text-muted-foreground">Loading uploads...</p>
          </div>
        ) : uploads.length === 0 ? (
          <div className="text-center py-4" data-testid="empty-uploads">
            <p className="text-muted-foreground">No files uploaded yet</p>
          </div>
        ) : (
          uploads.map((upload) => (
            <div key={upload.id} className="bg-card p-4 rounded-lg border border-border flex items-center justify-between" data-testid={`card-upload-${upload.id}`}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  {getFileIcon(upload.fileType)}
                </div>
                <div>
                  <h4 className="font-medium text-foreground" data-testid={`text-filename-${upload.id}`}>
                    {upload.originalName}
                  </h4>
                  <p className="text-sm text-muted-foreground" data-testid={`text-upload-meta-${upload.id}`}>
                    {upload.memberName} • {formatFileSize(upload.fileSize)} • {upload.uploadedAt ? new Date(upload.uploadedAt).toLocaleString() : 'Unknown time'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownload(upload.id)}
                  className="p-2 text-muted-foreground hover:text-primary"
                  data-testid={`button-download-${upload.id}`}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteMutation.mutate(upload.id)}
                  className="p-2 text-muted-foreground hover:text-destructive"
                  disabled={deleteMutation.isPending}
                  data-testid={`button-delete-${upload.id}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
