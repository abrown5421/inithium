import { useGetHealthQuery } from '../services/api';

interface Props {
  children: React.ReactNode;
}

export function DbConnectionGuard({ children }: Props) {
  const { data, isLoading, isError } = useGetHealthQuery(undefined, {
    pollingInterval: 30_000,
  });

  if (isLoading) {
    return (
      <div className="status-screen">
        <p>Checking database connection…</p>
      </div>
    );
  }

  if (isError || data?.status !== 'ok') {
    return (
      <div className="status-screen status-screen--error">
        <h1>Database Unavailable</h1>
        <p>
          {data?.db
            ? `Connection status: ${data.db}`
            : 'Could not reach the server.'}
        </p>
        <p>Please try again in a moment.</p>
      </div>
    );
  }

  return <>{children}</>;
}