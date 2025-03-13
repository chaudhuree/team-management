import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { assignUserToProject } from '../../store/slices/projectSlice';
import Modal from '../common/Modal';
import toast from 'react-hot-toast';
import axios from 'axios';
const AssignMemberModal = ({ isOpen, onClose, projectId, teamMembers ,setAssignments}) => {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const [selectedMember, setSelectedMember] = useState('');
  const [selectedPhase, setSelectedPhase] = useState('FRONTEND');

  const phases = [
    { value: 'FRONTEND', label: 'Frontend' },
    { value: 'BACKEND', label: 'Backend' },
    { value: 'UI', label: 'UI' },
  ];


  const fetchProjectDetails = async () => {
    try {
      const response = await axios.get(`/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAssignments(response.data.data.assignments || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error fetching project details');
      setLoading(false);
    }
  };

  fetchProjectDetails();
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMember || !selectedPhase) {
      toast.error('Please select both member and phase');
      return;
    }

    try {
      const result = await dispatch(assignUserToProject({
        projectId,
        userId: selectedMember,
        phase: selectedPhase,
      })).unwrap();
      
      const memberName = teamMembers.find(m => m.id === selectedMember)?.name;
      toast.success(`${memberName} assigned to ${selectedPhase.toLowerCase()} phase successfully`);
      //update the project details
      setAssignments(prevAssignments => [...prevAssignments, result]);

      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to assign member');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Team Member">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Select Member
          </label>
          <select
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Select a member</option>
            {teamMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Select Phase
          </label>
          <select
            value={selectedPhase}
            onChange={(e) => setSelectedPhase(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {phases.map((phase) => (
              <option key={phase.value} value={phase.value}>
                {phase.label}
              </option>
            ))}
          </select>
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
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Assign Member
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AssignMemberModal; 