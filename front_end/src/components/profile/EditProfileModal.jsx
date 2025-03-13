import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import Modal from '../common/Modal';
import { FaEdit as EditIcon } from 'react-icons/fa';

const EditProfileModal = ({ isOpen, onClose }) => {
  const { user, team, token, isTeam } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    photo: null
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [changePassword, setChangePassword] = useState(false);

  useEffect(() => {
    if (isTeam && team) {
      setFormData(prev => ({
        ...prev,
        name: team.name || '',
      }));
      setPhotoPreview(team.logo || null);
    } else if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
      }));
      setPhotoPreview(user.photo || null);
    }
  }, [user, team, isTeam]);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'photo' && files.length > 0) {
      const file = files[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB');
        return;
      }
      setFormData(prev => ({ ...prev, photo: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate password if changing
      if (changePassword) {
        if (!formData.currentPassword) {
          toast.error('Current password is required');
          setIsLoading(false);
          return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
          toast.error('New passwords do not match');
          setIsLoading(false);
          return;
        }
      }

      // Handle profile update
      let profileUpdated = false;
      
      // Only proceed with profile update if name has changed or photo is provided
      if (
        (isTeam && formData.name !== team?.name) || 
        (!isTeam && formData.name !== user?.name) || 
        formData.photo
      ) {
        // For regular JSON data (when only updating name without photo)
        if (!formData.photo) {
          const profileData = { name: formData.name };
          console.log('Sending JSON profile update with name:', profileData);
          
          const endpoint = isTeam ? '/teams/profile' : '/users/profile';
          console.log('Using endpoint:', endpoint, 'with token:', token ? 'Token exists' : 'No token');
          
          const profileResponse = await axios.patch(endpoint, profileData, {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log('Profile update response:', profileResponse.data);
          
          // Update in Redux store
          dispatch({
            type: 'auth/updateProfile',
            payload: {
              data: profileResponse.data.data,
              isTeam
            }
          });
          
          profileUpdated = true;
        } 
        // For multipart form data (when updating photo)
        else {
          const formDataObj = new FormData();
          
          // Always include name in the form data
          formDataObj.append('name', formData.name);
          formDataObj.append(isTeam ? 'logo' : 'photo', formData.photo);
          
          const endpoint = isTeam ? '/teams/profile' : '/users/profile';
          console.log('Sending multipart profile update to:', endpoint, 'with name:', formData.name);
          
          const profileResponse = await axios.patch(endpoint, formDataObj, {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          });
          
          console.log('Profile update response:', profileResponse.data);
          
          // Update in Redux store
          dispatch({
            type: 'auth/updateProfile',
            payload: {
              data: profileResponse.data.data,
              isTeam
            }
          });
          
          profileUpdated = true;
        }
      }

      // Update password if requested
      let passwordUpdated = false;
      if (changePassword && formData.currentPassword && formData.newPassword) {
        const passwordEndpoint = isTeam ? '/teams/change-password' : '/users/change-password';
        await axios.patch(passwordEndpoint, {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        passwordUpdated = true;
      }

      if (profileUpdated && passwordUpdated) {
        toast.success('Profile and password updated successfully');
      } else if (profileUpdated) {
        toast.success('Profile updated successfully');
      } else if (passwordUpdated) {
        toast.success('Password updated successfully');
      } else {
        toast.info('No changes were made');
      }
      
      onClose();
      
      // Reload the page to reflect changes
      if (profileUpdated || passwordUpdated) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Update error:', error.response?.data || error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Photo */}
        <div className="flex flex-col items-center space-y-3">
          <div className="relative">
            {photoPreview ? (
              <img 
                src={photoPreview} 
                alt={formData.name} 
                className="h-24 w-24 rounded-full object-cover"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 text-xl">
                  {formData.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            )}
            <label 
              htmlFor="photo-upload" 
              className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full cursor-pointer hover:bg-blue-700"
            >
              <EditIcon className="h-4 w-4" />
            </label>
            <input 
              id="photo-upload" 
              name="photo" 
              type="file" 
              accept="image/*" 
              onChange={handleInputChange} 
              className="hidden" 
            />
          </div>
        </div>

        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            {isTeam ? 'Team Name' : 'Name'}
          </label>
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Password Change Toggle */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="change-password"
            checked={changePassword}
            onChange={() => setChangePassword(!changePassword)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="change-password" className="ml-2 block text-sm text-gray-900">
            Change Password
          </label>
        </div>

        {/* Password Fields (Conditional) */}
        {changePassword && (
          <div className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                Current Password
              </label>
              <input
                type="password"
                name="currentPassword"
                id="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                id="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

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
            disabled={isLoading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditProfileModal; 