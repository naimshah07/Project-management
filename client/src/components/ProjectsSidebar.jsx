import { useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { ChevronRightIcon, SettingsIcon, KanbanIcon, ChartColumnIcon, CalendarIcon, ArrowRightIcon } from 'lucide-react';
import { useSelector } from 'react-redux';

const ProjectSidebar = () => {

    const location = useLocation();

    const [expandedProjects, setExpandedProjects] = useState(new Set());
    const [searchParams] = useSearchParams();

    const projects = useSelector(
        (state) => state?.workspace?.currentWorkspace?.projects || []
    );

    const getProjectSubItems = (projectId) => [
        { title: 'Tasks', icon: KanbanIcon, url: `/projectsDetail?id=${projectId}&tab=tasks` },
        { title: 'Analytics', icon: ChartColumnIcon, url: `/projectsDetail?id=${projectId}&tab=analytics` },
        { title: 'Calendar', icon: CalendarIcon, url: `/projectsDetail?id=${projectId}&tab=calendar` },
        { title: 'Settings', icon: SettingsIcon, url: `/projectsDetail?id=${projectId}&tab=settings` }
    ];

    const toggleProject = (id) => {
        const newSet = new Set(expandedProjects);
        newSet.has(id) ? newSet.delete(id) : newSet.add(id);
        setExpandedProjects(newSet);
    };

    return (
        <div className="mt-6 px-3">
            <div className="flex items-center justify-between px-3 py-2">
                <h3 className="section-title">
                    Projects
                </h3>
                <Link to="/projects">
                    <button className="btn-ghost size-7 text-text-muted hover:text-text">
                        <ArrowRightIcon className="size-3.5" />
                    </button>
                </Link>
            </div>

            <div className="space-y-0.5 px-2">
                {projects.map((project) => (
                    <div key={project.id}>
                        <button onClick={() => toggleProject(project.id)} className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all duration-200 text-text-soft hover:bg-bg-soft hover:text-text group" >
                            <ChevronRightIcon className={`size-3.5 text-text-muted transition-transform duration-200 group-hover:text-accent ${expandedProjects.has(project.id) && 'rotate-90'}`} />
                            <div className="size-2 rounded-full bg-accent shadow-[0_0_0_3px_rgb(99_102_241_/_0.15)]" />
                            <span className="truncate max-w-40 text-sm font-medium">{project.name}</span>
                        </button>

                        {expandedProjects.has(project.id) && (
                            <div className="ml-6 mt-0.5 mb-1 space-y-0.5 border-l border-border-soft pl-2.5">
                                {getProjectSubItems(project.id).map((subItem) => {
                                    // checking if the current path matches the sub-item's URL
                                    const isActive =
                                        location.pathname === `/projectsDetail` &&
                                        searchParams.get('id') === project.id &&
                                        searchParams.get('tab') === subItem.title.toLowerCase();

                                    return (
                                        <Link key={subItem.title} to={subItem.url} className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-all duration-200 text-xs font-medium ${isActive ? 'bg-accent-soft text-accent shadow-[inset_0_0_0_1px_rgb(99_102_241_/_0.18)]' : 'text-text-muted hover:text-text hover:bg-bg-soft'}`} >
                                            <subItem.icon className="size-3.5" />
                                            {subItem.title}
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProjectSidebar;
