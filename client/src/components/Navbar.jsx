import { SearchIcon, PanelLeft, BellIcon } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { toggleTheme } from '../features/themeSlice'
import { MoonIcon, SunIcon } from 'lucide-react'
import { UserButton } from '@clerk/clerk-react'

const Navbar = ({ setIsSidebarOpen }) => {

    const dispatch = useDispatch();
    const { theme } = useSelector(state => state.theme);

    return (
        <header className="w-full bg-bg-soft/80 dark:bg-bg-soft/70 border-b border-border dark:border-border backdrop-blur-xl px-6 xl:px-16 py-3.5 flex-shrink-0 sticky top-0 z-20">
            <div className="flex items-center justify-between max-w-7xl mx-auto gap-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    <button
                        onClick={() => setIsSidebarOpen((prev) => !prev)}
                        className="lg:hidden p-2 rounded-lg transition-colors text-text-soft hover:text-text hover:bg-border-soft"
                    >
                        <PanelLeft size={20} strokeWidth={2} />
                    </button>

                    <div className="relative flex-1 max-w-md">
                        <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted size-4" strokeWidth={2} />
                        <input
                            type="text"
                            placeholder="Search projects, tasks, members..."
                            className="input pl-10 pr-4 py-2.5 !bg-bg dark:!bg-bg !border-border dark:!border-border shadow-sm"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button className="btn-ghost relative">
                        <BellIcon size={18} strokeWidth={2} />
                        <span className="absolute top-1.5 right-1.5 size-2 rounded-full" style={{ background: 'var(--color-danger)' }} />
                    </button>

                    <button
                        onClick={() => dispatch(toggleTheme())}
                        className="btn-ghost size-9 flex items-center justify-center"
                        aria-label="Toggle theme"
                    >
                        {
                            theme === "light"
                                ? <MoonIcon size={18} strokeWidth={2} />
                                : <SunIcon size={18} strokeWidth={2} />
                        }
                    </button>

                    <div className="w-px h-7 bg-border dark:bg-border mx-1" />

                    <UserButton />
                </div>
            </div>
        </header>
    )
}

export default Navbar
