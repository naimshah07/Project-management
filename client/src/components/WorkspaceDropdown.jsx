import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Plus, Building2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentWorkspace } from "../features/workspaceSlice";
import { useNavigate } from "react-router-dom";
import { useClerk } from "@clerk/clerk-react";

function WorkspaceDropdown() {
    const { openCreateOrganization } = useClerk()

    const { workspaces } = useSelector((state) => state.workspace);
    const currentWorkspace = useSelector((state) => state.workspace?.currentWorkspace || null);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const onSelectWorkspace = (workspaceId) => {
        dispatch(setCurrentWorkspace(workspaceId))
        setIsOpen(false);
        navigate('/')
    }

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative px-4 py-4" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(prev => !prev)}
                className="w-full flex items-center justify-between p-3 rounded-xl transition-all hover:bg-border-soft dark:hover:bg-border-soft group"
            >
                <div className="flex items-center gap-3 min-w-0">
                    {currentWorkspace?.image_url ? (
                        <img
                            src={currentWorkspace.image_url}
                            alt={currentWorkspace?.name}
                            className="w-10 h-10 rounded-xl object-cover ring-2 ring-border-soft shrink-0"
                        />
                    ) : (
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white shadow-sm"
                            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
                        >
                            <Building2 size={18} strokeWidth={2.2} />
                        </div>
                    )}
                    <div className="min-w-0 flex-1 text-left">
                        <p className="font-semibold text-text text-sm truncate">
                            {currentWorkspace?.name || "Select Workspace"}
                        </p>
                        <p className="text-xs text-text-muted truncate">
                            {workspaces.length} workspace{workspaces.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>
                <ChevronDown
                    className={`w-4 h-4 text-text-muted shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <div className="absolute z-50 w-[calc(100%-2rem)] left-4 top-[calc(100%-0.75rem)] card p-2 shadow-xl animate-in fade-in zoom-in-95 duration-150 origin-top-left">
                    <div className="px-3 py-2">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                            Workspaces
                        </p>
                    </div>
                    <div className="space-y-0.5 max-h-64 overflow-y-auto no-scrollbar pb-1">
                        {workspaces.map((workspace) => {
                            const isSelected = currentWorkspace?.id === workspace.id;
                            return (
                                <button
                                    key={workspace.id}
                                    onClick={() => onSelectWorkspace(workspace.id)}
                                    className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-all text-left ${isSelected
                                        ? 'bg-accent-soft'
                                        : 'hover:bg-border-soft dark:hover:bg-border-soft'
                                        }`}
                                >
                                    {workspace.image_url ? (
                                        <img
                                            src={workspace.image_url}
                                            alt={workspace.name}
                                            className="w-8 h-8 rounded-lg object-cover shrink-0"
                                        />
                                    ) : (
                                        <div
                                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white"
                                            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
                                        >
                                            <Building2 size={14} strokeWidth={2.2} />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-text truncate">
                                            {workspace.name}
                                        </p>
                                        <p className="text-xs text-text-muted truncate">
                                            {workspace.members?.length || 0} members
                                        </p>
                                    </div>
                                    {isSelected && (
                                        <Check
                                            className="w-4 h-4 shrink-0"
                                            style={{ color: 'var(--color-accent)' }}
                                            strokeWidth={2.5}
                                        />
                                    )}
                                </button>
                            )
                        })}
                    </div>

                    <div className="h-px bg-border dark:bg-border my-1.5" />

                    <button
                        onClick={() => { openCreateOrganization(); setIsOpen(false) }}
                        className="w-full p-2.5 rounded-lg flex items-center gap-2.5 group hover:bg-border-soft dark:hover:bg-border-soft transition-all text-left"
                    >
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{ background: 'var(--color-accent-soft)' }}
                        >
                            <Plus className="w-4 h-4" style={{ color: 'var(--color-accent)' }} strokeWidth={2.5} />
                        </div>
                        <span
                            className="text-sm font-medium"
                            style={{ color: 'var(--color-accent)' }}
                        >
                            Create Workspace
                        </span>
                    </button>
                </div>
            )}
        </div>
    );
}

export default WorkspaceDropdown;
