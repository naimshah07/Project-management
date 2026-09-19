import { useState } from "react";
import { Calendar as CalendarIcon, XIcon, ListTodoIcon } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { format } from "date-fns";
import { useAuth } from "@clerk/clerk-react";
import api from "../configs/api";
import { addTask } from "../features/workspaceSlice";
import toast from "react-hot-toast";

export default function CreateTaskDialog({ showCreateTask, setShowCreateTask, projectId }) {

    const { getToken } = useAuth()
    const dispatch = useDispatch()


    const currentWorkspace = useSelector((state) => state.workspace?.currentWorkspace || null);
    const project = currentWorkspace?.projects.find((p) => p.id === projectId);
    const teamMembers = project?.members || [];

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        type: "TASK",
        status: "TODO",
        priority: "MEDIUM",
        assigneeId: "",
        due_date: "",
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true)
        try {
            const { data } = await api.post('/api/tasks', { ...formData, workspaceId: currentWorkspace.id, projectId },
                { headers: { Authorization: `Bearer ${await getToken()}` } })
            setShowCreateTask(false)
            setFormData({
                title: "",
                description: "",
                type: "TASK",
                status: "TODO",
                priority: "MEDIUM",
                assigneeId: "",
                due_date: "",
            })
            dispatch(addTask(data.task))
            toast.success(data.message)
        } catch (error) {
            toast.error(error.response?.data?.message || error.message)
        }
        finally {
            setIsSubmitting(false)
        }
    };

    return showCreateTask ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="card w-full max-w-md p-0 shadow-2xl [animation:zoom-in_0.25s_ease-out] overflow-hidden">
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border-soft">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-2xl bg-[linear-gradient(135deg,#6366f1_0%,#8b5cf6_100%)] text-white flex items-center justify-center shadow-[0_4px_14px_-4px_rgb(99_102_241_/_0.55)]">
                            <ListTodoIcon className="size-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-text tracking-tight">Create New Task</h2>
                            {project && (
                                <p className="muted-text text-xs">
                                    in <span className="text-accent font-medium">{project.name}</span>
                                </p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={() => setShowCreateTask(false)}
                        className="btn-ghost !size-9 !p-0 text-text-muted"
                        aria-label="Close"
                    >
                        <XIcon className="size-4.5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 p-6">
                    {/* Title */}
                    <div className="space-y-1.5">
                        <label htmlFor="title" className="text-xs muted-text uppercase tracking-wider font-semibold">Title</label>
                        <input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Wire up authentication flow" className="input" required />
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <label htmlFor="description" className="text-xs muted-text uppercase tracking-wider font-semibold">Description</label>
                        <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Add more context…" className="input !min-h-[90px]" />
                    </div>

                    {/* Type & Priority */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs muted-text uppercase tracking-wider font-semibold">Type</label>
                            <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="input" >
                                <option value="BUG">Bug</option>
                                <option value="FEATURE">Feature</option>
                                <option value="TASK">Task</option>
                                <option value="IMPROVEMENT">Improvement</option>
                                <option value="OTHER">Other</option>
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

                    {/* Assignee and Status */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs muted-text uppercase tracking-wider font-semibold">Assignee</label>
                            <select value={formData.assigneeId} onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })} className="input" >
                                <option value="">Unassigned</option>
                                {teamMembers.map((member) => (
                                    <option key={member?.user.id} value={member?.user.id}>
                                        {member?.user.email}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs muted-text uppercase tracking-wider font-semibold">Status</label>
                            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="input" >
                                <option value="TODO">To Do</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="DONE">Done</option>
                            </select>
                        </div>
                    </div>

                    {/* Due Date */}
                    <div className="space-y-1.5">
                        <label className="text-xs muted-text uppercase tracking-wider font-semibold">Due Date</label>
                        <div className="relative">
                            <CalendarIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4.5 text-text-muted pointer-events-none" />
                            <input type="date" value={formData.due_date} onChange={(e) => setFormData({ ...formData, due_date: e.target.value })} min={new Date().toISOString().split('T')[0]} className="input pl-10" />
                        </div>
                        {formData.due_date && (
                            <p className="text-xs muted-text flex items-center gap-1.5 pl-0.5">
                                <CalendarIcon className="size-3" />
                                {format(new Date(formData.due_date), "PPP")}
                            </p>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 pt-3 border-t border-border-soft -mx-6 px-6 pt-5">
                        <button type="button" onClick={() => setShowCreateTask(false)} className="btn-ghost" >
                            Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting} className="btn-primary min-w-[140px]" >
                            {isSubmitting ? "Creating…" : "Create Task"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    ) : null;
}
