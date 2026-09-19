import { FolderOpen, CheckCircle, Users, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function StatsGrid() {
    const currentWorkspace = useSelector(
        (state) => state?.workspace?.currentWorkspace || null
    );

    const [stats, setStats] = useState({
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        myTasks: 0,
        overdueIssues: 0,
    });

    const statCards = [
        {
            icon: FolderOpen,
            title: "Total Projects",
            value: stats.totalProjects,
            subtitle: `projects in ${currentWorkspace?.name || 'workspace'}`,
            gradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            ring: "6%",
        },
        {
            icon: CheckCircle,
            title: "Completed Tasks",
            value: stats.completedProjects,
            subtitle: `of ${stats.totalProjects} projects`,
            gradient: "linear-gradient(135deg, #10b981 0%, #14b8a6 100%)",
            ring: "6%",
        },
        {
            icon: Users,
            title: "My Tasks",
            value: stats.myTasks,
            subtitle: "assigned to me",
            gradient: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
            ring: "6%",
        },
        {
            icon: AlertTriangle,
            title: "Overdue",
            value: stats.overdueIssues,
            subtitle: "need attention",
            gradient: "linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)",
            ring: "6%",
        },
    ];

    useEffect(() => {
        if (currentWorkspace) {
            setStats({
                totalProjects: currentWorkspace.projects.length,
                activeProjects: currentWorkspace.projects.filter(
                    (p) => p.status !== "CANCELLED" && p.status !== "COMPLETED"
                ).length,
                completedProjects: currentWorkspace.projects
                    .filter((p) => p.status === "COMPLETED")
                    .reduce((acc, project) => acc + project.tasks.length, 0),
                myTasks: currentWorkspace.projects.reduce(
                    (acc, project) =>
                        acc +
                        project.tasks.filter(
                            (t) => t.assignee?.email === currentWorkspace.owner.email
                        ).length,
                    0
                ),
                overdueIssues: currentWorkspace.projects.reduce(
                    (acc, project) =>
                        acc + project.tasks.filter((t) => new Date(t.due_date) < new Date() && t.status !== "DONE").length,
                    0
                ),
            });
        }
    }, [currentWorkspace]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {statCards.map(
                // eslint-disable-next-line no-unused-vars
                ({ icon: Icon, title, value, subtitle, gradient }, i) => (
                    <div
                        key={i}
                        className="card p-5 group cursor-default"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                                <p className="muted-text mb-1.5">{title}</p>
                                <p className="text-3xl font-bold tracking-tight">
                                    {value}
                                </p>
                                {subtitle && (
                                    <p className="mt-1.5 muted-text text-xs truncate">
                                        {subtitle}
                                    </p>
                                )}
                            </div>
                            <div
                                className="shrink-0 size-12 rounded-xl flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform duration-200"
                                style={{ background: gradient, boxShadow: `0 6px 18px -4px color-mix(in srgb, ${gradient.split(',')[0].replace('linear-gradient(135deg, ', '')} 60%, transparent)` }}
                            >
                                <Icon size={22} strokeWidth={2.2} />
                            </div>
                        </div>
                    </div>
                )
            )}
        </div>
    );
}
