import { pageSchema, type Page, type PageUpdate } from '@inithium/shared-contracts';
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
    /** Deletes a page that isn't protected (needs pages.delete). */
    deletePage: build.mutation<void, string>({
      query: (id) => ({ url: `/pages/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Page', id: 'LIST' }],
    }),
  }),
});

export const { useGetPagesQuery, useUpdatePageMutation, useDeletePageMutation } = pagesApi;
export { pagesApi };
