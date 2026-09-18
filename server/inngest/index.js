import 'dotenv/config'
import sendEmail from '../config/nodemailer.js';

if (!process.env.INNGEST_SIGNING_KEY && process.env.INNGEST_SECRET_KEY) {
    process.env.INNGEST_SIGNING_KEY = process.env.INNGEST_SECRET_KEY;
}
import { Inngest, step } from 'inngest'
import { prisma } from '../config/prisma.js';

const inngestId = process.env.INNGEST_APP_ID || 'project-management';

export const inngest = new Inngest({
    id: inngestId,
    signingKey: process.env.INNGEST_SIGNING_KEY,
    eventKey: process.env.INNGEST_EVENT_KEY || process.env.INNGEST_SECRET_KEY,
})

const getEmail = (data) => data.email_addresses?.[0]?.email_address || `${data.id}@clerk.local`;
const getName = (data, fallbackEmail) =>
    `${data.first_name || ""} ${data.last_name || ""}`.trim() || fallbackEmail;

const normalizeRole = (role) => {
    const roleName = typeof role === "string" ? role : role?.name;
    return String(roleName || "").toLowerCase().includes("admin") ? "ADMIN" : "MEMBER";
};

const syncUserFromClerk = inngest.createFunction(
    { id: 'sync-user-from-clerk', name: 'Sync User from Clerk', triggers: { event: 'clerk/user.created' } },
    async ({ event }) => {
        const { data } = event;
        const email = getEmail(data);
        await prisma.user.upsert({
            where: { id: data.id },
            update: {
                email,
                name: getName(data, email),
                image: data.image_url || '',
            },
            create: {
                id: data.id,
                email,
                name: getName(data, email),
                image: data.image_url || '',
            },
        });
    }
);

const updateUserFromClerk = inngest.createFunction(
    { id: 'update-user-from-clerk', name: 'Update User from Clerk', triggers: { event: 'clerk/user.updated' } },
    async ({ event }) => {
        const { data } = event;
        const email = getEmail(data);
        await prisma.user.upsert({
            where: { id: data.id },
            update: {
                email,
                name: getName(data, email),
                image: data.image_url || '',
            },
            create: {
                id: data.id,
                email,
                name: getName(data, email),
                image: data.image_url || '',
            },
        });
    }
);

const deleteUserFromClerk = inngest.createFunction(
    { id: 'delete-user-with-clerk', name: 'Delete User with Clerk', triggers: { event: 'clerk/user.deleted' } },
    async ({ event }) => {
        const { data } = event;
        await prisma.user.deleteMany({ where: { id: data.id } });
    }
);

const syncWorkspaceFromClerk = inngest.createFunction(
    { id: 'sync-workspace-from-clerk', name: 'Sync Workspace from Clerk', triggers: { event: 'clerk/organization.created' } },
    async ({ event }) => {
        const { data } = event;
        const ownerId = data.created_by;

        await prisma.user.upsert({
            where: { id: ownerId },
            update: {},
            create: {
                id: ownerId,
                email: `${ownerId}@clerk.local`,
                name: ownerId,
                image: "",
            },
        });

        await prisma.workspace.upsert({
            where: { id: data.id },
            update: {
                name: data.name,
                slug: data.slug,
                ownerId,
                image_url: data.image_url || "",
            },
            create: {
                id: data.id,
                name: data.name,
                slug: data.slug,
                ownerId,
                image_url: data.image_url || "",
            },
        });

        await prisma.workspaceMember.upsert({
            where: {
                userId_workspaceId: {
                    userId: ownerId,
                    workspaceId: data.id,
                },
            },
            update: { role: "ADMIN" },
            create: { userId: ownerId, workspaceId: data.id, role: "ADMIN" },
        });
    }
);

const updateWorkspaceFromClerk = inngest.createFunction(
    { id: 'update-workspace-from-clerk', name: 'Update Workspace from Clerk', triggers: { event: 'clerk/organization.updated' } },
    async ({ event }) => {
        const { data } = event;
        await prisma.workspace.upsert({
            where: { id: data.id },
            update: {
                name: data.name,
                slug: data.slug,
                image_url: data.image_url || "",
            },
            create: {
                id: data.id,
                name: data.name,
                slug: data.slug,
                ownerId: data.created_by || data.id,
                image_url: data.image_url || "",
            },
        });
    }
);

