'use client';

import React, { useState } from 'react';
import { FaDownload, FaPlay, FaSpinner, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

export default function VideoDownloaderPage() {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState<'idle' | 'downloading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleDownload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;

        setLoading(true);
        setProgress(0);
        setStatus('downloading');
        setMessage('Starting download...');

        try {
            // Use our proxy API to bypass CORS and get progress
            const proxyUrl = `/api/tools/video-proxy?url=${encodeURIComponent(url)}`;
            const response = await fetch(proxyUrl);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Download failed');
            }

            const contentLength = response.headers.get('content-length');
            const total = contentLength ? parseInt(contentLength, 10) : 0;
            let loaded = 0;

            const reader = response.body?.getReader();
            if (!reader) throw new Error('Failed to initialize download stream');

            const chunks: Uint8Array[] = [];

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                chunks.push(value);
                loaded += value.length;

                if (total > 0) {
                    const percent = (loaded / total) * 100;
                    setProgress(Math.min(percent, 99.9)); // Keep it under 100 until fully done
                }
            }

            setProgress(100);
            setMessage('Processing file...');

            // Create blob and trigger download
            const blob = new Blob(chunks as BlobPart[], { type: 'video/mp4' });
            const downloadUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `video_${new Date().getTime()}.mp4`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(downloadUrl);

            setStatus('success');
            setMessage('Download complete!');
            setTimeout(() => setStatus('idle'), 3000);

        } catch (error: any) {
            console.error('Download error:', error);
            setStatus('error');
            setMessage(error.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8 font-sans text-slate-900">
            <div className="max-w-3xl mx-auto">

                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-4">
                        Universal Video Downloader
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Download videos directly to your device without watermarks. Fast, free, and unlimited.
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
                    <div className="p-8">

                        {/* Input Form */}
                        <form onSubmit={handleDownload} className="space-y-6">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder="Paste video URL here (e.g., https://example.com/video.mp4)"
                                    className="w-full px-6 py-4 text-lg bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none placeholder:text-slate-400"
                                    disabled={loading}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !url}
                                className={`w-full py-4 px-6 rounded-xl text-white font-bold text-lg shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3
                  ${loading || !url
                                        ? 'bg-slate-300 cursor-not-allowed shadow-none'
                                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-indigo-500/30'
                                    }`}
                            >
                                {loading ? (
                                    <>
                                        <FaSpinner className="animate-spin text-xl" />
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        <FaPlay className="text-lg" />
                                        <span>Start Download</span>
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Progress Section */}
                        {(status === 'downloading' || status === 'success') && (
                            <div className="mt-8 space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex justify-between text-sm font-medium text-slate-600">
                                    <span>{status === 'success' ? 'Completed' : 'Downloading...'}</span>
                                    <span>{Math.round(progress)}%</span>
                                </div>
                                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-300 ease-out ${status === 'success' ? 'bg-green-500' : 'bg-indigo-600'
                                            }`}
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Status Messages */}
                        {status === 'success' && (
                            <div className="mt-6 p-4 bg-green-50 text-green-700 rounded-xl flex items-center gap-3 animate-in fade-in zoom-in duration-300">
                                <FaCheckCircle className="text-xl" />
                                <span className="font-medium">{message}</span>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3 animate-in fade-in zoom-in duration-300">
                                <FaExclamationTriangle className="text-xl" />
                                <span className="font-medium">{message}</span>
                            </div>
                        )}

                    </div>

                    {/* Footer Info */}
                    <div className="bg-slate-50 px-8 py-6 border-t border-slate-100">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                            <div className="p-4 rounded-lg bg-white shadow-sm border border-slate-100">
                                <div className="text-2xl font-bold text-indigo-600 mb-1">Free</div>
                                <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">No Hidden Fees</div>
                            </div>
                            <div className="p-4 rounded-lg bg-white shadow-sm border border-slate-100">
                                <div className="text-2xl font-bold text-indigo-600 mb-1">Fast</div>
                                <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">High Speed</div>
                            </div>
                            <div className="p-4 rounded-lg bg-white shadow-sm border border-slate-100">
                                <div className="text-2xl font-bold text-indigo-600 mb-1">Secure</div>
                                <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Privacy First</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center text-slate-400 text-sm">
                    <p>© {new Date().getFullYear()} Video Downloader Tool. All rights reserved.</p>
                </div>

            </div>
        </div>
    );
}
