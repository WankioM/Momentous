import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface UserStats {
  totalTokensMinted: number;
  totalTokensOwned: number;
  totalServicesOffered: number;
  totalTransactions: number;
  minutesEarned: number;
  minutesSpent: number;
}

const Profile: React.FC = () => {
  const { currentUser } = useAuth();
  const [username, setUsername] = useState<string>(currentUser?.username || '');
  const [email, _setEmail] = useState<string>(currentUser?.email || '');
  const [bio, setBio] = useState<string>('');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState<string>('');
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);
  const [success, setSuccess] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Fetch user profile data
        const profileResponse = await axios.get('/api/users/profile');
        
        if (profileResponse.data.bio) {
          setBio(profileResponse.data.bio);
        }
        
        if (profileResponse.data.skills) {
          setSkills(profileResponse.data.skills);
        }
        
        // Fetch user stats
        const statsResponse = await axios.get('/api/users/stats');
        setStats(statsResponse.data);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile data:', error);
        setError('Failed to load profile data');
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setUpdating(true);
    
    try {
      await axios.put('/api/users/profile', {
        username,
        bio,
        skills
      });
      
      setSuccess('Profile updated successfully');
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  // Format minutes into hours and minutes
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    return hours > 0
      ? `${hours}h ${mins > 0 ? `${mins}m` : ''}`
      : `${mins}m`;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Info */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
            
            <form onSubmit={handleUpdateProfile}>
              <div className="mb-4">
                <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-500 bg-gray-100 leading-tight"
                />
                <p className="mt-1 text-sm text-gray-500">Email cannot be changed</p>
              </div>
              
              <div className="mb-4">
                <label htmlFor="bio" className="block text-gray-700 text-sm font-bold mb-2">
                  Bio
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  rows={4}
                  placeholder="Tell others about yourself..."
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Skills & Services
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {skills.map((skill, index) => (
                    <div key={index} className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm flex items-center">
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="ml-2 text-indigo-600 hover:text-indigo-800"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="flex">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    className="shadow appearance-none border rounded-l w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="Add a skill..."
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="bg-indigo-600 text-white py-2 px-4 rounded-r hover:bg-indigo-700 transition duration-200"
                  >
                    Add
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-end">
                <button
                  type="submit"
                  disabled={updating}
                  className={`bg-indigo-600 text-white py-2 px-6 rounded hover:bg-indigo-700 transition duration-200 ${
                    updating ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {updating ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
        
        {/* Right Column: Stats */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Your Stats</h2>
            
            {stats && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-gray-600">Reputation Score</h3>
                  <div className="text-2xl font-bold text-indigo-600">
                    {currentUser?.reputation_score}/100
                  </div>
                </div>
                
                <div>
                  <h3 className="text-gray-600">Time Balance</h3>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-green-600">
                      +{formatTime(stats.minutesEarned || 0)}
                    </div>
                    <div className="text-2xl font-bold text-red-600">
                      -{formatTime(stats.minutesSpent || 0)}
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-gray-600 text-sm">Tokens Minted</h3>
                      <div className="text-xl font-bold">{stats.totalTokensMinted || 0}</div>
                    </div>
                    <div>
                      <h3 className="text-gray-600 text-sm">Tokens Owned</h3>
                      <div className="text-xl font-bold">{stats.totalTokensOwned || 0}</div>
                    </div>
                    <div>
                      <h3 className="text-gray-600 text-sm">Services Offered</h3>
                      <div className="text-xl font-bold">{stats.totalServicesOffered || 0}</div>
                    </div>
                    <div>
                      <h3 className="text-gray-600 text-sm">Total Transactions</h3>
                      <div className="text-xl font-bold">{stats.totalTransactions || 0}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
            
            <div className="space-y-4">
              <button className="w-full py-2 px-4 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition duration-200">
                Change Password
              </button>
              
              <button className="w-full py-2 px-4 border border-red-300 rounded text-red-700 hover:bg-red-50 transition duration-200">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;