import {
  CONTENT_LOCK_HEADER,
  pageSchema,
  reusableTemplateSchema,
  type Page,
  type ContentDocument,
  type PageCreate,
  type PageDuplicate,
  type PageUpdate,
  type ReusableTemplate,
} from '@inithium/shared-contracts';
import { baseApi } from './base.api';

const pagesApi = baseApi.enhanceEndpoints({ addTagTypes: ['Page'] }).injectEndpoints({
  endpoints: (build) => ({
    /** Every page record, for the CMS (needs pages.edit; decision 0078). */
    getPages: build.query<Page[], void>({
      query: () => '/pages',
      transformResponse: (response: unknown) => pageSchema.array().parse(response),
      providesTags: (pages) => [
        { type: 'Page' as const, id: 'LIST' },
        ...(pages ?? []).map((page) => ({ type: 'Page' as const, id: page.id })),
      ],
    }),
    /** One page record, e.g. for the content editor (needs pages.edit). */
    getPage: build.query<Page, string>({
      query: (id) => `/pages/${id}`,
      transformResponse: (response: unknown) => pageSchema.parse(response),
      providesTags: (_page, _error, id) => [{ type: 'Page', id }],
    }),
    /**
     * Takes a content page's edit lock for a page builder session, or keeps it alive (needs pages.edit; decision 0116).
     * Fails with 409 and `editing` when someone else has the page open.
     */
    lockContent: build.mutation<void, { id: string; lockId: string }>({
      query: ({ id, lockId }) => ({ url: `/pages/${id}/content/lock`, method: 'POST', body: { lockId } }),
    }),
    /** Lets go of a content page's edit lock (decision 0116). */
    unlockContent: build.mutation<void, { id: string; lockId: string }>({
      query: ({ id, lockId }) => ({ url: `/pages/${id}/content/unlock`, method: 'POST', body: { lockId } }),
    }),
    /**
     * Saves a content page's draft (needs pages.edit and the edit lock; decisions 0093, 0116). The saved page replaces
     * the cached one.
     */
    saveContentDraft: build.mutation<Page, { id: string; draft: ContentDocument; lockId: string }>({
      query: ({ id, draft, lockId }) => ({ url: `/pages/${id}/content`, method: 'PUT', body: { draft }, headers: { [CONTENT_LOCK_HEADER]: lockId } }),
      transformResponse: (response: unknown) => pageSchema.parse(response),
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        const result = await queryFulfilled.catch(() => null);
        if (result) replacePage(dispatch, id, result.data);
      },
    }),
    /** Publishes a content page's draft, and the page if it wasn't live (needs pages.publish and the edit lock). */
    publishContent: build.mutation<Page, { id: string; lockId: string }>({
      query: ({ id, lockId }) => ({ url: `/pages/${id}/content/publish`, method: 'POST', headers: { [CONTENT_LOCK_HEADER]: lockId } }),
      transformResponse: (response: unknown) => pageSchema.parse(response),
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        const result = await queryFulfilled.catch(() => null);
        if (result) replacePage(dispatch, id, result.data);
      },
    }),
    /** Throws away a content page's unpublished changes (needs pages.edit and the edit lock). */
    discardContentDraft: build.mutation<Page, { id: string; lockId: string }>({
      query: ({ id, lockId }) => ({ url: `/pages/${id}/content/discard`, method: 'POST', headers: { [CONTENT_LOCK_HEADER]: lockId } }),
      transformResponse: (response: unknown) => pageSchema.parse(response),
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        const result = await queryFulfilled.catch(() => null);
        if (result) replacePage(dispatch, id, result.data);
      },
    }),
    /** Edits a page; `null` clears a colour or the animation. Changing status needs pages.publish. */
    updatePage: build.mutation<Page, { id: string; update: PageUpdate }>({
      query: ({ id, update }) => ({ url: `/pages/${id}`, method: 'PATCH', body: update }),
      transformResponse: (response: unknown) => pageSchema.parse(response),
      invalidatesTags: (_page, _error, { id }) => [{ type: 'Page', id }],
      // Put the saved page straight into the list.
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        const result = await queryFulfilled.catch(() => null);
        if (!result) return;
        dispatch(
          pagesApi.util.updateQueryData('getPages', undefined, (pages) => {
            const index = pages.findIndex((page) => page.id === id);
            if (index >= 0) pages[index] = result.data;
          }),
        );
      },
    }),
    /** The reusable templates new pages can be made from (needs pages.create; decision 0093). */
    getPageTemplates: build.query<ReusableTemplate[], void>({
      query: () => '/pages/templates',
      transformResponse: (response: unknown) => reusableTemplateSchema.array().parse(response),
    }),
    /** Creates an unpublished page from a reusable template (needs pages.create). */
    createPage: build.mutation<Page, PageCreate>({
      query: (body) => ({ url: '/pages', method: 'POST', body }),
      transformResponse: (response: unknown) => pageSchema.parse(response),
      invalidatesTags: [{ type: 'Page', id: 'LIST' }],
    }),
    /** Copies a page made from a reusable template under a new title and path (needs pages.create). */
    duplicatePage: build.mutation<Page, { id: string; copy: PageDuplicate }>({
      query: ({ id, copy }) => ({ url: `/pages/${id}/duplicate`, method: 'POST', body: copy }),
      transformResponse: (response: unknown) => pageSchema.parse(response),
      invalidatesTags: [{ type: 'Page', id: 'LIST' }],
    }),
    /** Deletes a page that isn't protected (needs pages.delete). */
    deletePage: build.mutation<void, string>({
      query: (id) => ({ url: `/pages/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Page', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetPageQuery,
  useLockContentMutation,
  useUnlockContentMutation,
  useSaveContentDraftMutation,
  usePublishContentMutation,
  useDiscardContentDraftMutation,
  useGetPagesQuery,
  useUpdatePageMutation,
  useDeletePageMutation,
  useGetPageTemplatesQuery,
  useCreatePageMutation,
  useDuplicatePageMutation,
} = pagesApi;
export { pagesApi };

/** Puts a saved page into the cached page and its row in the list, without refetching either. */
function replacePage(dispatch: (action: unknown) => unknown, id: string, page: Page) {
  dispatch(pagesApi.util.upsertQueryData('getPage', id, page));
  dispatch(
    pagesApi.util.updateQueryData('getPages', undefined, (pages) => {
      const index = pages.findIndex((entry) => entry.id === id);
      if (index >= 0) pages[index] = page;
    }),
  );
}
