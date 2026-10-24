import { AlertTriangle } from 'lucide-react';
import Button from './Button';
import Modal from './Modal';

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', loading = false, onConfirm, onCancel }) {
  return (
    <Modal
      open={open}
      onClose={loading ? undefined : onCancel}
      title={title}
      size="sm"
      footer={(
        <>
          <Button variant="secondary" onClick={onCancel} disabled={loading} data-autofocus>Cancel</Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
        </>
      )}
    >
      <div className="flex gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600">
          <AlertTriangle className="h-5 w-5" aria-hidden />
        </div>
        <div className="text-sm leading-6 text-slate-600">{message}</div>
      </div>
    </Modal>
  );
}
