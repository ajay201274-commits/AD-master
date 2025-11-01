import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { GoogleGenAI, Modality } from "@google/genai";
import { fileToGenerativePart } from '../../utils/helpers';
import { EditIcon, SparklesIcon, Spinner } from '../icons/AIIcons';

const ImageEditor = () => {
    const [originalImage, setOriginalImage] = useState<{ file: File, preview: string } | null>(null);
    const [editedImage, setEditedImage] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            setOriginalImage({ file, preview: URL.createObjectURL(file) });
            setEditedImage(null);
            setError(null);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpeg', '.png', '.gif', '.webp'] },
        multiple: false,
    });

    const handleEdit = async () => {
        if (!originalImage || !prompt.trim() || isLoading) return;

        setIsLoading(true);
        setError(null);
        setEditedImage(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const imagePart = await fileToGenerativePart(originalImage.file);

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: {
                    parts: [
                        { inlineData: imagePart },
                        { text: prompt },
                    ],
                },
                config: {
                    responseModalities: [Modality.IMAGE],
                },
            });
            
            let foundImage = false;
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    const base64ImageBytes: string = part.inlineData.data;
                    const imageUrl = `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
                    setEditedImage(imageUrl);
                    foundImage = true;
                    break;
                }
            }

            if(!foundImage) {
                setError("Couldn't generate an image. The model may have refused the request.");
            }

        } catch (err) {
            console.error('Image editing error:', err);
            setError('An error occurred during image editing. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="flex flex-col items-center justify-center h-full p-4 bg-slate-100 dark:bg-slate-800/40 rounded-lg">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Original Image</h3>
                    {originalImage ? (
                        <img src={originalImage.preview} alt="Original" className="max-w-full max-h-[45vh] rounded-md" />
                    ) : (
                        <div {...getRootProps()} className={`w-full h-full border-2 border-dashed border-slate-400 dark:border-slate-600 rounded-lg flex items-center justify-center text-center p-8 cursor-pointer hover:border-indigo-500 transition-colors ${isDragActive ? 'border-indigo-500 bg-indigo-500/10' : ''}`}>
                            <input {...getInputProps()} />
                            <p className="text-slate-500 dark:text-slate-400">Drag & drop an image here, or click to select</p>
                        </div>
                    )}
                </div>
                 <div className="flex flex-col items-center justify-center h-full p-4 bg-slate-100 dark:bg-slate-800/40 rounded-lg">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Edited Image</h3>
                    <div className="w-full h-full flex items-center justify-center">
                        {isLoading && <Spinner className="w-12 h-12 text-indigo-500 dark:text-indigo-400" />}
                        {error && <p className="text-red-500 dark:text-red-400 text-center">{error}</p>}
                        {editedImage && <img src={editedImage} alt="Edited" className="max-w-full max-h-[45vh] rounded-md" />}
                        {!isLoading && !editedImage && !error && <p className="text-slate-500 dark:text-slate-500">Your edited image will appear here</p>}
                    </div>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700/80">
                <label htmlFor="prompt" className="block mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">Editing Instruction</label>
                <div className="flex items-center space-x-2">
                    <input
                        id="prompt"
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., Add a retro filter"
                        className="flex-grow bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-600/80 rounded-lg p-3 focus:ring-indigo-500/80 focus:border-indigo-500"
                        disabled={isLoading || !originalImage}
                    />
                    <button onClick={handleEdit} disabled={isLoading || !originalImage || !prompt.trim()} className="p-3 bg-indigo-600 text-white rounded-lg disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed hover:bg-indigo-500 transition-colors flex items-center justify-center w-36">
                        {isLoading ? <Spinner className="w-6 h-6" /> : <><EditIcon className="w-5 h-5 mr-2" /> Edit</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImageEditor;