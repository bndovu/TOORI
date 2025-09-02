
import React, { useState, useCallback, useEffect } from 'react';
import StoryInput from './components/StoryInput';
import StoryDisplay from './components/StoryDisplay';
import CharacterGenerator from './components/CharacterGenerator';
import Gallery from './components/Gallery';
import AuthScreen from './components/AuthScreen';
import HelpModal from './components/HelpModal';
import UserProfile from './components/UserProfile';
import { generateStory, generateVideo, generateMusic, extractCharacters, generateCharacterImage } from './services/geminiService';
import { StarIcon, SettingsIcon, MagicWandIcon, GalleryIcon, HelpIcon } from './components/IconComponents';

type Theme = 'starlight' | 'enchanted-forest' | 'celestial-dawn';
export type StoryLength = 'short' | 'medium' | 'long';
export type ImageStyle = 'Vibrant' | 'Photo-Realistic' | 'Fantasy Art' | 'Anime';
export type View = 'create' | 'gallery';

export interface Character {
  name: string;
  description: string;
  imageUrl?: string;
  isImageLoading: boolean;
}

const themes: { name: Theme; label: string; from: string, to: string }[] = [
    { name: 'starlight', label: 'Starlight', from: 'from-purple-500', to: 'to-pink-500' },
    { name: 'enchanted-forest', label: 'Enchanted Forest', from: 'from-emerald-500', to: 'to-green-400' },
    { name: 'celestial-dawn', label: 'Celestial Dawn', from: 'from-orange-500', to: 'to-amber-400' },
];

