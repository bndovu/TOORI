import React, { useState } from 'react';
import { MagicWandIcon, UploadIcon } from './IconComponents';
import { StoryLength } from '../App';

interface StoryInputProps {
  onSubmit: (prompt: string, length: StoryLength, image?: { mimeType: string; data: string }) => void;
  isLoading: boolean;
}

const storyLengths: { id: StoryLength; label: string }[] = [
    { id: 'short', label: 'Short' },
    { id: 'medium', label: 'Medium' },
    { id: 'long', label: 'Long' },
];

const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
    });
    return {
        mimeType: file.type,
        data: await base64EncodedDataPromise,
    };
};

const StoryInput: React.FC<StoryInputProps> = ({ onSubmit, isLoading }) => {
  const [prompt, setPrompt] = useState('');
  const [storyLength, setStoryLength] = useState<StoryLength>('medium');
  const [customCharacterName, setCustomCharacterName] = useState('');
  const [customCharacterFile, setCustomCharacterFile] = useState<File | null>(null);

  const handlePresetClick = (presetPrompt: string) => {
    setPrompt(presetPrompt);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCustomCharacterFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const isTextPrompt = prompt.trim().length > 0;
    const isCustomCharacter = customCharacterName.trim().length > 0 && customCharacterFile !== null;

    if (!isTextPrompt && !isCustomCharacter) return;
    
    let finalPrompt = prompt.trim();
    let imagePart: { mimeType: string; data: string } | undefined = undefined;

    if (isCustomCharacter) {
        const characterPrompt = `a new character named ${customCharacterName}. Visually, they are inspired by the provided image.`;
        if (isTextPrompt) {
            finalPrompt = `${finalPrompt}, featuring ${characterPrompt}`;
        } else {
            finalPrompt = `A story about ${characterPrompt}`;
        }
        imagePart = await fileToGenerativePart(customCharacterFile!);
    }

    onSubmit(finalPrompt, storyLength, imagePart);
  };

  const canSubmit = prompt.trim().length > 0 || (customCharacterName.trim().length > 0 && customCharacterFile !== null);

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <label htmlFor="story-prompt" className="block text-lg font-semibold text-[var(--color-text-secondary)] mb-3 text-left">
        What should the story be about?
      </label>
      <div className="relative">
        <textarea
          id="story-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., a shy dragon who loves to bake pastries..."
          className="w-full h-28 p-4 pr-12 bg-black/20 text-[var(--color-text-primary)] rounded-lg border-2 border-transparent focus:border-[var(--color-accent-to)] focus:ring-2 focus:ring-[var(--color-focus-ring)] transition-all duration-300 resize-none placeholder-[var(--color-text-placeholder)]"
          disabled={isLoading}
        />
      </div>
      <div className="mt-2 text-left">
          <button
              type="button"
              onClick={() => handlePresetClick('A story about the mythic figures: Masai Adam, Masai Eve, and Lilith.')}
              className="px-3 py-1 text-xs font-semibold rounded-full transition-colors duration-300 bg-indigo-500/20 text-indigo-200 hover:bg-indigo-500/40"
          >
              Use Mythic Preset
          </button>
      </div>
      
      <div className="mt-4 text-left">
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
            Story Length
          </label>
          <div className="flex items-center space-x-2 rounded-lg bg-black/20 p-1">
              {storyLengths.map(({ id, label }) => (
                  <button
                      key={id}
                      type="button"
                      onClick={() => setStoryLength(id)}
                      className={`w-full py-1.5 text-sm font-semibold rounded-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)] ${
                          storyLength === id
                              ? 'bg-gradient-to-r from-[var(--color-accent-from)] to-[var(--color-accent-to)] text-white shadow'
                              : 'text-[var(--color-text-tertiary)] hover:bg-white/10'
                      }`}
                      disabled={isLoading}
                  >
                      {label}
                  </button>
              ))}
          </div>
      </div>

      {/* Create Your Own Section */}
      <div className="mt-6 pt-6 border-t border-[var(--color-border)] w-full">
         <h3 className="text-lg font-semibold text-[var(--color-text-secondary)] mb-3 text-center">
            ...and Enhance with a Custom Character
        </h3>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
            <input
                type="text"
                placeholder="Character Name"
                value={customCharacterName}
                onChange={(e) => setCustomCharacterName(e.target.value)}
                className="w-full sm:w-1/2 p-3 bg-black/20 text-[var(--color-text-primary)] rounded-lg border-2 border-transparent focus:border-[var(--color-accent-to)] focus:ring-2 focus:ring-[var(--color-focus-ring)] transition-all duration-300 placeholder-[var(--color-text-placeholder)]"
                disabled={isLoading}
            />
            <label className="w-full sm:w-1/2 cursor-pointer">
                <div className={`flex items-center justify-center p-3 rounded-lg border-2 border-dashed transition-colors ${customCharacterFile ? 'border-green-400 bg-green-900/20' : 'border-[var(--color-text-muted)] bg-black/20 hover:bg-white/10'}`}>
                    <UploadIcon className="w-5 h-5 mr-2 text-[var(--color-text-tertiary)]" />
                    <span className="text-sm font-medium text-[var(--color-text-tertiary)] truncate">
                        {customCharacterFile ? customCharacterFile.name : 'Upload Image'}
                    </span>
                </div>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={isLoading} />
            </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || !canSubmit}
        className="mt-6 w-full flex items-center justify-center px-6 py-3 font-bold text-white bg-gradient-to-r from-[var(--color-accent-from)] to-[var(--color-accent-to)] rounded-lg shadow-lg hover:shadow-[var(--color-shadow)] transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
      >
        <MagicWandIcon className="w-5 h-5 mr-2" />
        {isLoading ? 'Weaving Magic...' : 'Generate Story'}
      </button>
    </form>
  );
};

export default StoryInput;
