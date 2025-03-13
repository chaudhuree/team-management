import Modal from '../common/Modal';
import { format } from 'date-fns';

const ViewNoteModal = ({ isOpen, onClose, note }) => {
  const formatDate = (date) => {
    try {
      return format(new Date(date), 'PPp');
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Note Details">
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="whitespace-pre-wrap">{note?.content}</div>
          {note?.comment && (
            <div className="mt-3 text-sm text-gray-600">
              <span className="font-medium">Comment:</span> {note.comment}
            </div>
          )}
        </div>
        <div className="text-sm text-gray-500">
          <div>Version {note?.version}</div>
          <div>By {note?.createdBy?.name}</div>
          <div>{formatDate(note?.updatedAt || note?.createdAt)}</div>
        </div>
      </div>
    </Modal>
  );
};

export default ViewNoteModal; 