import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { BrainIcon, MapIcon, SearchIcon, SparklesIcon, Spinner } from '../icons/AIIcons';

interface Message {
    sender: 'user' | 'gemini';
    text: string;
    sources?: { uri: string, title: string }[];
}

const Chatbot = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [useThinking, setUseThinking] = useState(false);
    const [useSearch, setUseSearch] = useState(false);
    const [useMaps, setUseMaps] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

            const model = useThinking ? 'gemini-2.5-pro' : 'gemini-flash-lite-latest';
            
            const tools: any[] = [];
            if (useSearch) tools.push({ googleSearch: {} });
            if (useMaps) tools.push({ googleMaps: {} });

            const config: any = {};
            if (useThinking) config.thinkingConfig = { thinkingBudget: 32768 };
            if (tools.length > 0) config.tools = tools;
            
            setMessages(prev => [...prev, { sender: 'gemini', text: '' }]);

            const response = await ai.models.generateContentStream({
                model,
                contents: input,
                config,
            });

            let sources: { uri: string, title: string }[] = [];

            for await (const chunk of response) {
                if(chunk.candidates?.[0]?.groundingMetadata?.groundingChunks) {
                    const chunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
                    for(const c of chunks) {
                        if (c.web) sources.push({uri: c.web.uri, title: c.web.title});
                        if (c.maps) sources.push({uri: c.maps.uri, title: c.maps.title});
                    }
                }
                
                setMessages(prev => {
                    const lastMessage = prev[prev.length - 1];
                    lastMessage.text += chunk.text;
                    if(sources.length > 0) {
                         lastMessage.sources = [...new Map(sources.map(item => [item.uri, item])).values()];
                    }
                    return [...prev.slice(0, -1), lastMessage];
                });
            }

        } catch (error) {
            console.error('Gemini API error:', error);
            setMessages(prev => [...prev.slice(0, -1), { sender: 'gemini', text: 'Sorry, something went wrong.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex-grow overflow-y-auto pr-4 space-y-4">
                {messages.length === 0 ? (
                     <div className="text-center h-full flex flex-col justify-center items-center text-slate-500 dark:text-slate-400">
                        <SparklesIcon className="w-16 h-16 mb-4 text-indigo-500 dark:text-indigo-400" />
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Gemini Chat</h2>
                        <p>Ask me anything!</p>
                    </div>
                ) : (
                    messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xl p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200'}`}>
                                <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                                {msg.sources && msg.sources.length > 0 && (
                                    <div className="mt-2 pt-2 border-t border-slate-300 dark:border-slate-700">
                                        <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Sources:</h4>
                                        <div className="flex flex-wrap gap-2">
                                        {msg.sources.map((source, i) => (
                                            <a href={source.uri} key={i} target="_blank" rel="noopener noreferrer" className="text-xs bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600 text-indigo-600 dark:text-indigo-300 px-2 py-1 rounded-md transition-colors">
                                                {source.title || new URL(source.uri).hostname}
                                            </a>
                                        ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
                 <div ref={messagesEndRef} />
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700/80">
                <div className="flex items-center space-x-2 mb-2">
                     <button onClick={() => setUseThinking(!useThinking)} title="Thinking Mode (Gemini 2.5 Pro)" className={`flex items-center space-x-1.5 p-2 text-xs rounded-lg transition-colors ${useThinking ? 'bg-purple-500/80 text-white' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'}`}>
                        <BrainIcon className="w-4 h-4" />
                        <span>Thinking Mode</span>
                    </button>
                    <button onClick={() => setUseSearch(!useSearch)} title="Google Search Grounding" className={`flex items-center space-x-1.5 p-2 text-xs rounded-lg transition-colors ${useSearch ? 'bg-blue-500/80 text-white' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'}`}>
                        <SearchIcon className="w-4 h-4" />
                         <span>Search</span>
                    </button>
                     <button onClick={() => setUseMaps(!useMaps)} title="Google Maps Grounding" className={`flex items-center space-x-1.5 p-2 text-xs rounded-lg transition-colors ${useMaps ? 'bg-green-500/80 text-white' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'}`}>
                        <MapIcon className="w-4 h-4" />
                         <span>Maps</span>
                    </button>
                </div>
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type your message..."
                        className="flex-grow bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-600/80 rounded-lg p-3 focus:ring-indigo-500/80 focus:border-indigo-500"
                        disabled={isLoading}
                    />
                    <button onClick={handleSend} disabled={isLoading || !input.trim()} className="p-3 bg-indigo-600 text-white rounded-lg disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed hover:bg-indigo-500 transition-colors">
                        {isLoading ? <Spinner className="w-6 h-6" /> : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform -rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chatbot;