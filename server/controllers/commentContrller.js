import { prisma } from '../config/prisma.js'


export const addComment = async (req, res) => {

    try {
        const { userId } = await req.auth();
        const { content, taskId } = req.body;

        //check if user is projectMember
        const task = await prisma.task.findUnique({
            where: { id: taskId },
        });
        const project = await prisma.project.findUnique({
            where: { id: task.projectId },
            include: { members: { include: { user: true } } }
        });

        const member = project.members.find((member) => member.userId === userId);
        if (!member) {
            return res.status(403).json({ message: "You do not have permission to comment on this task" });
        }
        const comment = await prisma.comment.create({
            data: {
                content,
                task: { connect: { id: taskId } },
                user: { connect: { id: userId } },
            }
        });
        res.status(201).json({ comment, message: "Comment added successfully" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: err.code || err.message });
    }
}

// get comments of a task
export const getComments = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const { taskId } = req.params;
        //check if user is projectMember
        const task = await prisma.task.findUnique({
            where: { id: taskId },
        });
        const project = await prisma.project.findUnique({
            where: { id: task.projectId },
            include: { members: { include: { user: true } } }
        });
        const member = project.members.find((member) => member.userId === userId);
        if (!member) {
            return res.status(403).json({ message: "You do not have permission to view comments for this task" });
        }
        const comments = await prisma.comment.findMany({
            where: { taskId },
            include: { user: true }
        });
        res.status(200).json({ comments });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.code || err.message });
    }
};
