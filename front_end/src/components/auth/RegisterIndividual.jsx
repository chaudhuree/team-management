import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { registerIndividual } from '../../store/slices/authSlice';
import { toast } from 'react-hot-toast';
import { FaUser as UserIcon, FaEnvelope as EnvelopeIcon, FaLock as LockIcon, FaUsers as UserGroupIcon } from 'react-icons/fa';

const RegisterIndividual = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    teamName: '',
    department: 'Frontend',
    photo: null,
  });

  const departments = [
    { value: 'Frontend', label: 'Frontend Developer' },
    { value: 'Backend', label: 'Backend Developer' },
    { value: 'UI', label: 'UI Designer' },
  ];

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'photo' && files.length > 0) {
      const file = files[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB');
        return;
      }
      setFormData((prev) => ({ ...prev, photo: file }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (!formData.name || !formData.email || !formData.password || !formData.teamName) {
        toast.error('Please fill in all required fields');
        return;
      }

      let dataToSend;
      if (formData.photo) {
        dataToSend = new FormData();
        Object.keys(formData).forEach(key => {
          if (formData[key] !== null) {
            dataToSend.append(key, formData[key]);
          }
        });
      } else {
        dataToSend = formData;
      }

      await dispatch(registerIndividual(dataToSend)).unwrap();
      toast.success('Registration successful! Please wait for team leader approval.');
      navigate('/login');
    } catch (error) {
      toast.error(error.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Register as Individual
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            {/* Name */}
            <div className="relative">
              <label htmlFor="name" className="sr-only">
                Full Name
              </label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="appearance-none rounded-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Full Name"
              />
            </div>

            {/* Email */}
            <div className="relative">
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="appearance-none rounded-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="appearance-none rounded-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>

            {/* Team Name */}
            <div className="relative">
              <label htmlFor="teamName" className="sr-only">
                Team Name
              </label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserGroupIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="teamName"
                name="teamName"
                type="text"
                required
                value={formData.teamName}
                onChange={handleInputChange}
                className="appearance-none rounded-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Team Name"
              />
            </div>

            {/* Department */}
            <div>
              <select
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              >
                {departments.map((dept) => (
                  <option key={dept.value} value={dept.value}>
                    {dept.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Photo Upload */}
            <div className="rounded-b-md">
              <label htmlFor="photo" className="block text-sm font-medium text-gray-700 mt-2 mb-1">
                Profile Photo (Optional)
              </label>
              <input
                id="photo"
                name="photo"
                type="file"
                accept="image/*"
                onChange={handleInputChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </div>
        </form>

        <div className="text-center">
          <Link
            to="/register/team"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Register as a Team Instead
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterIndividual;
