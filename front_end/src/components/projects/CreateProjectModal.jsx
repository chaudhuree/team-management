import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createProject } from '../../store/slices/projectSlice';
import Modal from '../common/Modal';
import toast from 'react-hot-toast'; // Import toast

const CreateProjectModal = ({ isOpen, onClose, teamMembers, departments, isLoading }) => {
  const dispatch = useDispatch();
  const { teamMembers: existingTeamMembers } = useSelector((state) => state.team);
  const { user,team } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    type: 'FRONTEND_ONLY',
    deadline: '',
    notes: '',
    milestones: '',
    price: '',
    priority: 'MEDIUM',
    description: '',
    teamId: team.id, // Will be set in useEffect
  });

  // Ensure teamId is set from auth state
  useEffect(() => {
    if (user && user.teamId) {
      setFormData(prev => ({ ...prev, teamId: user.teamId }));
      console.log('Setting teamId from user:', user.teamId);
    }
  }, [user]);

  const projectTypes = [
    { value: 'FRONTEND_ONLY', label: 'Frontend Only' },
    { value: 'FULL_STACK', label: 'Full Stack' },
    { value: 'UI_ONLY', label: 'UI Only' },
  ];

  const priorities = [
    { value: 'HIGH', label: 'High' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'LOW', label: 'Low' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if teamId is set
    if (!formData.teamId) {
      toast.error('Team ID is required. Please try again or contact support.');
      console.error('TeamId is missing:', formData);
      return;
    }
    
    // Format the deadline to include time (ISO-8601 format)
    const formattedData = {
      ...formData,
      deadline: formData.deadline ? `${formData.deadline}T00:00:00.000Z` : null
    };
    
    if (!formattedData.deadline) {
      toast.error('Deadline is required.');
      return;
    }
    
    // toast.info('Submitting project...', { id: 'submit' });
    
    console.log('Submitting project with data:', formattedData);

    try {
      const result = await dispatch(createProject(formattedData)).unwrap();
      console.log('Project created successfully:', result);
      toast.success('Project created successfully!', { id: 'submit' });
      onClose();
    } catch (error) {
      console.error('Failed to create project:', error);
      toast.error(`Failed to create project: ${error.message || 'Unknown error'}`, { id: 'submit' });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Convert numeric fields to numbers
    if (name === 'price' || name === 'milestones') {
      setFormData((prev) => ({ ...prev, [name]: value === '' ? '' : Number(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  if (isLoading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Create New Project">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </Modal>
    );
  }

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