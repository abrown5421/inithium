import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { loginRequestSchema } from '@inithium/shared-contracts';
import { getApiErrorMessage, useGetCurrentUserQuery, useLoginMutation, useLogoutMutation } from '@inithium/shared-data-access';
import { hasPermission } from '@inithium/shared-permissions';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const { data: currentUser } = useGetCurrentUserQuery();
  const [login, { isLoading }] = useLoginMutation();
  const [logout] = useLogoutMutation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (currentUser && hasPermission(currentUser.role, 'cms.access')) {
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const parsed = loginRequestSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Check your email and password');
      return;
    }

    try {
      const user = await login(parsed.data).unwrap();
      if (!hasPermission(user.role, 'cms.access')) {
        await logout();
        setError("This account doesn't have access to the CMS");
        return;
      }
      navigate(from, { replace: true });
    } catch (loginError) {
      setError(getApiErrorMessage(loginError, 'Something went wrong. Please try again.'));
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <form onSubmit={handleSubmit} noValidate className="w-full max-w-sm space-y-4 rounded-lg bg-white p-8 shadow">
        <h1 className="text-xl font-semibold">Sign in to the CMS</h1>

        <label className="block space-y-1">
          <span className="text-sm font-medium">Email</span>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium">Password</span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2"
          />
        </label>

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded bg-gray-900 px-3 py-2 font-medium text-white disabled:opacity-50"
        >
          {isLoading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </main>
  );
}
