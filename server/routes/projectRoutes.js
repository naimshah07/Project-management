import express from 'express'
import { addMember, createProject, updateProject } from '../controllers/projectController.js';

const projectRouter = express.Router();

projectRouter.post('/', createProject)
projectRouter.put('/', updateProject)
projectRouter.post('/:projectId/addmember', addMember)

export default projectRouter;
