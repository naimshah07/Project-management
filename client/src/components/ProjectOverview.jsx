import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, UsersIcon, FolderOpen } from "lucide-react";
import { format } from "date-fns";
import { useSelector } from "react-redux";
import CreateProjectDialog from "./CreateProjectDialog";

const ProjectOverview = () => {
    const statusStyles = {
        PLANNING: { bg: "color-mix(in srgb, #a78bfa 18%, transparent)", text: "#7c3aed" },
        ACTIVE: { bg: "color-mix(in srgb, #10b981 18%, transparent)", text: "#059669" },
        ON_HOLD: { bg: "color-mix(in srgb, #f59e0b 18%, transparent)", text: "#d97706" },
        COMPLETED: { bg: "color-mix(in srgb, #3b82f6 18%, transparent)", text: "#2563eb" },
        CANCELLED: { bg: "color-mix(in srgb, #ef4444 18%, transparent)", text: "#dc2626" },
    };

    const priorityColors = {
        LOW: "#94a3b8",
        MEDIUM: "#f59e0b",
        HIGH: "#ef4444",
    };

    const currentWorkspace = useSelector((state) => state?.workspace?.currentWorkspace || null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        setProjects(currentWorkspace?.projects || []);
    }, [currentWorkspace]);

    return currentWorkspace && (
        <div className="card overflow-hidden">
            <div className="px-6 py-5 flex items-center justify-between border-b border-border dark:border-border">
                <div>
                    <h2 className="section-title">Project Overview</h2>
                    <p className="muted-text mt-0.5">Recent projects in this workspace</p>
                </div>
                <Link to={'/projects'} className="btn-ghost">
                    View all <ArrowRight className="size-4" />
                </Link>
            </div>

            <div>
                {projects.length === 0 ? (
                    <div className="p-14 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: 'var(--color-accent-soft)' }}>
                            <FolderOpen size={30} style={{ color: 'var(--color-accent)' }} strokeWidth={2} />
                        </div>
                        <p className="text-text-soft mb-1">No projects yet</p>
                        <p className="muted-text mb-5">Create your first project to get started</p>
                        <button onClick={() => setIsDialogOpen(true)} className="btn-primary">
                            <FolderOpen size={16} strokeWidth={2.5} />
                            Create Project
                        </button>
                        <CreateProjectDialog isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />
                    </div>
                ) : (
                    <div className="divide-y divide-border dark:divide-border">
                        {projects.slice(0, 5).map((project) => (
                            <Link
                                key={project.id}
                                to={`/projectsDetail?id=${project.id}&tab=tasks`}
                                className="block px-6 py-5 hover:bg-border-soft dark:hover:bg-border-soft transition-colors"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1 min-w-0 pr-4">
                                        <h3 className="font-semibold text-text mb-1 group-hover:text-accent">
                                            {project.name}
                                        </h3>
                                        <p className="text-text-soft text-sm line-clamp-2">
                                            {project.description || 'No description'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span
                                            className="badge"
                                            style={{ background: statusStyles[project.status]?.bg, color: statusStyles[project.status]?.text }}
                                        >
                                            {project.status.replace('_', ' ').replaceAll(/\b\w/g, c => c.toUpperCase())}
                                        </span>
                                        <div
                                            className="size-2.5 rounded-full"
                                            style={{ background: priorityColors[project.priority] }}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mb-3 text-xs text-text-muted">
                                    <div className="flex items-center gap-4">
                                        {project.members?.length > 0 && (
                                            <div className="flex items-center gap-1.5">
                                                <UsersIcon className="size-3.5" strokeWidth={2} />
                                                {project.members.length} members
                                            </div>
                                        )}
                                        {project.end_date && (
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="size-3.5" strokeWidth={2} />
                                                {format(new Date(project.end_date), "MMM d, yyyy")}
                                            </div>
                                        )}
                                    </div>
                                    <span className="font-medium text-text-soft">{project.progress || 0}%</span>
                                </div>

                                <div className="w-full h-1.5 rounded-full bg-border-soft dark:bg-border-soft overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all"
                                        style={{
                                            width: `${project.progress || 0}%`,
                                            background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)'
                                        }}
                                    />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProjectOverview;
