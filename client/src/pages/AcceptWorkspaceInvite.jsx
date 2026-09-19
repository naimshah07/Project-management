import { useEffect, useState } from "react";
import { useAuth, useUser, SignIn } from "@clerk/clerk-react";
import { useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2Icon, LogInIcon, CheckCircle2Icon, AlertTriangleIcon, UsersIcon } from "lucide-react";
import toast from "react-hot-toast";
import api from "../configs/api";
import { fetchWorkspaces, setCurrentWorkspace } from "../features/workspaceSlice";

export default function AcceptWorkspaceInvite() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const { user, isLoaded } = useUser();
    const { getToken } = useAuth();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [status, setStatus] = useState("loading");

    useEffect(() => {
        if (!isLoaded) return;

        if (!user) {
            setStatus("signin");
            return;
        }

        if (!token) {
            setStatus("error");
            return;
        }

        let isActive = true;

        const acceptInvitation = async () => {
            try {
                setStatus("loading");
                const authToken = await getToken();
                const { data } = await api.post(
                    "/api/workspaces/accept-invitation",
                    { token },
                    { headers: { Authorization: `Bearer ${authToken}` } }
                );

                if (!isActive) return;

                dispatch(fetchWorkspaces({ getToken }));

                if (data?.workspaceId) {
                    dispatch(setCurrentWorkspace(data.workspaceId));
                }

                toast.success("Invitation accepted");
                navigate("/projects", { replace: true });
            } catch (error) {
                if (!isActive) return;
                console.error(error);
                setStatus("error");
                toast.error(error.response?.data?.message || error.message);
            }
        };

        acceptInvitation();

        return () => {
            isActive = false;
        };
    }, [isLoaded, user, token, getToken, dispatch, navigate]);

    if (!isLoaded || status === "loading") {
        return (
            <div className="flex items-center justify-center min-h-screen bg-bg text-text">
                <div className="card p-10 flex flex-col items-center gap-4 text-center shadow-xl">
                    <div className="size-14 rounded-2xl bg-accent-soft flex items-center justify-center">
                        <Loader2Icon className="size-7 text-accent animate-spin" />
                    </div>
                    <div>
                        <p className="text-lg font-semibold text-text">Accepting invitation…</p>
                        <p className="muted-text mt-1 text-sm">Just a moment while we join you to the workspace.</p>
                    </div>
                </div>
            </div>
        );
    }

    if (status === "signin") {
        return (
            <div className="flex items-center justify-center min-h-screen bg-bg px-4">
                <div className="w-full max-w-md space-y-6">
                    <div className="flex flex-col items-center gap-3 mb-2 text-center">
                        <div className="size-14 rounded-2xl bg-accent-soft flex items-center justify-center shadow-lg">
                            <LogInIcon className="size-7 text-accent" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-text tracking-tight">Join the workspace</h1>
                            <p className="muted-text mt-1 text-sm">Sign in to accept your invitation.</p>
                        </div>
                    </div>
                    <div className="card p-6 shadow-xl">
                        <SignIn />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-bg px-4">
            <div className="max-w-md w-full space-y-3 text-center card p-10 shadow-xl">
                <div className="size-14 rounded-2xl bg-[color-mix(in_srgb,var(--color-danger)_14%,transparent)] flex items-center justify-center mx-auto">
                    <AlertTriangleIcon className="size-7 text-danger" />
                </div>
                <h1 className="text-xl font-bold text-text tracking-tight">Invitation could not be accepted</h1>
                <p className="muted-text text-sm leading-relaxed">
                    The link is invalid, expired, or you are signed in with a different email address than the one the invitation was sent to.
                </p>
                <button onClick={() => navigate('/projects', { replace: true })} className="btn-ghost mt-2 mx-auto">
                    <UsersIcon className="size-4" />
                    Back to Workspaces
                </button>
            </div>
        </div>
    );
}
