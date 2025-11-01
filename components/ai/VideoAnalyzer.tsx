import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { GoogleGenAI } from "@google/genai";
import { AnalyzeIcon, SparklesIcon, Spinner } from '../icons/AIIcons';

const FRAME_CAPTURE_INTERVAL_MS = 1000; // 1 frame per second
const MAX_FRAMES = 30; // Limit to 30 frames to avoid huge request size

const VideoAnalyzer = () => {
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [prompt, setPrompt] = useState('Summarize this video.');
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setVideoFile(acceptedFiles[0]);
            setAnalysis(null);
            setError(null);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'video/*': ['.mp4', '.mov', '.webm'] },
        multiple: false,
    });

    const extractFrames = (): Promise<string[]> => {
        return new Promise((resolve, reject) => {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            if (!video || !canvas || !videoFile) {
                return reject(new Error("Video or canvas element not available."));
            }

            const videoUrl = URL.createObjectURL(videoFile);
            video.src = videoUrl;
            const frames: string[] = [];
            const context = canvas.getContext('2d');
            if(!context) return reject(new Error("Canvas context not available."));

            video.onloadeddata = () => {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                let capturedFrames = 0;

                const captureFrame = () => {
                    if (video.currentTime >= video.duration || capturedFrames >= MAX_FRAMES) {
                        video.pause();
                        URL.revokeObjectURL(videoUrl);
                        resolve(frames);
                        return;
                    }

                    context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                    const frameDataUrl = canvas.toDataURL('image/jpeg', 0.8);
                    frames.push(frameDataUrl.split(',')[1]); // Get base64 part
                    capturedFrames++;
                    
                    video.currentTime += FRAME_CAPTURE_INTERVAL_MS / 1000;
                };
                
                video.addEventListener('seeked', captureFrame);
                video.currentTime = 0; // Start capturing from the beginning
            };
            
            video.onerror = (e) => {
                 URL.revokeObjectURL(videoUrl);
                 reject(new Error("Error loading video file."));
            }
        });
    };

    const handleAnalyze = async () => {
        if (!videoFile || !prompt.trim() || isLoading) return;

        setIsLoading(true);
        setError(null);
        setAnalysis(null);

        try {
            const frames = await extractFrames();
            if (frames.length === 0) {
                throw new Error("Could not extract any frames from the video.");
            }
            
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

            const imageParts = frames.map(frameData => ({
                inlineData: { data: frameData, mimeType: 'image/jpeg' }
            }));

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: { parts: [{ text: prompt }, ...imageParts] },
            });
            
            setAnalysis(response.text);

        } catch (err) {
            console.error('Video analysis error:', err);
            setError(`An error occurred during video analysis. ${err instanceof Error ? err.message : ''}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="h-full flex flex-col md:flex-row gap-6">
            <div className="md:w-1/2 flex flex-col">
                <div {...getRootProps()} className={`flex-grow border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center text-center p-4 cursor-pointer hover:border-indigo-500 transition-colors ${isDragActive ? 'border-indigo-500 bg-indigo-500/10' : ''}`}>
                    <input {...getInputProps()} />
                     {videoFile ? (
                         <div className="text-center">
                            <video src={URL.createObjectURL(videoFile)} className="max-w-full max-h-[50vh] rounded-md" controls muted />
                            <p className="text-slate-300 mt-2">{videoFile.name}</p>
                         </div>
                    ) : (
                         <p className="text-slate-400">Drag & drop a video here, or click to select</p>
                    )}
                </div>
                <div className="mt-4">
                    <label htmlFor="prompt" className="block mb-2 text-sm font-medium text-slate-300">Analysis Prompt</label>
                    <textarea
                        id="prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="w-full h-24 bg-slate-800/60 border border-slate-600/80 text-white rounded-lg p-3 focus:ring-indigo-500/80 focus:border-indigo-500 resize-none"
                        disabled={isLoading || !videoFile}
                    />
                </div>
                <button onClick={handleAnalyze} disabled={isLoading || !videoFile || !prompt.trim()} className="mt-4 w-full py-3 bg-indigo-600 text-white font-bold rounded-lg disabled:bg-slate-600 disabled:cursor-not-allowed hover:bg-indigo-500 transition-colors flex items-center justify-center">
                    {isLoading ? <><Spinner className="w-5 h-5 mr-2" /> Analyzing...</> : <><AnalyzeIcon className="w-5 h-5 mr-2" /> Analyze Video</>}
                </button>
                 <p className="text-xs text-slate-500 text-center mt-2">Analyzes up to {MAX_FRAMES} frames (1 per second).</p>
            </div>
             <div className="md:w-1/2 flex flex-col bg-slate-800/40 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Analysis Result</h3>
                <div className="flex-grow overflow-y-auto pr-2">
                    {isLoading && <div className="flex items-center justify-center h-full"><Spinner className="w-12 h-12 text-indigo-400" /></div>}
                    {error && <p className="text-red-400">{error}</p>}
                    {analysis && <p className="text-slate-300 whitespace-pre-wrap">{analysis}</p>}
                     {!isLoading && !analysis && !error && (
                         <div className="text-center h-full flex flex-col justify-center items-center text-slate-500">
                             <SparklesIcon className="w-12 h-12 mb-4" />
                            <p>Video analysis will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
            <video ref={videoRef} style={{ display: 'none' }} muted playsInline />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
    );
};

export default VideoAnalyzer;
