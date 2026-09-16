import express from 'express';
import {addMember, acceptWorkspaceInvitation, getUserWorkspaces, sendWorkspaceInvitationEmail} from '../controllers/workspaceControllers.js';

const workspaceRouter = express.Router();

workspaceRouter.get('/',getUserWorkspaces);
workspaceRouter.post('/add-member', addMember);
workspaceRouter.post('/invite-email', sendWorkspaceInvitationEmail);
workspaceRouter.post('/accept-invitation', acceptWorkspaceInvitation);


export default workspaceRouter;