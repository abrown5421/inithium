import { isValidObjectId } from 'mongoose';
import { userStatusChannel } from '@inithium/shared-contracts';
import { serveRealtimeChannel } from '@inithium/api-realtime';
import { UserModel } from '@inithium/api-users';
import { userStatus } from './presence.service';

/**
 * `core:user-status/<userId>` (decision 0124): anyone, guests included, may follow any account's status, whatever
 * either's role. New subscribers get the status at once.
 */
export const userStatusChannelServer = serveRealtimeChannel(userStatusChannel, {
  guests: true,
  canSubscribe: async (_context, { userId }) => isValidObjectId(userId) && Boolean(await UserModel.exists({ _id: userId })),
  snapshot: (_context, { userId }) => [{ type: 'status.changed', payload: userStatus(userId) }],
});
