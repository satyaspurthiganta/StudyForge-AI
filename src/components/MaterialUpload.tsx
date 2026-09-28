import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  FileText,
  Trash2,
  CheckCircle2,
  Loader2,
  FileCheck,
  Eye,
  X,
  Plus,
  BookOpen,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { StudyFile } from '../types';
import { uploadAndExtractDocument } from '../services/api';
import { SAMPLE_STUDY_FILE } from '../data/sampleMaterial';

interface MaterialUploadProps {
  files: StudyFile[];
  onFilesChange: (files: StudyFile[]) => void;
  onProceedToTopic: () => void;
}

export const MaterialUpload: React.FC<MaterialUploadProps> = ({
  files,
  onFilesChange,
  onProceedToTopic,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [previewFile, setPreviewFile] = useState<StudyFile | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleFiles = async (selectedFiles: FileList | File[]) => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    setIsUploading(true);
    setUploadError(null);

    const newFiles: StudyFile[] = [...files];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const tempId = 'file-' + Date.now() + '-' + i;

      try {
        const extracted = await uploadAndExtractDocument(file);
        const studyFile: StudyFile = {
          id: tempId,
          name: extracted.name || file.name,
          type: extracted.type || file.type || 'text/plain',
          size: extracted.size || file.size,
          extractedText: extracted.extractedText || '',
          wordCount: extracted.wordCount || 0,
          detectedTopics: extracted.detectedTopics || ['Entire Material'],
          status: extracted.status || 'ready',
          uploadedAt: new Date().toISOString(),
        };

        // Avoid exact duplicate filenames
        const exists = newFiles.findIndex(f => f.name === studyFile.name);
        if (exists >= 0) {
          newFiles[exists] = studyFile;
        } else {
          newFiles.push(studyFile);
        }
      } catch (err: any) {
        console.error('File parsing error:', err);
        setUploadError(`Failed to extract text from ${file.name}`);
      }
    }

    onFilesChange(newFiles);
    setIsUploading(false);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (id: string) => {
    const updated = files.filter(f => f.id !== id);
    onFilesChange(updated);
  };

  const handleLoadSample = () => {
    const exists = files.some(f => f.id === SAMPLE_STUDY_FILE.id);
    if (!exists) {
      onFilesChange([...files, SAMPLE_STUDY_FILE]);
    }
  };

  const totalWords = files.reduce((acc, f) => acc + (f.wordCount || 0), 0);

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-serif-display">
            Upload Study Material
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Upload your lecture notes, PDFs, or slides. StudyForge AI extracts the text and uses it exclusively for notes and quizzes.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleLoadSample}
            className="px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Sample Coursepack</span>
          </button>
        </div>
      </div>

      {uploadError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-800 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Drag & Drop Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
          dragActive
            ? 'border-indigo-600 bg-indigo-50/50 scale-[0.99]'
            : 'border-slate-300 hover:border-indigo-400 bg-white hover:bg-slate-50/50 shadow-xs'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.doc,.txt,.md,.pptx,.ppt"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-xs">
            {isUploading ? (
              <Loader2 className="w-7 h-7 animate-spin" />
            ) : (
              <UploadCloud className="w-7 h-7" />
            )}
          </div>

          <div className="space-y-1">
            <p className="text-base font-semibold text-slate-800">
              {isUploading
                ? 'Processing and extracting text from documents...'
                : 'Click to upload or drag & drop documents'}
            </p>
            <p className="text-xs text-slate-500">
              Supported Formats: PDF, DOCX, PPTX, TXT, Markdown (up to 25MB each)
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span>Multiple files allowed</span>
            <span>·</span>
            <span>Extracted locally & server grounded</span>
          </div>
        </div>
      </div>

      {/* Uploaded Files Section */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-slate-900">
                Uploaded Materials ({files.length})
              </h3>
              <span className="text-xs text-slate-500 font-mono">
                {totalWords.toLocaleString()} total words indexed
              </span>
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add more files</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {files.map((file) => (
              <div
                key={file.id}
                className="bg-white border border-slate-200/90 rounded-xl p-4.5 hover:border-slate-300 shadow-xs transition-all flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate" title={file.name}>
                        {file.name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <span>{formatFileSize(file.size)}</span>
                        <span>·</span>
                        <span>{file.wordCount ? `${file.wordCount.toLocaleString()} words` : 'Processing'}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFile(file.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Remove file"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Status and Action bar */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-medium">Text Extracted & Indexed</span>
                  </div>

                  <button
                    onClick={() => setPreviewFile(file)}
                    className="flex items-center gap-1 text-slate-600 hover:text-indigo-600 font-medium transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview Text</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Next Step CTA */}
          <div className="pt-4 flex justify-end">
            <button
              onClick={onProceedToTopic}
              className="px-6 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span>Choose What to Study</span>
              <BookOpen className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Extracted Text Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">{previewFile.name}</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  {previewFile.wordCount?.toLocaleString()} words extracted
                </p>
              </div>
              <button
                onClick={() => setPreviewFile(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto font-mono text-xs text-slate-700 bg-slate-50/70 whitespace-pre-wrap leading-relaxed select-text flex-1">
              {previewFile.extractedText || 'No text content found in document.'}
            </div>

            <div className="p-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setPreviewFile(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
