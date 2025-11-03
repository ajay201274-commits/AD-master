import React, { useState, useCallback, ChangeEvent, FormEvent, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { GoogleGenAI, Type } from "@google/genai";
import { Ad, AdType, UserRole, AdCategory, AdStatus } from '../types';
import { CATEGORIES } from '../constants';
import { ErrorIcon } from './icons/ErrorIcon';
import { fileToDataUrl } from '../utils/helpers';
import { LockClosedIcon } from './icons/LockClosedIcon';
import { LOCATIONS } from '../data/locations';
import { SparklesIcon } from './icons/AIIcons';
import { LocationIcon } from './icons/LocationIcon';
import { UploadIcon } from './icons/AIIcons';

interface UploadAdModalProps {
  onClose: () => void;
  onSave: (adData: Omit<Ad, 'id' | 'rating' | 'ratingCount' | 'uploaderId' | 'uploaderName'>) => void;
  isLoading: boolean;
  userRole: UserRole;
  error: string | null;
  adToEdit?: Ad | null;
}

const SpinnerIcon = () => (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const UploadAdModal: React.FC<UploadAdModalProps> = ({ onClose, onSave, isLoading, userRole, error: apiError, adToEdit }) => {
  const [formData, setFormData] = useState<Omit<Ad, 'rating' | 'ratingCount'>>(
    adToEdit || {
      id: '',
      title: '',
      description: '',
      type: AdType.VIDEO,
      category: AdCategory.ENTERTAINMENT,
      reward: 1,
      duration: 10,
      contentUrl: '',
      thumbnailUrl: '',
      country: '',
      state: '',
      district: '',
      lat: undefined,
      lng: undefined,
      uploaderId: '',
      uploaderName: '',
      status: AdStatus.PENDING,
    }
  );
  
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof Omit<Ad, 'id' | 'rating' | 'ratingCount' | 'lat' | 'lng' | 'uploaderId' | 'uploaderName' | 'status'>, string>>>({});
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  // New state for content upload
  const [contentFile, setContentFile] = useState<File | null>(null);
  const [contentPreview, setContentPreview] = useState<string | null>(null);
  const [contentSource, setContentSource] = useState<'url' | 'upload'>('url');
  
  // AI State
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [thumbnailSource, setThumbnailSource] = useState<'upload' | 'url' | 'generate'>('upload');
  const [aiError, setAiError] = useState<string | null>(null);

  const canUpload = userRole === UserRole.UPLOADER || userRole === UserRole.APP_OWNER;

  // Location dropdown logic
  const [states, setStates] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);

  useEffect(() => {
    if (formData.country && formData.country in LOCATIONS) {
      setStates(Object.keys(LOCATIONS[formData.country as keyof typeof LOCATIONS]));
    } else {
      setStates([]);
    }
  }, [formData.country]);

  useEffect(() => {
    if (formData.country && formData.state && formData.country in LOCATIONS && formData.state in LOCATIONS[formData.country as keyof typeof LOCATIONS]) {
      setDistricts(LOCATIONS[formData.country as keyof typeof LOCATIONS][formData.state as keyof typeof LOCATIONS[keyof typeof LOCATIONS]] || []);
    } else {
      setDistricts([]);
    }
  }, [formData.country, formData.state]);


  useEffect(() => {
    if (adToEdit) {
      setFormData(adToEdit);
      setThumbnailFile(null);
      setContentFile(null);

      if (adToEdit.contentUrl?.startsWith('data:')) {
          setContentSource('upload');
      } else {
          setContentSource('url');
      }

      if (adToEdit.thumbnailUrl?.startsWith('http')) {
          setThumbnailSource('url');
      } else {
          setThumbnailSource('upload');
      }
    }
  }, [adToEdit]);
  
  useEffect(() => {
    let objectUrl: string | null = null;
    if (thumbnailFile) {
        objectUrl = URL.createObjectURL(thumbnailFile);
        setThumbnailPreview(objectUrl);
    } else if (formData.thumbnailUrl) {
        setThumbnailPreview(formData.thumbnailUrl);
    } else {
        setThumbnailPreview(null);
    }
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [thumbnailFile, formData.thumbnailUrl]);

  useEffect(() => {
    let objectUrl: string | null = null;
    if (contentFile) {
        objectUrl = URL.createObjectURL(contentFile);
        setContentPreview(objectUrl);
    } else if (formData.contentUrl && formData.contentUrl.startsWith('data:')) {
        setContentPreview(formData.contentUrl);
    } else {
        setContentPreview(null);
    }
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [contentFile, formData.contentUrl]);

  const onContentDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setContentFile(file);
        setFormData(prev => ({ ...prev, contentUrl: '', type: file.type.startsWith('video') ? AdType.VIDEO : AdType.IMAGE }));
    }
  }, []);

  const onThumbnailDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
        setThumbnailFile(acceptedFiles[0]);
        setFormData(prev => ({ ...prev, thumbnailUrl: '' }));
    }
  }, []);

  // Fix: The onContentDrop function was used before it was declared. Moved it up.
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onContentDrop,
    accept: { 'video/*': [], 'image/*': [] },
    multiple: false,
});

