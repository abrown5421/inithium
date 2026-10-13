import type { Asset, AssetPurpose } from '@inithium/shared-contracts';
import { Modal } from '@inithium/shared-ui-composites';
import { UploadForm } from './upload-form.component';

export type UploadDialogProps = {
  open: boolean;
  onClose: () => void;
  /** What the file is for; without it, the dialog asks. */
  purpose?: AssetPurpose;
  purposes?: readonly AssetPurpose[];
  /** The dialog's heading. Default 'Upload a file'. */
  title?: string;
  onUploaded: (asset: Asset) => void;
};

/** The upload form (decision 0098) in a Modal. It starts afresh each time it opens. */
export function UploadDialog({ open, onClose, purpose, purposes, title = 'Upload a file', onUploaded }: UploadDialogProps) {
  return (
    <Modal open={open} onOpenChange={(next) => !next && onClose()} title={title} maxWidth={720}>
      {open && (
        <UploadForm
          purpose={purpose}
          purposes={purposes}
          onCancel={onClose}
          onUploaded={(asset) => {
            onUploaded(asset);
            onClose();
          }}
        />
      )}
    </Modal>
  );
}
