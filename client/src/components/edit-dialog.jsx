import { useEffect } from 'react';
import AssignmentForm from './assignment-form.jsx';

export default function EditDialog({ assignment, onClose, onSave }) {
  useEffect(() => {
    function onKey(event) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="edit-title">Edit assignment</h2>
        <AssignmentForm
          key={assignment._id}
          initial={assignment}
          submitLabel="Save changes"
          onSubmit={onSave}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}
