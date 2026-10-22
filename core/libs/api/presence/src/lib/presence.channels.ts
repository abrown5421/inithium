import { isValidObjectId } from 'mongoose';
import { userStatusChannel } from '@inithium/shared-contracts';
import { serveRealtimeChannel } from '@inithium/api-realtime';
import { UserModel } from '@inithium/api-users';
import { userStatus } from './presence.service';

/**
 * `core:user-status/<userId>` (decision 0124): anyone, guests included, may follow a user's status, except a dev
 * account's, which only dev viewers see (dev accounts are hidden from everyone else, decision 0100). New
 * subscribers get the status at once.
 */
export const userStatusChannelServer = serveRealtimeChannel(userStatusChannel, {
  guests: true,
  canSubscribe: async (context, { userId }) => {
    if (!isValidObjectId(userId)) return false;
    const user = await UserModel.findById(userId, { role: 1 }).lean();
    return Boolean(user) && (user?.role !== 'dev' || context.user?.role === 'dev');
  },
  snapshot: (_context, { userId }) => [{ type: 'status.changed', payload: userStatus(userId) }],
});
