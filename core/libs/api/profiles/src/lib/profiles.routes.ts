import { Router } from 'express';
import { updateProfileRequestSchema, type PublicProfile } from '@inithium/shared-contracts';
import { getAuth, readAuth, requireAuth } from '@inithium/api-auth';
import { findUserById, toPublicProfile, updateUserProfile } from '@inithium/api-users';

/** Mounted at /api/profiles (decision 0090). */
export const profilesRouter = Router();

/** Changes the signed-in user's own profile. Fields left out stay as they are. */
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
  const body: PublicProfile = toPublicProfile(await updateUserProfile(user, parsed.data), { owner: true });
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
