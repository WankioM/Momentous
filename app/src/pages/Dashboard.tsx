import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import TokenCard from './TokenCard';
import TransactionsList from './TransactionsList';

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

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [tokenFormOpen, setTokenFormOpen] = useState<boolean>(false);
  const [tokenDenomination, setTokenDenomination] = useState<number>(60); // Default: 1 hour
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch user's tokens
        const tokensResponse = await axios.get('/api/tokens/my');
        setTokens(tokensResponse.data);
        
        // Fetch recent transactions
        const transactionsResponse = await axios.get('/api/transactions/recent');
        setTransactions(transactionsResponse.data);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleCreateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await axios.post('/api/tokens', {
        denomination: tokenDenomination
      });
      
      setTokens([...tokens, response.data]);
      setTokenFormOpen(false);
      setTokenDenomination(60);
    } catch (error) {
      setError('Failed to create token');
    }
  };

  // Calculate total minutes of tokens owned
  const totalMinutes = tokens.reduce((sum, token) => sum + token.denomination, 0);
  // Convert to hours and minutes for display
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column: User info and balance */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">Welcome, {currentUser?.username}</h2>
            <div className="text-gray-600 mb-2">Reputation Score: {currentUser?.reputation_score}/100</div>
            
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Your Time Balance</h3>
              <div className="text-3xl font-bold text-indigo-600">
                {hours}h {minutes}m
              </div>
              <div className="text-sm text-gray-500">
                ({tokens.length} tokens)
              </div>
            </div>
            
            <button
              onClick={() => setTokenFormOpen(!tokenFormOpen)}
              className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition duration-200"
            >
              {tokenFormOpen ? 'Cancel' : 'Mint New Token'}
            </button>
            
            {tokenFormOpen && (
              <form onSubmit={handleCreateToken} className="mt-4">
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Token Denomination (minutes)
                  </label>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    value={tokenDenomination}
                    onChange={(e) => setTokenDenomination(parseInt(e.target.value))}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                  <div className="text-sm text-gray-500 mt-1">
                    {Math.floor(tokenDenomination / 60)}h {tokenDenomination % 60}m
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition duration-200"
                >
                  Create Token
                </button>
              </form>
            )}
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/marketplace" className="text-indigo-600 hover:text-indigo-800">
                  Browse Services
                </Link>
              </li>
              <li>
                <Link to="/services/create" className="text-indigo-600 hover:text-indigo-800">
                  Offer Your Services
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-indigo-600 hover:text-indigo-800">
                  Edit Profile
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Right columns: Tokens and Transactions */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-xl font-bold mb-4">Your Time Tokens</h3>
            {tokens.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tokens.map(token => (
                  <TokenCard key={token.id} token={token} />
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-6">
                You don't have any tokens yet. Mint your first token to get started!
              </div>
            )}
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-4">Recent Transactions</h3>
            {transactions.length > 0 ? (
              <TransactionsList transactions={transactions} />
            ) : (
              <div className="text-gray-500 text-center py-6">
                No transactions yet. Start trading your time tokens!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;