import { Request, Response, Router } from 'express'
import { body } from 'express-validator'

import { authenticateUser } from '../../../../middlewares/authenticateUser'
import { validateRequest } from '../../../../middlewares/validateRequest'
import Channel from '../../../../models/Channel'
import Member from '../../../../models/Member'
import Message from '../../../../models/Message'
import { commonErrorsMessages } from '../../../../utils/config/constants'
import { emitToMembers } from '../../../../utils/config/socket'
import { ForbiddenError } from '../../../../utils/errors/ForbiddenError'
import { NotFoundError } from '../../../../utils/errors/NotFoundError'

export const postMessagesRouter = Router()

postMessagesRouter.post(
  '/channels/:channelId/messages',
  authenticateUser,
  [
    body('value')
      .trim()
      .escape()
      .isLength({ min: 1, max: 10_000 })
      .withMessage(
        commonErrorsMessages.charactersLength('value', { min: 1, max: 10_000 })
      )
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    if (req.user == null) {
      throw new ForbiddenError()
    }
    const user = req.user.current
    const { value } = req.body as { value: string }
    const { channelId } = req.params as { channelId: string }
    const channel = await Channel.findOne({
      where: { id: channelId, type: 'text' }
    })
    if (channel == null) {
      throw new NotFoundError()
    }
    const member = await Member.findOne({
      where: { userId: user.id, guildId: channel.guildId }
    })
    if (member == null) {
      throw new NotFoundError()
    }
    const messageCreated = await Message.create({
      value,
      type: 'text',
      memberId: member.id,
      channelId: channel.id
    })
    const message = { ...messageCreated.toJSON(), user: req.user.current }
    emitToMembers({
      event: 'messages',
      guildId: member.guildId,
      payload: { action: 'create', message }
    })
    return res.status(201).json({ message })
  }
)
