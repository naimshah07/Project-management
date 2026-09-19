import { format } from "date-fns";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CalendarIcon, MessageCircle, PenIcon, SendIcon, User2 } from "lucide-react";
import { useAuth, useUser } from "@clerk/clerk-react";
import api from "../configs/api";

const statusChip = {
    TODO: "bg-border-soft text-text-soft",
    IN_PROGRESS: "bg-[color-mix(in_srgb,var(--color-warning)_14%,transparent)] text-warning",
    DONE: "bg-[color-mix(in_srgb,var(--color-success)_14%,transparent)] text-success",
};

const typeChip = {
    BUG: "bg-[color-mix(in_srgb,var(--color-danger)_14%,transparent)] text-danger",
    FEATURE: "bg-[color-mix(in_srgb,var(--color-accent)_14%,transparent)] text-accent",
    TASK: "bg-[color-mix(in_srgb,var(--color-success)_14%,transparent)] text-success",
    IMPROVEMENT: "bg-[color-mix(in_srgb,#8b5cf6_14%,transparent)] text-[#8b5cf6]",
    OTHER: "bg-[color-mix(in_srgb,var(--color-warning)_14%,transparent)] text-warning",
};

const priorityChip = {
    LOW: "bg-[color-mix(in_srgb,var(--color-success)_14%,transparent)] text-success",
    MEDIUM: "bg-[color-mix(in_srgb,var(--color-warning)_14%,transparent)] text-warning",
    HIGH: "bg-[color-mix(in_srgb,var(--color-danger)_14%,transparent)] text-danger",
};

const projectStatusChip = {
    PLANNING: "bg-[color-mix(in_srgb,var(--color-text-muted)_14%,transparent)] text-text-muted",
    ACTIVE: "bg-[color-mix(in_srgb,var(--color-success)_14%,transparent)] text-success",
    ON_HOLD: "bg-[color-mix(in_srgb,var(--color-warning)_14%,transparent)] text-warning",
    COMPLETED: "bg-[color-mix(in_srgb,var(--color-accent)_14%,transparent)] text-accent",
    CANCELLED: "bg-[color-mix(in_srgb,var(--color-danger)_14%,transparent)] text-danger",
};

