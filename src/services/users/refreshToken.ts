import { Request, Response, Router } from 'express'
import { body } from 'express-validator'
import jwt from 'jsonwebtoken'

import { validateRequest } from '../../middlewares/validateRequest'
import RefreshToken from '../../models/RefreshToken'
import { UserJWT } from '../../models/User'
import {
  expiresIn,
  generateAccessToken,
  ResponseJWT
} from '../../utils/config/jwtToken'
import { ForbiddenError } from '../../utils/errors/ForbiddenError'
import { UnauthorizedError } from '../../utils/errors/UnauthorizedError'

export const refreshTokenRouter = Router()

refreshTokenRouter.post(
  '/users/refresh-token',
  [
    body('refreshToken')
      .trim()
      .notEmpty()
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { refreshToken } = req.body as { refreshToken: string }
    const foundRefreshToken = await RefreshToken.findOne({
      where: { token: refreshToken }
    })
    if (foundRefreshToken == null) {
      throw new UnauthorizedError()
    }

    jwt.verify(
      foundRefreshToken.token,
      process.env.JWT_REFRESH_SECRET,
      (error, user) => {
        if (error != null) {
          throw new ForbiddenError()
        }
        const userJWT = user as UserJWT
        const accessToken = generateAccessToken({
          id: userJWT.id,
          strategy: userJWT.strategy
        })
        const responseJWT: ResponseJWT = {
          accessToken,
          expiresIn,
          type: 'Bearer'
        }
        return res.status(200).json(responseJWT)
      }
    )
  }
)
