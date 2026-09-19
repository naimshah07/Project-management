import { useEffect, useState } from "react";
import { GitCommit, MessageSquare, Clock, Bug, Zap, Square } from "lucide-react";
import { format } from "date-fns";
import { useSelector } from "react-redux";

const typeStyles = {
    BUG: { bg: "color-mix(in srgb, #ef4444 16%, transparent)", fg: "#dc2626", icon: Bug },
    FEATURE: { bg: "color-mix(in srgb, #3b82f6 16%, transparent)", fg: "#2563eb", icon: Zap },
    TASK: { bg: "color-mix(in srgb, #10b981 16%, transparent)", fg: "#059669", icon: Square },
    IMPROVEMENT: { bg: "color-mix(in srgb, #8b5cf6 16%, transparent)", fg: "#7c3aed", icon: MessageSquare },
    OTHER: { bg: "color-mix(in srgb, #f59e0b 16%, transparent)", fg: "#d97706", icon: GitCommit },
};

const statusStyles = {
    TODO: { bg: "color-mix(in srgb, #64748b 16%, transparent)", fg: "#475569" },
    IN_PROGRESS: { bg: "color-mix(in srgb, #f59e0b 16%, transparent)", fg: "#d97706" },
    DONE: { bg: "color-mix(in srgb, #10b981 16%, transparent)", fg: "#059669" },
};

const RecentActivity = () => {
    const [tasks, setTasks] = useState([]);
    const { currentWorkspace } = useSelector((state) => state.workspace);

    useEffect(() => {
        if (!currentWorkspace) return;
        const allTasks = currentWorkspace.projects.flatMap((project) => project.tasks.map((task) => task));
        setTasks(allTasks.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 8));
    }, [currentWorkspace]);

    return (
        <div className="card overflow-hidden">
            <div className="px-6 py-5 border-b border-border dark:border-border flex items-center justify-between">
                <div>
                    <h2 className="section-title">Recent Activity</h2>
                    <p className="muted-text mt-0.5">Latest updates across all projects</p>
                </div>
            </div>

            <div>
                {tasks.length === 0 ? (
                    <div className="p-14 text-center">
                        <div
                            className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                            style={{ background: 'color-mix(in srgb, #6366f1 12%, transparent)' }}
                        >
                            <Clock size={30} strokeWidth={2} style={{ color: 'var(--color-accent)' }} />
                        </div>
                        <p className="text-text-soft mb-1">No recent activity</p>
                        <p className="muted-text">Activity from your tasks will appear here</p>
                    </div>
                ) : (
                    <div className="divide-y divide-border dark:divide-border">
                        {tasks.map((task) => {
                            const ts = typeStyles[task.type] || typeStyles.TASK;
                            const TypeIcon = ts.icon;
                            const ss = statusStyles[task.status] || statusStyles.TODO;

                            return (
                                <div key={task.id} className="px-6 py-4 hover:bg-border-soft dark:hover:bg-border-soft transition-colors">
                                    <div className="flex items-start gap-4">
                                        <div
                                            className="shrink-0 size-10 rounded-xl flex items-center justify-center"
                                            style={{ background: ts.bg }}
                                        >
                                            <TypeIcon size={17} strokeWidth={2.2} style={{ color: ts.fg }} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between mb-2 gap-3">
                                                <h4 className="text-text font-medium truncate flex-1">
                                                    {task.title}
                                                </h4>
                                                <span
                                                    className="badge shrink-0"
                                                    style={{ background: ss.bg, color: ss.fg }}
                                                >
                                                    {task.status.replace("_", " ")}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-text-muted flex-wrap">
                                                <span
                                                    className="badge"
                                                    style={{ background: ts.bg, color: ts.fg }}
                                                >
                                                    {task.type}
                                                </span>
                                                {task.assignee && (
                                                    <div className="flex items-center gap-1.5">
                                                        <div
                                                            className="w-4.5 h-4.5 rounded-full flex items-center justify-center text-[10px] font-semibold text-white"
                                                            style={{ background: 'var(--color-accent)' }}
                                                        >
                                                            {task.assignee.name?.[0]?.toUpperCase()}
                                                        </div>
                                                        <span className="truncate">{task.assignee.name}</span>
                                                    </div>
                                                )}
                                                <span className="shrink-0">
                                                    {format(new Date(task.updatedAt), "MMM d, h:mm a")}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecentActivity;