const TaskDetails = () => {

    const [searchParams] = useSearchParams();
    const projectId = searchParams.get("projectId");
    const taskId = searchParams.get("taskId");

    const user = useUser()
    const { getToken } = useAuth()
    const [task, setTask] = useState(null);
    const [project, setProject] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);

    const { currentWorkspace } = useSelector((state) => state.workspace);

    const fetchComments = async () => {
        if (!taskId) return
        try {
            const token = await getToken()
            const { data } = await api.get(`/api/comments/${taskId}`, { headers: { Authorization: `Bearer ${token}` } })
            setComments(data.comments || [])
        } catch (error) {
            toast.error(error?.response?.data?.message || error.message);
        }

    };

    const fetchTaskDetails = async () => {
        setLoading(true);
        if (!projectId || !taskId) return;

        const proj = currentWorkspace.projects.find((p) => p.id === projectId);
        if (!proj) return;

        const tsk = proj.tasks.find((t) => t.id === taskId);
        if (!tsk) return;

        setTask(tsk);
        setProject(proj);
        setLoading(false);
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        try {

            toast.loading("Adding comment...");

            const token = await getToken()
            const { data } = await api.post(`/api/comments`,{ taskId: task.id, content: newComment },{ headers: { Authorization: `Bearer ${token}` } })
            setComments((prev) => [...prev, data.comment]);
            setNewComment("");
            toast.dismissAll();
            toast.success("Comment added.");
        } catch (error) {
            toast.dismissAll();
            toast.error(error?.response?.data?.message || error.message);
            console.error(error);
        }
    };

    useEffect(() => { fetchTaskDetails(); }, [taskId]);

    useEffect(() => {
        if (taskId && task) {
            fetchComments();
            const interval = setInterval(() => { fetchComments(); }, 10000);
            return () => clearInterval(interval);
        }
    }, [taskId, task]);

    if (loading) return <div className="muted-text px-4 py-10 text-center">Loading task details...</div>;
    if (!task) return <div className="text-danger px-4 py-10 text-center font-medium">Task not found.</div>;

    return (
        <div className="flex flex-col-reverse lg:flex-row gap-6 max-w-6xl mx-auto">
            {/* Left: Comments / Chatbox */}
            <div className="w-full lg:w-2/3">
                <div className="card p-5 flex flex-col lg:h-[80vh]">
                    <h2 className="text-base font-semibold flex items-center gap-2.5 mb-5 text-text">
                        <div className="size-9 rounded-xl bg-accent-soft text-accent flex items-center justify-center">
                            <MessageCircle className="size-4.5" />
                        </div>
                        Task Discussion
                        <span className="badge bg-accent-soft text-accent ml-1">{comments.length}</span>
                    </h2>

                    <div className="flex-1 md:overflow-y-auto no-scrollbar">
                        {comments.length > 0 ? (
                            <div className="flex flex-col gap-4 mb-6 mr-2">
                                {comments.map((comment) => {
                                    const commentUser = comment?.user || {};
                                    const isOwnComment = commentUser?.id === user?.id;

                                    return (
                                        <div key={comment.id} className={`sm:max-w-[85%] card !p-0 border-0 !rounded-2xl ${isOwnComment ? "ml-auto [background:linear-gradient(135deg,#6366f1_0%,#8b5cf6_100%)] text-white shadow-[0_4px_14px_-4px_rgb(99_102_241_/_0.45)]" : "mr-auto"}`} >
                                            <div className={`p-3.5 rounded-2xl`}>
                                                <div className={`flex items-center gap-2 mb-1.5 text-xs ${isOwnComment ? 'text-white/80' : 'text-text-muted'}`}>
                                                    {commentUser.image ? (
                                                        <img src={commentUser.image} alt="avatar" className="size-5 rounded-full ring-2 ring-white/20" />
                                                    ) : (
                                                        <div className="size-5 rounded-full bg-accent-soft text-accent flex items-center justify-center text-[10px] font-bold">
                                                            {(commentUser.name || "U").charAt(0)}
                                                        </div>
                                                    )}
                                                    <span className={`font-semibold ${isOwnComment ? 'text-white' : 'text-text'}`}>{commentUser.name || "Unknown user"}</span>
                                                    <span className={isOwnComment ? 'text-white/60' : 'text-text-muted'}>
                                                        • {format(new Date(comment.createdAt), "dd MMM yyyy, HH:mm")}
                                                    </span>
                                                </div>
                                                <p className={`text-sm leading-relaxed ${isOwnComment ? 'text-white/95' : 'text-text-soft'}`}>{comment.content}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="muted-text mb-4 text-sm py-10 text-center rounded-2xl bg-bg-soft/60 border border-dashed border-border-soft">
                                No comments yet. Be the first to start the discussion!
                            </div>
                        )}
                    </div>

                    {/* Add Comment */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 mt-4 pt-4 border-t border-border-soft">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write a comment..."
                            className="input flex-1 resize-none"
                            rows={3}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAddComment();
                            }}
                        />
                        <button onClick={handleAddComment} className="btn-primary gap-2 justify-center" >
                            <SendIcon className="size-4" />
                            Post
                        </button>
                    </div>
                </div>
            </div>

            {/* Right: Task + Project Info */}
            <div className="w-full lg:w-1/2 flex flex-col gap-6">
                {/* Task Info */}
                <div className="card p-6 space-y-5">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-text">{task.title}</h1>
                        <div className="flex flex-wrap gap-2 mt-3">
                            <span className={`badge ${statusChip[task.status] || statusChip.TODO}`}>
                                {task.status.replace("_", " ")}
                            </span>
                            <span className={`badge ${typeChip[task.type] || typeChip.OTHER} uppercase`}>
                                {task.type}
                            </span>
                            <span className={`badge ${priorityChip[task.priority] || priorityChip.MEDIUM}`}>
                                {task.priority}
                            </span>
                        </div>
                    </div>

                    {task.description && (
                        <p className="text-sm text-text-soft leading-relaxed rounded-xl bg-bg-soft/50 p-4 border border-border-soft">
                            {task.description}
                        </p>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-bg-soft/50 border border-border-soft">
                            {task.assignee?.image ? (
                                <img src={task.assignee.image} className="size-7 rounded-full ring-2 ring-border-soft" alt="avatar" />
                            ) : (
                                <div className="size-7 rounded-full bg-accent-soft text-accent flex items-center justify-center text-xs font-bold ring-2 ring-border-soft">
                                    <User2 className="size-4" />
                                </div>
                            )}
                            <div className="flex flex-col min-w-0">
                                <span className="muted-text text-[10px] uppercase tracking-wider">Assignee</span>
                                <span className="font-medium text-text truncate">{task.assignee?.name || "Unassigned"}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-bg-soft/50 border border-border-soft">
                            <div className="size-7 rounded-full bg-[color-mix(in_srgb,var(--color-warning)_14%,transparent)] text-warning flex items-center justify-center ring-2 ring-border-soft">
                                <CalendarIcon className="size-4" />
                            </div>
                            <div className="flex flex-col">
                                <span className="muted-text text-[10px] uppercase tracking-wider">Due Date</span>
                                <span className="font-medium text-text">{format(new Date(task.due_date), "dd MMM yyyy")}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Project Info */}
                {project && (
                    <div className="card p-6 text-text">
                        <p className="section-title mb-4 !text-sm">Project Context</p>
                        <h2 className="text-text flex items-center gap-2 text-lg font-semibold mb-4">
                            <span className="size-8 rounded-xl bg-accent-soft text-accent flex items-center justify-center shrink-0">
                                <PenIcon className="size-4" />
                            </span>
                            {project.name}
                        </h2>
                        <div className="rounded-xl bg-bg-soft/50 border border-border-soft p-4 space-y-2.5">
                            <p className="text-xs muted-text">
                                <span className="text-text-muted font-medium">Project Start Date:</span>{" "}
                                <span className="text-text-soft">{format(new Date(project.start_date), "dd MMM yyyy")}</span>
                            </p>
                            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
                                <span className={`badge ${projectStatusChip[project.status] || projectStatusChip.PLANNING} font-medium`}>
                                    Status · {project.status.replace("_", " ")}
                                </span>
                                <span className={`badge ${priorityChip[project.priority] || priorityChip.MEDIUM} font-medium`}>
                                    Priority · {project.priority}
                                </span>
                                <span className="badge bg-border-soft text-text-soft font-medium">
                                    Progress · {project.progress}%
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaskDetails;
