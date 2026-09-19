import { format } from "date-fns";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { deleteTask, updateTask } from "../features/workspaceSlice";
import { Bug, CalendarIcon, GitCommit, Inbox, MessageSquare, Square, Trash, XIcon, Zap } from "lucide-react";
import { useAuth } from "@clerk/clerk-react";
import api from "../configs/api";

const typeStyles = {
    BUG: { icon: Bug, chip: "bg-[color-mix(in_srgb,var(--color-danger)_14%,transparent)] text-danger" },
    FEATURE: { icon: Zap, chip: "bg-[color-mix(in_srgb,var(--color-accent)_14%,transparent)] text-accent" },
    TASK: { icon: Square, chip: "bg-[color-mix(in_srgb,var(--color-success)_14%,transparent)] text-success" },
    IMPROVEMENT: { icon: GitCommit, chip: "bg-[color-mix(in_srgb,#8b5cf6_14%,transparent)] text-[#8b5cf6]" },
    OTHER: { icon: MessageSquare, chip: "bg-[color-mix(in_srgb,var(--color-warning)_14%,transparent)] text-warning" },
};

const priorityStyles = {
    LOW: "bg-[color-mix(in_srgb,var(--color-success)_14%,transparent)] text-success",
    MEDIUM: "bg-[color-mix(in_srgb,var(--color-warning)_14%,transparent)] text-warning",
    HIGH: "bg-[color-mix(in_srgb,var(--color-danger)_14%,transparent)] text-danger",
};

const statusChips = {
    TODO: "bg-border-soft text-text-soft",
    IN_PROGRESS: "bg-[color-mix(in_srgb,var(--color-warning)_14%,transparent)] text-warning",
    DONE: "bg-[color-mix(in_srgb,var(--color-success)_14%,transparent)] text-success",
};

