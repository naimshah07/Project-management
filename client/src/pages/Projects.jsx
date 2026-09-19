import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Plus, Search, FolderOpen } from "lucide-react";
import ProjectCard from "../components/ProjectCard";
import CreateProjectDialog from "../components/CreateProjectDialog";

export default function Projects() {

    const projects = useSelector(
        (state) => state?.workspace?.currentWorkspace?.projects || []
    );

    const [filteredProjects, setFilteredProjects] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [filters, setFilters] = useState({
        status: "ALL",
        priority: "ALL",
    });

    const filterProjects = () => {
        let filtered = projects;

        if (searchTerm) {
            filtered = filtered.filter(
                (project) =>
                    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    project.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filters.status !== "ALL") {
            filtered = filtered.filter((project) => project.status === filters.status);
        }

        if (filters.priority !== "ALL") {
            filtered = filtered.filter(
                (project) => project.priority === filters.priority
            );
        }

        setFilteredProjects(filtered);
    };

    useEffect(() => {
        filterProjects();
    }, [projects, searchTerm, filters]);

    return (
        <div className="space-y-7">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1" style={{ letterSpacing: '-0.02em' }}>
                        Projects
                    </h1>
                    <p className="text-text-soft"> Manage and track all your projects </p>
                </div>
                <button onClick={() => setIsDialogOpen(true)} className="btn-primary">
                    <Plus size={17} strokeWidth={2.5} /> New Project
                </button>
                <CreateProjectDialog isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />
            </div>

            <div className="card p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
                <div className="relative md:flex-1 md:max-w-sm">
                    <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-text-muted size-4" strokeWidth={2} />
                    <input
                        onChange={(e) => setSearchTerm(e.target.value)}
                        value={searchTerm}
                        className="input pl-10 pr-4 py-2.5"
                        placeholder="Search projects..."
                    />
                </div>
                <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="input py-2.5 md:w-44"
                >
                    <option value="ALL">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="PLANNING">Planning</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="ON_HOLD">On Hold</option>
                    <option value="CANCELLED">Cancelled</option>
                </select>
                <select
                    value={filters.priority}
                    onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                    className="input py-2.5 md:w-44"
                >
                    <option value="ALL">All Priority</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                </select>
            </div>

            {filteredProjects.length === 0 ? (
                <div className="card py-16 text-center">
                    <div
                        className="w-20 h-20 mx-auto mb-5 rounded-2xl flex items-center justify-center"
                        style={{ background: 'var(--color-accent-soft)' }}
                    >
                        <FolderOpen size={36} strokeWidth={2} style={{ color: 'var(--color-accent)' }} />
                    </div>
                    <h3 className="text-xl font-bold mb-1.5">No projects found</h3>
                    <p className="text-text-soft mb-6 text-sm max-w-md mx-auto">
                        Try adjusting your filters or create a new project to get started
                    </p>
                    <button onClick={() => setIsDialogOpen(true)} className="btn-primary mx-auto">
                        <Plus size={16} strokeWidth={2.5} />
                        Create Project
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredProjects.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
            )}
        </div>
    );
}
