
import React, { useState, useCallback } from 'react';
import { Loader } from './Loader';
import { ImageIcon } from './icons';
import * as geminiService from '../services/geminiService';

export const ImageView: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || isLoading) return;
    
    setIsLoading(true);
    setError(null);
    setImages([]);

    try {
      const generatedImages = await geminiService.generateImage(prompt);
      setImages(generatedImages);
    } catch (e) {
      console.error(e);
      setError('Failed to generate images. Try a less lame prompt.');
    } finally {
      setIsLoading(false);
    }
  }, [prompt, isLoading]);

  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold mb-2 text-light font-display">Image Generator</h2>
      <p className="text-medium mb-6">Describe the epic image you want to create. Or whatever.</p>
      
      <div className="flex gap-2 mb-8">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          placeholder="e.g., A cybernetic dragon breathing neon fire over a glitchy cityscape"
          className="w-full p-3 bg-secondary rounded-lg text-light placeholder-medium focus:outline-none focus:ring-2 focus:ring-accent border border-gray-700"
          disabled={isLoading}
        />
        <button
          onClick={handleGenerate}
          disabled={isLoading || !prompt.trim()}
          className="px-6 py-3 bg-accent rounded-lg text-primary font-semibold disabled:bg-gray-500 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-display"
        >
          <ImageIcon className="w-5 h-5" />
          Generate
        </button>
      </div>

      {isLoading && <Loader text="Brewing some pixels..." />}
      {error && <p className="text-red-500 text-center my-4 font-display">{error}</p>}
      
      {images.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {images.map((src, index) => (
            <div key={index} className="aspect-square bg-secondary rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105 border-2 border-transparent hover:border-accent">
              <img src={src} alt={`Generated image ${index + 1} for prompt: ${prompt}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};