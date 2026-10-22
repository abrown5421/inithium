import {
  memberGrowthSchema,
  myDashboardSchema,
  setupChecklistSchema,
  type DashboardWidget,
  type MemberGrowth,
  type MemberGrowthRange,
  type MyDashboard,
  type SetupChecklist,
} from '@inithium/shared-contracts';
import { baseApi } from './base.api';

const dashboardApi = baseApi.enhanceEndpoints({ addTagTypes: ['Dashboard', 'SetupChecklist'] }).injectEndpoints({
  endpoints: (build) => ({
    /** The signed-in user's CMS dashboard (decision 0120); `widgets: null` means the default one. Needs cms.access. */
    getMyDashboard: build.query<MyDashboard, void>({
      query: () => '/dashboard/me',
      transformResponse: (response: unknown) => myDashboardSchema.parse(response),
      providesTags: ['Dashboard'],
    }),
    /** Replaces the signed-in user's dashboard. The dashboard changes at once and goes back if saving fails. */
    saveMyDashboard: build.mutation<MyDashboard, DashboardWidget[]>({
      query: (widgets) => ({ url: '/dashboard/me', method: 'PUT', body: { widgets } }),
      transformResponse: (response: unknown) => myDashboardSchema.parse(response),
      async onQueryStarted(widgets, { dispatch, queryFulfilled }) {
        const patch = dispatch(dashboardApi.util.updateQueryData('getMyDashboard', undefined, () => ({ widgets })));
        const result = await queryFulfilled.catch(() => null);
        if (!result) patch.undo();
      },
    }),
    /** Members by join date over a range, grouped in a time zone (the Members widget). Needs users.view. */
    getMemberGrowth: build.query<MemberGrowth, { range: MemberGrowthRange; tz: string }>({
      query: ({ range, tz }) => `/dashboard/members?${new URLSearchParams({ range, tz }).toString()}`,
      transformResponse: (response: unknown) => memberGrowthSchema.parse(response),
    }),
    /** The setup checklist, each step's state read now (the Setup checklist widget). Needs settings.edit. */
    getSetupChecklist: build.query<SetupChecklist, void>({
      query: () => '/dashboard/setup-checklist',
      transformResponse: (response: unknown) => setupChecklistSchema.parse(response),
      providesTags: ['SetupChecklist'],
    }),
    /** Ticks or unticks a step that's ticked by hand, for the whole site. Needs settings.edit. */
    tickSetupChecklistItem: build.mutation<SetupChecklist, { id: string; done: boolean }>({
      query: ({ id, done }) => ({ url: `/dashboard/setup-checklist/${encodeURIComponent(id)}`, method: 'PUT', body: { done } }),
      transformResponse: (response: unknown) => setupChecklistSchema.parse(response),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const result = await queryFulfilled.catch(() => null);
        if (result) dispatch(dashboardApi.util.upsertQueryData('getSetupChecklist', undefined, result.data));
      },
    }),
  }),
});

export const {
  useGetMyDashboardQuery,
  useSaveMyDashboardMutation,
  useGetMemberGrowthQuery,
  useGetSetupChecklistQuery,
  useTickSetupChecklistItemMutation,
} = dashboardApi;
