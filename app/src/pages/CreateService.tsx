import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface CategoryOption {
  id: string;
  name: string;
}

const CreateService: React.FC = () => {
  const navigate = useNavigate();
  
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [timeCost, setTimeCost] = useState<number>(60); // Default: 1 hour
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [customCategory, setCustomCategory] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Predefined categories
  const categoryOptions: CategoryOption[] = [
    { id: 'technology', name: 'Technology' },
    { id: 'design', name: 'Design' },
    { id: 'writing', name: 'Writing' },
    { id: 'education', name: 'Education' },
    { id: 'health', name: 'Health & Wellness' },
    { id: 'business', name: 'Business' },
    { id: 'household', name: 'Household' },
    { id: 'social', name: 'Social' },
    { id: 'creative', name: 'Creative Arts' },
    { id: 'legal', name: 'Legal' },
    { id: 'transportation', name: 'Transportation' },
    { id: 'other', name: 'Other' }
  ];

  const handleCategoryToggle = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  const handleAddCustomCategory = () => {
    if (customCategory.trim() && !selectedCategories.includes(customCategory.trim().toLowerCase())) {
      const formattedCategory = customCategory.trim().toLowerCase();
      setSelectedCategories([...selectedCategories, formattedCategory]);
      setCustomCategory('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedCategories.length === 0) {
      setError('Please select at least one category');
      return;
    }
    
    if (timeCost < 15) {
      setError('Minimum time cost is 15 minutes');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('/api/services', {
        title,
        description,
        time_cost: timeCost,
        categories: selectedCategories
      });
      
      // Redirect to the newly created service
      navigate(`/services/${response.data.id}`);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to create service');
      setLoading(false);
    }
  };

  // Format hours and minutes for display
  const formatTimeDisplay = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    return hours > 0
      ? `${hours} hour${hours > 1 ? 's' : ''} ${mins > 0 ? `${mins} minute${mins > 1 ? 's' : ''}` : ''}`
      : `${mins} minute${mins > 1 ? 's' : ''}`;
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Offer a New Service</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <form onSubmit={handleSubmit}>
            <div className="p-6">
              <div className="mb-6">
                <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">
                  Service Title
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="e.g., Web Development Consultation"
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Describe your service in detail..."
                  rows={6}
                />
                <p className="mt-1 text-sm text-gray-500">
                  Be specific about what you're offering, your experience, and any requirements.
                </p>
              </div>
              
              <div className="mb-6">
                <label htmlFor="timeCost" className="block text-gray-700 text-sm font-bold mb-2">
                  Time Cost
                </label>
                <div className="flex items-center">
                  <input
                    id="timeCost"
                    type="range"
                    min="15"
                    max="480"
                    step="15"
                    value={timeCost}
                    onChange={(e) => setTimeCost(parseInt(e.target.value))}
                    className="mr-4 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="min-w-[150px] text-gray-700 font-medium">
                    {formatTimeDisplay(timeCost)}
                  </div>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  How much time will this service cost?
                </p>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Categories
                </label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {categoryOptions.map(category => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => handleCategoryToggle(category.id)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        selectedCategories.includes(category.id)
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
                
                <div className="flex">
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="shadow appearance-none border rounded-l w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="Add custom category..."
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomCategory}
                    className="bg-indigo-600 text-white py-2 px-4 rounded-r hover:bg-indigo-700 transition duration-200"
                  >
                    Add
                  </button>
                </div>
                
                {selectedCategories.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">Selected categories:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedCategories.map(category => {
                        const matchedCategory = categoryOptions.find(c => c.id === category);
                        const displayName = matchedCategory?.name || category;
                        
                        return (
                          <div key={category} className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm flex items-center">
                            {displayName}
                            <button
                              type="button"
                              onClick={() => handleCategoryToggle(category)}
                              className="ml-2 text-indigo-600 hover:text-indigo-800"
                            >
                              &times;
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 border-t text-right">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="mr-4 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 transition duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`bg-indigo-600 text-white py-2 px-6 rounded hover:bg-indigo-700 transition duration-200 ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Creating...' : 'Create Service'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateService;