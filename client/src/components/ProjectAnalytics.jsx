import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { CheckCircle2, Clock3, AlertTriangle, Users, ChevronRightIcon } from "lucide-react";

const CHART_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

const priorityMeta = {
    LOW: { chip: "bg-[color-mix(in_srgb,var(--color-success)_14%,transparent)] text-success", bar: "var(--color-success)" },
    MEDIUM: { chip: "bg-[color-mix(in_srgb,var(--color-warning)_14%,transparent)] text-warning", bar: "var(--color-warning)" },
    HIGH: { chip: "bg-[color-mix(in_srgb,var(--color-danger)_14%,transparent)] text-danger", bar: "var(--color-danger)" },
};

const ProjectAnalytics = ({ project, tasks }) => {
    const { stats, statusData, typeData, priorityData } = useMemo(() => {
        const now = new Date();
        const total = tasks.length;

        const stats = {
            total,
            completed: 0,
            inProgress: 0,
            todo: 0,
            overdue: 0,
        };

        const statusMap = { TODO: 0, IN_PROGRESS: 0, DONE: 0 };
        const typeMap = { TASK: 0, BUG: 0, FEATURE: 0, IMPROVEMENT: 0, OTHER: 0 };
        const priorityMap = { LOW: 0, MEDIUM: 0, HIGH: 0 };

        tasks.forEach((t) => {
            if (t.status === "DONE") stats.completed++;
            if (t.status === "IN_PROGRESS") stats.inProgress++;
            if (t.status === "TODO") stats.todo++;
            if (new Date(t.due_date) < now && t.status !== "DONE") stats.overdue++;

            if (statusMap[t.status] !== undefined) statusMap[t.status]++;
            if (typeMap[t.type] !== undefined) typeMap[t.type]++;
            if (priorityMap[t.priority] !== undefined) priorityMap[t.priority]++;
        });

        return {
            stats,
            statusData: Object.entries(statusMap).map(([k, v]) => ({ name: k.replace("_", " "), value: v })),
            typeData: Object.entries(typeMap).filter(([_, v]) => v > 0).map(([k, v]) => ({ name: k, value: v })),
            priorityData: Object.entries(priorityMap).map(([k, v]) => ({
                name: k,
                value: v,
                percentage: total > 0 ? Math.round((v / total) * 100) : 0,
            })),
        };
    }, [tasks]);

    const completionRate = stats.total ? Math.round((stats.completed / stats.total) * 100) : 0;

    const metrics = [
        {
            label: "Completion Rate",
            value: `${completionRate}%`,
            tint: "var(--color-success)",
            Icon: CheckCircle2,
        },
        {
            label: "Active Tasks",
            value: stats.inProgress,
            tint: "var(--color-accent)",
            Icon: Clock3,
        },
        {
            label: "Overdue Tasks",
            value: stats.overdue,
            tint: "var(--color-danger)",
            Icon: AlertTriangle,
        },
        {
            label: "Team Size",
            value: project?.members?.length || 0,
            tint: "#8b5cf6",
            Icon: Users,
        },
    ];

    return (
        <div className="space-y-6">
            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {metrics.map((m, i) => (
                    <div key={i} className="card p-5">
                        <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                                <p className="muted-text text-xs mb-1">{m.label}</p>
                                <p className="text-2xl font-bold text-text tracking-tight">{m.value}</p>
                            </div>
                            <div
                                className="size-11 rounded-2xl flex items-center justify-center shrink-0"
                                style={{ background: `color-mix(in srgb, ${m.tint} 14%, transparent)`, color: m.tint }}
                            >
                                <m.Icon className="size-5" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-4">
                {/* Tasks by Status */}
                <div className="card p-6">
                    <h2 className="section-title mb-5 !text-sm">Tasks by Status</h2>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={statusData} barSize={44}>
                            <XAxis
                                dataKey="name"
                                tick={{ fill: "currentColor", fontSize: 12 }}
                                axisLine={{ stroke: "transparent" }}
                                tickLine={false}
                                className="text-text-muted"
                            />
                            <YAxis
                                tick={{ fill: "currentColor", fontSize: 12 }}
                                axisLine={{ stroke: "transparent" }}
                                tickLine={false}
                                allowDecimals={false}
                                className="text-text-muted"
                            />
                            <Bar
                                dataKey="value"
                                radius={[10, 10, 0, 0]}
                                fill="url(#statusGradient)"
                            />
                            <defs>
                                <linearGradient id="statusGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#6366f1" />
                                    <stop offset="100%" stopColor="#8b5cf6" />
                                </linearGradient>
                            </defs>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Tasks by Type */}
                <div className="card p-6">
                    <h2 className="section-title mb-5 !text-sm">Tasks by Type</h2>
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie
                                data={typeData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={95}
                                paddingAngle={3}
                                label={({ name, value }) => `${name} · ${value}`}
                                labelLine={false}
                            >
                                {typeData.map((_, i) => (
                                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="transparent" />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Priority Breakdown */}
            <div className="card p-6">
                <h2 className="section-title mb-6 !text-sm">Tasks by Priority</h2>
                <div className="space-y-5">
                    {priorityData.map((p) => {
                        const meta = priorityMeta[p.name] || priorityMeta.MEDIUM;
                        return (
                            <div key={p.name} className="space-y-2.5">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <ChevronRightIcon className={`size-4 ${meta.chip.split(' ')[1]}`} />
                                        <span className="text-text text-sm font-medium capitalize">{p.name.toLowerCase()}</span>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <span className="muted-text text-xs">{p.value} tasks</span>
                                        <span className={`badge ${meta.chip} font-semibold`}>
                                            {p.percentage}%
                                        </span>
                                    </div>
                                </div>
                                <div className="w-full bg-bg-soft rounded-full h-2 overflow-hidden">
                                    <div
                                        className="h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${p.percentage}%`, background: meta.bar }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ProjectAnalytics;
