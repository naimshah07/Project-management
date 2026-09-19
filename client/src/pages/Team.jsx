import { useEffect, useState } from "react";
import { UsersIcon, Search, UserPlus, Shield, Activity } from "lucide-react";
import InviteMemberDialog from "../components/InviteMemberDialog";
import { useSelector } from "react-redux";

const Team = () => {

    const [tasks, setTasks] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [users, setUsers] = useState([]);
    const currentWorkspace = useSelector((state) => state?.workspace?.currentWorkspace || null);
    const projects = currentWorkspace?.projects || [];

    const filteredUsers = users.filter(
        (user) =>
            user?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user?.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        setUsers(currentWorkspace?.members || []);
        setTasks(currentWorkspace?.projects?.reduce((acc, project) => [...acc, ...project.tasks], []) || []);
    }, [currentWorkspace]);

    const statsCards = [
        {
            title: "Total Members",
            value: users.length,
            icon: UsersIcon,
            accent: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
        },
        {
            title: "Active Projects",
            value: projects.filter((p) => p.status !== "CANCELLED" && p.status !== "COMPLETED").length,
            icon: Activity,
            accent: "linear-gradient(135deg, #10b981 0%, #14b8a6 100%)"
        },
        {
            title: "Total Tasks",
            value: tasks.length,
            icon: Shield,
            accent: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)"
        },
    ];

    return (
        <div className="space-y-7">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1" style={{ letterSpacing: '-0.02em' }}>
                        Team
                    </h1>
                    <p className="text-text-soft">
                        Manage team members and their contributions
                    </p>
                </div>
                <button onClick={() => setIsDialogOpen(true)} className="btn-primary">
                    <UserPlus size={17} strokeWidth={2.5} /> Invite Member
                </button>
                <InviteMemberDialog isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {statsCards.map((card) => (
                    <div key={card.title} className="card p-5 flex items-center gap-4">
                        <div
                            className="shrink-0 size-14 rounded-2xl flex items-center justify-center text-white shadow-sm"
                            style={{ background: card.accent }}
                        >
                            <card.icon size={22} strokeWidth={2.2} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="muted-text mb-1">{card.title}</p>
                            <p className="text-2xl font-bold tracking-tight">{card.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-text-muted size-4" strokeWidth={2} />
                <input
                    placeholder="Search team members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input pl-11 py-2.5"
                />
            </div>

            <div className="w-full">
                {filteredUsers.length === 0 ? (
                    <div className="card py-16 text-center">
                        <div
                            className="w-20 h-20 mx-auto mb-5 rounded-2xl flex items-center justify-center"
                            style={{ background: 'var(--color-accent-soft)' }}
                        >
                            <UsersIcon size={36} strokeWidth={2} style={{ color: 'var(--color-accent)' }} />
                        </div>
                        <h3 className="text-xl font-bold mb-1.5">
                            {users.length === 0 ? "No team members yet" : "No members match your search"}
                        </h3>
                        <p className="text-text-soft mb-6 max-w-md mx-auto text-sm">
                            {users.length === 0
                                ? "Invite team members to start collaborating"
                                : "Try adjusting your search term"}
                        </p>
                        {users.length === 0 && (
                            <button onClick={() => setIsDialogOpen(true)} className="btn-primary mx-auto">
                                <UserPlus size={16} strokeWidth={2.5} />
                                Invite Member
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="max-w-5xl w-full">
                        <div className="hidden sm:block">
                            <div className="card overflow-hidden">
                                <table className="min-w-full divide-y divide-border dark:divide-border">
                                    <thead>
                                        <tr className="text-left text-xs uppercase text-text-muted">
                                            <th className="px-6 py-4 font-semibold">Name</th>
                                            <th className="px-6 py-4 font-semibold">Email</th>
                                            <th className="px-6 py-4 font-semibold">Role</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border dark:divide-border">
                                        {filteredUsers.map((user) => (
                                            <tr
                                                key={user.id}
                                                className="hover:bg-border-soft dark:hover:bg-border-soft transition-colors"
                                            >
                                                <td className="px-6 py-3.5 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={user.user.image}
                                                            alt={user.user.name}
                                                            className="size-9 rounded-full ring-2 ring-border-soft"
                                                        />
                                                        <span className="text-sm font-medium text-text truncate">
                                                            {user.user?.name || "Unknown User"}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3.5 whitespace-nowrap text-sm text-text-soft">
                                                    {user.user.email}
                                                </td>
                                                <td className="px-6 py-3.5 whitespace-nowrap">
                                                    <span
                                                        className="badge"
                                                        style={
                                                            user.role === "ADMIN"
                                                                ? {
                                                                    background: "color-mix(in srgb, #8b5cf6 16%, transparent)",
                                                                    color: "#7c3aed",
                                                                }
                                                                : {
                                                                    background: "color-mix(in srgb, #64748b 16%, transparent)",
                                                                    color: "#475569",
                                                                }
                                                        }
                                                    >
                                                        {user.role || "MEMBER"}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="sm:hidden space-y-3">
                            {filteredUsers.map((user) => (
                                <div key={user.id} className="card p-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <img
                                            src={user.user.image}
                                            alt={user.user.name}
                                            className="size-11 rounded-full ring-2 ring-border-soft"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <p className="font-semibold text-text truncate">
                                                {user.user?.name || "Unknown User"}
                                            </p>
                                            <p className="text-sm text-text-soft truncate">
                                                {user.user.email}
                                            </p>
                                        </div>
                                    </div>
                                    <span
                                        className="badge"
                                        style={
                                            user.role === "ADMIN"
                                                ? {
                                                    background: "color-mix(in srgb, #8b5cf6 16%, transparent)",
                                                    color: "#7c3aed",
                                                }
                                                : {
                                                    background: "color-mix(in srgb, #64748b 16%, transparent)",
                                                    color: "#475569",
                                                }
                                        }
                                    >
                                        {user.role || "MEMBER"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Team;
