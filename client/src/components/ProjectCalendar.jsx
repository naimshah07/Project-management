import { useState } from "react";
import { format, isSameDay, isBefore, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths } from "date-fns";
import { CalendarIcon, Clock3, User2, ChevronLeftIcon, ChevronRightIcon, Inbox } from "lucide-react";

const typeChips = {
    BUG: "bg-[color-mix(in_srgb,var(--color-danger)_14%,transparent)] text-danger",
    FEATURE: "bg-[color-mix(in_srgb,var(--color-accent)_14%,transparent)] text-accent",
    TASK: "bg-[color-mix(in_srgb,var(--color-success)_14%,transparent)] text-success",
    IMPROVEMENT: "bg-[color-mix(in_srgb,#8b5cf6_14%,transparent)] text-[#8b5cf6]",
    OTHER: "bg-[color-mix(in_srgb,var(--color-warning)_14%,transparent)] text-warning",
};

const priorityLeftBorder = {
    LOW: "border-l-[3px] border-l-success",
    MEDIUM: "border-l-[3px] border-l-warning",
    HIGH: "border-l-[3px] border-l-danger",
};

const ProjectCalendar = ({ tasks }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const today = new Date();
    const getTasksForDate = (date) => tasks.filter((task) => isSameDay(task.due_date, date));

    const upcomingTasks = tasks
        .filter((task) => task.due_date && !isBefore(task.due_date, today) && task.status !== "DONE")
        .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
        .slice(0, 5);

    const overdueTasks = tasks.filter((task) => task.due_date && isBefore(task.due_date, today) && task.status !== "DONE");

    const daysInMonth = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth),
    });


    const handleMonthChange = (direction) => {
        setCurrentMonth((prev) => (direction === "next" ? addMonths(prev, 1) : subMonths(prev, 1)));
    };

    const startDayOfWeek = daysInMonth[0]?.getDay() ?? 0;

    return (
        <div className="grid lg:grid-cols-3 gap-6">
            {/* Calendar View */}
            <div className="lg:col-span-2 space-y-6">
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-text font-semibold flex gap-2 items-center">
                            <span className="size-8 rounded-xl bg-accent-soft text-accent flex items-center justify-center shrink-0">
                                <CalendarIcon className="size-4" />
                            </span>
                            Task Calendar
                        </h2>
                        <div className="flex items-center gap-1 p-1 rounded-xl bg-bg-soft">
                            <button onClick={() => handleMonthChange("prev")} className="btn-ghost !size-8 !p-0">
                                <ChevronLeftIcon className="size-4" />
                            </button>
                            <span className="text-text font-semibold px-3 text-sm min-w-[120px] text-center">
                                {format(currentMonth, "MMMM yyyy")}
                            </span>
                            <button onClick={() => handleMonthChange("next")} className="btn-ghost !size-8 !p-0">
                                <ChevronRightIcon className="size-4" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 mb-2">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                            <div key={day} className="text-center muted-text text-[11px] uppercase tracking-wider font-semibold py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1.5">
                        {Array.from({ length: startDayOfWeek }).map((_, i) => (
                            <div key={`blank-${i}`} />
                        ))}
                        {daysInMonth.map((day) => {
                            const dayTasks = getTasksForDate(day);
                            const isSelected = isSameDay(day, selectedDate);
                            const isToday = isSameDay(day, today);
                            const hasOverdue = dayTasks.some((t) => t.status !== "DONE" && isBefore(t.due_date, today));

                            return (
                                <button
                                    key={day}
                                    onClick={() => setSelectedDate(day)}
                                    className={`relative aspect-square rounded-xl flex flex-col items-center justify-center text-sm transition-all duration-200
                                    ${isSelected
                                        ? 'bg-[linear-gradient(135deg,#6366f1_0%,#8b5cf6_100%)] text-white shadow-[0_4px_14px_-4px_rgb(99_102_241_/_0.55)]'
                                        : isToday
                                        ? 'bg-accent-soft text-accent ring-1 ring-accent/30 hover:bg-accent/20'
                                        : 'bg-bg-soft/50 text-text hover:bg-bg-soft hover:text-accent'}
                                    ${hasOverdue ? 'ring-2 ring-danger/40' : ''}`}
                                >
                                    <span className={`font-semibold ${isSelected ? 'text-white' : isToday ? 'text-accent' : ''}`}>
                                        {format(day, "d")}
                                    </span>
                                    {dayTasks.length > 0 && (
                                        <div className="absolute bottom-1.5 flex gap-0.5">
                                            {dayTasks.slice(0, 3).map((_, i) => (
                                                <span
                                                    key={i}
                                                    className={`size-1 rounded-full ${isSelected ? 'bg-white/90' : 'bg-accent'}`}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Tasks for Selected Day */}
                <div className="card p-6">
                    <h3 className="section-title mb-4 !text-base">
                        {getTasksForDate(selectedDate).length > 0
                            ? `Tasks for ${format(selectedDate, "MMM d, yyyy")}`
                            : `${format(selectedDate, "MMM d, yyyy")}`}
                    </h3>
                    {getTasksForDate(selectedDate).length > 0 ? (
                        <div className="space-y-3">
                            {getTasksForDate(selectedDate).map((task) => (
                                <div
                                    key={task.id}
                                    className={`bg-bg-soft/40 hover:bg-bg-soft transition p-4 rounded-xl border border-border-soft ${priorityLeftBorder[task.priority] || priorityLeftBorder.MEDIUM}`}
                                >
                                    <div className="flex justify-between items-start mb-2.5 gap-3">
                                        <h4 className="text-text font-medium leading-snug">{task.title}</h4>
                                        <span className={`badge ${typeChips[task.type] || typeChips.OTHER} uppercase shrink-0`}>
                                            {task.type}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="muted-text capitalize">{task.priority.toLowerCase()} priority</span>
                                        {task.assignee && (
                                            <span className="flex items-center gap-1.5 text-text-soft">
                                                {task.assignee.image ? (
                                                    <img src={task.assignee.image} className="size-4 rounded-full ring-1 ring-border-soft" />
                                                ) : (
                                                    <div className="size-4 rounded-full bg-accent-soft text-accent flex items-center justify-center text-[8px] font-bold">
                                                        <User2 className="size-3" />
                                                    </div>
                                                )}
                                                {task.assignee.name}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-3 py-10 muted-text">
                            <div className="size-12 rounded-2xl bg-accent-soft flex items-center justify-center">
                                <Inbox className="size-6 text-accent" />
                            </div>
                            <p className="text-sm">No tasks scheduled for this day.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
                {/* Upcoming Tasks */}
                <div className="card p-5">
                    <h3 className="section-title mb-4 !text-sm flex items-center gap-2">
                        <span className="size-7 rounded-lg bg-accent-soft text-accent flex items-center justify-center shrink-0">
                            <Clock3 className="size-3.5" />
                        </span>
                        Upcoming Tasks
                    </h3>
                    {upcomingTasks.length === 0 ? (
                        <div className="muted-text text-sm text-center py-6 rounded-xl bg-bg-soft/50 border border-dashed border-border-soft">
                            No upcoming tasks
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {upcomingTasks.map((task) => (
                                <div
                                    key={task.id}
                                    className="bg-bg-soft/40 hover:bg-bg-soft p-3.5 rounded-xl border border-border-soft transition group"
                                >
                                    <div className="flex justify-between items-start gap-2 mb-1.5">
                                        <span className="text-text text-sm font-medium leading-snug group-hover:text-accent transition-colors">
                                            {task.title}
                                        </span>
                                        <span className={`badge ${typeChips[task.type] || typeChips.OTHER} uppercase shrink-0 text-[10px]`}>
                                            {task.type}
                                        </span>
                                    </div>
                                    <p className="text-xs muted-text flex items-center gap-1.5">
                                        <CalendarIcon className="size-3" />
                                        {format(task.due_date, "MMM d, yyyy")}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Overdue Tasks */}
                {overdueTasks.length > 0 && (
                    <div className="card p-5 ring-2 ring-danger/25 border-danger/40">
                        <h3 className="section-title mb-4 !text-sm flex items-center gap-2 !text-danger">
                            <span className="size-7 rounded-lg bg-[color-mix(in_srgb,var(--color-danger)_14%,transparent)] text-danger flex items-center justify-center shrink-0">
                                <Clock3 className="size-3.5" />
                            </span>
                            Overdue Tasks ({overdueTasks.length})
                        </h3>
                        <div className="space-y-2">
                            {overdueTasks.slice(0, 5).map((task) => (
                                <div
                                    key={task.id}
                                    className="bg-[color-mix(in_srgb,var(--color-danger)_8%,transparent)] hover:bg-[color-mix(in_srgb,var(--color-danger)_14%,transparent)] p-3.5 rounded-xl border border-danger/20 transition"
                                >
                                    <div className="flex justify-between items-start gap-2 mb-1.5">
                                        <span className="text-text text-sm font-medium leading-snug">
                                            {task.title}
                                        </span>
                                        <span className={`badge ${typeChips[task.type] || typeChips.OTHER} uppercase shrink-0 text-[10px]`}>
                                            {task.type}
                                        </span>
                                    </div>
                                    <p className="text-xs text-danger flex items-center gap-1.5 font-medium">
                                        <CalendarIcon className="size-3" />
                                        Due {format(task.due_date, "MMM d, yyyy")}
                                    </p>
                                </div>
                            ))}
                            {overdueTasks.length > 5 && (
                                <p className="text-xs muted-text text-center pt-1">
                                    +{overdueTasks.length - 5} more
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectCalendar;
