import React from 'react';
import { format } from 'date-fns';

interface Token {
  id: string;
  issuer_id: string;
  current_owner_id: string;
  denomination: number;
  created_at: string;
  expires_at?: string;
  is_active: boolean;
}

interface TokenCardProps {
  token: Token;
}

const TokenCard: React.FC<TokenCardProps> = ({ token }) => {
  // Convert minutes to hours and minutes
  const hours = Math.floor(token.denomination / 60);
  const minutes = token.denomination % 60;
  
  // Format time display
  const timeDisplay = hours > 0
    ? `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`
    : `${minutes}m`;
  
  // Determine if token is expiring soon (within 7 days)
  const isExpiringSoon = token.expires_at && new Date(token.expires_at).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000;

  return (
    <div className={`bg-white border rounded-lg overflow-hidden transition-shadow duration-200 hover:shadow-md ${!token.is_active ? 'opacity-60' : ''}`}>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div className="text-2xl font-bold text-indigo-600">
            {timeDisplay}
          </div>
          {token.is_active ? (
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
              Active
            </span>
          ) : (
            <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
              Inactive
            </span>
          )}
        </div>
        
        <div className="mt-2 text-sm text-gray-500">
          Token ID: {token.id.substring(0, 8)}...
        </div>
        
        <div className="mt-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Created:</span>
            <span>{format(new Date(token.created_at), 'MMM d, yyyy')}</span>
          </div>
          
          {token.expires_at && (
            <div className="flex justify-between mt-1">
              <span className="text-gray-600">Expires:</span>
              <span className={isExpiringSoon ? 'text-red-600 font-medium' : ''}>
                {format(new Date(token.expires_at), 'MMM d, yyyy')}
                {isExpiringSoon && ' (Soon)'}
              </span>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-gray-50 px-4 py-2 border-t">
        <div className="flex justify-between">
          <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
            Transfer
          </button>
          
          {token.is_active && token.expires_at && (
            <button className="text-sm text-gray-600 hover:text-gray-800 font-medium">
              Extend
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TokenCard;