const ProjectTasks = ({ tasks }) => {

    const { getToken } = useAuth()
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [selectedTasks, setSelectedTasks] = useState([]);

    const [filters, setFilters] = useState({
        status: "",
        type: "",
        priority: "",
        assignee: "",
    });

    const assigneeList = useMemo(
        () => Array.from(new Set(tasks.map((t) => t.assignee?.name).filter(Boolean))),
        [tasks]
    );

    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            const { status, type, priority, assignee } = filters;
            return (
                (!status || task.status === status) &&
                (!type || task.type === type) &&
                (!priority || task.priority === priority) &&
                (!assignee || task.assignee?.name === assignee)
            );
        });
    }, [filters, tasks]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            toast.loading("Updating status...");
            const token = await getToken()

            await api.put(`/api/tasks/${taskId}`, { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            let updatedTask = structuredClone(tasks.find((t) => t.id === taskId));
            updatedTask.status = newStatus;
            dispatch(updateTask(updatedTask));

            toast.dismissAll();
            toast.success("Task status updated successfully");
        } catch (error) {
            toast.dismissAll();
            toast.error(error?.response?.data?.message || error.message);
        }
    };

    const handleDelete = async () => {
        try {
            const confirm = window.confirm("Are you sure you want to delete the selected tasks?");
            if (!confirm) return;
            const token = await getToken()

            toast.loading("Deleting tasks...");

            await api.post('/api/tasks/delete', { tasksIds: selectedTasks }, { headers: { Authorization: `Bearer ${token}` } })

            dispatch(deleteTask(selectedTasks));

            toast.dismissAll();
            toast.success("Tasks deleted successfully");
        } catch (error) {
            toast.dismissAll();
            toast.error(error?.response?.data?.message || error.message);
        }
    };

    return (
        <div className="space-y-5">
            {/* Filters */}
            <div className="card p-4">
                <div className="flex flex-wrap items-center gap-3">
                    {["status", "type", "priority", "assignee"].map((name) => {
                        const options = {
                            status: [
                                { label: "All Statuses", value: "" },
                                { label: "To Do", value: "TODO" },
                                { label: "In Progress", value: "IN_PROGRESS" },
                                { label: "Done", value: "DONE" },
                            ],
                            type: [
                                { label: "All Types", value: "" },
                                { label: "Task", value: "TASK" },
                                { label: "Bug", value: "BUG" },
                                { label: "Feature", value: "FEATURE" },
                                { label: "Improvement", value: "IMPROVEMENT" },
                                { label: "Other", value: "OTHER" },
                            ],
                            priority: [
                                { label: "All Priorities", value: "" },
                                { label: "Low", value: "LOW" },
                                { label: "Medium", value: "MEDIUM" },
                                { label: "High", value: "HIGH" },
                            ],
                            assignee: [
                                { label: "All Assignees", value: "" },
                                ...assigneeList.map((n) => ({ label: n, value: n })),
                            ],
                        };
                        return (
                            <select key={name} name={name} onChange={handleFilterChange} className="input !py-2 min-w-[160px]" >
                                {options[name].map((opt, idx) => (
                                    <option key={idx} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        );
                    })}

                    <div className="ml-auto flex items-center gap-2">
                        {/* Reset filters */}
                        {(filters.status || filters.type || filters.priority || filters.assignee) && (
                            <button type="button" onClick={() => setFilters({ status: "", type: "", priority: "", assignee: "" })} className="btn-ghost gap-2 !py-2" >
                                <XIcon className="size-3.5" /> Reset
                            </button>
                        )}

                        {selectedTasks.length > 0 && (
                            <button type="button" onClick={handleDelete} className="btn-primary !py-2 gap-2 [background:linear-gradient(135deg,#ef4444_0%,#dc2626_100%)] [box-shadow:0_4px_14px_-4px_rgb(239_68_68_/_0.55)]" >
                                <Trash className="size-3.5" /> Delete ({selectedTasks.length})
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Tasks Table */}
            <div className="card overflow-hidden !p-0">
                <div className="w-full">
                    {/* Desktop/Table View */}
                    <div className="hidden lg:block overflow-x-auto">
                        <table className="min-w-full text-sm text-left">
                            <thead className="text-xs uppercase tracking-wider bg-bg-soft text-text-muted">
                                <tr>
                                    <th className="pl-5 pr-2 py-4">
                                        <input onChange={() => selectedTasks.length > 1 ? setSelectedTasks([]) : setSelectedTasks(tasks.map((t) => t.id))} checked={selectedTasks.length === tasks.length && tasks.length > 0} type="checkbox" className="accent-accent size-3.5" />
                                    </th>
                                    <th className="px-4 pl-0 py-4 font-semibold">Title</th>
                                    <th className="px-4 py-4 font-semibold">Type</th>
                                    <th className="px-4 py-4 font-semibold">Priority</th>
                                    <th className="px-4 py-4 font-semibold">Status</th>
                                    <th className="px-4 py-4 font-semibold">Assignee</th>
                                    <th className="px-5 py-4 font-semibold">Due Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTasks.length > 0 ? (
                                    filteredTasks.map((task) => {
                                        const style = typeStyles[task.type] || typeStyles.OTHER;
                                        const Icon = style.icon;
                                        const priorityChip = priorityStyles[task.priority] || priorityStyles.LOW;
                                        const statusChip = statusChips[task.status] || statusChips.TODO;

                                        return (
                                            <tr key={task.id} onClick={() => navigate(`/taskDetails?projectId=${task.projectId}&taskId=${task.id}`)} className=" border-t border-border-soft group hover:bg-bg-soft/60 transition-all cursor-pointer" >
                                                <td onClick={e => e.stopPropagation()} className="pl-5 pr-2 py-3.5">
                                                    <input type="checkbox" className="accent-accent size-3.5" onChange={() => selectedTasks.includes(task.id) ? setSelectedTasks(selectedTasks.filter((i) => i !== task.id)) : setSelectedTasks((prev) => [...prev, task.id])} checked={selectedTasks.includes(task.id)} />
                                                </td>
                                                <td className="px-4 pl-0 py-3.5">
                                                    <span className="font-medium text-text group-hover:text-accent transition-colors">{task.title}</span>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <span className={`inline-flex items-center gap-1.5 badge ${style.chip}`}>
                                                        {Icon && <Icon className="size-3" />}
                                                        <span className="uppercase">{task.type}</span>
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <span className={`badge ${priorityChip}`}>
                                                        {task.priority}
                                                    </span>
                                                </td>
                                                <td onClick={e => e.stopPropagation()} className="px-4 py-3.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`badge ${statusChip} font-medium`}>
                                                            {task.status.replace('_', ' ')}
                                                        </span>
                                                        <select name="status" onChange={(e) => handleStatusChange(task.id, e.target.value)} value={task.status} className="input !py-1 !px-2 !text-xs !shadow-none !bg-bg-soft min-w-[110px] cursor-pointer" >
                                                            <option value="TODO">To Do</option>
                                                            <option value="IN_PROGRESS">In Progress</option>
                                                            <option value="DONE">Done</option>
                                                        </select>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-2.5">
                                                        {task.assignee?.image ? (
                                                            <img src={task.assignee.image} className="size-6 rounded-full ring-2 ring-border-soft" alt="avatar" />
                                                        ) : (
                                                            <div className="size-6 rounded-full bg-accent-soft text-accent flex items-center justify-center text-[10px] font-bold ring-2 ring-border-soft">
                                                                {(task.assignee?.name || "A").charAt(0)}
                                                            </div>
                                                        )}
                                                        <span className="text-text-soft text-sm">{task.assignee?.name || "-"}</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center gap-1.5 text-text-muted">
                                                        <CalendarIcon className="size-4" />
                                                        {format(new Date(task.due_date), "dd MMM")}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center py-14">
                                            <div className="flex flex-col items-center gap-3 text-text-muted">
                                                <div className="size-14 rounded-2xl bg-accent-soft flex items-center justify-center">
                                                    <Inbox className="size-7 text-accent" />
                                                </div>
                                                <div className="text-sm">No tasks found for the selected filters.</div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile/Card View */}
                    <div className="lg:hidden p-4 flex flex-col gap-3">
                        {filteredTasks.length > 0 ? (
                            filteredTasks.map((task) => {
                                const style = typeStyles[task.type] || typeStyles.OTHER;
                                const Icon = style.icon;
                                const priorityChip = priorityStyles[task.priority] || priorityStyles.LOW;

                                return (
                                    <div key={task.id} onClick={() => navigate(`/taskDetails?projectId=${task.projectId}&taskId=${task.id}`)} className="card !p-4 flex flex-col gap-3 cursor-pointer hover:border-accent/40 transition-colors">
                                        <div className="flex items-start justify-between gap-3">
                                            <h3 className="text-text text-sm font-semibold leading-snug">{task.title}</h3>
                                            <input onClick={e => e.stopPropagation()} type="checkbox" className="accent-accent size-4 mt-0.5" onChange={() => selectedTasks.includes(task.id) ? setSelectedTasks(selectedTasks.filter((i) => i !== task.id)) : setSelectedTasks((prev) => [...prev, task.id])} checked={selectedTasks.includes(task.id)} />
                                        </div>

                                        <div className="flex items-center flex-wrap gap-2">
                                            <span className={`badge ${style.chip}`}>
                                                {Icon && <Icon className="size-3" />}
                                                <span className="uppercase">{task.type}</span>
                                            </span>
                                            <span className={`badge ${priorityChip}`}>
                                                {task.priority}
                                            </span>
                                            <span className={`badge ${statusChips[task.status] || statusChips.TODO}`}>
                                                {task.status.replace('_', ' ')}
                                            </span>
                                        </div>

                                        <div onClick={e => e.stopPropagation()}>
                                            <label className="text-xs muted-text block mb-1.5">Status</label>
                                            <select name="status" onChange={(e) => handleStatusChange(task.id, e.target.value)} value={task.status} className="input w-full" >
                                                <option value="TODO">To Do</option>
                                                <option value="IN_PROGRESS">In Progress</option>
                                                <option value="DONE">Done</option>
                                            </select>
                                        </div>

                                        <div className="flex items-center justify-between pt-1 border-t border-border-soft">
                                            <div className="flex items-center gap-2 text-sm text-text-soft">
                                                {task.assignee?.image ? (
                                                    <img src={task.assignee.image} className="size-5 rounded-full ring-2 ring-border-soft" alt="avatar" />
                                                ) : (
                                                    <div className="size-5 rounded-full bg-accent-soft text-accent flex items-center justify-center text-[10px] font-bold">
                                                        {(task.assignee?.name || "A").charAt(0)}
                                                    </div>
                                                )}
                                                <span className="text-xs">{task.assignee?.name || "-"}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs muted-text">
                                                <CalendarIcon className="size-3.5" />
                                                {format(new Date(task.due_date), "dd MMM")}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="card !py-12 !flex !flex-col !items-center !gap-3 text-text-muted">
                                <div className="size-14 rounded-2xl bg-accent-soft flex items-center justify-center">
                                    <Inbox className="size-7 text-accent" />
                                </div>
                                <p className="text-sm">No tasks found for the selected filters.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectTasks;
