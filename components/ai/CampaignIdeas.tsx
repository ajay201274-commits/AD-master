import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { BrainIcon, SparklesIcon, Spinner } from '../icons/AIIcons';

interface CampaignIdea {
    title: string;
    targetAudience: string;
    keyMessage: string;
    adFormat: string;
    platforms: string[];
}

const CampaignIdeas = () => {
    const [productDescription, setProductDescription] = useState('');
    const [campaignIdeas, setCampaignIdeas] = useState<CampaignIdea[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!productDescription.trim() || isLoading) return;

        setIsLoading(true);
        setError(null);
        setCampaignIdeas([]);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

            const prompt = `You are a world-class advertising strategist. Based on the following product description, generate 3 distinct and creative ad campaign ideas. For each idea, provide a catchy title/slogan, a specific target audience, a clear key message, a suggested primary ad format (e.g., Short-form Video, Interactive Story Ad, Carousel Post, etc.), and a list of 2-3 ideal platforms (e.g., Instagram, YouTube, TikTok, LinkedIn).

            Product Description: "${productDescription}"

            Return the response as a valid JSON object.`;
            
            const response = await ai.models.generateContent({
                model: "gemini-2.5-pro",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING, description: "A catchy title or slogan for the campaign." },
                                targetAudience: { type: Type.STRING, description: "A specific description of the target audience." },
                                keyMessage: { type: Type.STRING, description: "The core message the campaign should convey." },
                                adFormat: { type: Type.STRING, description: "The primary format for the ad creative (e.g., Short-form Video)." },
                                platforms: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of recommended platforms." },
                            },
                            required: ["title", "targetAudience", "keyMessage", "adFormat", "platforms"],
                        },
                    },
                },
            });

            const result = JSON.parse(response.text);
            setCampaignIdeas(result);

        } catch (err) {
            console.error('Campaign generation error:', err);
            setError('An error occurred while generating ideas. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const IdeaCard: React.FC<{ idea: CampaignIdea }> = ({ idea }) => (
        <div className="bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-lg p-4 animate-fade-in">
            <h3 className="text-lg font-bold text-indigo-500 dark:text-indigo-400 mb-2">{idea.title}</h3>
            <div className="space-y-2 text-sm">
                <p><strong className="text-slate-600 dark:text-slate-300">Audience:</strong> <span className="text-slate-700 dark:text-slate-200">{idea.targetAudience}</span></p>
                <p><strong className="text-slate-600 dark:text-slate-300">Message:</strong> <span className="text-slate-700 dark:text-slate-200">{idea.keyMessage}</span></p>
                <p><strong className="text-slate-600 dark:text-slate-300">Format:</strong> <span className="text-slate-700 dark:text-slate-200">{idea.adFormat}</span></p>
                <div>
                    <strong className="text-slate-600 dark:text-slate-300">Platforms:</strong>
                    <div className="flex flex-wrap gap-2 mt-1">
                        {idea.platforms.map(p => <span key={p} className="text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded-full">{p}</span>)}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col">
            <div className="flex-grow overflow-y-auto pr-4">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <Spinner className="w-12 h-12 text-indigo-500 dark:text-indigo-400" />
                        <p className="mt-4 text-slate-600 dark:text-slate-300">Brainstorming creative campaigns...</p>
                    </div>
                )}
                {!isLoading && error && <p className="text-red-500 dark:text-red-400 text-center">{error}</p>}
                
                {!isLoading && campaignIdeas.length > 0 && (
                    <div className="space-y-4">
                        {campaignIdeas.map((idea) => <IdeaCard key={idea.title} idea={idea} />)}
                    </div>
                )}
                
                {!isLoading && campaignIdeas.length === 0 && !error && (
                    <div className="text-center h-full flex flex-col justify-center items-center text-slate-500 dark:text-slate-400">
                        <BrainIcon className="w-16 h-16 mb-4 text-indigo-500 dark:text-indigo-400" />
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Ad Campaign Generator</h2>
                        <p>Describe your product and get a list of creative campaign ideas.</p>
                    </div>
                )}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700/80">
                <label htmlFor="product-description" className="block mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">Product/Service Description</label>
                <textarea
                    id="product-description"
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    placeholder="e.g., 'A subscription box for artisanal coffee beans, sourced ethically from around the world.'"
                    className="w-full h-24 bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-600/80 rounded-lg p-3 focus:ring-indigo-500/80 focus:border-indigo-500 resize-none"
                    disabled={isLoading}
                />
                <button onClick={handleGenerate} disabled={isLoading || !productDescription.trim()} className="mt-4 w-full py-3 bg-indigo-600 text-white font-bold rounded-lg disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed hover:bg-indigo-500 transition-colors flex items-center justify-center">
                    {isLoading ? <><Spinner className="w-5 h-5 mr-2" /> Generating...</> : <><SparklesIcon className="w-5 h-5 mr-2" /> Generate Ideas</>}
                </button>
            </div>
        </div>
    );
};

export default CampaignIdeas;