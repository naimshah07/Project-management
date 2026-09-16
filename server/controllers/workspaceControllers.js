// Get all workspaces for user 

import crypto from 'node:crypto';
import { createClerkClient } from '@clerk/backend';
import { prisma } from "../config/prisma.js";
import sendEmail from "../config/nodemailer.js";

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
const inviteSecret =  process.env.CLERK_SECRET_KEY ;
const inviteTokenTtlMs = Number(process.env.INVITE_TTL_MS || 1000 * 60 * 60 * 24 * 7);

const base64UrlEncode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');

const signInviteToken = (payload) => crypto.createHmac('sha256', inviteSecret).update(payload).digest('base64url');

const createInvitationToken = (payload) => {
    const encodedPayload = base64UrlEncode(payload);
    const signature = signInviteToken(encodedPayload);
    return `${encodedPayload}.${signature}`;
};

const verifyInvitationToken = (token) => {
    if (!token) return null;

    const [encodedPayload, signature] = token.split('.');

    if (!encodedPayload || !signature) return null;

    const expectedSignature = signInviteToken(encodedPayload);

    if (expectedSignature.length !== signature.length) return null;

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) return null;

    try {
        const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));

        if (payload.expiresAt && Date.now() > payload.expiresAt) {
            return null;
        }

        return payload;
    } catch {
        return null;
    }
};

