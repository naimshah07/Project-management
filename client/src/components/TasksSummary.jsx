import { useEffect, useState } from "react";
import { ArrowRight, Clock, AlertTriangle, User } from "lucide-react";
import { useSelector } from "react-redux";
import { useUser } from "@clerk/clerk-react";

const typeStyles = {
    BUG: { bg: "color-mix(in srgb, #ef4444 16%, transparent)", fg: "#dc2626" },
    FEATURE: { bg: "color-mix(in srgb, #3b82f6 16%, transparent)", fg: "#2563eb" },
    TASK: { bg: "color-mix(in srgb, #10b981 16%, transparent)", fg: "#059669" },
    IMPROVEMENT: { bg: "color-mix(in srgb, #8b5cf6 16%, transparent)", fg: "#7c3aed" },
    OTHER: { bg: "color-mix(in srgb, #f59e0b 16%, transparent)", fg: "#d97706" },
};

export default function TasksSummary() {

    const { currentWorkspace } = useSelector((state) => state.workspace);
    const { user } = useUser();
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        if (currentWorkspace) {
            setTasks(currentWorkspace.projects.flatMap((project) => project.tasks));
        }
    }, [currentWorkspace]);

    const myTasks = tasks.filter((task) => {
        const assigneeId = task?.assigneeId || task?.assignee?.id;
        return assigneeId && user?.id && assigneeId === user.id;
    });
    const overdueTasks = tasks.filter((task) => task.due_date && new Date(task.due_date) < new Date() && task.status !== 'DONE');
    const inProgressIssues = tasks.filter((task) => task.status === 'IN_PROGRESS');

    const summaryCards = [
        {
            title: "My Tasks",
            count: myTasks.length,
            icon: User,
            accent: "linear-gradient(135deg, #10b981 0%, #14b8a6 100%)",
            items: myTasks.slice(0, 3)
        },
        {
            title: "Overdue",
            count: overdueTasks.length,
            icon: AlertTriangle,
            accent: "linear-gradient(135deg, #ef4444 0%, #ec4899 100%)",
            items: overdueTasks.slice(0, 3)
        },
        {
            title: "In Progress",
            count: inProgressIssues.length,
            icon: Clock,
            accent: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
            items: inProgressIssues.slice(0, 3)
        }
    ];

    return (
        <div className="space-y-5">
            {summaryCards.map((card) => (
                <div key={card.title} className="card overflow-hidden">
                    <div className="px-5 py-4 flex items-center gap-3 border-b border-border dark:border-border">
                        <div
                            className="shrink-0 size-10 rounded-xl flex items-center justify-center text-white shadow-sm"
                            style={{ background: card.accent }}
                        >
                            <card.icon className="size-4.5" strokeWidth={2.2} />
                        </div>
                        <div className="flex items-center justify-between flex-1">
                            <h3 className="section-title">{card.title}</h3>
                            <span
                                className="badge font-semibold text-white text-xs"
                                style={{ background: card.accent }}
                            >
                                {card.count}
                            </span>
                        </div>
                    </div>
                    <div className="p-4">
                        {card.items.length === 0 ? (
                            <div className="py-5 text-center">
                                <p className="text-text-soft text-sm mb-1">No {card.title.toLowerCase()}</p>
                                <p className="muted-text">You're all caught up!</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {card.items.map((issue) => {
                                    const ts = typeStyles[issue.type] || typeStyles.TASK;
                                    return (
                                        <div
                                            key={issue.id}
                                            className="p-3.5 rounded-xl hover:bg-border-soft dark:hover:bg-border-soft transition-colors cursor-pointer border border-transparent hover:border-border"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <h4 className="text-sm font-medium text-text truncate flex-1">
                                                    {issue.title}
                                                </h4>
                                            </div>
                                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                <span
                                                    className="badge"
                                                    style={{ background: ts.bg, color: ts.fg }}
                                                >
                                                    {issue.type}
                                                </span>
                                                <span className="muted-text">• {issue.priority} priority</span>
                                            </div>
                                        </div>
                                    )
                                })}
                                {card.count > 3 && (
                                    <button className="btn-ghost w-full justify-center mt-1">
                                        View {card.count - 3} more <ArrowRight className="size-3.5" />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
