import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeftIcon, PlusIcon, SettingsIcon, BarChart3Icon, CalendarIcon, FileStackIcon, UsersIcon, ListTodoIcon, ActivityIcon, ZapIcon, CheckCircle2Icon, Clock3Icon } from "lucide-react";
import ProjectAnalytics from "../components/ProjectAnalytics";
import ProjectSettings from "../components/ProjectSettings";
import CreateTaskDialog from "../components/CreateTaskDialog";
import ProjectCalendar from "../components/ProjectCalendar";
import ProjectTasks from "../components/ProjectTasks";

export default function ProjectDetail() {

    const [searchParams, setSearchParams] = useSearchParams();
    const tab = searchParams.get('tab');
    const id = searchParams.get('id');

    const navigate = useNavigate();
    const projects = useSelector((state) => state?.workspace?.currentWorkspace?.projects || []);

    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [showCreateTask, setShowCreateTask] = useState(false);
    const [activeTab, setActiveTab] = useState(tab || "tasks");

    useEffect(() => {
        if (tab) setActiveTab(tab);
    }, [tab]);

    useEffect(() => {
        if (projects && projects.length > 0) {
            const proj = projects.find((p) => p.id === id);
            setProject(proj);
            setTasks(proj?.tasks || []);
        }
    }, [id, projects]);

    const statusChips = {
        PLANNING: "bg-[color-mix(in_srgb,var(--color-text-muted)_14%,transparent)] text-text-muted",
        ACTIVE: "bg-[color-mix(in_srgb,var(--color-success)_14%,transparent)] text-success",
        ON_HOLD: "bg-[color-mix(in_srgb,var(--color-warning)_14%,transparent)] text-warning",
        COMPLETED: "bg-[color-mix(in_srgb,var(--color-accent)_14%,transparent)] text-accent",
        CANCELLED: "bg-[color-mix(in_srgb,var(--color-danger)_14%,transparent)] text-danger",
    };

    const infoCards = [
        { label: "Total Tasks", value: tasks.length, Icon: ListTodoIcon, tint: "var(--color-accent)" },
        { label: "Completed", value: tasks.filter((t) => t.status === "DONE").length, Icon: CheckCircle2Icon, tint: "var(--color-success)" },
        { label: "In Progress", value: tasks.filter((t) => t.status === "IN_PROGRESS" || t.status === "TODO").length, Icon: Clock3Icon, tint: "var(--color-warning)" },
        { label: "Team Members", value: project?.members?.length || 0, Icon: UsersIcon, tint: "#8b5cf6" },
    ];

    if (!project) {
        return (
            <div className="py-24 flex flex-col items-center gap-6 text-text">
                <div className="size-20 rounded-3xl bg-danger/10 border border-danger/20 flex items-center justify-center">
                    <ZapIcon className="size-10 text-danger" />
                </div>
                <p className="text-3xl md:text-4xl font-bold tracking-tight">Project not found</p>
                <button onClick={() => navigate('/projects')} className="btn-primary" >
                    <ArrowLeftIcon className="size-4" />
                    Back to Projects
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-7 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex max-md:flex-col gap-4 flex-wrap items-start justify-between">
                <div className="flex items-center gap-4">
                    <button className="btn-ghost size-9" onClick={() => navigate('/projects')}>
                        <ArrowLeftIcon className="size-4.5" />
                    </button>
                    <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-2xl font-bold tracking-tight text-text">{project.name}</h1>
                        <span className={`badge ${statusChips[project.status] || statusChips.PLANNING} font-medium capitalize`} >
                            {project.status.replace("_", " ")}
                        </span>
                    </div>
                </div>
                <button onClick={() => setShowCreateTask(true)} className="btn-primary gap-2" >
                    <PlusIcon className="size-4" />
                    New Task
                </button>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {infoCards.map(({ label, value, Icon, tint }, idx) => (
                    <div key={idx} className="card p-5 flex items-center justify-between gap-4">
                        <div>
                            <p className="muted-text text-xs mb-1">{label}</p>
                            <p className="text-2xl font-bold text-text tracking-tight">{value}</p>
                        </div>
                        <div
                            className="size-11 rounded-2xl flex items-center justify-center shrink-0"
                            style={{ background: `color-mix(in srgb, ${tint} 14%, transparent)`, color: tint }}
                        >
                            <Icon className="size-5" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div>
                <div className="inline-flex flex-wrap max-sm:grid max-sm:grid-cols-2 gap-1.5 p-1.5 card !rounded-2xl">
                    {[
                        { key: "tasks", label: "Tasks", icon: FileStackIcon },
                        { key: "calendar", label: "Calendar", icon: CalendarIcon },
                        { key: "analytics", label: "Analytics", icon: BarChart3Icon },
                        { key: "settings", label: "Settings", icon: SettingsIcon },
                    ].map((tabItem) => {
                        const isActive = activeTab === tabItem.key;
                        const Icon = tabItem.icon;
                        return (
                            <button
                                key={tabItem.key}
                                onClick={() => { setActiveTab(tabItem.key); setSearchParams({ id: id, tab: tabItem.key }) }}
                                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all ${isActive
                                    ? 'bg-[linear-gradient(135deg,#6366f1_0%,#8b5cf6_100%)] text-white shadow-[0_4px_14px_-4px_rgb(99_102_241_/_0.55)]'
                                    : 'text-text-soft hover:bg-bg-soft hover:text-text'}`}
                            >
                                <Icon className="size-4" />
                                {tabItem.label}
                            </button>
                        );
                    })}
                </div>

                <div className="mt-7">
                    {activeTab === "tasks" && (
                        <div className="max-w-6xl">
                            <ProjectTasks tasks={tasks} />
                        </div>
                    )}
                    {activeTab === "analytics" && (
                        <div className="max-w-6xl">
                            <ProjectAnalytics tasks={tasks} project={project} />
                        </div>
                    )}
                    {activeTab === "calendar" && (
                        <div className="max-w-6xl">
                            <ProjectCalendar tasks={tasks} />
                        </div>
                    )}
                    {activeTab === "settings" && (
                        <div className="max-w-6xl">
                            <ProjectSettings project={project} />
                        </div>
                    )}
                </div>
            </div>

            {/* Create Task Modal */}
            {showCreateTask && <CreateTaskDialog showCreateTask={showCreateTask} setShowCreateTask={setShowCreateTask} projectId={id} />}
        </div>
    );
}
