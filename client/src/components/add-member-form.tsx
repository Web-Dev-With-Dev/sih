
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AddMemberForm() {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [avatar, setAvatar] = useState("");
  const [color, setColor] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addMemberMutation = useMutation({
    mutationFn: async (member) => {
      const response = await apiRequest("POST", "/api/team-members", member);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team-members"] });
      toast({ title: "Success", description: "Member added!" });
      setName(""); setRole(""); setAvatar(""); setColor("");
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addMemberMutation.mutate({ name, role, avatar, color });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Input value={name} onChange={e => setName(e.target.value)} placeholder="Name" required />
      <Input value={role} onChange={e => setRole(e.target.value)} placeholder="Role" required />
      <Input value={avatar} onChange={e => setAvatar(e.target.value)} placeholder="Avatar" />
      <Input value={color} onChange={e => setColor(e.target.value)} placeholder="Color" />
      <Button type="submit" disabled={addMemberMutation.isPending}>Add Member</Button>
    </form>
  );
}