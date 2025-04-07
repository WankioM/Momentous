import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export interface Service {
  id: string;
  title: string;
  description: string;
  time_cost: number;
  categories: string[];
  provider_username?: string;
  avg_rating?: number;
  created_at: string;
  updated_at: string;
}

interface ServiceCardProps {
  service: Service;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  // Convert minutes to hours and minutes
  const hours = Math.floor(service.time_cost / 60);
  const minutes = service.time_cost % 60;
  
  // Format time display
  const timeDisplay = hours > 0
    ? `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`
    : `${minutes}m`;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold mb-2 text-indigo-800">
            <Link to={`/services/${service.id}`} className="hover:underline">
              {service.title}
            </Link>
          </h3>
          <div className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-sm font-semibold">
            {timeDisplay}
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {service.description}
        </p>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center">
            <div className="w-6 h-6 rounded-full bg-indigo-200 flex items-center justify-center mr-2">
              {service.provider_username?.charAt(0).toUpperCase() || '?'}
            </div>
            <span className="text-gray-700">
              {service.provider_username || 'Anonymous'}
            </span>
          </div>
          
          {service.avg_rating && (
            <div className="flex items-center">
              <svg className="w-4 h-4 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>{service.avg_rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        
        <div className="mt-3 flex flex-wrap gap-1">
          {service.categories.map(category => (
            <span
              key={category}
              className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded"
            >
              {category}
            </span>
          ))}
        </div>
      </div>
      
      <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500 flex justify-between">
        <span>Posted: {format(new Date(service.created_at), 'MMM d, yyyy')}</span>
        <Link
          to={`/services/${service.id}`}
          className="text-indigo-600 hover:text-indigo-800 font-medium"
        >
          View Details →
        </Link>
      </div>
    </div>
  );
};

export default ServiceCard;