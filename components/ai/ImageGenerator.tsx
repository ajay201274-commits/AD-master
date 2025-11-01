import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { SparklesIcon, Spinner } from '../icons/AIIcons';

type AspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4";

const ImageGenerator = () => {
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!prompt.trim() || isLoading) return;

        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: prompt,
                config: {
                    numberOfImages: 1,
                    outputMimeType: 'image/jpeg',
                    aspectRatio: aspectRatio,
                },
            });

            if (response.generatedImages && response.generatedImages.length > 0) {
                 const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
                 const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
                 setGeneratedImage(imageUrl);
            } else {
                 setError('Image generation failed. No images were returned.');
            }
        } catch (err) {
            console.error('Image generation error:', err);
            setError('An error occurred during image generation. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const aspectRatios: { value: AspectRatio; label: string }[] = [
        { value: '1:1', label: 'Square' },
        { value: '16:9', label: 'Widescreen' },
        { value: '9:16', label: 'Portrait' },
        { value: '4:3', label: 'Landscape' },
        { value: '3:4', label: 'Tall' },
    ];

    return (
        <div className="flex flex-col h-full">
            <div className="flex-grow flex items-center justify-center bg-slate-100 dark:bg-slate-800/20 rounded-lg">
                 {isLoading && (
                    <div className="text-center">
                        <Spinner className="w-12 h-12 mx-auto text-indigo-500 dark:text-indigo-400" />
                        <p className="mt-4 text-slate-600 dark:text-slate-300">Generating your masterpiece...</p>
                    </div>
                 )}
                 {error && <p className="text-red-500 dark:text-red-400 text-center">{error}</p>}
                 {generatedImage && (
                    <div className="p-4 bg-black/30 rounded-lg">
                        <img src={generatedImage} alt="Generated" className="max-w-full max-h-[60vh] rounded-md shadow-2xl" />
                    </div>
                 )}
                 {!isLoading && !generatedImage && !error && (
                    <div className="text-center text-slate-500 dark:text-slate-400">
                        <SparklesIcon className="w-16 h-16 mx-auto text-indigo-500 dark:text-indigo-400" />
                        <h2 className="mt-4 text-2xl font-bold text-slate-800 dark:text-white">Image Generation</h2>
                        <p>Describe the image you want to create.</p>
                    </div>
                 )}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700/80">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <label htmlFor="prompt" className="block mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">Prompt</label>
                        <textarea
                            id="prompt"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., A robot holding a red skateboard."
                            className="w-full h-24 bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-600/80 rounded-lg p-3 focus:ring-indigo-500/80 focus:border-indigo-500 resize-none"
                            disabled={isLoading}
                        />
                    </div>
                     <div>
                        <label htmlFor="aspectRatio" className="block mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">Aspect Ratio</label>
                         <select
                            id="aspectRatio"
                            value={aspectRatio}
                            onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                            className="w-full h-24 bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-600/80 rounded-lg p-3 focus:ring-indigo-500/80 focus:border-indigo-500"
                            disabled={isLoading}
                        >
                            {aspectRatios.map(ar => (
                                <option key={ar.value} value={ar.value}>{ar.label} ({ar.value})</option>
                            ))}
                        </select>
                    </div>
                </div>
                 <button onClick={handleGenerate} disabled={isLoading || !prompt.trim()} className="mt-4 w-full py-3 bg-indigo-600 text-white font-bold rounded-lg disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed hover:bg-indigo-500 transition-colors flex items-center justify-center">
                    {isLoading ? <><Spinner className="w-5 h-5 mr-2" /> Generating...</> : <><SparklesIcon className="w-5 h-5 mr-2" /> Generate Image</>}
                </button>
            </div>
        </div>
    );
};

export default ImageGenerator;