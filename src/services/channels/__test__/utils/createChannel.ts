import request from 'supertest'

import app from '../../../../app'
import Channel from '../../../../models/Channel'
import {
  createGuild,
  CreateGuildResult
} from '../../../guilds/__test__/utils/createGuild'

interface ChannelOptions {
  name: string
  description: string
}

interface CreateChannelResult extends CreateGuildResult {
  channels: Channel[]
}

export const createChannel = async (
  channels: ChannelOptions[]
): Promise<CreateChannelResult> => {
  const result = await createGuild({
    guild: { description: 'description', name: 'guild' },
    user: {
      email: 'test@test.com',
      name: 'Test'
    }
  })
  const channelsResponses: Channel[] = []
  for (const { name, description } of channels) {
    const response = await request(app)
      .post(`/guilds/${result.guild.id as number}/channels`)
      .set('Authorization', `${result.user.type} ${result.user.accessToken}`)
      .send({ name, description })
      .expect(201)
    channelsResponses.push(response.body.channel)
  }
  return {
    ...result,
    channels: channelsResponses
  }
}
