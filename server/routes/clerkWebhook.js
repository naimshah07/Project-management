import express from "express";
import { Webhook } from "svix";
import { prisma } from "../config/prisma.js";
import { inngest } from "../inngest/index.js";

const router = express.Router();

const getEmail = (data) => data.email_addresses?.[0]?.email_address || `${data.id}@clerk.local`;

const getName = (data, fallbackEmail) =>
    `${data.first_name || ""} ${data.last_name || ""}`.trim() || fallbackEmail;

const normalizeRole = (role) => {
    const roleName = typeof role === "string" ? role : role?.name;

    return String(roleName || "").toLowerCase().includes("admin") ? "ADMIN" : "MEMBER";
};

const upsertUserFromClerk = (data) => {
    const email = getEmail(data);

    return prisma.user.upsert({
        where: { id: data.id },
        update: {
            email,
            name: getName(data, email),
            image: data.image_url || "",
        },
        create: {
            id: data.id,
            email,
            name: getName(data, email),
            image: data.image_url || "",
        },
    });
};

const upsertWorkspaceOwner = async (ownerId) => {
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
};

const upsertWorkspaceMember = (userId, workspaceId, role) =>
    prisma.workspaceMember.upsert({
        where: {
            userId_workspaceId: {
                userId,
                workspaceId,
            },
        },
        update: {
            role,
        },
        create: {
            userId,
            workspaceId,
            role,
        },
    });

router.post("/", express.raw({ type: "application/json" }), async (req, res) => {
    try {
        const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
        const evt = wh.verify(req.body, {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"],
        });

        const { type, data } = evt;

        switch (type) {
            case "user.created":
                await upsertUserFromClerk(data);
                await inngest.send({ name: "clerk/user.created", data });
                break;
            case "user.updated":
                await upsertUserFromClerk(data);
                await inngest.send({ name: "clerk/user.updated", data });
                break;
            case "user.deleted":
                await prisma.user.deleteMany({ where: { id: data.id } });
                await inngest.send({ name: "clerk/user.deleted", data });
                break;
            case "organization.created":
                await upsertWorkspaceOwner(data.created_by);
                await prisma.workspace.upsert({
                    where: { id: data.id },
                    update: {
                        name: data.name,
                        slug: data.slug,
                        ownerId: data.created_by,
                        image_url: data.image_url || "",
                    },
                    create: {
                        id: data.id,
                        name: data.name,
                        slug: data.slug,
                        ownerId: data.created_by,
                        image_url: data.image_url || "",
                    },
                });
                await upsertWorkspaceMember(data.created_by, data.id, "ADMIN");
                await inngest.send({ name: "clerk/organization.created", data });
                break;
            case "organization.updated":
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
                await inngest.send({ name: "clerk/organization.updated", data });
                break;
            case "organization.deleted":
                await prisma.workspace.deleteMany({ where: { id: data.id } });
                await inngest.send({ name: "clerk/organization.deleted", data });
                break;
            case "organizationInvitation.accepted":
                await upsertWorkspaceOwner(data.user_id);
                await upsertWorkspaceMember(data.user_id, data.organization_id, normalizeRole(data.role));
                await inngest.send({ name: "clerk/organizationInvitation.accepted", data });
                break;
            default:
                break;
        }

        res.status(200).json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: "Webhook Error" });
    }
});

export default router;
