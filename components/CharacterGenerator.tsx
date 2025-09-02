
import React, { useState } from 'react';
import { Character, ImageStyle } from '../App';
import { CharacterIcon, DownloadIcon } from './IconComponents';
import Loader from './Loader';

interface CharacterGeneratorProps {
    onGenerateCharacters: () => void;
    isCharacterLoading: boolean;
    characters: Character[];
    characterError: string | null;
    onGenerateImageForCharacter: (characterIndex: number, style: ImageStyle) => void;
}

const imageStyles: ImageStyle[] = ['Vibrant', 'Photo-Realistic', 'Fantasy Art', 'Anime'];

const CharacterGenerator: React.FC<CharacterGeneratorProps> = ({
    onGenerateCharacters,
    isCharacterLoading,
    characters,
    characterError,
    onGenerateImageForCharacter,
}) => {
    // Each character can have its own selected style.
    // The key is the character index, value is the style.
    const [selectedStyles, setSelectedStyles] = useState<{ [key: number]: ImageStyle }>({});

    const handleDownloadImage = (imageUrl: string, characterName: string) => {
        const link = document.createElement('a');
        link.href = imageUrl;
        // Generate a unique filename using a timestamp to prevent overwrites
        const fileName = `${characterName.replace(/\s+/g, '_').toLowerCase()}_portrait_${Date.now()}.jpeg`;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (characters.length > 0) {
        return (
            <div className="w-full h-full space-y-4">
                <h3 className="text-lg font-semibold text-center mb-4 text-[var(--color-text-secondary)]">Characters</h3>
                {characters.map((char, index) => {
                    const currentStyle = selectedStyles[index] || 'Vibrant';

                    return (
                        <div key={index} className="p-4 bg-black/20 rounded-lg text-left space-y-3">
                            <p className="font-bold text-[var(--color-text-secondary)]">{char.name}</p>
                            <p className="text-sm text-[var(--color-text-tertiary)] italic">"{char.description}"</p>
                            <p className="text-sm text-[var(--color-text-secondary)]">{char.backstory}</p>
                            
                            {char.imageUrl ? (
                                <div className="relative group">
                                    <img src={char.imageUrl} alt={`Portrait of ${char.name}`} className="w-full rounded-md aspect-square object-cover" />
                                    <button
                                        onClick={() => handleDownloadImage(char.imageUrl!, char.name)}
                                        className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                        aria-label="Download Image"
                                    >
                                        <DownloadIcon className="w-5 h-5"/>
                                    </button>
                                </div>
                            ) : char.isImageLoading ? (
                                <div className="w-full aspect-square bg-black/20 rounded-md flex items-center justify-center">
                                    <Loader message="Conjuring portrait..." />
                                </div>
                            ) : (
                                <div className="flex flex-col space-y-2">
                                    <div className="flex items-center space-x-2 rounded-lg bg-black/20 p-1">
                                        {imageStyles.map(style => (
                                            <button
                                                key={style}
                                                onClick={() => setSelectedStyles(prev => ({ ...prev, [index]: style }))}
                                                className={`w-full py-1 text-xs font-semibold rounded-md transition-colors duration-300 focus:outline-none focus:ring-1 focus:ring-[var(--color-focus-ring)] ${currentStyle === style ? 'bg-white/20' : 'text-[var(--color-text-tertiary)] hover:bg-white/10'}`}
                                            >
                                                {style}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => onGenerateImageForCharacter(index, currentStyle)}
                                        className="w-full text-sm py-2 font-semibold text-white bg-gradient-to-r from-[var(--color-accent-from)] to-[var(--color-accent-to)] rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all"
                                    >
                                        Generate Image
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-start w-full h-full space-y-4">
            {isCharacterLoading ? (
                <Loader message="Discovering characters..." />
            ) : characterError ? (
                <p className="text-red-400 text-center">{characterError}</p>
            ) : (
                <button
                    onClick={onGenerateCharacters}
                    className="w-full max-w-xs mx-auto flex items-center justify-center px-6 py-3 font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg shadow-lg hover:shadow-purple-500/50 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                >
                    <CharacterIcon className="w-5 h-5 mr-2" />
                    Meet the Characters
                </button>
            )}
        </div>
    );
};

export default CharacterGenerator;
