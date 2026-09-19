import { useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import MyTasksSidebar from './MyTasksSidebar'
import ProjectSidebar from './ProjectsSidebar'
import WorkspaceDropdown from './WorkspaceDropdown'
import { FolderOpenIcon, LayoutDashboardIcon, SettingsIcon, UsersIcon } from 'lucide-react'
import { useClerk } from '@clerk/clerk-react'

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {

    const { openUserProfile } = useClerk()

    const menuItems = [
        { name: 'Dashboard', href: '/', icon: LayoutDashboardIcon },
        { name: 'Projects', href: '/projects', icon: FolderOpenIcon },
        { name: 'Team', href: '/team', icon: UsersIcon },
    ]

    const sidebarRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                setIsSidebarOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [setIsSidebarOpen]);

    return (
        <aside
            ref={sidebarRef}
            className={`z-30 w-72 shrink-0 flex flex-col h-screen bg-bg-soft dark:bg-bg-soft border-r border-border dark:border-border backdrop-blur-xl max-lg:fixed max-lg:top-0 max-lg:h-screen max-lg:shadow-xl transition-all duration-300 ${isSidebarOpen ? 'max-lg:left-0' : 'max-lg:-left-full'}`}
        >
            <WorkspaceDropdown />
            <div className="h-px bg-border-soft dark:bg-border-soft mx-5" />
            <div className='flex-1 overflow-y-auto no-scrollbar flex flex-col py-3 px-4'>
                <nav className="space-y-1 mb-4">
                    {menuItems.map((item) => (
                        <NavLink
                            to={item.href}
                            key={item.name}
                            end={item.href === '/'}
                            className={({ isActive }) =>
                                `flex items-center gap-3 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${isActive
                                    ? 'text-white shadow-md'
                                    : 'text-text-soft hover:text-text hover:bg-border-soft dark:hover:bg-border-soft'
                                }`
                            }
                            style={({ isActive }) => isActive ? { background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', boxShadow: '0 4px 14px -4px rgb(99 102 241 / 0.55)' } : {}}
                        >
                            <item.icon size={17} strokeWidth={2} />
                            <span>{item.name}</span>
                        </NavLink>
                    ))}
                    <button
                        onClick={openUserProfile}
                        className="w-full flex items-center gap-3 py-2.5 px-3 rounded-lg text-sm font-medium text-text-soft hover:text-text hover:bg-border-soft dark:hover:bg-border-soft transition-all"
                    >
                        <SettingsIcon size={17} strokeWidth={2} />
                        <span>Settings</span>
                    </button>
                </nav>

                <MyTasksSidebar />
                <ProjectSidebar />
            </div>
        </aside>
    )
}

export default Sidebar
