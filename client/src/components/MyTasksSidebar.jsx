import { useEffect, useState } from 'react';
import { CheckSquareIcon, ChevronDownIcon, ChevronRightIcon } from 'lucide-react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

function MyTasksSidebar() {

    const { user } = useUser();

    // const user = { id: 'user_1' }

    const { currentWorkspace } = useSelector((state) => state.workspace);
    const [showMyTasks, setShowMyTasks] = useState(false);
    const [myTasks, setMyTasks] = useState([]);

    const toggleMyTasks = () => setShowMyTasks(prev => !prev);

    const getTaskStatusColor = (status) => {
        switch (status) {
            case 'DONE':
                return 'bg-success shadow-[0_0_0_3px_rgb(16_185_129_/_0.18)]';
            case 'IN_PROGRESS':
                return 'bg-warning shadow-[0_0_0_3px_rgb(245_158_11_/_0.18)]';
            case 'TODO':
                return 'bg-border shadow-[0_0_0_3px_rgb(203_213_225_/_0.3)]';
            default:
                return 'bg-border shadow-[0_0_0_3px_rgb(203_213_225_/_0.3)]';
        }
    };

    const fetchUserTasks = () => {
        const userId = user?.id || '';
        if (!userId || !currentWorkspace) return;
        const currentWorkspaceTasks = currentWorkspace.projects.flatMap((project) => {
            return project.tasks.filter((task) => task?.assignee?.id === userId);
        });

        setMyTasks(currentWorkspaceTasks);
    }

    useEffect(() => {
        fetchUserTasks()
    }, [currentWorkspace])

    return (
        <div className="mt-6 px-3">
            <div onClick={toggleMyTasks} className="flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-all duration-200 hover:bg-bg-soft group" >
                <div className="flex items-center gap-2.5">
                    <div className="size-7 rounded-lg bg-accent-soft flex items-center justify-center group-hover:scale-[1.03] transition-transform">
                        <CheckSquareIcon className="w-4 h-4 text-accent" />
                    </div>
                    <h3 className="text-sm font-semibold text-text">My Tasks</h3>
                    <span className="badge bg-border-soft text-text-soft">
                        {myTasks.length}
                    </span>
                </div>
                {showMyTasks ? (
                    <ChevronDownIcon className="w-4 h-4 text-text-muted group-hover:text-accent transition-colors" />
                ) : (
                    <ChevronRightIcon className="w-4 h-4 text-text-muted group-hover:text-accent transition-colors" />
                )}
            </div>

            {showMyTasks && (
                <div className="mt-2 pl-2">
                    <div className="space-y-1">
                        {myTasks.length === 0 ? (
                            <div className="mx-1 px-3 py-3 text-xs muted-text text-center rounded-xl bg-bg-soft/50 border border-dashed border-border-soft">
                                No tasks assigned
                            </div>
                        ) : (
                            myTasks.map((task, index) => (
                                <Link key={index} to={`/taskDetails?projectId=${task.projectId}&taskId=${task.id}`} className="w-full block rounded-xl transition-all duration-200 text-text-soft hover:bg-bg-soft hover:text-text group" >
                                    <div className="flex items-center gap-2.5 px-3 py-2 w-full min-w-0">
                                        <div className={`w-2 h-2 rounded-full ${getTaskStatusColor(task.status)} flex-shrink-0`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium truncate group-hover:text-accent transition-colors">
                                                {task.title}
                                            </p>
                                            <p className="text-xs muted-text capitalize mt-0.5">
                                                {task.status.replace('_', ' ')}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default MyTasksSidebar;