const App: React.FC = () => {
  const [user, setUser] = useState<{ name: string; isAdmin: boolean } | null>(null);
  const [story, setStory] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // View state
  const [view, setView] = useState<View>('create');

  // Theme state
  const [theme, setTheme] = useState<Theme>('starlight');
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  
  // Modal State
  const [showHelpModal, setShowHelpModal] = useState(false);

  // State for video generation
  const [isVideoLoading, setIsVideoLoading] = useState<boolean>(false);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [sceneImages, setSceneImages] = useState<string[]>([]);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [videoLoadingMessage, setVideoLoadingMessage] = useState<string>('');

  // State for music generation
  const [isMusicLoading, setIsMusicLoading] = useState<boolean>(false);
  const [musicUrl, setMusicUrl] = useState<string>('');
  const [musicError, setMusicError] = useState<string | null>(null);
  const [musicLoadingMessage, setMusicLoadingMessage] = useState<string>('');
  
  // State for character generation
  const [isCharacterLoading, setIsCharacterLoading] = useState<boolean>(false);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [characterError, setCharacterError] = useState<string | null>(null);


  useEffect(() => {
    const savedTheme = localStorage.getItem('story-weaver-theme') as Theme | null;
    if (savedTheme && themes.some(t => t.name === savedTheme)) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('story-weaver-theme', theme);
  }, [theme]);


  const handleLogin = (name: string) => {
    if (!name.trim()) return;
    setUser({
      name: name.trim(),
      isAdmin: name.trim().toLowerCase() === 'admin',
    });
  };

  const handleGenerateStory = useCallback(async (prompt: string, length: StoryLength, image?: { mimeType: string; data: string; }) => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setStory('');
    
    setVideoUrl('');
    setSceneImages([]);
    setVideoError(null);
    setIsVideoLoading(false);
    setVideoLoadingMessage('');

    setMusicUrl('');
    setMusicError(null);
    setIsMusicLoading(false);
    setMusicLoadingMessage('');
    
    setCharacters([]);
    setCharacterError(null);
    setIsCharacterLoading(false);


    try {
      const result = await generateStory(prompt, length, image);
      setStory(result);
    } catch (err) {
      setError('An enchanting tale could not be woven. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const handleGenerateVideo = useCallback(async () => {
    if (!story || isVideoLoading) return;

    setIsVideoLoading(true);
    setVideoError(null);
    setVideoUrl('');
    setSceneImages([]);

    try {
        const { videoUrl, sceneImages } = await generateVideo(story, setVideoLoadingMessage);
        setVideoUrl(videoUrl);
        setSceneImages(sceneImages);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setVideoError(`Could not create the video clip. ${errorMessage}`);
        console.error(err);
    } finally {
        setIsVideoLoading(false);
        setVideoLoadingMessage('');
    }
  }, [story, isVideoLoading]);

  const handleGenerateMusic = useCallback(async () => {
    if (!story || isMusicLoading) return;

    setIsMusicLoading(true);
    setMusicError(null);
    setMusicUrl('');

    try {
        const url = await generateMusic(story, setMusicLoadingMessage);
        setMusicUrl(url);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setMusicError(`Could not compose the soundtrack. ${errorMessage}`);
        console.error(err);
    } finally {
        setIsMusicLoading(false);
        setMusicLoadingMessage('');
    }
  }, [story, isMusicLoading]);

  const handleGenerateCharacters = useCallback(async () => {
      if (!story || isCharacterLoading) return;
      setIsCharacterLoading(true);
      setCharacterError(null);
      setCharacters([]);

      try {
          const extracted = await extractCharacters(story);
          setCharacters(extracted.map(c => ({...c, isImageLoading: false})));
      } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
          setCharacterError(`Could not identify characters. ${errorMessage}`);
          console.error(err);
      } finally {
          setIsCharacterLoading(false);
      }
  }, [story, isCharacterLoading]);

  const handleGenerateImageForCharacter = useCallback(async (characterIndex: number, style: ImageStyle) => {
      const character = characters[characterIndex];
      if (!character || character.isImageLoading) return;
      
      setCharacters(prev => prev.map((c, i) => i === characterIndex ? {...c, isImageLoading: true} : c));

      try {
          const imageUrl = await generateCharacterImage(character.description, style);
          setCharacters(prev => prev.map((c, i) => i === characterIndex ? {...c, imageUrl, isImageLoading: false} : c));
      } catch (err) {
          console.error(err);
          // Set error on the specific character in a real app, for now just log and stop loading
          setCharacters(prev => prev.map((c, i) => i === characterIndex ? {...c, isImageLoading: false} : c));
      }
  }, [characters]);

  if (!user) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[var(--color-bg-from)] via-[var(--color-bg-via)] to-[var(--color-bg-to)] text-[var(--color-text-primary)] p-4 sm:p-6 md:p-8 flex flex-col items-center transition-colors duration-500">
        <div className="w-full max-w-5xl mx-auto flex flex-col items-center text-center">
          <header className="mb-8 animate-fade-in-down w-full">
              <div className="flex items-center justify-center space-x-3 relative">
                  <UserProfile user={user} />

                  <StarIcon className="w-8 h-8 text-[var(--color-icon-1)]" />
                  <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-header-from)] to-[var(--color-header-to)]">
                  AI Story Weaver
                  </h1>
                  <StarIcon className="w-8 h-8 text-[var(--color-icon-2)]" />

                  <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                      <button 
                          onClick={() => setShowHelpModal(true)}
                          className="p-2 rounded-full hover:bg-white/10 transition-colors"
                          aria-label="Help"
                      >
                          <HelpIcon className="w-6 h-6 text-[var(--color-text-secondary)]"/>
                      </button>
                      <button 
                          onClick={() => setShowThemeSelector(!showThemeSelector)} 
                          className="p-2 rounded-full hover:bg-white/10 transition-colors"
                          aria-label="Select theme"
                      >
                          <SettingsIcon className="w-6 h-6 text-[var(--color-text-secondary)]"/>
                      </button>
                      {showThemeSelector && (
                          <div className="absolute top-full right-0 mt-2 w-48 bg-[var(--color-panel-bg)] backdrop-blur-lg border border-[var(--color-border)] rounded-lg shadow-2xl p-2 z-10 animate-fade-in-up">
                              {themes.map((t) => (
                                  <button
                                      key={t.name}
                                      onClick={() => {
                                          setTheme(t.name);
                                          setShowThemeSelector(false);
                                      }}
                                      className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${theme === t.name ? 'bg-white/20' : 'hover:bg-white/10'}`}
                                  >
                                      <div className="flex items-center">
                                          <span className={`w-4 h-4 rounded-full mr-3 bg-gradient-to-br ${t.from} ${t.to}`}></span>
                                          {t.label}
                                      </div>
                                  </button>
                              ))}
                          </div>
                      )}
                  </div>
              </div>
              <p className="mt-4 text-lg text-[var(--color-text-secondary)]">Invoke a sense of wonder. Let's create magic together.</p>

              <nav className="mt-6 flex justify-center items-center space-x-2 p-1 bg-[var(--color-panel-bg)] border border-[var(--color-border)] rounded-full max-w-xs mx-auto">
                <button
                  onClick={() => setView('create')}
                  className={`flex items-center justify-center w-full px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-300 ${view === 'create' ? 'bg-white/20 text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)] hover:bg-white/10'}`}
                >
                  <MagicWandIcon className="w-5 h-5 mr-2" />
                  Create
                </button>
                <button
                  onClick={() => setView('gallery')}
                  className={`flex items-center justify-center w-full px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-300 ${view === 'gallery' ? 'bg-white/20 text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)] hover:bg-white/10'}`}
                >
                  <GalleryIcon className="w-5 h-5 mr-2" />
                  Showcase
                </button>
              </nav>
          </header>

          {view === 'create' ? (
              <main className="w-full flex-grow flex flex-col items-center">
                <div className="w-full max-w-2xl p-6 bg-[var(--color-panel-bg)] backdrop-blur-md rounded-2xl shadow-2xl shadow-[var(--color-shadow)] border border-[var(--color-border)] mb-8 animate-fade-in-up">
                  <StoryInput onSubmit={handleGenerateStory} isLoading={isLoading} />
                </div>

                <div className="w-full max-w-3xl flex-grow animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                  <StoryDisplay 
                    story={story} 
                    isLoading={isLoading} 
                    error={error} 
                    characters={characters}
                    onGenerateVideo={handleGenerateVideo}
                    isVideoLoading={isVideoLoading}
                    videoUrl={videoUrl}
                    sceneImages={sceneImages}
                    videoError={videoError}
                    videoLoadingMessage={videoLoadingMessage}
                    onGenerateMusic={handleGenerateMusic}
                    isMusicLoading={isMusicLoading}
                    musicUrl={musicUrl}
                    musicError={musicError}
                    musicLoadingMessage={musicLoadingMessage}
                  >
                      <CharacterGenerator
                          onGenerateCharacters={handleGenerateCharacters}
                          isCharacterLoading={isCharacterLoading}
                          characters={characters}
                          characterError={characterError}
                          onGenerateImageForCharacter={handleGenerateImageForCharacter}
                      />
                  </StoryDisplay>
                </div>
              </main>
          ) : (
              <Gallery />
          )}
          
          <footer className="mt-12 text-center text-[var(--color-text-muted)] text-sm">
            <p>Powered by Gemini & React</p>
          </footer>
        </div>
      </div>
      {showHelpModal && <HelpModal onClose={() => setShowHelpModal(false)} />}
    </>
  );
};

export default App;
