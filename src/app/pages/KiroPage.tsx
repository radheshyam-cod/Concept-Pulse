import React from 'react';
import { KiroDashboard } from '../components/kiro/KiroDashboard';
import { Navbar } from '../components/Navbar';

interface KiroPageProps {
  user: any;
  token: string;
  onLogout: () => void;
}

export const KiroPage: React.FC<KiroPageProps> = ({ user, token, onLogout }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        user={user} 
        onLogout={onLogout}
        currentPage="kiro"
      />
      <KiroDashboard user={user} token={token} />
    </div>
  );
};