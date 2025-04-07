import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import TokenSelector from './TokenSelector';

interface Service {
  id: string;
  provider_id: string;
  title: string;
  description: string;
  time_cost: number;
  categories: string[];
  avg_rating?: number;
  created_at: string;
  updated_at: string;
}

interface Provider {
  id: string;
  username: string;
  email: string;
  reputation_score: number;
}

interface Review {
  id: string;
  service_id: string;
  reviewer_id: string;
  reviewer_username: string;
  transaction_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface Token {
  id: string;
  issuer_id: string;
  current_owner_id: string;
  denomination: number;
  created_at: string;
  expires_at?: string;
  is_active: boolean;
}

const ServiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [service, setService] = useState<Service | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userTokens, setUserTokens] = useState<Token[]>([]);
  const [selectedTokens, setSelectedTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [purchaseStep, setPurchaseStep] = useState<'view' | 'select' | 'confirm'>('view');

  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        // Fetch service details
        const serviceResponse = await axios.get<Service>(`/api/services/${id}`);
        setService(serviceResponse.data);
        
        // Fetch provider details
        const providerResponse = await axios.get<Provider>(`/api/users/${serviceResponse.data.provider_id}`);
        setProvider(providerResponse.data);
        
        // Fetch service reviews
        const reviewsResponse = await axios.get<Review[]>(`/api/services/${id}/reviews`);
        setReviews(reviewsResponse.data);
        
        // Fetch user's tokens
        const tokensResponse = await axios.get<Token[]>('/api/tokens/my');
        setUserTokens(tokensResponse.data);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching service details:', error);
        setError('Failed to load service details');
        setLoading(false);
      }
    };

    if (id) {
      fetchServiceDetails();
    }
  }, [id]);

  const canPurchase = (): boolean => {
    if (!service || !currentUser) return false;
    return service.provider_id !== currentUser.id;
  };

  const handleStartPurchase = (): void => {
    setPurchaseStep('select');
  };

  const handleSelectTokens = (tokens: Token[]): void => {
    setSelectedTokens(tokens);
    setPurchaseStep('confirm');
  };

  const handleConfirmPurchase = async (): Promise<void> => {
    if (!service) return;
    
    try {
      await axios.post('/api/transactions', {
        recipient_id: service.provider_id,
        service_id: service.id,
        token_ids: selectedTokens.map(token => token.id)
      });
      
      // Redirect to dashboard with success message
      navigate('/dashboard', { 
        state: { 
          successMessage: `Service "${service.title}" purchased successfully!` 
        } 
      });
    } catch (error) {
      console.error('Error purchasing service:', error);
      setError('Failed to complete purchase');
    }
  };

  const handleCancelPurchase = (): void => {
    setPurchaseStep('view');
    setSelectedTokens([]);
  };

  // Convert minutes to hours and minutes
  const formatTimeDisplay = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    return hours > 0
      ? `${hours} hour${hours > 1 ? 's' : ''} ${mins > 0 ? `${mins} minute${mins > 1 ? 's' : ''}` : ''}`
      : `${mins} minute${mins > 1 ? 's' : ''}`;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (!service) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Service not found
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Service Header */}
        <div className="p-6 border-b">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2 md:mb-0">{service.title}</h1>
            <div className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-lg font-semibold self-start">
              {formatTimeDisplay(service.time_cost)}
            </div>
          </div>
          
          <div className="flex items-center mt-4">
            {provider && (
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-indigo-200 flex items-center justify-center mr-3 text-lg font-semibold">
                  {provider.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium">{provider.username}</div>
                  <div className="text-sm text-gray-500">Reputation: {provider.reputation_score}/100</div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Service Content */}
        <div className="p-6">
          {/* Purchase Controls */}
          {canPurchase() && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              {purchaseStep === 'view' && (
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <div>
                    <h3 className="text-xl font-semibold">Interested in this service?</h3>
                    <p className="text-gray-600">
                      Exchange your time tokens for this service
                    </p>
                  </div>
                  <button
                    onClick={handleStartPurchase}
                    className="mt-3 sm:mt-0 bg-indigo-600 text-white py-2 px-6 rounded hover:bg-indigo-700 transition duration-200"
                  >
                    Purchase Service
                  </button>
                </div>
              )}
              
              {purchaseStep === 'select' && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Select Tokens to Exchange</h3>
                  <TokenSelector
                    tokens={userTokens}
                    requiredAmount={service.time_cost}
                    onSelect={handleSelectTokens}
                    onCancel={handleCancelPurchase}
                  />
                </div>
              )}
              
              {purchaseStep === 'confirm' && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Confirm Purchase</h3>
                  <p className="mb-4">
                    You are about to exchange <span className="font-semibold">{selectedTokens.length} token(s)</span> for:
                  </p>
                  <div className="p-4 bg-gray-100 rounded mb-4">
                    <p className="font-semibold">{service.title}</p>
                    <p className="text-gray-600">Provider: {provider?.username}</p>
                    <p className="text-gray-600">Cost: {formatTimeDisplay(service.time_cost)}</p>
                  </div>
                  <div className="flex space-x-4">
                    <button
                      onClick={handleConfirmPurchase}
                      className="bg-green-600 text-white py-2 px-6 rounded hover:bg-green-700 transition duration-200"
                    >
                      Confirm Purchase
                    </button>
                    <button
                      onClick={handleCancelPurchase}
                      className="bg-gray-200 text-gray-800 py-2 px-6 rounded hover:bg-gray-300 transition duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Description */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-3">Description</h3>
            <div className="text-gray-700 whitespace-pre-line">
              {service.description}
            </div>
          </div>
          
          {/* Categories */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-3">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {service.categories.map(category => (
                <span
                  key={category}
                  className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
          
          {/* Reviews */}
          <div>
            <h3 className="text-xl font-semibold mb-3">Reviews</h3>
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map(review => (
                  <div key={review.id} className="border-b pb-4">
                    <div className="flex items-center mb-2">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2 text-sm">
                          {review.reviewer_username.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium">{review.reviewer_username}</span>
                      </div>
                      <div className="flex items-center ml-4">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating ? 'text-yellow-500' : 'text-gray-300'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(review.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No reviews yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;