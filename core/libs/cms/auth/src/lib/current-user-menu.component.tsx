import { useGetCurrentUserQuery, useLogoutMutation } from '@inithium/shared-data-access';

/** The signed-in user's email and role, with a sign-out button. */
export function CurrentUserMenu() {
  const { data: user } = useGetCurrentUserQuery();
  const [logout, { isLoading }] = useLogoutMutation();

  if (!user) return null;

  return (
    <div className="flex items-center gap-3 text-sm">
      <span>
        {user.email} <span className="text-gray-500">({user.role})</span>
      </span>
      <button
        type="button"
        onClick={() => logout()}
        disabled={isLoading}
        className="rounded border border-gray-300 px-3 py-1 disabled:opacity-50"
      >
        Sign out
      </button>
    </div>
  );
}
