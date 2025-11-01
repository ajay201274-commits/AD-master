

import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { GoogleGenAI } from "@google/genai";
import { fileToBase64 } from '../../utils/helpers';
import { SparklesIcon, Spinner, ImageIcon } from '../icons/AIIcons';

type AspectRatio = '16:9' | '9:16';
type GenerationMode = 'text-to-video' | 'image-to-video';

const LOADING_MESSAGES = [
    "Warming up the digital director's chair...",
    "Choreographing pixels into motion...",
    "Rendering your cinematic vision...",
    "This can take a few minutes, please wait...",
    "The final cut is almost ready...",
];


const VideoGenerator = () => {
    const [hasApiKey, setHasApiKey] = useState(false);
    const [isCheckingKey, setIsCheckingKey] = useState(true);
    const [mode, setMode] = useState<GenerationMode>('text-to-video');
    const [prompt, setPrompt] = useState('');
    const [image, setImage] = useState<{ file: File; preview: string } | null>(null);
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const checkKey = async () => {
            try {
                if (window.aistudio?.hasSelectedApiKey) {
                    const hasKey = await window.aistudio.hasSelectedApiKey();
                    setHasApiKey(hasKey);
                } else {
                    setHasApiKey(false);
                }
            } catch (e) {
                console.error("Error checking for API key:", e);
                setHasApiKey(false); // Assume no key on error
            } finally {
                setIsCheckingKey(false);
            }
        };
        checkKey();
    }, []);
    
     useEffect(() => {
        let interval: number;
        if (isLoading) {
            interval = window.setInterval(() => {
                setLoadingMessage(prev => {
                    const currentIndex = LOADING_MESSAGES.indexOf(prev);
                    const nextIndex = (currentIndex + 1) % LOADING_MESSAGES.length;
                    return LOADING_MESSAGES[nextIndex];
                });
            }, 5000);
        }
        return () => clearInterval(interval);
    }, [isLoading]);

    const handleSelectKey = async () => {
        try {
            if (window.aistudio?.openSelectKey) {
                await window.aistudio.openSelectKey();
                // Assume success and optimistically update UI
                setHasApiKey(true);
                setError(null);
            }
        } catch (e) {
            console.error("Error opening key selection:", e);
        }
    };
    
    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            setImage({ file, preview: URL.createObjectURL(file) });
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpeg', '.png'] },
        multiple: false,
    });
    
     const handleRemoveImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setImage(null);
    }

    const handleGenerate = async () => {
        if (isLoading) return;
        if (mode === 'image-to-video' && !image) {
            setError('Please upload an image for image-to-video generation.');
            return;
        }
        if (mode === 'text-to-video' && !prompt.trim()) {
            setError('Please enter a prompt for text-to-video generation.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedVideoUrl(null);
        setLoadingMessage(LOADING_MESSAGES[0]);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            
            const generationPayload: any = {
                model: 'veo-3.1-fast-generate-preview',
                prompt: prompt,
                config: {
                    numberOfVideos: 1,
                    resolution: '720p',
                    aspectRatio: aspectRatio,
                }
            };

            if (mode === 'image-to-video' && image) {
                const base64Data = await fileToBase64(image.file);
                generationPayload.image = {
                    imageBytes: base64Data,
                    mimeType: image.file.type,
                };
            }

            let operation = await ai.models.generateVideos(generationPayload);

            while (!operation.done) {
                await new Promise(resolve => setTimeout(resolve, 10000));
                operation = await ai.operations.getVideosOperation({ operation: operation });
            }

            if(operation.error) {
                throw new Error(operation.error.message || 'Video generation failed in operation.');
            }

            const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
            if (downloadLink) {
                const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
                const blob = await response.blob();
                const videoUrl = URL.createObjectURL(blob);
                setGeneratedVideoUrl(videoUrl);
            } else {
                throw new Error('No video URI found in the operation response.');
            }

        } catch (err) {
            console.error('Video generation error:', err);
             if (err instanceof Error && err.message?.includes("Requested entity was not found.")) {
                setError("Your API Key is invalid. Please select a valid key and try again.");
                setHasApiKey(false); // Reset key state
            } else {
                if (err instanceof Error) {
                    setError(`An error occurred: ${err.message}`);
                } else {
                    setError('An unknown error occurred. Please check the console for details.');
                }
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    if (isCheckingKey) {
        return <div className="flex items-center justify-center h-full"><Spinner className="w-10 h-10" /></div>;
    }

    if (!hasApiKey) {
        return (
            <div className="text-center h-full flex flex-col justify-center items-center">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">API Key Required for Veo</h2>
                <p className="max-w-md text-slate-500 dark:text-slate-400 mb-4">Video generation requires a project-linked API key. Please select one to proceed.</p>
                <p className="max-w-md text-xs text-slate-500 dark:text-slate-500 mb-6">For information on billing, please visit <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-indigo-500 dark:text-indigo-400 hover:underline">ai.google.dev/gemini-api/docs/billing</a>.</p>
                <button onClick={handleSelectKey} className="py-2 px-5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-500 transition-colors">
                    Select API Key
                </button>
                 {error && <p className="text-red-500 dark:text-red-400 mt-4">{error}</p>}
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex-grow flex items-center justify-center bg-slate-100 dark:bg-slate-800/20 rounded-lg p-4">
                 {isLoading && (
                    <div className="text-center">
                        <Spinner className="w-12 h-12 mx-auto text-indigo-500 dark:text-indigo-400" />
                        <p className="mt-4 text-slate-600 dark:text-slate-300">{loadingMessage}</p>
                    </div>
                 )}
                 {error && <p className="text-red-500 dark:text-red-400 text-center">{error}</p>}
                 {generatedVideoUrl && (
                    <div className="p-4 bg-black/30 rounded-lg">
                        <video src={generatedVideoUrl} controls autoPlay loop className="max-w-full max-h-[60vh] rounded-md shadow-2xl" />
                    </div>
                 )}
                  {!isLoading && !generatedVideoUrl && !error && (
                    <div 
                        {...(mode === 'image-to-video' ? getRootProps() : {})}
                        className={`w-full h-full flex flex-col items-center justify-center text-center transition-colors
                            ${mode === 'image-to-video' ? 'border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-400' : ''}
                            ${isDragActive ? 'border-indigo-500 bg-indigo-500/10' : ''}
                        `}>
                         <input {...(mode === 'image-to-video' ? getInputProps() : {})} />
                         {mode === 'text-to-video' && (
                             <div className="text-center text-slate-500 dark:text-slate-400">
                                <SparklesIcon className="w-16 h-16 mx-auto text-indigo-500 dark:text-indigo-400" />
                                <h2 className="mt-4 text-2xl font-bold text-slate-800 dark:text-white">Video Generation with Veo</h2>
                                <p>Create a video from a text prompt.</p>
                            </div>
                         )}
                         {mode === 'image-to-video' && (
                             image ? (
                                <div className="relative">
                                    <img src={image.preview} alt="Upload preview" className="max-w-full max-h-[50vh] rounded-md shadow-lg" />
                                    <button 
                                        onClick={handleRemoveImage}
                                        className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-black/80 transition-colors z-10"
                                        aria-label="Remove image"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                             ) : (
                                <div className="text-center text-slate-500 dark:text-slate-400">
                                    <ImageIcon className="w-16 h-16 mx-auto text-indigo-500 dark:text-indigo-400" />
                                    <h2 className="mt-4 text-2xl font-bold text-slate-800 dark:text-white">Start with an Image</h2>
                                    <p>Drag & drop or click here to upload a starting image for your video.</p>
                                </div>
                             )
                         )}
                    </div>
                  )}
            </div>

             <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700/80 space-y-4">
                 <div className="flex space-x-2 bg-slate-200 dark:bg-slate-800/60 p-1 rounded-lg">
                    <button onClick={() => setMode('text-to-video')} className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${mode === 'text-to-video' ? 'bg-indigo-600 text-white' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700'}`}>Text-to-Video</button>
                    <button onClick={() => setMode('image-to-video')} className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${mode === 'image-to-video' ? 'bg-indigo-600 text-white' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700'}`}>Image-to-Video</button>
                </div>
                
                 <div>
                    <label htmlFor="prompt" className="block mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">Prompt {mode === 'image-to-video' && '(optional)'}</label>
                    <textarea
                        id="prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., A neon hologram of a cat driving at top speed"
                        className={`w-full bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-600/80 text-slate-900 dark:text-white rounded-lg p-3 focus:ring-indigo-500/80 focus:border-indigo-500 resize-none transition-all duration-300 ${
                            mode === 'image-to-video' && image ? 'h-16' : 'h-20'
                        }`}
                        disabled={isLoading}
                    />
                </div>

                <div>
                    <label htmlFor="aspectRatio" className="block mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">Aspect Ratio</label>
                    <select id="aspectRatio" value={aspectRatio} onChange={e => setAspectRatio(e.target.value as AspectRatio)} className="w-full bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-600/80 text-slate-900 dark:text-white rounded-lg p-3 focus:ring-indigo-500/80 focus:border-indigo-500" disabled={isLoading}>
                        <option value="16:9">Landscape (16:9)</option>
                        <option value="9:16">Portrait (9:16)</option>
                    </select>
                </div>
                
                <button onClick={handleGenerate} disabled={isLoading} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed hover:bg-indigo-500 transition-colors flex items-center justify-center">
                    {isLoading ? <><Spinner className="w-5 h-5 mr-2" /> Generating Video...</> : <><SparklesIcon className="w-5 h-5 mr-2" /> Generate Video</>}
                </button>
            </div>
        </div>
    );
};

export default VideoGenerator;