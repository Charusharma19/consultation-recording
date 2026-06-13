import React, { useState, useEffect, useRef } from 'react';
import API from '../services/api';
import {
  ArrowLeft,
  Calendar,
  User,
  Clock,
  RotateCw,
  FileText,
  Brain,
  ClipboardList,
  CheckSquare,
  Search,
  AlertCircle,
  Mic,
} from 'lucide-react';

interface Client {
  name: string;
  email?: string;
  phone?: string;
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
  transcript?: string;
  summary?: string;
  insights?: string[];
}

interface RecordingDetailsProps {
  recordingId: string;
  onBack: () => void;
}

export const RecordingDetails: React.FC<RecordingDetailsProps> = ({
  recordingId,
  onBack,
}) => {
  const [recording, setRecording] = useState<Recording | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'transcript' | 'summary' | 'notes'>('transcript');
  const [searchTerm, setSearchTerm] = useState('');
  const [reprocessing, setReprocessing] = useState(false);
  const [error, setError] = useState('');

  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const fetchRecordingDetails = async () => {
    try {
      const res = await API.get(`/recordings/${recordingId}`);
      setRecording(res.data);
    } catch (err: any) {
      setError('Failed to fetch recording details.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecordingDetails();
  }, [recordingId]);

  const handleReprocess = async () => {
    if (!recording) return;
    setReprocessing(true);
    setError('');
    try {
      await API.post(`/recordings/${recording._id}/process`);
      // Start polling
      const poll = setInterval(async () => {
        const res = await API.get(`/recordings/${recordingId}`);
        if (res.data.status !== 'processing') {
          setRecording(res.data);
          clearInterval(poll);
          setReprocessing(false);
        }
      }, 3000);
    } catch (err: any) {
      setError('Failed to trigger reprocessing.');
      setReprocessing(false);
    }
  };

  const getMediaUrl = (url: string): string => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const backendBase = (import.meta.env.VITE_API_URL as string)?.replace('/api', '') || 'http://localhost:5000';
    return `${backendBase}${url}`;
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
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Helper function to highlight keywords in transcript
  const renderHighlightedText = (text: string, search: string) => {
    if (!search.trim()) return text;
    const regex = new RegExp(`(${search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-500/30 text-yellow-200 px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-3">
        <RotateCw className="w-8 h-8 text-indigo-500 animate-spin" />
        <span className="text-sm text-slate-400">Loading details...</span>
      </div>
    );
  }

  if (error || !recording) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-lg font-semibold text-slate-200">Error Loading Recording</h3>
        <p className="text-sm text-slate-500">{error || 'Recording not found.'}</p>
        <button onClick={onBack} className="glow-btn-secondary py-2 mt-4 inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
      </div>
    );
  }

  const mediaSource = getMediaUrl(recording.fileUrl);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back button and title header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <button
          onClick={onBack}
          className="text-slate-400 hover:text-slate-200 text-sm font-semibold flex items-center gap-2 py-1.5 focus:outline-none"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="flex items-center gap-3">
          {recording.status === 'failed' && (
            <button
              onClick={handleReprocess}
              disabled={reprocessing}
              className="glow-btn-secondary py-2 text-sm flex items-center gap-2"
            >
              <RotateCw className={`w-4 h-4 ${reprocessing ? 'animate-spin' : ''}`} />
              Retry AI Processing
            </button>
          )}
          {recording.status === 'completed' && (
            <button
              onClick={handleReprocess}
              disabled={reprocessing}
              className="glow-btn-secondary py-2 text-sm flex items-center gap-2 border-white/5 bg-white/2"
              title="Re-run AI processing if needed"
            >
              <RotateCw className={`w-4 h-4 ${reprocessing ? 'animate-spin' : ''}`} />
              Re-Process AI
            </button>
          )}
        </div>
      </div>

      {/* Recording Info Card */}
      <div className="glass-panel rounded-2xl p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100">{recording.title}</h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-slate-400">
              <span className="flex items-center gap-1.5 text-slate-200">
                <User className="w-4.5 h-4.5 text-indigo-400" />
                {recording.client?.name}
              </span>
              <span className="text-slate-700 hidden sm:inline">•</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4.5 h-4.5 text-slate-500" />
                {formatDate(recording.date)}
              </span>
              <span className="text-slate-700 hidden sm:inline">•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4.5 h-4.5 text-slate-500" />
                {formatDuration(recording.duration || 165)}
              </span>
            </div>
          </div>

          <div>
            {recording.status === 'processing' || reprocessing ? (
              <span className="px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-semibold flex items-center gap-2 animate-pulse">
                <RotateCw className="w-4 h-4 animate-spin" />
                Processing Transcript...
              </span>
            ) : recording.status === 'failed' ? (
              <span className="px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Transcription Failed
              </span>
            ) : (
              <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold flex items-center gap-2">
                <CheckSquare className="w-4 h-4" />
                AI Analyzed
              </span>
            )}
          </div>
        </div>

        {/* Media Player */}
        <div className="bg-dark-950/40 border border-white/5 rounded-xl p-4 flex flex-col items-center">
          {recording.fileType === 'video' ? (
            <video
              ref={videoRef}
              src={mediaSource}
              controls
              className="w-full max-h-[400px] rounded-lg bg-black object-contain border border-white/5 shadow-inner"
            />
          ) : (
            <div className="w-full py-4 space-y-4">
              <div className="flex items-center gap-3 bg-indigo-600/5 border border-indigo-500/10 p-4 rounded-xl max-w-md mx-auto">
                <Mic className="w-8 h-8 text-indigo-400 flex-shrink-0 animate-pulse" />
                <div className="min-w-0 flex-1">
                  <span className="text-sm font-semibold block text-slate-200 truncate">Audio Playback</span>
                  <span className="text-xs text-slate-500">Securely streaming encrypted audio</span>
                </div>
              </div>
              <audio ref={audioRef} src={mediaSource} controls className="w-full max-w-xl mx-auto" />
            </div>
          )}
        </div>
      </div>

      {/* Main Tabbed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Left/Middle Column: Tabs */}
        <div className="md:col-span-2 glass-panel rounded-2xl overflow-hidden flex flex-col h-[520px]">
          {/* Tab Selector */}
          <div className="flex border-b border-white/5 bg-white/2">
            <button
              onClick={() => setActiveTab('transcript')}
              className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 focus:outline-none transition-all duration-200 ${
                activeTab === 'transcript'
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/1'
              }`}
            >
              <FileText className="w-4.5 h-4.5" />
              Verbatim Transcript
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 focus:outline-none transition-all duration-200 ${
                activeTab === 'summary'
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/1'
              }`}
            >
              <Brain className="w-4.5 h-4.5" />
              AI Summary & Insights
            </button>
          </div>

          {/* Tab Content Area */}
          <div className="p-6 overflow-y-auto flex-1 bg-dark-900/40">
            {activeTab === 'transcript' && (
              <div className="space-y-4">
                {/* Search Bar inside Transcript */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    className="w-full glass-input pl-9 py-2 text-xs"
                    placeholder="Search inside transcript..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {recording.status === 'processing' || reprocessing ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
                    <RotateCw className="w-6 h-6 text-amber-500 animate-spin" />
                    <span className="text-sm text-slate-400">Gemini is transcribing this session...</span>
                  </div>
                ) : recording.status === 'failed' ? (
                  <div className="text-center py-20 text-slate-500 text-sm">
                    No transcript available. Processing failed.
                  </div>
                ) : !recording.transcript ? (
                  <div className="text-center py-20 text-slate-500 text-sm">
                    No transcript available. Click 'Re-Process' to retry.
                  </div>
                ) : (
                  <div className="text-sm text-slate-300 leading-relaxed space-y-4 font-mono select-text whitespace-pre-line">
                    {renderHighlightedText(recording.transcript, searchTerm)}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'summary' && (
              <div className="space-y-6">
                {recording.status === 'processing' || reprocessing ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
                    <RotateCw className="w-6 h-6 text-amber-500 animate-spin" />
                    <span className="text-sm text-slate-400">Gemini is generating summary and action items...</span>
                  </div>
                ) : recording.status === 'failed' ? (
                  <div className="text-center py-20 text-slate-500 text-sm">
                    No summary available. Processing failed.
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        Clinical Overview
                      </h4>
                      <p className="text-sm text-slate-200 leading-relaxed bg-white/2 border border-white/5 p-4 rounded-xl">
                        {recording.summary || 'No overview generated.'}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        Action Items & Clinical Insights
                      </h4>
                      {recording.insights && recording.insights.length > 0 ? (
                        <div className="space-y-2.5">
                          {recording.insights.map((insight, idx) => (
                            <div key={idx} className="flex items-start gap-3 bg-indigo-600/5 border border-indigo-500/10 p-3.5 rounded-xl">
                              <span className="flex-shrink-0 w-5 h-5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs font-bold flex items-center justify-center mt-0.5">
                                {idx + 1}
                              </span>
                              <span className="text-sm text-slate-300">{insight}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500 italic">No recommendations extracted.</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Intake / Clinician Notes */}
        <div className="glass-panel rounded-2xl p-6 space-y-4 h-[520px] flex flex-col">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-widest flex items-center gap-2">
            <ClipboardList className="w-4.5 h-4.5 text-indigo-400" />
            Clinician Consultation Notes
          </h3>

          <div className="flex-1 bg-dark-950/60 border border-white/5 rounded-xl p-4 text-sm text-slate-300 leading-relaxed resize-none overflow-y-auto whitespace-pre-wrap">
            {recording.notes ? (
              recording.notes
            ) : (
              <span className="text-slate-500 italic">No clinician notes provided during session.</span>
            )}
          </div>

          <div className="p-3 bg-white/2 border border-white/5 rounded-xl text-xs text-slate-400 space-y-1">
            <span className="font-semibold text-slate-300 block">Confidentiality Notice</span>
            All contents including transcriptions, summaries, and action plans are generated securely and are HIPAA compliant.
          </div>
        </div>
      </div>
    </div>
  );
};
