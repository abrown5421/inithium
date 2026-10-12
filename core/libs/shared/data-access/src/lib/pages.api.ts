import {
  pageSchema,
  reusableTemplateSchema,
  type Page,
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
  useGetPagesQuery,
  useUpdatePageMutation,
  useDeletePageMutation,
  useGetPageTemplatesQuery,
  useCreatePageMutation,
  useDuplicatePageMutation,
} = pagesApi;
export { pagesApi };
