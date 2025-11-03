import React, { useState, useCallback, ReactNode, useEffect } from 'react';
import { AnalyzeIcon, AudioWaveIcon, BrainIcon, ChatIcon, EditIcon, ImageIcon, MicIcon, SparklesIcon, VideoIcon } from './icons/AIIcons';
import ApiKeyManager from './ai/ApiKeyManager';

import Chatbot from './ai/Chatbot';
import ImageGenerator from './ai/ImageGenerator';
import ImageEditor from './ai/ImageEditor';
import ImageAnalyzer from './ai/ImageAnalyzer';
import VideoGenerator from './ai/VideoGenerator';
import VideoAnalyzer from './ai/VideoAnalyzer';
import AudioTranscriber from './ai/AudioTranscriber';
import LiveAgent from './ai/LiveAgent';
import TextToSpeech from './ai/TextToSpeech';
import CampaignIdeas from './CampaignIdeas';

type AITool = 'CHATBOT' | 'IMAGE_GENERATOR' | 'IMAGE_EDITOR' | 'IMAGE_ANALYZER' | 'VIDEO_GENERATOR' | 'VIDEO_ANALYZER' | 'AUDIO_TRANSCRIBER' | 'LIVE_AGENT' | 'TEXT_TO_SPEECH' | 'CAMPAIGN_IDEAS';

interface Tool {
    id: AITool;
    name: string;
    description: string;
    icon: ReactNode;
    component: ReactNode;
}

interface ToolCategory {
    name: string;
    tools: Tool[];
}

const AI_TOOL_CATEGORIES: ToolCategory[] = [
     {
        name: 'Strategy',
        tools: [
            { id: 'CAMPAIGN_IDEAS', name: 'Campaign Ideas', description: 'Generate creative ad campaigns.', icon: <BrainIcon />, component: <CampaignIdeas /> },
        ]
    },
    {
        name: 'Conversation',
        tools: [
            { id: 'CHATBOT', name: 'Gemini Chat', description: 'Ask questions, get answers.', icon: <ChatIcon />, component: <Chatbot /> },
            { id: 'LIVE_AGENT', name: 'Live Conversation', description: 'Talk with Gemini in real-time.', icon: <AudioWaveIcon />, component: <LiveAgent /> },
        ]
    },
    {
        name: 'Image',
        tools: [
            { id: 'IMAGE_GENERATOR', name: 'Image Generation', description: 'Create images from text.', icon: <ImageIcon />, component: <ImageGenerator /> },
            { id: 'IMAGE_EDITOR', name: 'Image Editor', description: 'Edit images with prompts.', icon: <EditIcon />, component: <ImageEditor /> },
            { id: 'IMAGE_ANALYZER', name: 'Image Analyzer', description: 'Understand image content.', icon: <AnalyzeIcon />, component: <ImageAnalyzer /> },
        ]
    },
    {
        name: 'Video',
        tools: [
            { id: 'VIDEO_GENERATOR', name: 'Video Generation', description: 'Generate videos with Veo.', icon: <VideoIcon />, component: <VideoGenerator /> },
            { id: 'VIDEO_ANALYZER', name: 'Video Analyzer', description: 'Analyze video content.', icon: <AnalyzeIcon />, component: <VideoAnalyzer /> },
        ]
    },
    {
        name: 'Audio',
        tools: [
            { id: 'AUDIO_TRANSCRIBER', name: 'Audio Transcriber', description: 'Transcribe spoken words.', icon: <MicIcon />, component: <AudioTranscriber /> },
            { id: 'TEXT_TO_SPEECH', name: 'Text to Speech', description: 'Generate speech from text.', icon: <AudioWaveIcon />, component: <TextToSpeech /> },
        ]
    }
];


const AIStudioModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [activeTool, setActiveTool] = useState<AITool>('CAMPAIGN_IDEAS');
    const [isClosing, setIsClosing] = useState(false);
    const [apiKeyStatus, setApiKeyStatus] = useState<'checking' | 'configured' | 'unconfigured'>('checking');

    const checkApiKey = useCallback(async () => {
        try {
            if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
                const hasKey = await window.aistudio.hasSelectedApiKey();
                setApiKeyStatus(hasKey ? 'configured' : 'unconfigured');
            } else {
                setApiKeyStatus('unconfigured');
            }
        } catch (e) {
            console.error("Error checking for API key:", e);
            setApiKeyStatus('unconfigured');
        }
    }, []);

    useEffect(() => {
        checkApiKey();
    }, [checkApiKey]);

    const handleClose = useCallback(() => {
        setIsClosing(true);
        setTimeout(onClose, 300);
    }, [onClose]);

    const activeToolData = AI_TOOL_CATEGORIES.flatMap(c => c.tools).find(t => t.id === activeTool);

    const handleManageKey = useCallback(async () => {
        try {
            if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
                await window.aistudio.openSelectKey();
                setApiKeyStatus('checking');
                await checkApiKey();
            } else {
                alert("API Key management is not available in this environment.");
            }
        } catch (e) {
            console.error("Error opening key selection dialog:", e);
        }
    }, [checkApiKey]);
    
    const animationClasses = isClosing 
        ? 'opacity-0 scale-95' 
        : 'opacity-100 scale-100';
    
    const getCategoryIcon = (categoryName: string): ReactNode => {
        switch (categoryName) {
            case 'Strategy':
                return <BrainIcon className="w-4 h-4" />;
            case 'Conversation':
                return <ChatIcon className="w-4 h-4" />;
            case 'Image':
                return <ImageIcon className="w-4 h-4" />;
            case 'Video':
                return <VideoIcon className="w-4 h-4" />;
            case 'Audio':
                return <MicIcon className="w-4 h-4" />;
            default:
                return null;
        }
    };

    return (
        <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-lg flex items-center justify-center z-50 transition-opacity duration-300"
            style={{ opacity: isClosing ? 0 : 1 }}
        >
            <div
                className={`relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl w-[95vw] h-[90vh] flex transform transition-all duration-300 ease-in-out ${animationClasses}`}
            >
                <div className="w-1/4 max-w-xs border-r border-slate-200 dark:border-slate-800/80 flex flex-col p-4 space-y-4">
                    <div className="flex items-center space-x-3 p-2 mb-4">
                        <SparklesIcon className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">AI Studio</h1>
                    </div>
                    <nav className="flex-grow space-y-4 overflow-y-auto pr-2">
                        {AI_TOOL_CATEGORIES.map(category => (
                            <div key={category.name}>
                                <div className="flex items-center space-x-2 px-3 mb-2">
                                    <span className="text-slate-400">{getCategoryIcon(category.name)}</span>
                                    <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{category.name}</h2>
                                </div>
                                <div className="space-y-1">
                                    {category.tools.map(tool => (
                                        <button 
                                            key={tool.id}
                                            onClick={() => setActiveTool(tool.id)}
                                            className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors text-sm font-medium ${activeTool === tool.id ? 'bg-indigo-600 text-white' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800/60'}`}
                                        >
                                            <span className="flex-shrink-0 w-5 h-5">{tool.icon}</span>
                                            <span>{tool.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </nav>
                     <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-800/80 flex-shrink-0">
                        <ApiKeyManager 
                            status={apiKeyStatus} 
                            onManageKey={handleManageKey} 
                        />
                    </div>
                </div>

                <main className="flex-1 flex flex-col">
                     <header className="p-4 border-b border-slate-200 dark:border-slate-800/80 flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{activeToolData?.name}</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{activeToolData?.description}</p>
                        </div>
                        <button onClick={handleClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700/70 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </header>
                    <div className="flex-grow p-6 overflow-y-auto">
                        {activeToolData?.component}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AIStudioModal;