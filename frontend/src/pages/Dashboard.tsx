import React, { useState, useEffect, useRef } from 'react';
import API from '../services/api';
import { FileUpload } from '../components/FileUpload';
import {
  Search,
  Users,
  Video,
  Mic,
  Calendar,
  Clock,
  Play,
  RotateCw,
  SearchX,
  FileAudio,
  Trash2,
} from 'lucide-react';

interface Client {
  _id: string;
  name: string;
  email?: string;
}

interface Recording {
  _id: string;
  title: string;
  client: Client;
  fileUrl: string;
  fileType: 'audio' | 'video';
  duration: number;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  date: string;
  notes?: string;
  createdAt: string;
}

interface DashboardProps {
  onSelectRecording: (id: string) => void;
  onOpenClientModal: () => void;
  clients: Client[];
  onRefreshClients: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onSelectRecording,
  onOpenClientModal,
  clients,
  onRefreshClients,
}) => {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedClientFilter, setSelectedClientFilter] = useState('');
  
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchRecordings = async () => {
    try {
      const params: any = {};
      if (selectedClientFilter) params.clientId = selectedClientFilter;
      if (search) params.search = search;

      const res = await API.get('/recordings', { params });
      setRecordings(res.data);
    } catch (err) {
      console.error('Error fetching recordings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecordings();
    
    // Poll recordings if there are any in 'processing' status, so they update automatically when Gemini finishes!
    const hasProcessing = recordings.some(r => r.status === 'processing' || r.status === 'uploading');
    
    if (hasProcessing) {
      if (!refreshIntervalRef.current) {
        refreshIntervalRef.current = setInterval(() => {
          fetchRecordings();
        }, 5000);
      }
    } else {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [selectedClientFilter, search, recordings]);

  // Initial load
  useEffect(() => {
    setLoading(true);
    fetchRecordings();
  }, [selectedClientFilter]);

  // Debounced search hook or just trigger on keyup/change since filter is local-friendly
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchRecordings();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search]);

  const handleDeleteRecording = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this recording?')) return;
    try {
      await API.delete(`/recordings/${id}`);
      fetchRecordings();
    } catch (err) {
      console.error('Failed to delete recording:', err);
      alert('Failed to delete recording.');
    }
  };

  const formatDuration = (seconds: number): string => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const formatDate = (dateStr: string): string => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Stats computation
  const totalRecordings = recordings.length;
  const audioCount = recordings.filter((r) => r.fileType === 'audio').length;
  const videoCount = recordings.filter((r) => r.fileType === 'video').length;


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Overview stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel rounded-2xl p-5 flex items-center gap-4">
          <div className="bg-indigo-600/10 text-indigo-400 p-3 rounded-xl border border-indigo-500/20">
            <FileAudio className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-bold block text-slate-100">{totalRecordings}</span>
            <span className="text-xs text-slate-400 font-medium tracking-wide">Total Consultations</span>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 flex items-center gap-4">
          <div className="bg-emerald-600/10 text-emerald-400 p-3 rounded-xl border border-emerald-500/20">
            <Mic className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-bold block text-slate-100">{audioCount}</span>
            <span className="text-xs text-slate-400 font-medium tracking-wide">Audio Uploads</span>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 flex items-center gap-4">
          <div className="bg-violet-600/10 text-violet-400 p-3 rounded-xl border border-violet-500/20">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-bold block text-slate-100">{videoCount}</span>
            <span className="text-xs text-slate-400 font-medium tracking-wide">Video Uploads</span>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 flex items-center gap-4">
          <div className="bg-amber-600/10 text-amber-400 p-3 rounded-xl border border-amber-500/20">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-bold block text-slate-100">{clients.length}</span>
            <span className="text-xs text-slate-400 font-medium tracking-wide">Active Clients</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Upload Widget */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <FileUpload
              clients={clients}
              onUploadSuccess={() => {
                fetchRecordings();
                onRefreshClients();
              }}
              onOpenClientModal={onOpenClientModal}
            />
          </div>
        </div>

        {/* Right Side: List and filters */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-100 self-start sm:self-center">
                Consultation History
              </h3>

              {/* Filters */}
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                {/* Search */}
                <div className="relative flex-1 sm:w-48 md:w-64">
                  <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-500" />
                  <input
                    type="text"
                    className="w-full glass-input pl-9 py-2 text-sm"
                    placeholder="Search transcripts, notes..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                {/* Client Select Filter */}
                <select
                  className="glass-input py-2 text-sm bg-dark-950/80 border-white/10"
                  value={selectedClientFilter}
                  onChange={(e) => setSelectedClientFilter(e.target.value)}
                >
                  <option value="">All Clients</option>
                  {clients.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Recordings List */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <RotateCw className="w-8 h-8 text-indigo-500 animate-spin" />
                <span className="text-sm text-slate-400">Loading consultations...</span>
              </div>
            ) : recordings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center gap-3 border border-white/5 bg-white/1 rounded-xl">
                <SearchX className="w-12 h-12 text-slate-600" />
                <h4 className="text-md font-semibold text-slate-300">No recordings found</h4>
                <p className="text-sm text-slate-500 max-w-xs px-4">
                  Try adjusting your filters, or upload your first consultation recording to begin.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {recordings.map((rec) => (
                  <div
                    key={rec._id}
                    onClick={() => rec.status !== 'uploading' && onSelectRecording(rec._id)}
                    className={`py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer hover:bg-white/2 px-3 -mx-3 rounded-lg transition-colors duration-150 ${
                      rec.status === 'processing' || rec.status === 'uploading' ? 'pointer-events-none' : ''
                    }`}
                  >
                    <div className="flex gap-4 items-center min-w-0">
                      {/* Media Icon */}
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                          rec.fileType === 'video'
                            ? 'bg-violet-600/10 text-violet-400 border-violet-500/20'
                            : 'bg-emerald-600/10 text-emerald-400 border-emerald-500/20'
                        }`}
                      >
                        {rec.fileType === 'video' ? (
                          <Video className="w-5 h-5" />
                        ) : (
                          <Mic className="w-5 h-5" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-slate-200 truncate group-hover:text-indigo-400">
                          {rec.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-400">
                          <span className="font-medium text-slate-300">{rec.client?.name}</span>
                          <span className="text-slate-600">•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(rec.date)}
                          </span>
                          <span className="text-slate-600">•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {formatDuration(rec.duration || 165)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status / Play Button */}
                    <div className="flex items-center gap-3 self-end sm:self-center w-full sm:w-auto justify-between sm:justify-start">
                      {/* Status Tag */}
                      {rec.status === 'processing' || rec.status === 'uploading' ? (
                        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold animate-pulse">
                          <RotateCw className="w-3.5 h-3.5 animate-spin" />
                          <span>AI Processing</span>
                        </div>
                      ) : rec.status === 'failed' ? (
                        <div className="px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
                          Failed
                        </div>
                      ) : (
                        <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                          AI Ready
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        {rec.status === 'completed' && (
                          <div className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-lg transition-colors duration-150 shadow-md">
                            <Play className="w-3.5 h-3.5 fill-current" />
                          </div>
                        )}
                        <button
                          onClick={(e) => handleDeleteRecording(e, rec._id)}
                          className="p-2 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-white/5 transition-all duration-150"
                          title="Delete Recording"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
