import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ServiceCard, { Service } from './ServiceCard';


const Marketplace: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [minCost, setMinCost] = useState<string>('');
  const [maxCost, setMaxCost] = useState<string>('');

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get<Service[]>('/api/services');
        setServices(response.data);
        
        // Extract unique categories
        const uniqueCategories = new Set<string>();
        response.data.forEach((service: Service) => {
          service.categories.forEach((category: string) => uniqueCategories.add(category));
        });
        setCategories([...uniqueCategories].sort());
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching services:', error);
        setError('Failed to load services');
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Filter and sort services
  const filteredServices = services.filter(service => {
    // Filter by category
    if (selectedCategory !== 'all' && !service.categories.includes(selectedCategory)) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery && !service.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !service.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Filter by min cost
    if (minCost !== '' && service.time_cost < parseInt(minCost)) {
      return false;
    }
    
    // Filter by max cost
    if (maxCost !== '' && service.time_cost > parseInt(maxCost)) {
      return false;
    }
    
    return true;
  }).sort((a, b) => {
    // Sort services
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'cost_low_high':
        return a.time_cost - b.time_cost;
      case 'cost_high_low':
        return b.time_cost - a.time_cost;
      case 'rating':
        return (b.avg_rating || 0) - (a.avg_rating || 0);
      default:
        return 0;
    }
  });

  const handleSearchSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    // Search is already applied in the filtered services
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Service Marketplace</h1>
        <Link
          to="/services/create"
          className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition duration-200"
        >
          Offer Your Service
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-4 sticky top-6">
            <h2 className="text-xl font-semibold mb-4">Filters</h2>
            
            {/* Search */}
            <form onSubmit={handleSearchSubmit} className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Search
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-grow shadow appearance-none border rounded-l py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Search services..."
                />
                <button
                  type="submit"
                  className="bg-indigo-600 text-white py-2 px-4 rounded-r hover:bg-indigo-700"
                >
                  Search
                </button>
              </div>
            </form>
            
            {/* Categories */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Sort */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="cost_low_high">Price: Low to High</option>
                <option value="cost_high_low">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
            
            {/* Price Range */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Price Range (minutes)
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  value={minCost}
                  onChange={(e) => setMinCost(e.target.value)}
                  className="w-1/2 shadow appearance-none border rounded-l py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Min"
                  min="0"
                />
                <span className="mx-2">-</span>
                <input
                  type="number"
                  value={maxCost}
                  onChange={(e) => setMaxCost(e.target.value)}
                  className="w-1/2 shadow appearance-none border rounded-r py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Max"
                  min="0"
                />
              </div>
            </div>
            
            {/* Reset Filters */}
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
                setSortBy('newest');
                setMinCost('');
                setMaxCost('');
              }}
              className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 transition duration-200"
            >
              Reset Filters
            </button>
          </div>
        </div>
        
        {/* Services Grid */}
        <div className="lg:col-span-3">
          <div className="mb-4">
            <p className="text-gray-600">
              Showing {filteredServices.length} of {services.length} services
            </p>
          </div>
          
          {filteredServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredServices.map(service => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-gray-600">No services match your filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Marketplace;