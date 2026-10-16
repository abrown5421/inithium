import { useState } from 'react';
import type { Page } from '@inithium/shared-contracts';
import { readApiFailure, useAlerts, useDeletePageMutation, useGetPageUsageQuery } from '@inithium/shared-data-access';
import { Button, Container, Icon, Loader, Text } from '@inithium/shared-ui-components';
import { Modal } from '@inithium/shared-ui-composites';

export type DeletePageDialogProps = {
  /** The page to delete; the dialog is open while there is one. */
  page: Page | null;
  onClose: () => void;
};

/**
 * Asks before deleting a page that isn't protected (needs pages.delete), listing the content pages that link to it
 * (decision 0116): their links show as plain text once it's gone. Deleting can't be undone.
 */
export function DeletePageDialog({ page, onClose }: DeletePageDialogProps) {
  const [deletePage, { isLoading }] = useDeletePageMutation();
  const { show: showAlert } = useAlerts();
  // Keep the last page while the Modal animates out.
  const [shown, setShown] = useState(page);
  if (page && page !== shown) setShown(page);
  const target = page ?? shown;
  const usage = useGetPageUsageQuery(page?.id ?? '', { skip: !page, refetchOnMountOrArgChange: true });
  const linkedFrom = usage.data?.places ?? [];

  const confirm = async () => {
    if (!target) return;
    try {
      await deletePage(target.id).unwrap();
      showAlert({ color: 'green', icon: 'trash-2', title: 'Page deleted', message: `${target.title} is gone from the site.` });
      onClose();
    } catch (error) {
      showAlert({
        color: 'red',
        icon: 'circle-alert',
        title: 'We couldn’t delete the page',
        message: readApiFailure(error).message ?? 'Something went wrong. Please try again.',
        urgent: true,
      });
    }
  };

  return (
    <Modal
      open={page !== null}
      onOpenChange={(open) => !open && onClose()}
      title={`Delete “${target?.title ?? ''}”?`}
      description={`${target?.path ?? ''} will stop working, and links to it will lead nowhere.`}
      maxWidth={480}
    >
      <Container flex={{ direction: 'column', gap: 20 }}>
        {usage.isFetching ? (
          <Loader size={20} label="Checking where it’s linked from" />
        ) : (
          linkedFrom.length > 0 && (
            <Container flex={{ direction: 'column', gap: 8 }} padding={{ all: 12 }} radius={{ all: 8 }} bgColor={{ color: 'amber', intensity: 100 }} textColor={{ color: 'amber', intensity: 800 }}>
              <Container flex={{ direction: 'row', align: 'center', gap: 8 }}>
                <Icon name="link-2-off" size={18} />
                <Text as="p" fontWeight={600}>
                  {linkedFrom.length === 1 ? 'A page links to it' : `${linkedFrom.length} pages link to it`}
                </Text>
              </Container>
              <Container as="ul" flex={{ direction: 'column', gap: 2 }} padding={{ left: 26 }}>
                {linkedFrom.map((place) => (
                  <Container as="li" key={place.label}>
                    <Text as="span" fontSize={14}>
                      {place.label}
                    </Text>
                  </Container>
                ))}
              </Container>
              <Text as="p" fontSize={13}>
                Those links will show as plain text, and buttons to it will be switched off.
              </Text>
            </Container>
          )
        )}
        <Text as="p">This can’t be undone. To take a page off the site for now, unpublish it instead.</Text>
        <Container flex={{ justify: 'end', gap: 8 }}>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button color="red" leadingIcon="trash-2" loading={isLoading} onClick={() => void confirm()}>
            Delete page
          </Button>
        </Container>
      </Container>
    </Modal>
  );
}
