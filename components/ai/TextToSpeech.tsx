import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import { decode, decodeAudioData } from '../../utils/helpers';
import { AudioWaveIcon, Spinner } from '../icons/AIIcons';

type VoiceName = 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';

const VOICES: { name: string, id: VoiceName }[] = [
    { name: 'Kore (Female)', id: 'Kore' },
    { name: 'Puck (Male)', id: 'Puck' },
    { name: 'Charon (Male)', id: 'Charon' },
    { name: 'Fenrir (Female)', id: 'Fenrir' },
    { name: 'Zephyr (Male)', id: 'Zephyr' },
];

const TextToSpeech = () => {
    const [text, setText] = useState('Hello! I am a friendly AI assistant powered by Gemini.');
    const [selectedVoice, setSelectedVoice] = useState<VoiceName>('Kore');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

    useEffect(() => {
        // Create AudioContext on client side after component mounts
        setAudioContext(new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 }));
        return () => {
            audioContext?.close();
        };
    }, []);

    const handleGenerateSpeech = async () => {
        if (!text.trim() || isLoading || !audioContext) return;

        setIsLoading(true);
        setError(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [{ parts: [{ text: text }] }],
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: { voiceName: selectedVoice },
                        },
                    },
                },
            });

            const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
                const audioBuffer = await decodeAudioData(decode(base64Audio), audioContext, 24000, 1);
                const source = audioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioContext.destination);
                source.start();
            } else {
                throw new Error("No audio data received from API.");
            }

        } catch (err) {
            console.error("TTS error:", err);
            setError("Failed to generate speech. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full max-w-2xl mx-auto flex flex-col">
            <div className="flex-grow">
                 <label htmlFor="tts-text" className="block mb-2 text-sm font-medium text-slate-300">Text to Synthesize</label>
                <textarea
                    id="tts-text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full h-48 bg-slate-800/60 border border-slate-600/80 text-white rounded-lg p-3 focus:ring-indigo-500/80 focus:border-indigo-500 resize-y"
                    placeholder="Enter text here..."
                    disabled={isLoading}
                />
            </div>
            <div className="mt-4 pt-4 border-t border-slate-700/80 space-y-4">
                 <div>
                    <label htmlFor="tts-voice" className="block mb-2 text-sm font-medium text-slate-300">Voice</label>
                    <select
                        id="tts-voice"
                        value={selectedVoice}
                        onChange={(e) => setSelectedVoice(e.target.value as VoiceName)}
                        className="w-full bg-slate-800/60 border border-slate-600/80 text-white rounded-lg p-3 focus:ring-indigo-500/80 focus:border-indigo-500"
                        disabled={isLoading}
                    >
                        {VOICES.map(voice => (
                            <option key={voice.id} value={voice.id}>{voice.name}</option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={handleGenerateSpeech}
                    disabled={isLoading || !text.trim()}
                    className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg disabled:bg-slate-600 disabled:cursor-not-allowed hover:bg-indigo-500 transition-colors flex items-center justify-center"
                >
                    {isLoading ? <><Spinner className="w-5 h-5 mr-2" /> Generating...</> : <><AudioWaveIcon className="w-5 h-5 mr-2" /> Generate & Play</>}
                </button>
                 {error && <p className="text-red-400 text-center mt-2">{error}</p>}
            </div>
        </div>
    );
};

export default TextToSpeech;
