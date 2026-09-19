import { useState } from "react";
import { Mail, UserPlus, XIcon, SendIcon } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import api from "../configs/api";
import { fetchWorkspaces } from "../features/workspaceSlice";

const InviteMemberDialog = ({ isDialogOpen, setIsDialogOpen }) => {

    const dispatch = useDispatch()
    const { getToken } = useAuth()

    const currentWorkspace = useSelector((state) => state.workspace?.currentWorkspace || null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        role: "org:member",
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (!currentWorkspace?.id) {
                throw new Error("Workspace is not available")
            }

            const token = await getToken()
            await api.post('/api/workspaces/invite-email', {
                email: formData.email.trim(),
                workspaceId: currentWorkspace?.id,
                role: formData.role,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            dispatch(fetchWorkspaces({ getToken }))
            toast.success("Invitation Sent Successfully")
            setIsDialogOpen(false)
            setFormData({ email: "", role: "org:member" });
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || error.message)
        }
        finally {
            setIsSubmitting(false)
        }
    };

    if (!isDialogOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-bg/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="card w-full max-w-md p-0 shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border-soft">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-2xl bg-[linear-gradient(135deg,#6366f1_0%,#8b5cf6_100%)] text-white flex items-center justify-center shadow-[0_4px_14px_-4px_rgb(99_102_241_/_0.55)]">
                            <UserPlus className="size-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-text tracking-tight">Invite Team Member</h2>
                            {currentWorkspace && (
                                <p className="muted-text text-xs">
                                    to workspace <span className="text-accent font-medium">{currentWorkspace.name}</span>
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
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4.5 text-text-muted pointer-events-none" />
                            <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="teammate@company.com" className="input pl-11" required />
                        </div>
                    </div>

                    {/* Role */}
                    <div className="space-y-1.5">
                        <label className="text-xs muted-text uppercase tracking-wider font-semibold">Role</label>
                        <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="input" >
                            <option value="org:member">Member — can work on projects</option>
                            <option value="org:admin">Admin — full workspace access</option>
                        </select>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 pt-3 border-t border-border-soft -mx-6 px-6 pt-5">
                        <button type="button" onClick={() => setIsDialogOpen(false)} className="btn-ghost" >
                            Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting || !currentWorkspace} className="btn-primary min-w-[160px] gap-2" >
                            <SendIcon className="size-4" />
                            {isSubmitting ? "Sending…" : "Send Invitation"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InviteMemberDialog;
