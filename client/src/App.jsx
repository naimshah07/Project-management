import { Routes, Route } from "react-router-dom";
import Layout from "./pages/Layout";
import { Toaster } from "react-hot-toast";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Team from "./pages/Team";
import ProjectDetails from "./pages/ProjectDetails";
import TaskDetails from "./pages/TaskDetails";
import AcceptWorkspaceInvite from "./pages/AcceptWorkspaceInvite";
import { Analytics } from "@vercel/analytics/react"

const App = () => {
    return (
        <>
            <Toaster />
            <Routes>
                <Route path="accept-invite" element={<AcceptWorkspaceInvite />} />
                <Route path="/" element={<Layout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="team" element={<Team />} />
                    <Route path="projects" element={<Projects />} />
                    <Route path="projectsDetail" element={<ProjectDetails />} />
                    <Route path="taskDetails" element={<TaskDetails />} />
                </Route>
            </Routes>
            <Analytics />
        </>
    );
};

export default App;
