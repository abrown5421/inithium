import { Router } from 'express';
import { updateProfileRequestSchema, type PublicProfile } from '@inithium/shared-contracts';
import { checkProfileImage, releaseProfileImage } from '@inithium/api-assets';
import { getAuth, readAuth, requireAuth } from '@inithium/api-auth';
import { findUserById, toPublicProfile, updateUserProfile } from '@inithium/api-users';

/** Mounted at /api/profiles (decision 0090). */
export const profilesRouter = Router();

/**
 * Changes the signed-in user's own profile. Fields left out stay as they are. An uploaded avatar or banner must be the
 * user's own upload of that kind; the picture it replaces (or that `null` removes) is deleted (decision 0098).
 */
profilesRouter.patch('/me', requireAuth, async (req, res) => {
  const parsed = updateProfileRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).send({ message: 'Check the highlighted fields and try again', issues: parsed.error.issues });
    return;
  }

  const user = await findUserById(getAuth(res).sub);
  if (!user) {
    res.status(401).send({ message: 'Not authenticated' });
    return;
  }
  const userId = user._id.toString();
  const before = { avatar: user.profile?.avatarAssetId, banner: user.profile?.bannerAssetId };
  const { avatarAssetId, bannerAssetId } = parsed.data;
  if (avatarAssetId) await checkProfileImage(userId, avatarAssetId, 'avatar');
  if (bannerAssetId) await checkProfileImage(userId, bannerAssetId, 'banner');

  const updated = await updateUserProfile(user, parsed.data);
  // Delete the pictures that are no longer shown.
  for (const [old, next] of [
    [before.avatar, avatarAssetId],
    [before.banner, bannerAssetId],
  ] as const) {
    if (old && next !== undefined && next !== old) {
      await releaseProfileImage(old).catch((error: Error) => console.warn(`[ assets ] couldn't delete replaced picture ${old}: ${error.message}`));
    }
  }
  const body: PublicProfile = toPublicProfile(updated, { owner: true });
  res.send(body);
});

/** Anyone's profile, signed in or not; its owner also gets the email. Unknown or malformed ids are a 404. */
profilesRouter.get('/:id', async (req, res) => {
  const user = await findUserById(req.params.id);
  if (!user) {
    res.status(404).send({ message: 'Profile not found' });
    return;
  }
  const body: PublicProfile = toPublicProfile(user, { owner: readAuth(req)?.sub === user._id.toString() });
  res.send(body);
});