const deleteWorkspaceFromClerk = inngest.createFunction(
    { id: 'delete-workspace-with-clerk', name: 'Delete Workspace with Clerk', triggers: { event: 'clerk/organization.deleted' } },
    async ({ event }) => {
        const { data } = event;
        await prisma.workspace.deleteMany({ where: { id: data.id } });
    }
);

const syncWorkspaceMemberFromClerk = inngest.createFunction(
    { id: 'sync-workspace-member-from-clerk', name: 'Sync Workspace Member from Clerk', triggers: { event: 'clerk/organizationInvitation.accepted' } },
    async ({ event }) => {
        const { data } = event;
        const userId = data.user_id;
        const workspaceId = data.organization_id;
        const role = normalizeRole(data.role);

        await prisma.user.upsert({
            where: { id: userId },
            update: {},
            create: {
                id: userId,
                email: `${userId}@clerk.local`,
                name: userId,
                image: "",
            },
        });

        await prisma.workspaceMember.upsert({
            where: {
                userId_workspaceId: { userId, workspaceId },
            },
            update: { role },
            create: { userId, workspaceId, role },
        });
    }
);

const sendTaskAssignmentEmail = inngest.createFunction(
    { id: 'send-task-assignment-mail', name: 'Send Task Assignment Email', triggers: { event: 'app/task.assigned' } },
    async ({ event }) => {
        const { taskId, origin } = event.data;

        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: {
                assignee: true,
                workspace: true,
                project: true,
            }
        });

        if (!task || !task.assignee || !task.project) {
            console.warn('sendTaskAssignmentEmail: task/assignee/project not found', { taskId });
            return;
        }

        const originUrl = origin || process.env.CLIENT_URL || 'http://localhost:5173';
        const taskLink = `${originUrl}/workspace/${task.workspaceId}/tasks/${task.id}`;

        await sendEmail(
            task.assignee.email,
            `New Task Assigned: ${task.project.name} - ${task.title}`,
            `You have been assigned a new task: ${task.title}. Please check the task details at ${taskLink}`,
            `<p>You have been assigned a new task: <strong>${task.title}</strong>.</p><p>Please check the task details <a href="${taskLink}">here</a>.</p>`,
        );

        const due = new Date(task.due_date || task.dueDate);
        if (due.toDateString() !== new Date().toDateString()) {
            await step.sleepUntil('wait-until-due-date', due);
            await sendEmail(
                task.assignee.email,
                `Task Due Reminder: ${task.project.name} - ${task.title}`,
                `This is a reminder that the task "${task.title}" is due today. Please check the task details at ${taskLink}`,
                `<p>This is a reminder that the task "<strong>${task.title}</strong>" is due today.</p><p>Please check the task details <a href="${taskLink}">here</a>.</p>`,
            );
            const updated = await step.run('check-task-completion', async () => {
                return prisma.task.findUnique({ where: { id: taskId } });
            });
            if (updated && updated.status !== 'DONE') {
                await step.run('send-task-remainder-mail', async () => {
                    await sendEmail(
                        task.assignee.email,
                        `Task Overdue: ${task.project.name} - ${task.title}`,
                        `The task "${task.title}" is now overdue. Please check the task details at ${taskLink}`,
                        `<p>The task "<strong>${task.title}</strong>" is now overdue.</p><p>Please check the task details <a href="${taskLink}">here</a>.</p>`,
                    );
                });
            }
        }
    }
)

export const functions = [
    deleteUserFromClerk,
    syncUserFromClerk,
    updateUserFromClerk,
    syncWorkspaceFromClerk,
    updateWorkspaceFromClerk,
    deleteWorkspaceFromClerk,
    syncWorkspaceMemberFromClerk,
    sendTaskAssignmentEmail,
];
