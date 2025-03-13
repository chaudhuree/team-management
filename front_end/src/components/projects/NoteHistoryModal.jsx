import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import Modal from '../common/Modal';
import { format } from 'date-fns';
import ViewNoteModal from './ViewNoteModal';

const NoteHistoryModal = ({ isOpen, onClose, noteId }) => {
  const [noteData, setNoteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token } = useSelector((state) => state.auth);
  const [selectedViewNote, setSelectedViewNote] = useState(null);
  const [isViewNoteModalOpen, setIsViewNoteModalOpen] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get(`/projects/notes/${noteId}/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNoteData(response.data.data);
        setLoading(false);
      } catch (error) {
        toast.error('Failed to fetch note history');
        setLoading(false);
      }
    };

    fetchHistory();
  }, [noteId, token]);

  const formatDate = (date) => {
    try {
      return format(new Date(date), 'PPp');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Note History">
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : noteData ? (
          <>
            {/* Current Version */}
            <div className="border-b pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <p 
                    className="whitespace-nowrap overflow-hidden text-ellipsis cursor-pointer hover:text-blue-600"
                    onClick={() => {
                      setSelectedViewNote(noteData.current);
                      setIsViewNoteModalOpen(true);
                    }}
                  >
                    {truncateText(noteData.current.content)}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Version {noteData.current.version} • By {noteData.current.createdBy.name}
                  </p>
                </div>
                <p className="text-sm text-gray-500">
                  {formatDate(noteData.current.updatedAt)}
                </p>
              </div>
              {noteData.current.comment && (
                <p className="mt-2 text-sm text-gray-600">
                  Comment: {noteData.current.comment}
                </p>
              )}
            </div>

            {/* History Versions */}
            {noteData.history.map((version) => (
              <div key={version.id} className="border-b pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p 
                      className="whitespace-nowrap overflow-hidden text-ellipsis cursor-pointer hover:text-blue-600"
                      onClick={() => {
                        setSelectedViewNote(version);
                        setIsViewNoteModalOpen(true);
                      }}
                    >
                      {truncateText(version.content)}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Version {version.version} • By {version.createdBy.name}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500">
                    {formatDate(version.createdAt)}
                  </p>
                </div>
                {version.comment && (
                  <p className="mt-2 text-sm text-gray-600">
                    Comment: {version.comment}
                  </p>
                )}
              </div>
            ))}
          </>
        ) : (
          <p className="text-center text-gray-500">No history available</p>
        )}
      </div>

      {/* Add ViewNoteModal */}
      {isViewNoteModalOpen && selectedViewNote && (
        <ViewNoteModal
          isOpen={isViewNoteModalOpen}
          onClose={() => {
            setIsViewNoteModalOpen(false);
            setSelectedViewNote(null);
          }}
          note={selectedViewNote}
        />
      )}
    </Modal>
  );
};

export default NoteHistoryModal; 