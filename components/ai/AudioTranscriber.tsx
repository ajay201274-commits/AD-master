import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { fileToGenerativePart } from '../../utils/helpers';
import { MicIcon, SparklesIcon, Spinner } from '../icons/AIIcons';

const AudioTranscriber = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };
            mediaRecorderRef.current.onstop = handleTranscription;
            audioChunksRef.current = [];
            mediaRecorderRef.current.start();
            setIsRecording(true);
            setTranscript(null);
            setError(null);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            setError("Could not access microphone. Please check permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setIsLoading(true);
        }
    };

    const handleTranscription = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], "recording.webm", { type: "audio/webm" });
        
        try {
             const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
             const audioPart = await fileToGenerativePart(audioFile);

             const response = await ai.models.generateContent({
                 model: 'gemini-2.5-flash',
                 contents: { parts: [{ text: "Transcribe this audio recording." }, { inlineData: audioPart }] },
             });
             
             setTranscript(response.text);

        } catch (err) {
            console.error('Transcription error:', err);
            setError('An error occurred during transcription.');
        } finally {
            setIsLoading(false);
            audioChunksRef.current = [];
        }
    };

    return (
        <div className="h-full flex flex-col items-center justify-center">
            <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-48 h-48 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isRecording 
                    ? 'bg-red-500/80 text-white shadow-2xl shadow-red-500/50 scale-110' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-500'
                }`}
                disabled={isLoading}
            >
                <MicIcon className="w-20 h-20" />
            </button>
            <p className="mt-4 text-lg font-semibold text-white">
                {isLoading ? "Transcribing..." : isRecording ? "Recording..." : "Tap to start recording"}
            </p>

            <div className="mt-8 p-6 bg-slate-800/40 rounded-lg w-full max-w-2xl h-64 overflow-y-auto">
                 <h3 className="text-lg font-semibold text-white mb-2">Transcript</h3>
                 {isLoading && <div className="flex items-center justify-center h-full"><Spinner className="w-10 h-10 text-indigo-400" /></div>}
                 {error && <p className="text-red-400">{error}</p>}
                 {transcript && <p className="text-slate-300 whitespace-pre-wrap">{transcript}</p>}
                 {!isLoading && !transcript && !error && (
                    <div className="text-center h-full flex flex-col justify-center items-center text-slate-500">
                        <SparklesIcon className="w-12 h-12 mb-4" />
                        <p>Your transcript will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AudioTranscriber;
