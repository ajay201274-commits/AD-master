import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { decode, encode, decodeAudioData } from '../../utils/helpers';
import { AudioWaveIcon } from '../icons/AIIcons';

const LiveAgent = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [history, setHistory] = useState<{ speaker: 'User' | 'Gemini'; text: string }[]>([]);
    const [partialUser, setPartialUser] =useState('');
    const [partialGemini, setPartialGemini] = useState('');
    
    const partialUserRef = useRef('');
    const partialGeminiRef = useRef('');
    const transcriptEndRef = useRef<HTMLDivElement>(null);

    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history, partialUser, partialGemini]);

    const createBlob = (data: Float32Array): Blob => {
      const l = data.length;
      const int16 = new Int16Array(l);
      for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
      }
      return {
        data: encode(new Uint8Array(int16.buffer)),
        mimeType: 'audio/pcm;rate=16000',
      };
    };

    const cleanup = useCallback(() => {
        sessionPromiseRef.current?.then(session => session.close());
        sessionPromiseRef.current = null;
        
        scriptProcessorRef.current?.disconnect();
        scriptProcessorRef.current = null;
        
        mediaStreamSourceRef.current?.disconnect();
        mediaStreamSourceRef.current = null;
        
        inputAudioContextRef.current?.close().catch(console.error);
        inputAudioContextRef.current = null;
        
        outputAudioContextRef.current?.close().catch(console.error);
        outputAudioContextRef.current = null;

        audioSourcesRef.current.forEach(source => source.stop());
        audioSourcesRef.current.clear();
        nextStartTimeRef.current = 0;
        
        setHistory([]);
        setPartialUser('');
        setPartialGemini('');
        partialUserRef.current = '';
        partialGeminiRef.current = '';

        setIsConnected(false);
        setIsConnecting(false);
    }, []);
    
    const startSession = async () => {
        setIsConnecting(true);
        setError(null);
        setHistory([]);
        setPartialUser('');
        setPartialGemini('');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            
            inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        setIsConnecting(false);
                        setIsConnected(true);
                        
                        const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
                        mediaStreamSourceRef.current = source;

                        const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current = scriptProcessor;

                        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob = createBlob(inputData);
                            sessionPromiseRef.current?.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inputAudioContextRef.current!.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        // Handle audio
                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (base64Audio && outputAudioContextRef.current) {
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContextRef.current.currentTime);
                            const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContextRef.current, 24000, 1);
                            const source = outputAudioContextRef.current.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputAudioContextRef.current.destination);
                            source.addEventListener('ended', () => { audioSourcesRef.current.delete(source); });
                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                            audioSourcesRef.current.add(source);
                        }
                        if (message.serverContent?.interrupted) {
                            audioSourcesRef.current.forEach(source => source.stop());
                            audioSourcesRef.current.clear();
                            nextStartTimeRef.current = 0;
                        }

                        // Handle transcription
                        let userTextChanged = false, geminiTextChanged = false, turnCompleted = false;
                        if (message.serverContent?.inputTranscription) {
                            partialUserRef.current += message.serverContent.inputTranscription.text;
                            userTextChanged = true;
                        }
                        if (message.serverContent?.outputTranscription) {
                            if(partialUserRef.current) {
                                setHistory(prev => [...prev, {speaker: 'User', text: partialUserRef.current}]);
                                partialUserRef.current = '';
                                userTextChanged = true;
                            }
                            partialGeminiRef.current += message.serverContent.outputTranscription.text;
                            geminiTextChanged = true;
                        }
                        if (message.serverContent?.turnComplete) turnCompleted = true;

                        // Batch state updates
                        if(turnCompleted) {
                            const finalUser = partialUserRef.current;
                            const finalGemini = partialGeminiRef.current;
                             setHistory(prev => {
                                let next = [...prev];
                                if (finalUser) next.push({speaker: 'User', text: finalUser});
                                if (finalGemini) next.push({speaker: 'Gemini', text: finalGemini});
                                return next;
                            });
                            partialUserRef.current = '';
                            partialGeminiRef.current = '';
                            setPartialUser('');
                            setPartialGemini('');
                        } else {
                            if (userTextChanged) setPartialUser(partialUserRef.current);
                            if (geminiTextChanged) setPartialGemini(partialGeminiRef.current);
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Session error:', e);
                        setError('A session error occurred. Please try again.');
                        cleanup();
                    },
                    onclose: (e: CloseEvent) => {
                        cleanup();
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                    systemInstruction: 'You are a friendly and helpful AI assistant.',
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                },
            });

        } catch (err) {
            console.error("Error starting session:", err);
            setError("Failed to start session. Please check microphone permissions.");
            cleanup();
        }
    };

    useEffect(() => {
        return () => { cleanup(); };
    }, [cleanup]);
    
    const buttonState = isConnecting ? 'Connecting...' : isConnected ? 'Disconnect' : 'Connect';

    return (
        <div className="h-full flex flex-col text-center">
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {history.map((turn, i) => (
                    <div key={i} className={`flex ${turn.speaker === 'User' ? 'justify-end' : 'justify-start'}`}>
                         <div className={`max-w-xl p-3 rounded-2xl text-left ${turn.speaker === 'User' ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200'}`}>
                           <p>{turn.text}</p>
                        </div>
                    </div>
                ))}
                {partialUser && (
                     <div className="flex justify-end">
                         <div className="max-w-xl p-3 rounded-2xl bg-indigo-600 text-white opacity-70 text-left">
                           <p>{partialUser}</p>
                        </div>
                    </div>
                )}
                 {partialGemini && (
                     <div className="flex justify-start">
                         <div className="max-w-xl p-3 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 opacity-70 text-left">
                           <p>{partialGemini}</p>
                        </div>
                    </div>
                )}
                <div ref={transcriptEndRef} />
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-700/80 flex flex-col items-center justify-center space-y-4">
                <p className="text-sm text-slate-500 dark:text-slate-400 h-5">
                   { isConnected ? "Speak now. Gemini is listening..." : "Tap the button to start a conversation." }
                </p>
                <div className={`relative w-40 h-40 flex items-center justify-center`}>
                    {isConnected && (
                        <div className="absolute inset-0 rounded-full bg-indigo-500/30 animate-ping"></div>
                    )}
                    <button 
                        onClick={isConnected ? cleanup : startSession}
                        disabled={isConnecting}
                        className="w-32 h-32 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex flex-col items-center justify-center transition-all duration-300 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed z-10"
                    >
                        <AudioWaveIcon className="w-12 h-12" />
                        <span className="mt-1 font-semibold">{buttonState}</span>
                    </button>
                </div>
                 {error && <p className="text-red-500 dark:text-red-400">{error}</p>}
            </div>
        </div>
    );
};

export default LiveAgent;