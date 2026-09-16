import { prisma } from '../config/prisma.js'
import sendEmail from '../config/nodemailer.js'
import {inngest} from '../inngest/index.js'

const notifyAssignee = async (task, origin = '') => {
    if (!task?.assignee?.email) return;

    const taskUrl = origin
        ? `${origin}/taskDetails?id=${task.id}`
        : `${process.env.CLIENT_URL || 'http://localhost:5173'}/taskDetails?id=${task.id}`;

    const subject = `New task assigned: ${task.title}`;
    const text = `You have been assigned a new task "${task.title}" in project "${task.project?.name || 'Unknown project'}".`;
    const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
            <h3>You have a new task assignment</h3>
            <p>You have been assigned the task <strong>${task.title}</strong> in project <strong>${task.project?.name || 'Unknown project'}</strong>.</p>
            <p><a href="${taskUrl}" style="color:#2563eb">Open task</a></p>
        </div>
    `;

    await sendEmail(task.assignee.email, subject, text, html);
};

// Create task 

export const createTask = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const { title, description, type, status, priority, projectId, assigneeId, due_date } = req.body;
        const origin = req.get('origin');

        //check if user is project lead or admin of workspace
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { members: { include: { user: true } } }
        })
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }
        else if (project.team_lead !== userId) {
            return res.status(403).json({ message: "You do not have permission to create task for this project" });
        }
        else if (assigneeId && !project.members.find((member) => member.userId == assigneeId)) {
            return res.status(403).json({ message: "Assignee is not a member of this project" });
        }
        const task = await prisma.task.create({
            data: {
                title,
                description,
                type,
                status,
                priority,
                project: { connect: { id: projectId } },
                assignee: assigneeId ? { connect: { id: assigneeId } } : undefined,
                due_date: due_date ? new Date(due_date) : null,
            },
        });

        const taskWithAssignee = await prisma.task.findUnique({
            where: { id: task.id },
            include: { assignee: true, project: true }
        });

        if (taskWithAssignee?.assignee) {
            await notifyAssignee(taskWithAssignee, origin);
        }

        await inngest.send({
            name: "app/task.assigned",
            data: { taskId: task.id, origin }
        });

        res.status(201).json({ message: "Task created successfully", task: taskWithAssignee });

    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }

}

// update task
export const updateTask = async (req, res) => {
    try {
        const task = await prisma.task.findUnique({
            where: { id: req.params.id },
        });
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        const { userId } = await req.auth();
        const { assigneeId } = req.body;
        const origin = req.get('origin');

        //check if user is project lead or admin of workspace
        const project = await prisma.project.findUnique({
            where: { id: task.projectId },
            include: { members: { include: { user: true } } }
        })
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }
        else if (project.team_lead !== userId) {
            return res.status(403).json({ message: "You do not have permission to update this task" });
        }
        const updatedTask = await prisma.task.update({
            where: { id: req.params.id },
            data: req.body
        })

        const taskWithAssignee = await prisma.task.findUnique({
            where: { id: req.params.id },
            include: { assignee: true, project: true }
        });

        const assigneeChanged = typeof assigneeId !== 'undefined' && assigneeId !== task.assigneeId;
        if (assigneeChanged && taskWithAssignee?.assignee) {
            await notifyAssignee(taskWithAssignee, origin);
        }

        res.status(201).json({ message: "Task updated successfully", task: updatedTask });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
}
// delete task
export const deleteTask = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const { tasksIds } = req.body;
        const tasks = await prisma.task.findMany({
            where: { id: { in: tasksIds } },
        });
        if (tasks.length === 0) {
            return res.status(404).json({ message: "Tasks not found" });
        }

        const project = await prisma.project.findUnique({
            where: { id: tasks[0].projectId },
            include: { members: { include: { user: true } } }
        })
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }
        else if (project.team_lead !== userId) {
            return res.status(403).json({ message: "You do not have permission to delete this task" });
        }
        const deletedTasks = await prisma.task.deleteMany({
            where: { id: { in: tasksIds } },

        })
        res.status(201).json({ message: "Task deleted successfully", task: deletedTasks });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
}