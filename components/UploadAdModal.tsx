import React, { useState, useCallback, ChangeEvent, FormEvent, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { GoogleGenAI, Type } from "@google/genai";
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { Ad, AdType, UserRole, AdCategory } from '../types';
import { CATEGORIES } from '../constants';
import { ErrorIcon } from './icons/ErrorIcon';
import { fileToDataUrl } from '../utils/helpers';
import { LockClosedIcon } from './icons/LockClosedIcon';
import { LOCATIONS } from '../data/locations';
import { SparklesIcon } from './icons/AIIcons';
import { LocationIcon } from './icons/LocationIcon';

interface UploadAdModalProps {
  onClose: () => void;
  onSave: (adData: Omit<Ad, 'rating'>) => void;
  isLoading: boolean;
  userRole: UserRole;
  error: string | null;
  adToEdit?: Ad | null;
}

const SpinnerIcon = () => (
    <svg className="animate-spin h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const UploadAdModal: React.FC<UploadAdModalProps> = ({ onClose, onSave, isLoading, userRole, error: apiError, adToEdit }) => {
  const [formData, setFormData] = useState<Omit<Ad, 'rating'>>(
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
    }
  );
  
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof Omit<Ad, 'id' | 'rating' | 'lat' | 'lng'>, string>>>({});
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  
  // AI State
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [thumbnailSource, setThumbnailSource] = useState<'upload' | 'url' | 'generate'>('upload');
  const [aiError, setAiError] = useState<string | null>(null);

  // Geocoding State
  const geocodingApi = useMapsLibrary('geocoding');
  const [address, setAddress] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);

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
      if (adToEdit.thumbnailUrl) {
          if (adToEdit.thumbnailUrl.startsWith('http')) {
              setThumbnailSource('url');
          } else {
              setThumbnailSource('upload');
          }
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

  const onThumbnailDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
        setThumbnailFile(acceptedFiles[0]);
        setFormData(prev => ({ ...prev, thumbnailUrl: '' }));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop: onThumbnailDrop,
      accept: { 'image/*': ['.jpeg', '.png', '.webp'] },
      multiple: false,
      disabled: isLoading || isGeneratingImage,
  });

  const handleClose = useCallback(() => {
    if (isLoading) return;
    setIsClosing(true);
    setTimeout(onClose, 300);
  }, [onClose, isLoading]);

  const validateField = (name: keyof typeof errors, value: any) => {
    switch (name) {
      case 'title': return value.trim().length < 3 ? 'Title must be at least 3 characters.' : '';
      case 'description': return value.trim().length < 10 ? 'Description must be at least 10 characters.' : '';
      case 'reward': return isNaN(value) || Number(value) <= 0 ? 'Reward must be a positive number.' : '';
      case 'duration': return isNaN(value) || Number(value) < 5 ? 'Duration must be at least 5 seconds.' : '';
      case 'country': return (formData.lat && formData.lng) ? '' : (!value || value === 'ALL' ? 'Please select a country.' : '');
      case 'state': return (formData.lat && formData.lng) ? '' : (!value || value === 'ALL' ? 'Please select a state.' : '');
      case 'district': return (formData.lat && formData.lng) ? '' : (!value || value === 'ALL' ? 'Please select a district.' : '');
      case 'thumbnailUrl':
        if (thumbnailSource === 'url' && value) { try { new URL(value); return ''; } catch (_) { return 'Please enter a valid URL.'; } }
        return '';
       case 'contentUrl':
        if (value) { try { new URL(value); return ''; } catch (_) { return 'Please enter a valid URL.'; } }
        return '';
      default: return '';
    }
  };
  
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let processedValue: string | number = value;
     if (name === 'reward' || name === 'duration') {
      processedValue = value === '' ? '' : parseFloat(value);
    }
    if (name === 'thumbnailUrl' && value) setThumbnailFile(null);

    setFormData((prev) => {
        const newState = { ...prev, [name]: processedValue };
        if(name === 'country') {
            newState.state = '';
            newState.district = '';
        } else if (name === 'state') {
            newState.district = '';
        }
        return newState;
    });

    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name as keyof typeof errors, value) }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
     const { name, value } = e.target;
     if (name === 'thumbnailUrl' && thumbnailFile) return;
     setErrors((prev) => ({ ...prev, [name]: validateField(name as keyof typeof errors, value) }));
  };
  
  const handleGenerateText = async () => {
    if (!aiPrompt.trim() || isLoading || isGeneratingText) return;
    setIsGeneratingText(true);
    setAiError(null);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const prompt = `Generate a catchy ad title and a compelling, brief ad description (around 20-30 words) for the following product/service: "${aiPrompt}". Return a valid JSON object with two keys: "title" and "description".`;
        
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
                },
            },
        });
        
        const result = JSON.parse(response.text);
        setFormData(prev => ({ ...prev, title: result.title, description: result.description }));

    } catch (err) {
        console.error("AI text generation error:", err);
        setAiError("Failed to generate ad copy. Please try again.");
    } finally {
        setIsGeneratingText(false);
    }
  }

  const handleGenerateImage = async () => {
    if (!aiPrompt.trim() || isLoading || isGeneratingImage) return;
    setIsGeneratingImage(true);
    setThumbnailFile(null);
    setFormData(prev => ({...prev, thumbnailUrl: ''}));
    setThumbnailPreview(null);
    setAiError(null);

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const generationPrompt = `A vibrant, eye-catching advertisement thumbnail for ${aiPrompt}. 16:9 aspect ratio, photographic style, bright colors, no text on image.`;
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: generationPrompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '16:9',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
             const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
             const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
             setFormData(prev => ({ ...prev, thumbnailUrl: imageUrl }));
        } else {
             setAiError('Image generation failed. No images were returned.');
        }

    } catch(err) {
        console.error("AI image generation error:", err);
        setAiError("Failed to generate thumbnail. Please try again.");
    } finally {
        setIsGeneratingImage(false);
    }
  };

  const handleGeocode = async () => {
    if (!geocodingApi || !address.trim() || isGeocoding) return;
    setIsGeocoding(true);
    setErrors({});
    const geocoder = new geocodingApi.Geocoder();
    geocoder.geocode({ address: address, region: 'IN' }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const result = results[0];
        const location = result.geometry.location;
        const components = result.address_components;
        const get = (type: string) => components.find(c => c.types.includes(type))?.long_name || '';

        const district = get('administrative_area_level_3') || get('locality');
        const state = get('administrative_area_level_1');
        const country = get('country');

        setFormData(prev => ({
          ...prev,
          lat: location.lat(),
          lng: location.lng(),
          country: country,
          state: state,
          district: district
        }));

      } else {
        setErrors(prev => ({ ...prev, country: "Could not find location. Please check the address." }));
      }
      setIsGeocoding(false);
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    
    // Full validation
    const newErrors: typeof errors = {};
    Object.keys(formData).forEach(key => {
        const error = validateField(key as keyof typeof errors, (formData as any)[key]);
        if (error) newErrors[key as keyof typeof errors] = error;
    });

    const isThumbnailMissing = 
        (thumbnailSource === 'upload' && !thumbnailFile && !adToEdit?.thumbnailUrl) ||
        (thumbnailSource === 'url' && !formData.thumbnailUrl) ||
        (thumbnailSource === 'generate' && !formData.thumbnailUrl.startsWith('data:image'));

    if (isThumbnailMissing) newErrors.thumbnailUrl = 'Please provide a thumbnail.';
    if (!formData.contentUrl) newErrors.contentUrl = 'Please provide a content URL.';
    
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        let finalData = { ...formData };
        if (thumbnailFile) {
            finalData.thumbnailUrl = await fileToDataUrl(thumbnailFile);
        }
        onSave(finalData);
      } catch (err) {
        setErrors(prev => ({ ...prev, thumbnailUrl: "Failed to process uploaded file."}));
      }
    }
  };

   if (!canUpload) {
    return (
      <div className="fixed inset-0 bg-slate-500/30 dark:bg-black/60 backdrop-blur-md flex items-center justify-center z-50">
        <div className="relative bg-white dark:bg-slate-800/50 p-8 rounded-xl shadow-2xl text-center">
            <LockClosedIcon className="w-12 h-12 mx-auto text-red-500 dark:text-red-400 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6">You do not have permission to upload ads.</p>
            <button onClick={onClose} className="py-2 px-6 bg-slate-200 dark:bg-slate-700 rounded-lg font-semibold">Close</button>
        </div>
      </div>
    );
  }
  
  const getInputClass = (name: keyof typeof errors, disabled = false) => 
    `w-full bg-slate-100 dark:bg-slate-800/60 border text-slate-900 dark:text-white rounded-lg p-2.5 focus:ring-indigo-500/80 focus:border-indigo-500 disabled:opacity-50 ${errors[name] ? 'border-red-500/70' : 'border-slate-300 dark:border-slate-600/80'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`;
    
  return (
    <div
      className="fixed inset-0 bg-slate-500/30 dark:bg-black/60 backdrop-blur-md flex items-center justify-center z-50"
      onClick={handleClose}
    >
      <div
        className={`relative bg-white dark:bg-slate-800/50 backdrop-blur-2xl border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center flex-shrink-0">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{adToEdit ? 'Edit Ad' : 'Upload New Ad'}</h2>
          <button onClick={handleClose} disabled={isLoading} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
            <div className="p-4 bg-indigo-500/10 dark:bg-indigo-500/10 rounded-lg border border-indigo-500/20 space-y-3">
                <div className="flex items-center space-x-2">
                    <SparklesIcon className="w-5 h-5 text-indigo-500" />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">AI Assistant</h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                    Describe your product or service below, and let AI help you create compelling ad copy and a thumbnail.
                </p>
                <div>
                    <input 
                        type="text" 
                        name="aiPrompt" 
                        id="aiPrompt" 
                        value={aiPrompt} 
                        onChange={(e) => setAiPrompt(e.target.value)} 
                        className={getInputClass('title')}
                        placeholder="e.g., 'Eco-friendly running shoes made from recycled materials'" 
                        disabled={isLoading}
                    />
                </div>
            </div>

           <div className="relative">
              <label htmlFor="title" className="block mb-2 text-sm font-medium">Title</label>
              <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} onBlur={handleBlur} className={`${getInputClass('title')} pr-12`} disabled={isLoading} />
              <button type="button" onClick={handleGenerateText} disabled={!aiPrompt.trim() || isLoading || isGeneratingText} className="absolute right-2 bottom-2 p-1.5 rounded-md bg-indigo-500 text-white hover:bg-indigo-600 disabled:bg-slate-400 disabled:cursor-not-allowed" title="Generate with AI">
                  {isGeneratingText ? <SpinnerIcon /> : <SparklesIcon className="w-4 h-4" />}
              </button>
              {errors.title && <div className="text-red-500 text-sm mt-1">{errors.title}</div>}
          </div>
           <div className="relative">
              <label htmlFor="description" className="block mb-2 text-sm font-medium">Description</label>
              <textarea name="description" id="description" value={formData.description} onChange={handleChange} onBlur={handleBlur} rows={3} className={`${getInputClass('description')} pr-12`} disabled={isLoading}/>
              <button type="button" onClick={handleGenerateText} disabled={!aiPrompt.trim() || isLoading || isGeneratingText} className="absolute right-2 top-10 p-1.5 rounded-md bg-indigo-500 text-white hover:bg-indigo-600 disabled:bg-slate-400 disabled:cursor-not-allowed" title="Generate with AI">
                   {isGeneratingText ? <SpinnerIcon /> : <SparklesIcon className="w-4 h-4" />}
              </button>
              {errors.description && <div className="text-red-500 text-sm mt-1">{errors.description}</div>}
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="contentUrl" className="block mb-2 text-sm font-medium">Content URL</label>
                <input type="text" name="contentUrl" id="contentUrl" value={formData.contentUrl} onChange={handleChange} onBlur={handleBlur} className={getInputClass('contentUrl')} disabled={isLoading} placeholder="https://example.com/video.mp4"/>
                {errors.contentUrl && <div className="text-red-500 text-sm mt-1">{errors.contentUrl}</div>}
              </div>
              <div>
                  <label htmlFor="category" className="block mb-2 text-sm font-medium">Category</label>
                  <select name="category" id="category" value={formData.category} onChange={handleChange} className={getInputClass('category')} disabled={isLoading}>
                      {CATEGORIES.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                  </select>
              </div>
           </div>

            <div>
                <label htmlFor="address" className="block mb-2 text-sm font-medium">Street Address (Optional)</label>
                <div className="flex space-x-2">
                    <input type="text" id="address" value={address} onChange={e => setAddress(e.target.value)} className={getInputClass('country')} placeholder="e.g., 1600 Amphitheatre Parkway, Mountain View, CA" disabled={isLoading || isGeocoding}/>
                    <button type="button" onClick={handleGeocode} disabled={!address || isGeocoding} className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg text-sm flex items-center justify-center w-28 disabled:bg-slate-400">
                        {isGeocoding ? <SpinnerIcon/> : 'Find'}
                    </button>
                </div>
                 <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Find location from an address to auto-fill fields below.</p>
            </div>


           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div>
                  <label htmlFor="country" className="block mb-2 text-sm font-medium">Country</label>
                  <select name="country" id="country" value={formData.country} onChange={handleChange} onBlur={handleBlur} className={getInputClass('country')} disabled={isLoading}>
                      <option value="">Select Country</option>
                      {Object.keys(LOCATIONS).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                   {errors.country && <div className="text-red-500 text-sm mt-1">{errors.country}</div>}
              </div>
               <div>
                  <label htmlFor="state" className="block mb-2 text-sm font-medium">State</label>
                  <select name="state" id="state" value={formData.state} onChange={handleChange} onBlur={handleBlur} className={getInputClass('state', states.length === 0)} disabled={isLoading || states.length === 0}>
                      <option value="">Select State</option>
                      {states.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                   {errors.state && <div className="text-red-500 text-sm mt-1">{errors.state}</div>}
              </div>
              <div>
                  <label htmlFor="district" className="block mb-2 text-sm font-medium">District</label>
                  <select name="district" id="district" value={formData.district} onChange={handleChange} onBlur={handleBlur} className={getInputClass('district', districts.length === 0)} disabled={isLoading || districts.length === 0}>
                      <option value="">Select District</option>
                      {districts.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                   {errors.district && <div className="text-red-500 text-sm mt-1">{errors.district}</div>}
              </div>
           </div>
          
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label htmlFor="reward" className="block mb-2 text-sm font-medium">Reward (₹)</label>
                  <input type="number" step="0.01" name="reward" id="reward" value={formData.reward} onChange={handleChange} onBlur={handleBlur} className={getInputClass('reward')} disabled={isLoading} />
                  {errors.reward && <div className="text-red-500 text-sm mt-1">{errors.reward}</div>}
              </div>
               <div>
                  <label htmlFor="duration" className="block mb-2 text-sm font-medium">Duration (seconds)</label>
                  <input type="number" name="duration" id="duration" value={formData.duration} onChange={handleChange} onBlur={handleBlur} className={getInputClass('duration')} disabled={isLoading} />
                  {errors.duration && <div className="text-red-500 text-sm mt-1">{errors.duration}</div>}
              </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">Thumbnail Image</label>
            <div className="flex bg-slate-200 dark:bg-slate-900/50 p-1 rounded-lg mb-3">
                {(['upload', 'url', 'generate'] as const).map(source => (
                    <button type="button" key={source} onClick={() => setThumbnailSource(source)} className={`capitalize flex-1 py-1.5 text-sm font-semibold rounded-md transition-colors ${thumbnailSource === source ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow' : 'text-slate-600 dark:text-slate-300'}`}>
                        {source}
                    </button>
                ))}
            </div>

            {thumbnailSource === 'upload' && (
                <div {...getRootProps()} className={`relative h-40 border-2 border-dashed rounded-lg flex items-center justify-center text-center cursor-pointer transition-colors ${isDragActive ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500'}`}>
                    <input {...getInputProps()} disabled={isLoading} />
                    {thumbnailPreview && thumbnailFile && <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover rounded-md" />}
                    {!thumbnailFile && <p className="p-4 text-slate-500">Drop image here or click to upload</p>}
                </div>
            )}
            {thumbnailSource === 'url' && (
                 <div>
                    <input type="text" name="thumbnailUrl" placeholder="https://example.com/image.png" value={formData.thumbnailUrl.startsWith('http') ? formData.thumbnailUrl : ''} onChange={handleChange} onBlur={handleBlur} className={getInputClass('thumbnailUrl')} disabled={isLoading} />
                </div>
            )}
            {thumbnailSource === 'generate' && (
                <div className="space-y-3 p-4 bg-slate-100 dark:bg-slate-800/40 rounded-lg">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Generates a 16:9 thumbnail using Imagen based on your product description.</p>
                     <button type="button" onClick={handleGenerateImage} disabled={!aiPrompt.trim() || isLoading || isGeneratingImage} className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-indigo-600 text-white font-bold text-sm rounded-lg hover:bg-indigo-500 disabled:bg-slate-400 disabled:cursor-not-allowed">
                        {isGeneratingImage ? <SpinnerIcon /> : <SparklesIcon className="w-4 h-4" />}
                        <span>{isGeneratingImage ? 'Generating...' : 'Generate Thumbnail'}</span>
                    </button>
                    {isGeneratingImage && (
                        <div className="h-40 flex items-center justify-center bg-slate-200 dark:bg-slate-700/50 rounded-md animate-pulse">
                            <SpinnerIcon />
                        </div>
                    )}
                    {thumbnailPreview && formData.thumbnailUrl.startsWith('data:image') && !isGeneratingImage &&(
                         <img src={thumbnailPreview} alt="AI Generated Preview" className="w-full h-auto object-cover rounded-md aspect-video" />
                    )}
                </div>
            )}
            {errors.thumbnailUrl && <div className="text-red-500 text-sm mt-1">{errors.thumbnailUrl}</div>}
          </div>
          {aiError && <div className="text-red-500 text-sm mt-2 p-3 bg-red-500/10 rounded-lg border border-red-500/20">{aiError}</div>}
        </form>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end items-center space-x-3 flex-shrink-0">
          {apiError && <p className="text-red-500 text-sm mr-auto">{apiError}</p>}
          <button onClick={handleClose} type="button" disabled={isLoading} className="py-2 px-4 bg-slate-200 dark:bg-slate-700 font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">Cancel</button>
          <button onClick={handleSubmit} type="submit" disabled={isLoading} className="py-2 px-5 bg-indigo-600 text-white font-bold rounded-lg w-36 flex items-center justify-center hover:bg-indigo-500 transition-colors disabled:bg-slate-400 dark:disabled:bg-slate-600">
            {isLoading ? <SpinnerIcon /> : (adToEdit ? 'Save Changes' : 'Upload Ad')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadAdModal;