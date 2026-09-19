import { format } from "date-fns";
import { Save, Plus, User2 } from "lucide-react";
import { useEffect, useState } from "react";
import AddProjectMember from "./AddProjectMember";
import { useDispatch } from "react-redux";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import api from "../configs/api";
import { fetchWorkspaces } from "../features/workspaceSlice";

const priorityChip = {
    LOW: "bg-[color-mix(in_srgb,var(--color-success)_14%,transparent)] text-success",
    MEDIUM: "bg-[color-mix(in_srgb,var(--color-warning)_14%,transparent)] text-warning",
    HIGH: "bg-[color-mix(in_srgb,var(--color-danger)_14%,transparent)] text-danger",
};

const statusChip = {
    PLANNING: "bg-[color-mix(in_srgb,var(--color-text-muted)_14%,transparent)] text-text-muted",
    ACTIVE: "bg-[color-mix(in_srgb,var(--color-success)_14%,transparent)] text-success",
    ON_HOLD: "bg-[color-mix(in_srgb,var(--color-warning)_14%,transparent)] text-warning",
    COMPLETED: "bg-[color-mix(in_srgb,var(--color-accent)_14%,transparent)] text-accent",
    CANCELLED: "bg-[color-mix(in_srgb,var(--color-danger)_14%,transparent)] text-danger",
};

export default function ProjectSettings({ project }) {

    const dispatch = useDispatch();
    const { getToken } = useAuth()


    const [formData, setFormData] = useState({
        name: "New Website Launch",
        description: "Initial launch for new web platform.",
        status: "PLANNING",
        priority: "MEDIUM",
        start_date: "2025-09-10",
        end_date: "2025-10-15",
        progress: 30,
    });

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true)
        toast.loading("Saving...")
        try {
            const { data } = await api.put('/api/projects', formData, { headers: { Authorization: `Bearer ${await getToken()}` } })
            setIsDialogOpen(false)
            dispatch(fetchWorkspaces({ getToken }))
            toast.dismissAll();
            toast.success(data.message)
        } catch (error) {
            toast.dismissAll();
            toast.error(error.response?.data?.message || error.message)
        }
        finally {
            setIsSubmitting(false)
        }
    };

    useEffect(() => {
        if (project) setFormData(project);
    }, [project]);

    const progressGradient = `linear-gradient(90deg, #6366f1 0%, #8b5cf6 ${formData.progress}%, rgb(203 213 225 / 0.4) ${formData.progress}%, rgb(203 213 225 / 0.4) 100%)`;

    return (
        <div className="grid lg:grid-cols-2 gap-6">
            {/* Project Details */}
            <div className="card p-6 space-y-5">
                <h2 className="section-title !text-base mb-0">Project Details</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name */}
                    <div className="space-y-2">
                        <label className="text-xs muted-text uppercase tracking-wider font-semibold">Project Name</label>
                        <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input" required />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-xs muted-text uppercase tracking-wider font-semibold">Description</label>
                        <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input !min-h-[100px]" />
                    </div>

                    {/* Status & Priority */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs muted-text uppercase tracking-wider font-semibold">Status</label>
                            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="input" >
                                <option value="PLANNING">Planning</option>
                                <option value="ACTIVE">Active</option>
                                <option value="ON_HOLD">On Hold</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                            <div className={`badge w-fit mt-1 ${statusChip[formData.status] || statusChip.PLANNING}`}>
                                Current: {formData.status.replace("_", " ")}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs muted-text uppercase tracking-wider font-semibold">Priority</label>
                            <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className="input" >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                            </select>
                            <div className={`badge w-fit mt-1 ${priorityChip[formData.priority] || priorityChip.MEDIUM}`}>
                                Current: {formData.priority}
                            </div>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="space-y-2 grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs muted-text uppercase tracking-wider font-semibold">Start Date</label>
                            <input type="date" value={format(formData.start_date, "yyyy-MM-dd")} onChange={(e) => setFormData({ ...formData, start_date: new Date(e.target.value) })} className="input" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs muted-text uppercase tracking-wider font-semibold">End Date</label>
                            <input type="date" value={format(formData.end_date, "yyyy-MM-dd")} onChange={(e) => setFormData({ ...formData, end_date: new Date(e.target.value) })} className="input" />
                        </div>
                    </div>

                    {/* Progress */}
                    <div className="space-y-3 p-4 rounded-2xl bg-bg-soft/60 border border-border-soft">
                        <div className="flex items-center justify-between">
                            <label className="text-xs muted-text uppercase tracking-wider font-semibold">Overall Progress</label>
                            <span className="badge bg-accent-soft text-accent font-semibold">{formData.progress}%</span>
                        </div>
                        <div className="h-3 w-full rounded-full overflow-hidden" style={{ background: progressGradient }} />
                        <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={formData.progress}
                            onChange={(e) => setFormData({ ...formData, progress: Number(e.target.value) })}
                            className="w-full accent-accent"
                        />
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end pt-1">
                        <button type="submit" disabled={isSubmitting} className="btn-primary gap-2" >
                            <Save className="size-4" /> {isSubmitting ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Team Members */}
            <div className="space-y-6">
                <div className="card p-6">
                    <div className="flex items-center justify-between gap-3 mb-5">
                        <h2 className="section-title !text-base mb-0">
                            Team Members <span className="muted-text text-sm font-normal">({project.members.length})</span>
                        </h2>
                        <button type="button" onClick={() => setIsDialogOpen(true)} className="btn-primary gap-1.5 !py-2 !px-3.5" title="Add member">
                            <Plus className="size-4" />
                            <span className="max-sm:hidden">Add</span>
                        </button>
                        <AddProjectMember isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />
                    </div>

                    {/* Member List */}
                    {project.members.length > 0 ? (
                        <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                            {project.members.map((member, index) => (
                                <div key={index} className="flex items-center justify-between px-3.5 py-3 rounded-xl bg-bg-soft/50 border border-border-soft hover:bg-bg-soft transition-colors group" >
                                    <div className="flex items-center gap-3 min-w-0">
                                        {member?.user?.image ? (
                                            <img src={member.user.image} className="size-9 rounded-xl ring-2 ring-border-soft shrink-0" alt="avatar" />
                                        ) : (
                                            <div className="size-9 rounded-xl bg-accent-soft text-accent flex items-center justify-center shrink-0 ring-2 ring-border-soft">
                                                <User2 className="size-4" />
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <span className="block text-sm font-medium text-text truncate">
                                                {member?.user?.name || "Unknown user"}
                                            </span>
                                            <span className="block text-xs muted-text truncate">
                                                {member?.user?.email || "No email on record"}
                                            </span>
                                        </div>
                                    </div>
                                    {project.team_lead === member.user.id && (
                                        <span className="badge bg-accent-soft text-accent font-semibold shrink-0">
                                            Team Lead
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-10 text-center rounded-2xl bg-bg-soft/60 border border-dashed border-border-soft muted-text text-sm">
                            No team members yet. Click Add to invite people.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
