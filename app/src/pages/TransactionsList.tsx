import React from 'react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface Token {
  id: string;
  issuer_id: string;
  current_owner_id: string;
  denomination: number;
  created_at: string;
  expires_at?: string;
  is_active: boolean;
}

interface Transaction {
  id: string;
  sender_id: string;
  recipient_id: string;
  service_id?: string;
  status: string;
  created_at: string;
  completed_at?: string;
  sender_username?: string;
  recipient_username?: string;
  service_title?: string;
  tokens: Token[];
}

interface TransactionsListProps {
  transactions: Transaction[];
}

const TransactionsList: React.FC<TransactionsListProps> = ({ transactions }) => {
  const { currentUser } = useAuth();

  // Format total time in transaction
  const formatTimeDisplay = (tokens: Token[]): string => {
    const totalMinutes = tokens.reduce((sum, token) => sum + token.denomination, 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return hours > 0
      ? `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`
      : `${minutes}m`;
  };

  return (
    <div className="divide-y">
      {transactions.map(transaction => {
        const isSender = transaction.sender_id === currentUser?.id;
        const otherPartyName = isSender 
          ? transaction.recipient_username || 'Unknown User'
          : transaction.sender_username || 'Unknown User';
        const actionText = isSender ? 'Sent to' : 'Received from';
        
        return (
          <div key={transaction.id} className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                  isSender ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  {isSender ? '→' : '←'}
                </div>
                <div>
                  <div className="font-medium">
                    {actionText} <span className="text-indigo-600">{otherPartyName}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {format(new Date(transaction.created_at), 'MMM d, yyyy • h:mm a')}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold">
                  {isSender ? '-' : '+'}{formatTimeDisplay(transaction.tokens)}
                </div>
                <div className="text-sm">
                  {transaction.tokens.length} token{transaction.tokens.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
            
            {transaction.service_id && transaction.service_title && (
              <div className="mt-2 ml-12">
                <span className="text-sm text-gray-600">Service: </span>
                <Link 
                  to={`/services/${transaction.service_id}`}
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  {transaction.service_title}
                </Link>
              </div>
            )}
            
            <div className="mt-2 ml-12">
              <span className={`text-xs px-2 py-1 rounded-full ${
                transaction.status === 'completed' 
                  ? 'bg-green-100 text-green-800' 
                  : transaction.status === 'pending' 
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
              }`}>
                {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TransactionsList;