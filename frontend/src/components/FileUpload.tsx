import React, { useState, useRef } from 'react';
import API from '../services/api';
import { UploadCloud, File, CheckCircle2, AlertCircle } from 'lucide-react';

interface Client {
  _id: string;
  name: string;
}

interface FileUploadProps {
  clients: Client[];
  onUploadSuccess: (newRecording: any) => void;
  onOpenClientModal: () => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  clients,
  onUploadSuccess,
  onOpenClientModal,
}) => {
  const [title, setTitle] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState<File | null>(null);
  
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      if (!title) {
        // Pre-fill title with filename (without extension)
        const nameWithoutExt = e.dataTransfer.files[0].name.replace(/\.[^/.]+$/, "");
        setTitle(nameWithoutExt);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      if (!title) {
        const nameWithoutExt = e.target.files[0].name.replace(/\.[^/.]+$/, "");
        setTitle(nameWithoutExt);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) return setError('Please enter a recording title.');
    if (!selectedClientId) return setError('Please select a client.');
    if (!file) return setError('Please select or drop an audio/video file.');

    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('clientId', selectedClientId);
    formData.append('date', date);
    formData.append('notes', notes.trim());
    formData.append('file', file);

    try {
      const res = await API.post('/recordings/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          setProgress(percentCompleted);
        },
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setTitle('');
        setSelectedClientId('');
        setNotes('');
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        onUploadSuccess(res.data);
      }, 1500);

    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload file. Check size or format.');
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="glass-panel rounded-2xl p-6 shadow-xl">
      <h3 className="text-lg font-semibold text-slate-100 mb-5 flex items-center gap-2">
        <UploadCloud className="w-5 h-5 text-indigo-400" />
        Upload Consultation Recording
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>Upload successful! Processing transcript...</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              Recording Title
            </label>
            <input
              type="text"
              className="w-full glass-input"
              placeholder="e.g. Anxiety Assessment Session 1"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={uploading || success}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                Client / Patient
              </label>
              <button
                type="button"
                onClick={onOpenClientModal}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold focus:outline-none"
                disabled={uploading || success}
              >
                + Create Client
              </button>
            </div>
            <select
              className="w-full glass-input bg-dark-950"
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              disabled={uploading || success}
            >
              <option value="">Select a Client</option>
              {clients.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              Consultation Date
            </label>
            <input
              type="date"
              className="w-full glass-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={uploading || success}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              Clinician Consultation Notes
            </label>
            <input
              type="text"
              className="w-full glass-input"
              placeholder="e.g. Discussed medication adjustments..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={uploading || success}
            />
          </div>
        </div>

        {/* Drag and drop zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 select-none ${
            dragging
              ? 'border-indigo-500 bg-indigo-500/5'
              : file
              ? 'border-slate-600 bg-slate-800/10'
              : 'border-white/10 hover:border-indigo-500/50 hover:bg-white/2'
          } ${uploading || success ? 'pointer-events-none opacity-50' : ''}`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="audio/*,video/*"
            className="hidden"
          />

          {!file ? (
            <>
              <UploadCloud className="w-10 h-10 text-slate-400 mb-2" />
              <p className="text-sm font-medium text-slate-300">
                Drag & drop audio/video file here, or <span className="text-indigo-400">browse</span>
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Supports MP3, WAV, M4A, MP4, MOV (max 100MB)
              </p>
            </>
          ) : (
            <div className="flex items-center gap-3 bg-white/5 border border-white/5 px-4 py-3 rounded-lg w-full max-w-sm">
              <File className="w-8 h-8 text-indigo-400 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-200 truncate">{file.name}</p>
                <p className="text-xs text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {uploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <span>Uploading File...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-dark-950 h-2 rounded-full overflow-hidden border border-white/5">
              <div
                className="bg-gradient-to-r from-violet-600 to-indigo-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="glow-btn-primary py-2.5 px-6 font-semibold flex items-center justify-center gap-2 w-full sm:w-auto"
            disabled={uploading || success || !file || !selectedClientId}
          >
            {uploading ? 'Uploading...' : 'Upload & Process AI'}
          </button>
        </div>
      </form>
    </div>
  );
};
