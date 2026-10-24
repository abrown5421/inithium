import { useMemo, useState } from 'react';
import { roles, type ManagedUser, type Role } from '@inithium/shared-contracts';
import { useGetCurrentUserQuery, useGetUserManagementInfoQuery, useGetUsersQuery } from '@inithium/shared-data-access';
import { assignableRoles, canManageRole, hasPermission } from '@inithium/shared-permissions';
import { Button, Checkbox, Container, Input, Loader, Select, Text, Tooltip } from '@inithium/shared-ui-components';
import { Alert, Pagination } from '@inithium/shared-ui-composites';
import { DeleteUsersDialog } from './delete-users-dialog.component';
import { NewUserDialog } from './new-user-dialog.component';
import { Badge, managedUserName, UserDetails, type UserAbilities } from './user-details.component';
import { ROLE_COLORS, ROLE_LABELS } from './user-roles.config';
import { UserAvatar } from './user-avatar.component';

const PAGE_SIZE = 25;

/**
 * The CMS's Users screen (decision 0100, needs users.view): every account the viewer may see, 25 a page, searchable by
 * name or email and filterable by role. Each row opens the account's details; with users.delete, checkboxes select
 * accounts for deleting in bulk. With users.create, New account adds one with the site's temporary password.
 */
export function UsersScreen() {
  const { data: me } = useGetCurrentUserQuery();
  const info = useGetUserManagementInfoQuery();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<Role | 'all'>('all');
  const [page, setPage] = useState(1);
  const query = useGetUsersQuery({ page, pageSize: PAGE_SIZE, q: search.trim() || undefined, role: role === 'all' ? undefined : role });
  // Selected accounts by id, kept across pages so a bulk delete can name them all.
  const [selected, setSelected] = useState<Map<string, ManagedUser>>(new Map());
  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<ManagedUser[]>([]);

  const myRole = me?.role ?? 'user';
  const can = {
    create: hasPermission(myRole, 'users.create'),
    edit: hasPermission(myRole, 'users.edit'),
    delete: hasPermission(myRole, 'users.delete'),
  };
  const giveable = useMemo(() => assignableRoles(myRole), [myRole]);
  const tempPasswordSet = info.data?.tempPasswordSet ?? false;
  const users = query.data?.users ?? [];
  const total = query.data?.total ?? 0;

  /** Why this account can't be deleted by the viewer, or null if it can. */
  const deleteBlock = (user: ManagedUser) =>
    user.id === me?.id ? 'You can’t delete your own account' : !canManageRole(myRole, user.role) ? 'It’s more senior than your own' : null;
  const selectable = can.delete ? users.filter((user) => !deleteBlock(user)) : [];
  const pageSelected = selectable.filter((user) => selected.has(user.id)).length;

  const toggle = (user: ManagedUser, on: boolean) =>
    setSelected((current) => {
      const next = new Map(current);
      if (on) next.set(user.id, user);
      else next.delete(user.id);
      return next;
    });
  const togglePage = (on: boolean) =>
    setSelected((current) => {
      const next = new Map(current);
      for (const user of selectable) {
        if (on) next.set(user.id, user);
        else next.delete(user.id);
      }
      return next;
    });

  const open = users.find((user) => user.id === openId) ?? null;
  const abilities = (user: ManagedUser | null): UserAbilities => {
    const manageable = user ? canManageRole(myRole, user.role) : false;
    const self = user?.id === me?.id;
    return { edit: can.edit && manageable, delete: can.delete && manageable && !self, self, roles: giveable, tempPasswordSet };
  };
  const filterRoles = roles.filter((candidate) => candidate !== 'dev' || myRole === 'dev');

  return (
    <Container flex={{ direction: 'column', gap: 24 }}>
      <Container flex={{ direction: { base: 'column', md: 'row' }, align: { base: 'start', md: 'end' }, justify: 'between', gap: 16 }}>
        <Container flex={{ direction: 'column', gap: 4 }}>
          <Text as="h1" fontFamily="display" fontSize={28}>
            Users
          </Text>
          <Text as="p" fontSize={14} textColor={{ color: 'surface', intensity: 700 }}>
            Everyone with an account: members of the site and the people who run it.
          </Text>
        </Container>
        {can.create &&
          (tempPasswordSet ? (
            <Button leadingIcon="user-plus" onClick={() => setCreating(true)}>
              New account
            </Button>
          ) : (
            <Tooltip content="Set USER_TEMP_PASSWORD on the server first.">
              <Button leadingIcon="user-plus" disabled>
                New account
              </Button>
            </Tooltip>
          ))}
      </Container>

      {(can.create || can.edit) && info.data && !tempPasswordSet && (
        <Alert
          color="amber"
          icon="key-round"
          title="Creating accounts is off"
          message="New accounts and password resets use the site’s temporary password, which isn’t set. Your developer sets it as USER_TEMP_PASSWORD on the server."
        />
      )}

      <Container grid={{ columns: { base: 1, md: 2 }, gap: 12 }}>
        <Input
          label="Search by name or email"
          leadingIcon="search"
          value={search}
          onValueChange={(next) => {
            setSearch(next);
            setPage(1);
          }}
        />
        <Select
          label="Role"
          value={role}
          onValueChange={(next) => {
            setRole(next as Role | 'all');
            setPage(1);
          }}
          options={[{ value: 'all', label: 'All roles' }, ...filterRoles.map((candidate) => ({ value: candidate, label: ROLE_LABELS[candidate] }))]}
        />
      </Container>

      {can.delete && (
        <Container
          flex={{ align: 'center', justify: 'between', gap: 12, wrap: 'wrap' }}
          padding={{ x: 16, y: 8 }}
          radius={{ all: 8 }}
          bgColor={selected.size > 0 ? { color: 'primary', intensity: 50 } : { color: 'surface', intensity: 100 }}
        >
          <Checkbox
            label={selected.size > 0 ? `${selected.size} selected` : 'Select this page'}
            checked={pageSelected === 0 ? false : pageSelected === selectable.length ? true : 'indeterminate'}
            disabled={selectable.length === 0}
            onCheckedChange={(checked) => togglePage(checked === true)}
          />
          {selected.size > 0 && (
            <Container flex={{ gap: 8 }}>
              <Button color="red" leadingIcon="trash-2" onClick={() => setDeleting([...selected.values()])}>
                Delete {selected.size}
              </Button>
              <Button variant="ghost" onClick={() => setSelected(new Map())}>
                Clear
              </Button>
            </Container>
          )}
        </Container>
      )}

      {query.isLoading ? (
        <Container flex={{ justify: 'center' }} padding={{ all: 32 }}>
          <Loader size={32} label="Loading accounts" />
        </Container>
      ) : query.isError ? (
        <Container flex={{ direction: 'column', align: 'start', gap: 12 }}>
          <Text as="p">We couldn’t load the accounts.</Text>
          <Button variant="outlined" onClick={() => void query.refetch()}>
            Try again
          </Button>
        </Container>
      ) : users.length === 0 ? (
        <Text as="p" textColor={{ color: 'surface', intensity: 700 }}>
          {search || role !== 'all' ? 'No accounts match.' : 'No accounts yet.'}
        </Text>
      ) : (
        <Container as="ul" flex={{ direction: 'column', gap: 8 }} aria-label="Accounts">
          {users.map((user) => {
            const name = managedUserName(user);
            const block = deleteBlock(user);
            return (
              <Container
                as="li"
                key={user.id}
                flex={{ align: 'center', gap: 12 }}
                padding={{ left: can.delete ? 16 : 0 }}
                radius={{ all: 8 }}
                bgColor={selected.has(user.id) ? { color: 'primary', intensity: 50 } : { color: 'surface', intensity: 50 }}
                borderWidth={{ all: 1 }}
                borderColor={{ color: 'surface', intensity: 500, opacity: 30 }}
              >
                {can.delete &&
                  (block ? (
                    <Tooltip content={block}>
                      <Checkbox aria-label={`Select ${name}`} checked={false} disabled />
                    </Tooltip>
                  ) : (
                    <Checkbox aria-label={`Select ${name}`} checked={selected.has(user.id)} onCheckedChange={(checked) => toggle(user, checked === true)} />
                  ))}
                {/* A plain <button> filling the rest of the row: Button is a fixed-height row and can't hold this (decision 0092). */}
                <button
                  type="button"
                  onClick={() => setOpenId(user.id)}
                  aria-label={`${name}, ${ROLE_LABELS[user.role]}. Open details`}
                  style={{ flex: 1, minWidth: 0, padding: 0, border: 0, background: 'none', font: 'inherit', color: 'inherit', textAlign: 'start', cursor: 'pointer' }}
                >
                  <Container flex={{ align: 'center', gap: 12 }} padding={{ y: 12, left: can.delete ? 0 : 16, right: 16 }}>
                    <UserAvatar user={user} name={name} size={40} />
                    <Container flex={{ direction: 'column', gap: 2 }} flexItem={{ grow: 1 }} minWidth={0}>
                      <Text as="span" fontSize={15} fontWeight={600} truncate={1}>
                        {name}
                      </Text>
                      <Text as="span" fontSize={13} truncate={1} textColor={{ color: 'surface', intensity: 700 }}>
                        {user.email}
                      </Text>
                    </Container>
                    <Container flex={{ direction: 'row', wrap: 'wrap', justify: 'end', gap: 6 }} flexItem={{ shrink: 0 }}>
                      {user.passwordChangeRequired && <Badge label="Temporary password" color={{ color: 'amber', intensity: 600 }} />}
                      <Badge label={ROLE_LABELS[user.role]} color={ROLE_COLORS[user.role]} />
                    </Container>
                    <Container hidden={{ base: true, md: false }} flexItem={{ shrink: 0 }}>
                      <Text as="span" fontSize={13} textColor={{ color: 'surface', intensity: 700 }}>
                        Joined {new Date(user.createdAt).toLocaleDateString()}
                      </Text>
                    </Container>
                  </Container>
                </button>
              </Container>
            );
          })}
        </Container>
      )}

      {total > PAGE_SIZE && (
        <Pagination pageCount={Math.ceil(total / PAGE_SIZE)} page={page} onPageChange={setPage} pageSize={PAGE_SIZE} totalItems={total} aria-label="Account pages" />
      )}

      <NewUserDialog open={creating} onClose={() => setCreating(false)} roles={giveable} onCreated={() => setCreating(false)} />
      <UserDetails user={open} abilities={abilities(open)} onClose={() => setOpenId(null)} />
      <DeleteUsersDialog
        users={deleting}
        onClose={() => setDeleting([])}
        onDone={(result) =>
          setSelected((current) => {
            const next = new Map(current);
            for (const id of result.deleted) next.delete(id);
            return next;
          })
        }
      />
    </Container>
  );
}