const { getRootProps: getThumbnailRootProps, getInputProps: getThumbnailInputProps, isDragActive: isThumbnailDragActive } = useDropzone({
    onDrop: onThumbnailDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.webp'] },
    multiple: false,
});

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  }, [onClose]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'reward' || name === 'duration' ? parseFloat(value) : value }));
  };

  const validate = () => {
    const newErrors: Partial<Record<keyof typeof formData, string>> = {};
    if (!formData.title) newErrors.title = "Title is required.";
    if (!formData.description) newErrors.description = "Description is required.";
    if (!formData.reward || formData.reward <= 0) newErrors.reward = "Reward must be a positive number.";
    if (!formData.duration || formData.duration <= 0) newErrors.duration = "Duration must be a positive number.";
    if (!formData.country || !formData.state || !formData.district) newErrors.country = "Location is required.";

    if (contentSource === 'url' && !formData.contentUrl) {
      newErrors.contentUrl = "Content URL is required.";
    } else if (contentSource === 'upload' && !contentFile && !adToEdit?.contentUrl) {
       newErrors.contentUrl = "Content file is required.";
    }

    if (thumbnailSource === 'url' && !formData.thumbnailUrl) {
      newErrors.thumbnailUrl = "Thumbnail URL is required.";
    } else if (thumbnailSource === 'upload' && !thumbnailFile && !adToEdit?.thumbnailUrl) {
       newErrors.thumbnailUrl = "Thumbnail file is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (validate()) {
      let contentUrl = formData.contentUrl;
      let thumbnailUrl = formData.thumbnailUrl;

      // Handle file uploads by converting them to data URLs
      if (contentSource === 'upload' && contentFile) {
        contentUrl = await fileToDataUrl(contentFile);
      }
      if (thumbnailSource === 'upload' && thumbnailFile) {
        thumbnailUrl = await fileToDataUrl(thumbnailFile);
      }

      onSave({ ...formData, contentUrl, thumbnailUrl });
    }
  };

  const handleGenerateText = async () => {
    if (!aiPrompt.trim()) return;
    setIsGeneratingText(true);
    setAiError(null);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const prompt = `Generate an ad title and description for the following topic: "${aiPrompt}". Return a valid JSON object with keys "title" and "description".`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                 responseMimeType: "application/json",
                 responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                    },
                    required: ["title", "description"],
                }
            }
        });
        const result = JSON.parse(response.text);
        setFormData(prev => ({ ...prev, title: result.title, description: result.description }));
    } catch (err) {
        setAiError("Failed to generate text. Please try again.");
        console.error(err);
    } finally {
        setIsGeneratingText(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!aiPrompt.trim()) return;
    setIsGeneratingImage(true);
    setAiError(null);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: aiPrompt,
             config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '16:9',
            },
        });
        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
        setFormData(prev => ({...prev, thumbnailUrl: imageUrl}));
        setThumbnailFile(null);
    } catch (err) {
        setAiError("Failed to generate image. Please try again.");
        console.error(err);
    } finally {
        setIsGeneratingImage(false);
    }
  };

  const animationClasses = isClosing 
    ? 'opacity-0 scale-95 -translate-y-10' 
    : 'opacity-100 scale-100 translate-y-0';

  const getInputClass = (name: keyof typeof errors) => 
    `w-full bg-slate-100 dark:bg-slate-800/60 border text-slate-900 dark:text-white rounded-lg p-2.5 focus:ring-indigo-500/80 focus:border-indigo-500 ${errors[name] ? 'border-red-500/70' : 'border-slate-300 dark:border-slate-600/80'}`;

  const renderAIField = () => (
     <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800/50">
        <label htmlFor="ai-prompt" className="block mb-2 text-sm font-semibold text-indigo-800 dark:text-indigo-300 flex items-center space-x-2">
            <SparklesIcon className="w-5 h-5" />
            <span>Generate with AI</span>
        </label>
        <textarea
            id="ai-prompt"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            rows={2}
            className="w-full bg-white dark:bg-slate-800/60 border-slate-300 dark:border-slate-600/80 rounded-lg p-2.5 focus:ring-indigo-500/80 focus:border-indigo-500"
            placeholder="e.g., 'An ad for eco-friendly coffee pods'"
        />
        <div className="flex items-center space-x-2 mt-2">
             <button type="button" onClick={handleGenerateText} disabled={isGeneratingText || !aiPrompt} className="flex-1 py-2 px-3 bg-indigo-600 text-white font-semibold text-sm rounded-lg disabled:bg-slate-400 dark:disabled:bg-slate-600 hover:bg-indigo-500 flex items-center justify-center">
                {isGeneratingText ? <SpinnerIcon /> : 'Generate Text'}
            </button>
            <button type="button" onClick={handleGenerateImage} disabled={isGeneratingImage || !aiPrompt} className="flex-1 py-2 px-3 bg-indigo-600 text-white font-semibold text-sm rounded-lg disabled:bg-slate-400 dark:disabled:bg-slate-600 hover:bg-indigo-500 flex items-center justify-center">
                {isGeneratingImage ? <SpinnerIcon /> : 'Generate Thumbnail'}
            </button>
        </div>
        {aiError && <p className="text-red-500 text-sm mt-2">{aiError}</p>}
    </div>
  );

  return (
    <div
      className="fixed inset-0 bg-slate-500/30 dark:bg-black/60 backdrop-blur-md flex items-center justify-center z-50 transition-opacity duration-300"
      style={{ opacity: isClosing ? 0 : 1 }}
      onClick={handleClose}
    >
      <div
        className={`relative bg-white dark:bg-slate-800/50 backdrop-blur-2xl border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col transform transition-all duration-300 ease-in-out ${animationClasses}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-200 dark:border-slate-700/80 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{adToEdit ? 'Edit' : 'Upload'} Ad</h2>
          <button onClick={handleClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700/70 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex-grow p-6 overflow-y-auto space-y-4">
            {renderAIField()}
            <div>
              <label htmlFor="title" className="block mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">Title</label>
              <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} className={getInputClass('title')} />
              {errors.title && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.title}</p>}
            </div>
            <div>
              <label htmlFor="description" className="block mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">Description</label>
              <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={3} className={getInputClass('description')}></textarea>
              {errors.description && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="category" className="block mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">Category</label>
                    <select name="category" id="category" value={formData.category} onChange={handleChange} className={getInputClass('category')}>
                        {CATEGORIES.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                    </select>
                </div>
                <div>
                     <label htmlFor="type" className="block mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">Ad Type</label>
                    <select name="type" id="type" value={formData.type} onChange={handleChange} className={getInputClass('type')}>
                        <option value={AdType.VIDEO}>Video</option>
                        <option value={AdType.IMAGE}>Image/Poster</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="reward" className="block mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">Reward (₹)</label>
                    <input type="number" name="reward" id="reward" value={formData.reward} onChange={handleChange} className={getInputClass('reward')} step="0.01" min="0" />
                    {errors.reward && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.reward}</p>}
                </div>
                <div>
                    <label htmlFor="duration" className="block mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">Duration (seconds)</label>
                    <input type="number" name="duration" id="duration" value={formData.duration} onChange={handleChange} className={getInputClass('duration')} min="1" />
                    {errors.duration && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.duration}</p>}
                </div>
            </div>

            {/* Ad Content Upload */}
            <div className="mt-4">
                <label className="block mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">Ad Content</label>
                <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-lg mb-2">
                    <button type="button" onClick={() => setContentSource('url')} className={`w-1/2 py-1 text-sm font-semibold rounded-md transition-colors ${contentSource === 'url' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-300'}`}>From URL</button>
                    <button type="button" onClick={() => setContentSource('upload')} className={`w-1/2 py-1 text-sm font-semibold rounded-md transition-colors ${contentSource === 'upload' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-300'}`}>Upload File</button>
                </div>

                {contentSource === 'url' ? (
                    <input type="text" name="contentUrl" placeholder="https://example.com/ad.mp4" value={formData.contentUrl} onChange={handleChange} className={getInputClass('contentUrl')} />
                ) : (
                    <div {...getRootProps()} className={`w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-4 cursor-pointer hover:border-indigo-500 transition-colors ${isDragActive ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-300 dark:border-slate-600'}`}>
                        <input {...getInputProps()} />
                        <UploadIcon className="w-8 h-8 text-slate-400 dark:text-slate-500 mb-2"/>
                        {contentPreview ? (
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{contentFile?.name || 'File selected'}</p>
                        ) : (
                             <div className="text-center">
                                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Tap to select from Gallery or Camera</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Video or Image. Max 100MB.</p>
                            </div>
                        )}
                    </div>
                )}
                {errors.contentUrl && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.contentUrl}</p>}
            </div>

            {/* Thumbnail Upload */}
            <div className="mt-4">
                 <label className="block mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">Thumbnail</label>
                <div className="flex items-center space-x-4">
                    <div className="w-1/2">
                        <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-lg mb-2">
                           <button type="button" onClick={() => setThumbnailSource('url')} className={`w-1/2 py-1 text-sm font-semibold rounded-md transition-colors ${thumbnailSource === 'url' ? 'bg-white dark:bg-slate-700 shadow-sm' : ''}`}>URL</button>
                           <button type="button" onClick={() => setThumbnailSource('upload')} className={`w-1/2 py-1 text-sm font-semibold rounded-md transition-colors ${thumbnailSource === 'upload' ? 'bg-white dark:bg-slate-700 shadow-sm' : ''}`}>Upload</button>
                        </div>
                         {thumbnailSource === 'url' ? (
                            <input type="text" name="thumbnailUrl" placeholder="https://example.com/thumb.jpg" value={formData.thumbnailUrl} onChange={handleChange} className={getInputClass('thumbnailUrl')} />
                        ) : (
                            <div {...getThumbnailRootProps()} className={`w-full h-full border-2 border-dashed rounded-lg flex items-center justify-center text-center p-4 cursor-pointer hover:border-indigo-500 ${isThumbnailDragActive ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-300 dark:border-slate-600'}`}>
                                <input {...getThumbnailInputProps()} />
                                <div className="text-center">
                                    <UploadIcon className="w-6 h-6 mx-auto mb-1 text-slate-400 dark:text-slate-500"/>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Tap to upload</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">From gallery/camera</p>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="w-1/2">
                        <div className="w-full aspect-video bg-slate-100 dark:bg-slate-900/50 rounded-lg flex items-center justify-center overflow-hidden">
                            {thumbnailPreview ? (
                                <img src={thumbnailPreview} alt="Thumbnail preview" className="w-full h-full object-cover" />
                            ) : <p className="text-sm text-slate-400">Preview</p>}
                        </div>
                    </div>
                </div>
                 {errors.thumbnailUrl && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.thumbnailUrl}</p>}
            </div>

            {/* Location */}
            <div>
              <label htmlFor="country" className="block mb-2 text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center space-x-2">
                  <LocationIcon className="w-5 h-5"/>
                  <span>Target Location</span>
              </label>
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <select name="country" value={formData.country} onChange={(e) => {setFormData(p => ({...p, country: e.target.value, state: '', district: ''}))}} className={getInputClass('country')}><option value="">Select Country</option>{Object.keys(LOCATIONS).map(c => <option key={c} value={c}>{c}</option>)}</select>
                  <select name="state" value={formData.state} onChange={(e) => {setFormData(p => ({...p, state: e.target.value, district: ''}))}} className={getInputClass('country')} disabled={!states.length}><option value="">Select State</option>{states.map(s => <option key={s} value={s}>{s}</option>)}</select>
                  <select name="district" value={formData.district} onChange={handleChange} className={getInputClass('country')} disabled={!districts.length}><option value="">Select District</option>{districts.map(d => <option key={d} value={d}>{d}</option>)}</select>
              </div>
              {errors.country && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.country}</p>}
            </div>

            {!canUpload && (
                <div className="flex items-center space-x-2 p-3 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200">
                    <LockClosedIcon className="w-6 h-6 flex-shrink-0" />
                    <p className="text-sm">You must be an Uploader or App Owner to submit ads. Change your role in the header menu.</p>
                </div>
            )}
            
            {apiError && <p className="text-red-500 dark:text-red-400 text-sm text-center">{apiError}</p>}
        </form>
        <div className="p-4 border-t border-slate-200 dark:border-slate-700/80 flex justify-end items-center space-x-3">
            <button onClick={handleClose} type="button" className="py-2 px-4 bg-slate-200 hover:bg-slate-300 text-slate-800 dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-white font-bold rounded-lg transition-colors">Cancel</button>
            <button onClick={handleSubmit} type="submit" disabled={isLoading || !canUpload} className="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-all hover:shadow-lg hover:shadow-indigo-500/50 disabled:bg-slate-400 dark:disabled:bg-slate-500 disabled:cursor-not-allowed">
                {isLoading ? 'Saving...' : 'Save Ad'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default UploadAdModal;