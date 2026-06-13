import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { RecordingDetails } from './pages/RecordingDetails';
import { ClientModal } from './components/ClientModal';
import { RotateCw, Headphones } from 'lucide-react';
import API from './services/api';

interface Client {
  _id: string;
  name: string;
}

const AppContent: React.FC = () => {
  const { user, token, loading } = useAuth();
  const [page, setPage] = useState<string>('dashboard');
  const [selectedRecordingId, setSelectedRecordingId] = useState<string | null>(null);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);

  const fetchClients = async () => {
    if (!token) return;
    try {
      const res = await API.get('/clients');
      setClients(res.data);
    } catch (err) {
      console.error('Failed to fetch clients:', err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchClients();
      setPage('dashboard');
    } else {
      setPage('login');
    }
  }, [token]);

  const handleNavigate = (targetPage: string, recordingId: string | null = null) => {
    setPage(targetPage);
    if (recordingId) {
      setSelectedRecordingId(recordingId);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 text-slate-100 flex flex-col items-center justify-center gap-4">
        <div className="bg-indigo-600/10 p-4 rounded-2xl border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-2 shadow-lg animate-pulse">
          <Headphones className="w-10 h-10" />
        </div>
        <div className="flex items-center gap-2">
          <RotateCw className="w-5 h-5 text-indigo-500 animate-spin" />
          <span className="text-sm font-semibold tracking-wider text-slate-300">Initializing Secure Vault...</span>
        </div>
      </div>
    );
  }

  // Router layout
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Global Background Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <Navbar onNavigate={(target) => handleNavigate(target)} />

      <main className="flex-1 relative z-10">
        {!user ? (
          page === 'register' ? (
            <Register onNavigate={(target) => handleNavigate(target)} />
          ) : (
            <Login onNavigate={(target) => handleNavigate(target)} />
          )
        ) : (
          <>
            {page === 'dashboard' && (
              <Dashboard
                onSelectRecording={(id) => handleNavigate('recording-details', id)}
                onOpenClientModal={() => setIsClientModalOpen(true)}
                clients={clients}
                onRefreshClients={fetchClients}
              />
            )}
            
            {page === 'recording-details' && selectedRecordingId && (
              <RecordingDetails
                recordingId={selectedRecordingId}
                onBack={() => handleNavigate('dashboard')}
              />
            )}
          </>
        )}
      </main>

      {isClientModalOpen && (
        <ClientModal
          onClose={() => setIsClientModalOpen(false)}
          onClientCreated={(newClient) => {
            setClients((prev) => [...prev, newClient].sort((a, b) => a.name.localeCompare(b.name)));
          }}
        />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
