import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { updateProjectStatus } from '../../store/slices/projectSlice';
import { FaPlus as PlusIcon, FaTrash as TrashIcon, FaHistory as HistoryIcon, FaEdit as EditIcon } from 'react-icons/fa';
import AssignMemberModal from './AssignMemberModal';
import AddNoteModal from './AddNoteModal';
import StatusHistoryModal from './StatusHistoryModal';
import NoteHistoryModal from './NoteHistoryModal';
import ViewNoteModal from './ViewNoteModal';
// get role of user from redux

const ProjectDetails = () => {
  const { id } = useParams();
  const { token } = useSelector((state) => state.auth);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [notes, setNotes] = useState([]);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [isStatusHistoryModalOpen, setIsStatusHistoryModalOpen] = useState(false);
  const [statusComment, setStatusComment] = useState('');
  const [isNoteHistoryModalOpen, setIsNoteHistoryModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [selectedViewNote, setSelectedViewNote] = useState(null);
  const [isViewNoteModalOpen, setIsViewNoteModalOpen] = useState(false);

  useEffect(() => {
    fetchProjectDetails();
  }, [id, token]);
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
  const fetchTeamMembers = async () => {
    try {
      const response = await axios.get('/users/team-members', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeamMembers(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch team members');
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    try {
      await axios.delete(`/projects/assignments/${assignmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAssignments(assignments.filter(a => a.id !== assignmentId));
      toast.success('Member removed from assignment');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove member');
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await axios.delete(`/projects/notes/${noteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(notes.filter(note => note.id !== noteId));
      toast.success('Note deleted successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete note');
    }
  };

  const handleEditNote = (note) => {
    setSelectedNote(note);
    setIsEditingNote(true);
    setIsAddNoteModalOpen(true);
  };

  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

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

  const handleStatusChange = async (newStatus) => {
    try {
      await dispatch(updateProjectStatus({
        projectId: project.id,
        status: newStatus,
        comment: statusComment || '',
      })).unwrap();
      
      toast.success('Project status updated successfully');
      setStatusComment(''); // Clear the comment after successful update
      fetchProjectDetails();
    } catch (error) {
      toast.error('Failed to update project status');
    }
  };

  const groupAssignmentsByPhase = (assignments) => {
    return assignments.reduce((acc, assignment) => {
      if (!acc[assignment.phase]) {
        acc[assignment.phase] = [];
      }
      acc[assignment.phase].push(assignment);
      return acc;
    }, {});
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Assignments</h2>
            {user?.role === 'LEADER' && (
              <button
                onClick={() => {
                  fetchTeamMembers();
                  setIsAssignModalOpen(true);
                }}
                className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Assign Member
              </button>
            )}
          </div>
          {assignments.length > 0 ? (
            <div className="space-y-6">
              {Object.entries(groupAssignmentsByPhase(assignments)).map(([phase, phaseAssignments]) => (
                <div key={phase} className="border-b pb-4 last:border-b-0">
                  <h3 className="font-medium text-lg mb-3">{phase}</h3>
                  <div className="space-y-4">
                    {phaseAssignments.map((assignment) => (
                      <div key={assignment.id} className="flex items-center space-x-4 bg-gray-50 p-3 rounded-lg">
                        <div className="flex-shrink-0">
                          {assignment?.user?.photo ? (
                            <img
                              src={assignment?.user?.photo}
                              alt={assignment?.user?.name}
                              className="h-10 w-10 rounded-full"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-500 text-lg">
                                {assignment?.user?.name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-grow">
                          <div className="flex items-center">
                            <p className="font-medium">{assignment?.user?.name}</p>
                            {assignment?.user?.role === 'LEADER' && (
                              <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                                Leader
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            {assignment?.user?.department?.name || 'No Department'} •
                            Assigned: {formatDate(assignment?.createdAt)}
                          </p>
                        </div>
                        {user?.role === 'LEADER' && (
                          <button
                            onClick={() => handleDeleteAssignment(assignment?.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                            title="Remove member"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No assignments yet</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Notes</h2>
            <button
              onClick={() => setIsAddNoteModalOpen(true)}
              className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Note
            </button>
          </div>
          {notes.length > 0 ? (
            <div className="space-y-4">
              {notes.map((note) => (
                <div key={note.id} className="border-b pb-3">
                  <div className="flex justify-between items-start">
                    <p 
                      className="whitespace-nowrap overflow-hidden text-ellipsis cursor-pointer hover:text-blue-600"
                      onClick={() => {
                        setSelectedViewNote(note);
                        setIsViewNoteModalOpen(true);
                      }}
                    >
                      {truncateText(note.content)}
                    </p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedNote(note);
                          setIsNoteHistoryModalOpen(true);
                        }}
                        className="p-1 text-gray-600 hover:text-gray-800"
                        title="View History"
                      >
                        <HistoryIcon className="h-4 w-4" />
                      </button>
                      {user?.role === 'LEADER' && (
                        <>
                          <button
                            onClick={() => handleEditNote(note)}
                            className="p-1 text-blue-600 hover:text-blue-800"
                            title="Edit Note"
                          >
                            <EditIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="p-1 text-red-600 hover:text-red-800"
                            title="Delete Note"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 mt-2">
                    <span>Version {note.version}</span>
                    <span className="mx-2">•</span>
                    <span>By {note.createdBy?.name}</span>
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

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Project Status</h2>
          <button
            onClick={() => setIsStatusHistoryModalOpen(true)}
            className="flex items-center px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            <HistoryIcon className="h-4 w-4 mr-1" />
            View History
          </button>
        </div>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <select
              value={project.projectStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="NOT_STARTED">Not Started</option>
              <option value="WIP">Work in Progress</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="DISPUTE">Dispute</option>
              <option value="DELIVERED">Delivered</option>
              <option value="REVISION_DELIVERY">Revision Delivery</option>
            </select>
          </div>
        </div>
        {project.deliveryDate && (
          <p className="mt-2 text-sm text-gray-600">
            Delivered on: {formatDate(project.deliveryDate)}
          </p>
        )}
      </div>

      {isAssignModalOpen && (
        <AssignMemberModal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          projectId={id}
          teamMembers={teamMembers}
          setAssignments={setAssignments}
        />
      )}

      {isAddNoteModalOpen && (
        <AddNoteModal
          isOpen={isAddNoteModalOpen}
          onClose={() => {
            setIsAddNoteModalOpen(false);
            setSelectedNote(null);
            setIsEditingNote(false);
          }}
          projectId={id}
          note={isEditingNote ? selectedNote : null}
          onNoteAdded={(newNote) => {
            if (isEditingNote) {
              setNotes(notes.map(n => n.id === newNote.id ? newNote : n));
            } else {
              setNotes([...notes, newNote]);
            }
          }}
        />
      )}

      {isStatusHistoryModalOpen && (
        <StatusHistoryModal
          isOpen={isStatusHistoryModalOpen}
          onClose={() => setIsStatusHistoryModalOpen(false)}
          projectId={id}
        />
      )}

      {isNoteHistoryModalOpen && selectedNote && (
        <NoteHistoryModal
          isOpen={isNoteHistoryModalOpen}
          onClose={() => {
            setIsNoteHistoryModalOpen(false);
            setSelectedNote(null);
          }}
          noteId={selectedNote.id}
        />
      )}

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
    </div>
  );
};

export default ProjectDetails;