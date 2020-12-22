import { Router } from 'express'

import { postMessagesRouter } from './post'

export const messagesChannelsRouter = Router()

messagesChannelsRouter.use('/', postMessagesRouter)
