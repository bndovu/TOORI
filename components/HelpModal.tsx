import React from 'react';
import { CloseIcon, MagicWandIcon, UploadIcon } from './IconComponents';

interface HelpModalProps {
  onClose: () => void;
}

// This is a placeholder for an actual downloaded character image.
// In a real app, you might fetch this from user data or local storage.
const characterGuideImage = "https://storage.googleapis.com/maker-suite-media/o/storage/v1/b/maker-suite-media/o/WX_maker_suite_20240410_134921.jpeg";

const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  return (
    <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-modal-title"
    >
      <div 
        className="bg-gradient-to-br from-[var(--color-bg-via)] to-[var(--color-bg-to)] w-full max-w-2xl rounded-2xl shadow-2xl border border-[var(--color-border)] p-6 sm:p-8 text-left relative"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-[var(--color-text-secondary)] hover:bg-white/10 transition-colors"
          aria-label="Close help"
        >
          <CloseIcon className="w-6 h-6" />
        </button>
        
        <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="flex-shrink-0 text-center">
                <img 
                    src={characterGuideImage} 
                    alt="Story Guide Character" 
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-[var(--color-accent-to)] shadow-lg"
                />
                <p className="mt-2 text-sm font-bold text-[var(--color-text-secondary)]">Your Guide</p>
            </div>
            
            <div className="flex-grow">
                <h2 id="help-modal-title" className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-header-from)] to-[var(--color-header-to)] mb-4">
                    Greetings, Story Weaver!
                </h2>
                <p className="text-[var(--color-text-secondary)] mb-4">
                    I'm here to help you get started with some of our most powerful magic.
                </p>
                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold text-[var(--color-text-primary)] flex items-center"><MagicWandIcon className="w-5 h-5 mr-2 text-[var(--color-accent-from)]" />Using Presets</h3>
                        <p className="text-sm text-[var(--color-text-tertiary)] mt-1 pl-7">
                            Press the "Use Mythic Preset" button to instantly start a story with legendary characters like Masai Adam, Eve, and Lilith. It's a quick way to dive into epic tales!
                        </p>
                    </div>
                     <div>
                        <h3 className="font-semibold text-[var(--color-text-primary)] flex items-center"><UploadIcon className="w-5 h-5 mr-2 text-[var(--color-accent-to)]" />Create Your Own</h3>
                        <p className="text-sm text-[var(--color-text-tertiary)] mt-1 pl-7">
                            Have your own character in mind? Use the "Create Your Own" section. Give them a name, upload a picture from your downloads for inspiration, and weave a brand new story starring them!
                        </p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;