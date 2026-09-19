import { Plus } from 'lucide-react'
import { useState } from 'react'
import StatsGrid from '../components/StatsGrid'
import ProjectOverview from '../components/ProjectOverview'
import RecentActivity from '../components/RecentActivity'
import TasksSummary from '../components/TasksSummary'
import CreateProjectDialog from '../components/CreateProjectDialog'
import { useUser } from '@clerk/clerk-react'

const Dashboard = () => {

    const { user } = useUser()
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    return (
        <div className='space-y-8'>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <div className="muted-text mb-1.5">
                        {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1" style={{ letterSpacing: '-0.02em' }}>
                        Welcome back, {user?.firstName || user?.fullName || 'there'} 👋
                    </h1>
                    <p className="text-text-soft">Here's what's happening with your projects today</p>
                </div>

                <button onClick={() => setIsDialogOpen(true)} className="btn-primary">
                    <Plus size={17} strokeWidth={2.5} />
                    New Project
                </button>

                <CreateProjectDialog isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />
            </div>

            <StatsGrid />

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <ProjectOverview />
                    <RecentActivity />
                </div>
                <div className="space-y-6">
                    <TasksSummary />
                </div>
            </div>
        </div>
    )
}

export default Dashboard