const ensureClerkUserInDatabase = async (userId) => {
    const existingUser = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (existingUser) {
        return existingUser;
    }

    const clerkUser = await clerkClient.users.getUser(userId);

    const email =
        clerkUser.emailAddresses?.[0]?.emailAddress || `${userId}@clerk.local`;

    const name =
        `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
        email;

    const image = clerkUser.imageUrl || "";

    // Check if same email already exists
    const existingByEmail = await prisma.user.findUnique({
        where: { email },
    });

    if (existingByEmail) {
        console.log(
            `User with email ${email} already exists. Returning existing user.`
        );

        return existingByEmail;
    }

    return await prisma.user.create({
        data: {
            id: clerkUser.id,
            email,
            name,
            image,
        },
    });
};

export const getUserWorkspaces = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const workspaceMemberships = await prisma.workspaceMember.findMany({
            where: {
                userId: userId,
            },
            include: {
                workspace: {
                    include: {
                        members: { include: { user: true } },
                        projects: {
                            include: {
                                tasks: { include: { assignee: true, comments: { include: { user: true } } } },
                                members: { include: { user: true } }
                            }
                        },
                        owner: true,
                    }
                }
            }
        });

        const workspaces = workspaceMemberships.map((membership) => membership.workspace);
        res.json({ workspaces });


    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: err.code || err.message });
    }
}

// Add member to workspace
export const addMember = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const { email, role, workspaceId } = req.body;
        const normalizedRole = role === 'org:admin' ? 'ADMIN' : 'MEMBER';

        let invitedUser = await prisma.user.findUnique({ where: { email } });

        if (!invitedUser) {
            try {
                const clerkUsers = await clerkClient.users.getUserList({ emailAddress: [email] });
                const clerkUser = clerkUsers.data?.[0];

                if (clerkUser) {
                    invitedUser = await prisma.user.create({
                        data: {
                            id: clerkUser.id,
                            email: clerkUser.emailAddresses?.[0]?.emailAddress || email,
                            name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || email,
                            image: clerkUser.imageUrl || '',
                        },
                    });
                }
            } catch (clerkError) {
                console.error('Unable to sync invited user from Clerk:', clerkError);
            }
        }

        if (!invitedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!workspaceId || !role) {
            return res.status(400).json({ message: "Workspace ID and role are required" });
        }

        if (!['ADMIN', 'MEMBER'].includes(normalizedRole)) {
            return res.status(400).json({ message: "Invalid role. Must be 'ADMIN' or 'MEMBER'" });
        }

        //Fetch Workspace
        const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId }, include: { members: true } });

        if (!workspace) {
            return res.status(404).json({ message: "Workspace not found" });
        }

        const isAdmin = workspace.members.some((member) => member.userId === userId && member.role === 'ADMIN') || workspace.ownerId === userId;

        if (!isAdmin) {
            return res.status(401).json({ message: "Only Admins can add members to the workspace" });
        }

        // check if the user is already a member of the workspace
        const existingMember = workspace.members.find((member) => member.userId === invitedUser.id);

        if (existingMember) {
            return res.json({ member: existingMember, message: "User is already a member of the workspace" });
        }

        const member = await prisma.workspaceMember.create({
            data: {
                userId: invitedUser.id,
                workspaceId: workspaceId,
                role: normalizedRole,
                message: `${invitedUser.name} has been added as a ${normalizedRole.toLowerCase()} to the workspace ${workspace.name}`
            }
        })
        res.json({ member, message: "Member added successfully" });
    }

    catch (err) {
        console.error(err);
        res.status(500).json({ message: err.code || err.message });
    }
}

export const sendWorkspaceInvitationEmail = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const { email, workspaceId, role } = req.body;
        const normalizedRole = role === 'org:admin' ? 'ADMIN' : 'MEMBER';

        if (!email || !workspaceId) {
            return res.status(400).json({ message: "Email and workspace ID are required" });
        }

        const workspace = await prisma.workspace.findUnique({
            where: { id: workspaceId },
            include: {
                members: true,
                owner: true,
            },
        });

        if (!workspace) {
            return res.status(404).json({ message: "Workspace not found" });
        }

        const inviterUser = await prisma.user.findUnique({ where: { id: userId } });
        const isAdmin = workspace.members.some((member) => member.userId === userId && member.role === 'ADMIN') || workspace.ownerId === userId;

        if (!isAdmin) {
            return res.status(401).json({ message: "Only Admins can invite members to the workspace" });
        }

        const inviter = inviterUser?.name || inviterUser?.email || "A workspace admin";
        const workspaceUrl = process.env.CLIENT_URL || req.get('origin') || 'https://projectworkspacemanagement.vercel.app' || 'http://localhost:5173';
        const token = createInvitationToken({
            email: email.toLowerCase(),
            workspaceId,
            role: normalizedRole,
            issuedAt: Date.now(),
            expiresAt: Date.now() + inviteTokenTtlMs,
        });
        const acceptLink = `${workspaceUrl.replace(/\/$/, '')}/accept-invite?token=${encodeURIComponent(token)}`;
        const subject = `Invitation to join ${workspace.name}`;
        const text = `${inviter} invited you to join the workspace ${workspace.name} as ${normalizedRole.toLowerCase()}. Open the link below to continue: ${acceptLink}`;
        const html = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
                <h2 style="margin: 0 0 12px;">You're invited to join ${workspace.name}</h2>
                <p style="margin: 0 0 12px;">${inviter} invited you to join this workspace as <strong>${normalizedRole.toLowerCase()}</strong>.</p>
                <p style="margin: 0 0 20px;">Click the button below to accept the invitation.</p>
                <p style="margin: 0 0 20px;">
                    <a href="${acceptLink}" style="display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-weight: 600;">Accept Invite</a>
                </p>
                <p style="margin: 0 0 16px; color: #6b7280; font-size: 14px;">If the button does not work, use this link:</p>
                <p style="margin: 0 0 16px;"><a href="${acceptLink}" style="color: #2563eb; word-break: break-word;">${acceptLink}</a></p>
                <p style="margin: 0; color: #6b7280; font-size: 14px;">If the link does not open, visit ${workspaceUrl} and sign in with this email address.</p>
            </div>
        `;

        await sendEmail(email, subject, text, html);

        return res.json({ message: "Invitation email sent successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.code || err.message });
    }
}

export const acceptWorkspaceInvitation = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const { token } = req.body;

        const invitation = verifyInvitationToken(token);

        if (!invitation) {
            return res.status(400).json({ message: "Invitation link is invalid or has expired" });
        }

        const clerkUser = await clerkClient.users.getUser(userId);
        const currentEmail = clerkUser.emailAddresses?.[0]?.emailAddress?.toLowerCase();

        if (currentEmail && currentEmail !== invitation.email) {
            return res.status(403).json({ message: "Please sign in with the invited email address" });
        }

        const workspace = await prisma.workspace.findUnique({
            where: { id: invitation.workspaceId },
            include: { members: true },
        });

        if (!workspace) {
            return res.status(404).json({ message: "Workspace not found" });
        }

        const user = await ensureClerkUserInDatabase(userId);

        const existingMember = workspace.members.find((member) => member.userId === user.id);

        if (existingMember) {
            return res.json({ message: "You are already a member of this workspace", workspaceId: workspace.id });
        }

        await prisma.workspaceMember.create({
            data: {
                userId: user.id,
                workspaceId: workspace.id,
                role: invitation.role,
                message: `${user.name} joined the workspace ${workspace.name} through an invitation`,
            },
        });

        return res.json({ message: "Invitation accepted successfully", workspaceId: workspace.id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.code || err.message });
    }
};