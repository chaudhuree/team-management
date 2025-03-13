import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const ProjectDetails = () => {
  const { id } = useParams();
  const { token } = useSelector((state) => state.auth);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const response = await axios.get(`/projects/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProject(response.data.data);
        setAssignments(response.data.data.assignments || []);
        setNotes(response.data.data.notes || []);
        setLoading(false);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error fetching project details');
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [id, token]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!project) {
    return <div className="text-center mt-8">Project not found</div>;
  }

  const getStatusColor = (status) => {
    if (status.includes('Completed')) return 'bg-green-100 text-green-800';
    if (status.includes('Started')) return 'bg-blue-100 text-blue-800';
    if (status.includes('Locked')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH':
        return 'text-red-600';
      case 'MEDIUM':
        return 'text-yellow-600';
      case 'LOW':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const calculateEarnings = (price) => {
    return price - (price * 0.2); // 20% deduction
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return format(date, 'PPP');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h1 className="text-3xl font-bold mb-4">{project?.name}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-3">Project Information</h2>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Type:</span>{' '}
                {project?.type?.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ') || 'N/A'}
              </p>
              <p><span className="font-medium">Description:</span> {project?.description || 'N/A'}</p>
              <p><span className="font-medium">Price:</span> ${project?.price || 0}</p>
              <p>
                <span className="font-medium">Earnings after completion:</span>{' '}
                ${project?.price ? calculateEarnings(project.price) : 0}
              </p>
              <p>
                <span className="font-medium">Priority:</span>
                <span className={getPriorityColor(project?.priority)}> {project?.priority || 'N/A'}</span>
              </p>
              <p>
                <span className="font-medium">Deadline:</span>{' '}
                {project?.deadline ? formatDate(project.deadline) : 'N/A'}
              </p>
              <p>
                <span className="font-medium">Creation Month:</span>{' '}
                {project?.creationMonth || 'N/A'}
              </p>
              <p>
                <span className="font-medium">Milestones:</span>{' '}
                {project?.milestones || 'N/A'}
              </p>
              <p>
                <span className="font-medium">Running Milestone:</span>{' '}
                {project?.runningMilestone || 'N/A'}
              </p>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-3">Status</h2>
            <div className="flex flex-wrap gap-2">
              {project?.status?.map((status, index) => (
                <span
                  key={index}
                  className={`px-3 py-1 rounded-full text-sm ${getStatusColor(status)}`}
                >
                  {status}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Assignments</h2>
          {assignments.length > 0 ? (
            <div className="space-y-4">
              {assignments?.map((assignment) => (
                <div key={assignment.id} className="border-b pb-3">
                  <p><span className="font-medium">Member:</span> {assignment.user.name}</p>
                  <p><span className="font-medium">Phase:</span> {assignment.phase}</p>
                  <p><span className="font-medium">Assigned:</span> {formatDate(assignment.createdAt)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No assignments yet</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Notes</h2>
          {notes.length > 0 ? (
            <div className="space-y-4">
              {notes?.map((note) => (
                <div key={note.id} className="border-b pb-3">
                  <p className="whitespace-pre-wrap">{note.content}</p>
                  <div className="text-sm text-gray-500 mt-2">
                    <span>Version {note.version}</span>
                    <span className="mx-2">•</span>
                    <span>{formatDate(note.updatedAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No notes yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;