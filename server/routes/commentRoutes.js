import express from 'express'
import { addComment, getComments } from '../controllers/commentContrller.js';

const commentRouter = express.Router();

commentRouter.post('/',addComment)
commentRouter.get('/:taskId',getComments)
 
export default commentRouter;
