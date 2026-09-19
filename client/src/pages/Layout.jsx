import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { Outlet } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { loadTheme } from '../features/themeSlice'
import { Loader2Icon } from 'lucide-react'
import { useUser, SignIn, useAuth } from '@clerk/clerk-react'
import { fetchWorkspaces } from '../features/workspaceSlice'


const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const { loading, workspaces } = useSelector((state) => state.workspace)
    const dispatch = useDispatch()
    const { user, isLoaded } = useUser()
    const { getToken } = useAuth()

    useEffect(() => {
        dispatch(loadTheme())
    }, [])

    useEffect(() => {
        if (!isLoaded || !user) return;

        const loadWorkspaces = () => dispatch(fetchWorkspaces({ getToken }))

        loadWorkspaces()

        const handleWindowFocus = () => loadWorkspaces()
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                loadWorkspaces()
            }
        }

        window.addEventListener('focus', handleWindowFocus)
        document.addEventListener('visibilitychange', handleVisibilityChange)

        return () => {
            window.removeEventListener('focus', handleWindowFocus)
            document.removeEventListener('visibilitychange', handleVisibilityChange)
        }
    }, [isLoaded, user, dispatch, getToken])

    if (!user) {
        return (
            <div className='flex justify-center items-center min-h-screen bg-bg dark:bg-bg'>
                <div className="card p-10 w-full max-w-md shadow-xl">
                    <SignIn />
                </div>
            </div>
        )
    }

    if (loading) return (
        <div className='flex items-center justify-center min-h-screen bg-bg dark:bg-bg'>
            <div className="card p-8 flex items-center gap-3">
                <Loader2Icon className="size-6 animate-spin" style={{ color: 'var(--color-accent)' }} />
                <span className="muted-text">Loading workspace...</span>
            </div>
        </div>
    )

    return (
        <div className="flex min-h-screen bg-bg text-text dark:bg-bg dark:text-text">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            <div className="flex-1 flex flex-col min-h-screen">
                <Navbar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
                <main className="flex-1 h-full p-6 xl:p-10 xl:px-16 overflow-y-auto">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}

export default Layout
