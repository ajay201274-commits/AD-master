import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { GoogleGenAI } from "@google/genai";
import { fileToGenerativePart } from '../../utils/helpers';
import { AnalyzeIcon, SparklesIcon, Spinner } from '../icons/AIIcons';

const ImageAnalyzer = () => {
    const [image, setImage] = useState<{ file: File, preview: string } | null>(null);
    const [prompt, setPrompt] = useState('Describe this image in detail.');
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            setImage({ file, preview: URL.createObjectURL(file) });
            setAnalysis(null);
            setError(null);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpeg', '.png', '.gif', '.webp'] },
        multiple: false,
    });

    const handleAnalyze = async () => {
        if (!image || !prompt.trim() || isLoading) return;

        setIsLoading(true);
        setError(null);
        setAnalysis(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const imagePart = await fileToGenerativePart(image.file);
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [{inlineData: imagePart}, {text: prompt}] },
            });
            
            setAnalysis(response.text);

        } catch (err) {
            console.error('Image analysis error:', err);
            setError('An error occurred during image analysis. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col md:flex-row gap-6">
            <div className="md:w-1/2 flex flex-col">
                 <div {...getRootProps()} className={`flex-grow border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center text-center p-4 cursor-pointer hover:border-indigo-500 transition-colors ${isDragActive ? 'border-indigo-500 bg-indigo-500/10' : ''}`}>
                    <input {...getInputProps()} />
                    {image ? (
                         <img src={image.preview} alt="Selected" className="max-w-full max-h-[60vh] rounded-md" />
                    ) : (
                         <p className="text-slate-400">Drag & drop an image here, or click to select</p>
                    )}
                </div>
                 <div className="mt-4">
                    <label htmlFor="prompt" className="block mb-2 text-sm font-medium text-slate-300">Question / Instruction</label>
                    <textarea
                        id="prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="w-full h-24 bg-slate-800/60 border border-slate-600/80 text-white rounded-lg p-3 focus:ring-indigo-500/80 focus:border-indigo-500 resize-none"
                        disabled={isLoading || !image}
                    />
                </div>
                 <button onClick={handleAnalyze} disabled={isLoading || !image || !prompt.trim()} className="mt-4 w-full py-3 bg-indigo-600 text-white font-bold rounded-lg disabled:bg-slate-600 disabled:cursor-not-allowed hover:bg-indigo-500 transition-colors flex items-center justify-center">
                    {isLoading ? <><Spinner className="w-5 h-5 mr-2" /> Analyzing...</> : <><AnalyzeIcon className="w-5 h-5 mr-2" /> Analyze Image</>}
                </button>
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
                            <p>Analysis will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImageAnalyzer;