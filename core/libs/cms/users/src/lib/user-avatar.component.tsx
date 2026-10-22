import { profileImage, type ManagedUser } from '@inithium/shared-contracts';
import { useUserPresence } from '@inithium/shared-realtime';
import { Avatar } from '@inithium/shared-ui-composites';

/** An account's avatar in the Users screen, with its live status light (decision 0124). */
export function UserAvatar({ user, name, size, label }: { user: ManagedUser; name: string; size: number; label?: string }) {
  const presence = useUserPresence(user.id);
  return (
    <Avatar
      value={user.avatar}
      image={profileImage(user.avatarAssetId)}
      presence={presence}
      name={name}
      label={label}
      width={size}
      height={size}
    />
  );
}
