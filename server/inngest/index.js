import 'dotenv/config'
import SendEmail from '../config/nodemailer.js';

if (!process.env.INNGEST_SIGNING_KEY && process.env.INNGEST_SECRET_KEY) {
    process.env.INNGEST_SIGNING_KEY = process.env.INNGEST_SECRET_KEY;
}
import { Inngest, step } from 'inngest'
import { prisma } from '../config/prisma.js';

export const inngest = new Inngest({
    id: 'Project Management',
    signingKey: process.env.INNGEST_SIGNING_KEY,
    eventKey: process.env.INNGEST_EVENT_KEY || process.env.INNGEST_SECRET_KEY,
})

// Inngest functio to send email on task creation
const sendTaskAssignmentEmail = inngest.createFunction(
    { id: 'send-task-assignment-email', triggers: { event: 'task.assigned' } },
    async ({ event }) => {
        const { taskId, origin } = event.data;

        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: {
                assignee: true,
                workspace: true,
            }
        })
        await sendEmail({
            to: task.assignee.email,
            subject: `New Task Assigned: ${task.project.name} - ${task.title}`,
            text: `You have been assigned a new task: ${task.title}. Please check the task details at ${origin}/workspace/${task.workspaceId}/tasks/${task.id}`,
            html: `<p>You have been assigned a new task: <strong>${task.title}</strong>.</p><p>Please check the task details <a href="${origin}/workspace/${task.workspaceId}/tasks/${task.id}">here</a>.</p>`,
        })
        if (new Date(task.dueDate).toLocaleDateString() !== new Date().toDateString()) {
            await step.sleepUntil('wait-until-due-date', new Date(task.dueDate));
            await sendEmail({
                to: task.assignee.email,
                subject: `Task Due Reminder: ${task.project.name} - ${task.title}`,
                text: `This is a reminder that the task "${task.title}" is due today. Please check the task details at ${origin}/workspace/${task.workspaceId}/tasks/${task.id}`,
                html: `<p>This is a reminder that the task "<strong>${task.title}</strong>" is due today.</p><p>Please check the task details <a href="${origin}/workspace/${task.workspaceId}/tasks/${task.id}">here</a>.</p>`,
            })
            await step.run('check-task-completion', async () => {
                const updatedTask = await prisma.task.findUnique({
                    where: { id: taskId },
                });
                if (!updatedTask.completed) {
                    await sendEmail({
                        to: task.assignee.email,
                        subject: `Task Overdue: ${task.project.name} - ${task.title}`,
                        text: `The task "${task.title}" is now overdue. Please check the task details at ${origin}/workspace/${task.workspaceId}/tasks/${task.id}`,
                        html: `<p>The task "<strong>${task.title}</strong>" is now overdue.</p><p>Please check the task details <a href="${origin}/workspace/${task.workspaceId}/tasks/${task.id}">here</a>.</p>`,
                    })
                }
            })
            if (!task) return
            if (task.status !== 'DONE') {
                await step.run('senf-task-remainder-mail', async () => {
                    await sendEmail({
                        to: task.assignee.email,
                        subject: `Task Overdue: ${task.project.name} - ${task.title}`,
                        text: `The task "${task.title}" is now overdue. Please check the task details at ${origin}/workspace/${task.workspaceId}/tasks/${task.id}`,
                        html: `<p>The task "<strong>${task.title}</strong>" is now overdue.</p><p>Please check the task details <a href="${origin}/workspace/${task.workspaceId}/tasks/${task.id}">here</a>.</p>`,
                    })
                }
                )
            }
        }
    }
)

export const functions = [
    sendTaskAssignmentEmail
];