import React, { useState } from 'react';
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

interface TokenSelectorProps {
  tokens: Token[];
  requiredAmount: number;
  onSelect: (selectedTokens: Token[]) => void;
  onCancel: () => void;
}

const TokenSelector: React.FC<TokenSelectorProps> = ({ 
  tokens, 
  requiredAmount, 
  onSelect, 
  onCancel 
}) => {
  const [selectedTokenIds, setSelectedTokenIds] = useState<string[]>([]);
  const [selectedAmount, setSelectedAmount] = useState<number>(0);
  const [error, setError] = useState<string>('');

  // Sort tokens by denomination (ascending)
  const sortedTokens = [...tokens].sort((a, b) => a.denomination - b.denomination);

  const handleTokenSelection = (tokenId: string, isChecked: boolean, denomination: number) => {
    if (isChecked) {
      setSelectedTokenIds([...selectedTokenIds, tokenId]);
      setSelectedAmount(selectedAmount + denomination);
    } else {
      setSelectedTokenIds(selectedTokenIds.filter(id => id !== tokenId));
      setSelectedAmount(selectedAmount - denomination);
    }
  };

  const handleConfirm = () => {
    if (selectedAmount < requiredAmount) {
      setError(`You need to select tokens worth at least ${formatTimeDisplay(requiredAmount)}`);
      return;
    }
    
    const selectedTokensObjects = tokens.filter(token => selectedTokenIds.includes(token.id));
    onSelect(selectedTokensObjects);
  };

  // Format time display
  const formatTimeDisplay = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    return hours > 0
      ? `${hours}h ${mins > 0 ? `${mins}m` : ''}`
      : `${mins}m`;
  };

  return (
    <div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <p className="text-gray-600">Required Amount:</p>
          <p className="font-semibold">{formatTimeDisplay(requiredAmount)}</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-gray-600">Selected Amount:</p>
          <p className={`font-semibold ${selectedAmount < requiredAmount ? 'text-red-600' : 'text-green-600'}`}>
            {formatTimeDisplay(selectedAmount)}
          </p>
        </div>
      </div>
      
      <div className="max-h-60 overflow-y-auto mb-4 border border-gray-200 rounded">
        {sortedTokens.length > 0 ? (
          <div className="divide-y">
            {sortedTokens.map(token => (
              <div key={token.id} className="p-3 flex items-center">
                <input
                  type="checkbox"
                  id={`token-${token.id}`}
                  checked={selectedTokenIds.includes(token.id)}
                  onChange={(e) => handleTokenSelection(token.id, e.target.checked, token.denomination)}
                  className="mr-3"
                />
                <label htmlFor={`token-${token.id}`} className="flex-grow cursor-pointer">
                  <div className="font-medium">{formatTimeDisplay(token.denomination)}</div>
                  <div className="text-xs text-gray-500">
                    Created: {format(new Date(token.created_at), 'MMM d, yyyy')}
                  </div>
                </label>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500">
            You don't have any tokens to exchange
          </div>
        )}
      </div>
      
      <div className="flex space-x-4">
        <button
          onClick={handleConfirm}
          disabled={selectedAmount < requiredAmount}
          className={`flex-1 py-2 rounded ${
            selectedAmount < requiredAmount
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          Confirm Selection
        </button>
        <button
          onClick={onCancel}
          className="flex-1 bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300 transition duration-200"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default TokenSelector;