import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createProject } from '../../store/slices/projectSlice';
import Modal from '../common/Modal';

const CreateProjectModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { teamMembers } = useSelector((state) => state.team);
  const [formData, setFormData] = useState({
    name: '',
    type: 'frontend',
    deadline: '',
    notes: '',
    milestones: '',
    price: '',
    priority: 'medium',
    description: '',
    assignedPeople: [],
  });

  const projectTypes = [
    { value: 'frontend', label: 'Frontend Only' },
    { value: 'fullstack', label: 'Full Stack' },
    { value: 'ui', label: 'UI Only' },
  ];

  const priorities = [
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(createProject(formData)).unwrap();
      onClose();
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAssignmentChange = (e, memberId) => {
    const isChecked = e.target.checked;
    setFormData((prev) => ({
      ...prev,
      assignedPeople: isChecked
        ? [...prev.assignedPeople, memberId]
        : prev.assignedPeople.filter((id) => id !== memberId),
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Project">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Project Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Project Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {projectTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Deadline */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Deadline
          </label>
          <input
            type="date"
            name="deadline"
            value={formData.deadline}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Price</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              required
              className="block w-full pl-7 pr-12 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Priority
          </label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {priorities.map((priority) => (
              <option key={priority.value} value={priority.value}>
                {priority.label}
              </option>
            ))}
          </select>
        </div>

        {/* Milestones */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Milestones
          </label>
          <input
            type="number"
            name="milestones"
            value={formData.milestones}
            onChange={handleInputChange}
            placeholder="Number of milestones (optional)"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Project Details
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            rows={3}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows={3}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Assign Team Members */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assign Team Members
          </label>
          <div className="max-h-60 overflow-y-auto border rounded-md p-3">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center space-x-3 py-2">
                <input
                  type="checkbox"
                  id={`member-${member.id}`}
                  checked={formData.assignedPeople.includes(member.id)}
                  onChange={(e) => handleAssignmentChange(e, member.id)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor={`member-${member.id}`}
                  className="text-sm text-gray-700"
                >
                  {member.name} - {member.department}
                </label>
              </div>
            ))}
          </div>
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
            Create Project
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateProjectModal;
