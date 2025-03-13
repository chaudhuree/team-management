import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import Modal from '../common/Modal';

const AddNoteModal = ({ isOpen, onClose, projectId, note, onNoteAdded }) => {
  const [content, setContent] = useState('');
  const [comment, setComment] = useState('');
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (note) {
      setContent(note.content);
    }
  }, [note]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (note) {
        // Editing existing note
        response = await axios.patch(
          `/projects/notes/${note.id}`,
          {
            content,
            comment,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        // Creating new note
        response = await axios.post(
          '/projects/notes',
          {
            projectId,
            content,
            comment,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }
      
      onNoteAdded(response.data.data);
      toast.success(note ? 'Note updated successfully' : 'Note added successfully');
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${note ? 'update' : 'add'} note`);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={note ? "Edit Note" : "Add Project Note"}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Note Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={4}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Comment (Optional)
          </label>
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder={note ? "Reason for update" : "Brief description of changes"}
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            {note ? 'Update Note' : 'Add Note'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddNoteModal; 