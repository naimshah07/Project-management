import { useState } from "react";
import { XIcon, FolderKanbanIcon } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-hot-toast";
import api from "../configs/api";
import { useAuth } from "@clerk/clerk-react";
import { addProject } from '../features/workspaceSlice';


const CreateProjectDialog = ({ isDialogOpen, setIsDialogOpen }) => {

    const { getToken } = useAuth()
    const dispatch = useDispatch();


    const { currentWorkspace } = useSelector((state) => state.workspace);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        status: "PLANNING",
        priority: "MEDIUM",
        start_date: "",
        end_date: "",
        team_members: [],
        team_lead: "",
        progress: 0,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!formData.team_lead) {
                return toast.error("Please select a project lead.");
            }
            setIsSubmitting(true)
            const { data } = await api.post('/api/projects', { ...formData, workspaceId: currentWorkspace.id }, { headers: { Authorization: `Bearer ${await getToken()}` } });
            dispatch(addProject(data.project))
            setIsDialogOpen(false)
            toast.success("Project created successfully!");

        } catch (error) {
            toast.error(error?.response?.data?.message || error.message || "Failed to create project. Please try again.");
        } finally {
            setIsSubmitting(false);
        }

    };

    const removeTeamMember = (email) => {
        setFormData((prev) => ({ ...prev, team_members: prev.team_members.filter(m => m !== email) }));
    };

    if (!isDialogOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-bg/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="card w-full max-w-lg p-0 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border-soft shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-2xl bg-[linear-gradient(135deg,#6366f1_0%,#8b5cf6_100%)] text-white flex items-center justify-center shadow-[0_4px_14px_-4px_rgb(99_102_241_/_0.55)]">
                            <FolderKanbanIcon className="size-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-text tracking-tight">Create New Project</h2>
                            {currentWorkspace && (
                                <p className="muted-text text-xs">
                                    in workspace <span className="text-accent font-medium">{currentWorkspace.name}</span>
                                </p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={() => setIsDialogOpen(false)}
                        className="btn-ghost !size-9 !p-0 text-text-muted"
                        aria-label="Close"
                    >
                        <XIcon className="size-4.5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 p-6 overflow-y-auto">
                    {/* Project Name */}
                    <div className="space-y-1.5">
                        <label className="text-xs muted-text uppercase tracking-wider font-semibold">Project Name</label>
                        <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Marketing Website v2" className="input" required />
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <label className="text-xs muted-text uppercase tracking-wider font-semibold">Description</label>
                        <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="What is this project about?" className="input !min-h-[80px]" />
                    </div>

                    {/* Status & Priority */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs muted-text uppercase tracking-wider font-semibold">Status</label>
                            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="input" >
                                <option value="PLANNING">Planning</option>
                                <option value="ACTIVE">Active</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="ON_HOLD">On Hold</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs muted-text uppercase tracking-wider font-semibold">Priority</label>
                            <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className="input" >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                            </select>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs muted-text uppercase tracking-wider font-semibold">Start Date</label>
                            <input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} className="input" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs muted-text uppercase tracking-wider font-semibold">End Date</label>
                            <input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} min={formData.start_date && new Date(formData.start_date).toISOString().split('T')[0]} className="input" />
                        </div>
                    </div>

                    {/* Lead */}
                    <div className="space-y-1.5">
                        <label className="text-xs muted-text uppercase tracking-wider font-semibold">Project Lead</label>
                        <select value={formData.team_lead} onChange={(e) => setFormData({ ...formData, team_lead: e.target.value, team_members: e.target.value ? [...new Set([...formData.team_members, e.target.value])] : formData.team_members, })} className="input" >
                            <option value="">Select a lead…</option>
                            {currentWorkspace?.members?.map((member) => (
                                <option key={member.user.email} value={member.user.email}>
                                    {member.user.email}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Team Members */}
                    <div className="space-y-1.5">
                        <label className="text-xs muted-text uppercase tracking-wider font-semibold">Team Members</label>
                        <select className="input"
                            onChange={(e) => {
                                if (e.target.value && !formData.team_members.includes(e.target.value)) {
                                    setFormData((prev) => ({ ...prev, team_members: [...prev.team_members, e.target.value] }));
                                }
                                e.target.value = "";
                            }}
                        >
                            <option value="">+ Add workspace members…</option>
                            {currentWorkspace?.members
                                ?.filter((member) => !formData.team_members.includes(member.user.email))
                                .map((member) => (
                                    <option key={member.user.email} value={member.user.email}>
                                        {member.user.email}
                                    </option>
                                ))}
                        </select>

                        {formData.team_members.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-1">
                                {formData.team_members.map((email) => (
                                    <div key={email} className="inline-flex items-center gap-1.5 badge bg-accent-soft text-accent px-3 py-1 rounded-lg" >
                                        <span className="text-xs font-medium">{email}</span>
                                        <button type="button" onClick={() => removeTeamMember(email)} className="ml-0.5 size-4 rounded-full hover:bg-accent/20 flex items-center justify-center transition-colors" aria-label={`Remove ${email}`}>
                                            <XIcon className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-border-soft -mx-6 px-6 pt-5 sticky bottom-0 bg-bg -mb-6 pb-6 mt-2">
                        <button type="button" onClick={() => setIsDialogOpen(false)} className="btn-ghost" >
                            Cancel
                        </button>
                        <button disabled={isSubmitting || !currentWorkspace} className="btn-primary min-w-[150px]" >
                            {isSubmitting ? "Creating…" : "Create Project"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateProjectDialog;
