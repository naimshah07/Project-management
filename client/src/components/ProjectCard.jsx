import { Link } from "react-router-dom";

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

const ProjectCard = ({ project }) => {
    return (
        <Link to={`/projectsDetail?id=${project.id}&tab=tasks`} className="card p-6 flex flex-col h-full group">
            <div className="flex items-start justify-between mb-2 gap-3">
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-text mb-1 truncate group-hover:text-accent transition-colors" style={{ '--tw-text-opacity': 1 }}>
                        {project.name}
                    </h3>
                </div>
                <div
                    className="size-2.5 rounded-full shrink-0 mt-2"
                    style={{ background: priorityColors[project.priority] }}
                    title={`${project.priority} priority`}
                />
            </div>

            <p className="text-text-soft text-sm line-clamp-2 mb-5 min-h-[2.5rem]">
                {project.description || "No description"}
            </p>

            <div className="flex items-center justify-between mb-5">
                <span
                    className="badge"
                    style={{
                        background: statusStyles[project.status]?.bg,
                        color: statusStyles[project.status]?.text,
                    }}
                >
                    {project.status.replace("_", " ")}
                </span>
                <span className="text-xs text-text-muted capitalize">
                    {project.priority?.toLowerCase()} priority
                </span>
            </div>

            <div className="mt-auto space-y-2">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-text-muted">Progress</span>
                    <span className="text-text-soft font-medium">{project.progress || 0}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-border-soft overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all"
                        style={{
                            width: `${project.progress || 0}%`,
                            background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)'
                        }}
                    />
                </div>
            </div>
        </Link>
    );
};

export default ProjectCard;
