import { useEffect, useState } from "react";
import { useAuth, useUser, SignIn } from "@clerk/clerk-react";
import { useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2Icon } from "lucide-react";
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
            <div className="flex items-center justify-center h-screen bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-100">
                <Loader2Icon className="size-7 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (status === "signin") {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white dark:bg-zinc-950 px-4">
                <SignIn />
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-white dark:bg-zinc-950 px-4 text-center">
            <div className="max-w-md space-y-3">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Invitation could not be accepted</h1>
                <p className="text-sm text-gray-500 dark:text-zinc-400">
                    The link is invalid, expired, or you are signed in with a different email address.
                </p>
            </div>
        </div>
    );
}