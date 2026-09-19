import { useState } from "react";
import { Mail, UserPlus, XIcon, UserPlus2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import api from "../configs/api";
import { fetchWorkspaces } from "../features/workspaceSlice";
import toast from "react-hot-toast";

const AddProjectMember = ({ isDialogOpen, setIsDialogOpen }) => {

    const [searchParams] = useSearchParams();

    const id = searchParams.get('id');

    const { getToken } = useAuth();
    const dispatch = useDispatch()

    const currentWorkspace = useSelector((state) => state.workspace?.currentWorkspace || null);

    const project = currentWorkspace?.projects.find((p) => p.id === id);
    const projectMembersEmails = project?.members.map((member) => member.user.email) || [];

    const [email, setEmail] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsAdding(true)
        try {
            await api.post(`/api/projects/${project.id}/addMember`, { email }, { headers: { Authorization: `Bearer ${await getToken()}` } })
            setIsDialogOpen(false)
            setEmail('');
            dispatch(fetchWorkspaces({ getToken }))
            toast.success("Member Added to the Project")
        } catch (error) {
            toast.error(error.response?.data?.message || error.message)
        }
        finally {
            setIsAdding(false);
        }
    };

    if (!isDialogOpen) return null;

    const availableMembers = (currentWorkspace?.members || []).filter(
        (member) => !projectMembersEmails.includes(member.user.email)
    );

    return (
        <div className="fixed inset-0 z-50 bg-bg/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="card w-full max-w-md p-0 shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border-soft">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-2xl bg-[linear-gradient(135deg,#6366f1_0%,#8b5cf6_100%)] text-white flex items-center justify-center shadow-[0_4px_14px_-4px_rgb(99_102_241_/_0.55)]">
                            <UserPlus2 className="size-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-text tracking-tight">Add Member to Project</h2>
                            {project && (
                                <p className="muted-text text-xs">
                                    project <span className="text-accent font-medium">{project.name}</span>
                                </p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={() => setIsDialogOpen(false)}
                        className="btn-ghost !size-9 !p-0 text-text-muted"
                        aria-label="Close"
                    >
                        <XIcon className="size-4.5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4 p-6">
                    {/* Email */}
                    <div className="space-y-1.5">
                        <label htmlFor="email" className="text-xs muted-text uppercase tracking-wider font-semibold">
                            Workspace Member
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4.5 text-text-muted pointer-events-none" />
                            <select value={email} onChange={(e) => setEmail(e.target.value)} className="input pl-11" required >
                                <option value="">Select a workspace member…</option>
                                {availableMembers.length === 0 ? (
                                    <option value="" disabled>
                                        All workspace members are already on the project.
                                    </option>
                                ) : (
                                    availableMembers.map((member) => (
                                        <option key={member.user.id} value={member.user.email}>
                                            {member.user.email}
                                        </option>
                                    ))
                                )}
                            </select>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 pt-3 border-t border-border-soft -mx-6 px-6 pt-5">
                        <button type="button" onClick={() => setIsDialogOpen(false)} className="btn-ghost" >
                            Cancel
                        </button>
                        <button type="submit" disabled={isAdding || !currentWorkspace || !email} className="btn-primary min-w-[140px]" >
                            {isAdding ? "Adding…" : "Add Member"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProjectMember;
