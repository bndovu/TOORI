import React, { useRef, useEffect, useState } from 'react';
import JSZip from 'jszip';
import Loader from './Loader';
import { VideoIcon, DownloadIcon, ShareIcon, MusicIcon, FolderDownloadIcon, RegenerateIcon } from './IconComponents';
import { Character } from '../App';


interface StoryDisplayProps {
  story: string;
  isLoading: boolean;
  error: string | null;
  characters: Character[];
  onGenerateVideo: () => void;
  isVideoLoading: boolean;
  videoUrl: string;
  sceneImages: string[];
  videoError: string | null;
  videoLoadingMessage: string;
  onGenerateMusic: () => void;
  isMusicLoading: boolean;
  musicUrl: string;
  musicError: string | null;
  musicLoadingMessage: string;
  children: React.ReactNode; // For CharacterGenerator
}

const StoryDisplay: React.FC<StoryDisplayProps> = ({ 
    story, 
    isLoading, 
    error,
    characters,
    onGenerateVideo,
    isVideoLoading,
    videoUrl,
    sceneImages,
    videoError,
    videoLoadingMessage,
    onGenerateMusic,
    isMusicLoading,
    musicUrl,
    musicError,
    musicLoadingMessage,
    children,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isZipping, setIsZipping] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;

    if (video && audio) {
      const syncPlay = () => audio.play();
      const syncPause = () => audio.pause();
      const syncTime = () => {
        if (Math.abs(video.currentTime - audio.currentTime) > 0.5) {
          audio.currentTime = video.currentTime;
        }
      };
      const syncVolume = () => {
        audio.volume = video.volume;
        audio.muted = video.muted;
      };

      syncVolume(); // Initial sync

      video.addEventListener('play', syncPlay);
      video.addEventListener('pause', syncPause);
      video.addEventListener('seeking', syncTime);
      video.addEventListener('volumechange', syncVolume);

      return () => {
        video.removeEventListener('play', syncPlay);
        video.removeEventListener('pause', syncPause);
        video.removeEventListener('seeking', syncTime);
        video.removeEventListener('volumechange', syncVolume);
      };
    }
  }, [videoUrl, musicUrl]);


  const getStoryPrefix = () => story
      .split(/\s+/)
      .slice(0, 5)
      .join('_')
      .replace(/[^a-zA-Z0-9_]/g, '')
      .toLowerCase() || 'story';

  const handleDownload = () => {
    if (!videoUrl) return;
    const fileName = `${getStoryPrefix()}_clip_${Date.now()}.mp4`;
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleDownloadScene = (e: React.MouseEvent, imageUrl: string, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    const fileName = `${getStoryPrefix()}_scene_${index + 1}_${Date.now()}.jpeg`;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'A Tale from AI Story Weaver',
          text: `I created a story with AI Story Weaver!\n\n---\n\n${story}`,
        });
      } catch (err) {
        console.error('Error sharing the story:', err);
      }
    } else {
      alert('Sharing is not supported on this browser.');
    }
  };

  const handleDownloadAll = async () => {
      if (isZipping) return;
      setIsZipping(true);
      try {
          const zip = new JSZip();
          zip.file("story.txt", story);

          if (videoUrl) {
              const videoBlob = await fetch(videoUrl).then(res => res.blob());
              zip.file("video.mp4", videoBlob);
          }

          if (sceneImages.length > 0) {
              const scenesFolder = zip.folder("key_scenes");
              await Promise.all(sceneImages.map(async (imgUrl, index) => {
                  const imgBlob = await fetch(imgUrl).then(res => res.blob());
                  scenesFolder?.file(`scene_${index + 1}.jpeg`, imgBlob);
              }));
          }
          
          const charactersWithImages = characters.filter(c => c.imageUrl);
          if (charactersWithImages.length > 0) {
              const charactersFolder = zip.folder("characters");
               await Promise.all(charactersWithImages.map(async (char) => {
                  const imgBlob = await fetch(char.imageUrl!).then(res => res.blob());
                  const fileName = `${char.name.replace(/\s+/g, '_').toLowerCase()}.jpeg`;
                  charactersFolder?.file(fileName, imgBlob);
              }));
          }

          const content = await zip.generateAsync({ type: "blob" });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(content);
          link.download = `${getStoryPrefix()}_collection.zip`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(link.href);

      } catch (err) {
          console.error("Error creating zip file:", err);
          alert("Could not create the download package. Please try again.");
      } finally {
          setIsZipping(false);
      }
  };


  const renderContent = () => {
    if (isLoading) {
      return <Loader />;
    }
    if (error) {
      return <p className="text-red-400 text-center">{error}</p>;
    }
    if (story) {
      const paragraphs = story.split('\n').filter(p => p.trim() !== '');
      return (
        <div className="w-full">
            <div className="relative mb-6">
                <button
                    onClick={handleDownloadAll}
                    disabled={isZipping}
                    className="absolute -top-2 right-0 flex items-center justify-center px-3 py-1.5 font-semibold text-[var(--color-text-tertiary)] bg-white/5 rounded-lg shadow-sm hover:bg-white/10 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                >
                    <FolderDownloadIcon className="w-5 h-5 mr-2" />
                    {isZipping ? 'Packaging...' : 'Download All'}
                </button>
            </div>
            <div className="space-y-4 text-[var(--color-text-secondary)] leading-relaxed text-left">
                {paragraphs.map((para, index) => (
                <p key={index}>{para}</p>
                ))}
            </div>

            <div className="mt-8 pt-6 border-t border-[var(--color-border)]">
                <h2 className="text-xl font-bold text-center text-[var(--color-text-secondary)] mb-6">Creative Tools</h2>
                <div className="grid md:grid-cols-3 gap-6 items-start">
                {/* Video Generation Column */}
                <div className="flex flex-col items-center justify-start w-full h-full space-y-4">
                    {videoUrl ? (
                        <div className="w-full mx-auto space-y-6">
                            {sceneImages.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-center mb-4 text-[var(--color-text-secondary)]">Key Scenes</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        {sceneImages.map((image, index) => (
                                            <a href={image} target="_blank" rel="noopener noreferrer" key={index} className="relative group rounded-lg overflow-hidden">
                                                <img src={image} alt={`Scene ${index + 1}`} className="aspect-video w-full object-cover transition-transform group-hover:scale-105" />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button
                                                        onClick={(e) => handleDownloadScene(e, image, index)}
                                                        className="p-2 bg-white/20 rounded-full text-white"
                                                        aria-label="Download Scene"
                                                    >
                                                        <DownloadIcon className="w-5 h-5"/>
                                                    </button>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div>
                                <h3 className="text-lg font-semibold text-center mb-4 text-[var(--color-text-secondary)]">Your Story's Clip</h3>
                                <video ref={videoRef} controls src={videoUrl} className="w-full rounded-lg shadow-lg aspect-video"></video>
                                <div className="mt-4 flex items-center justify-center space-x-4">
                                    <button
                                        onClick={handleDownload}
                                        className="flex items-center justify-center px-4 py-2 font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg shadow-lg hover:shadow-emerald-500/50 transform hover:scale-105 transition-all duration-300"
                                    >
                                        <DownloadIcon className="w-5 h-5 mr-2" />
                                        Download Clip
                                    </button>
                                    {navigator.share && (
                                        <button
                                            onClick={handleShare}
                                            className="flex items-center justify-center px-4 py-2 font-semibold text-white bg-gradient-to-r from-sky-500 to-blue-500 rounded-lg shadow-lg hover:shadow-blue-500/50 transform hover:scale-105 transition-all duration-300"
                                        >
                                            <ShareIcon className="w-5 h-5 mr-2" />
                                            Share Story
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : isVideoLoading ? (
                        <Loader message={videoLoadingMessage} />
                    ) : videoError ? (
                        <p className="text-red-400 text-center">{videoError}</p>
                    ) : (
                        <button
                            onClick={onGenerateVideo}
                            disabled={isVideoLoading}
                            className="w-full max-w-xs mx-auto flex items-center justify-center px-6 py-3 font-bold text-white bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg shadow-lg hover:shadow-cyan-500/50 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                        >
                            <VideoIcon className="w-5 h-5 mr-2" />
                            Generate Video Clip
                        </button>
                    )}
                </div>

                {/* Music Generation Column */}
                <div className="flex flex-col items-center justify-start w-full h-full space-y-4">
                    {isMusicLoading ? (
                        <Loader message={musicLoadingMessage} />
                    ) : musicError ? (
                        <p className="text-red-400 text-center">{musicError}</p>
                    ) : musicUrl ? (
                        <div className="w-full mx-auto text-center space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold mb-4 text-[var(--color-text-secondary)]">Soundtrack</h3>
                                {videoUrl ? (
                                    <>
                                        <p className="text-sm text-[var(--color-text-tertiary)] p-4 bg-black/20 rounded-lg">
                                            Playing with video.
                                        </p>
                                        <audio ref={audioRef} src={musicUrl} />
                                    </>
                                ) : (
                                    <audio controls src={musicUrl} className="w-full rounded-lg shadow-lg"></audio>
                                )}
                                <p className="text-xs text-[var(--color-text-muted)] mt-3">The generated video is yours to keep.<br/>The soundtrack is licensed to AI Story Weaver.</p>
                            </div>
                            <button
                                onClick={onGenerateMusic}
                                disabled={isMusicLoading}
                                className="w-full max-w-xs mx-auto flex items-center justify-center px-6 py-2 font-semibold text-white bg-gradient-to-r from-rose-500/80 to-fuchsia-500/80 rounded-lg shadow-md hover:from-rose-500 hover:to-fuchsia-500 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                            >
                                <RegenerateIcon className="w-5 h-5 mr-2" />
                                Regenerate Soundtrack
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={onGenerateMusic}
                            disabled={isMusicLoading}
                            className="w-full max-w-xs mx-auto flex items-center justify-center px-6 py-3 font-bold text-white bg-gradient-to-r from-rose-500 to-fuchsia-500 rounded-lg shadow-lg hover:shadow-fuchsia-500/50 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                        >
                            <MusicIcon className="w-5 h-5 mr-2" />
                            Generate Soundtrack
                        </button>
                    )}
                </div>

                {/* Character Generation Column */}
                {children}

                </div>
            </div>
        </div>
      );
    }
    return (
      <div className="text-center text-[var(--color-text-tertiary)]">
        <p className="text-xl">Your enchanted tale will appear here.</p>
        <p className="text-sm mt-2">Let your imagination take flight!</p>
      </div>
    );
  };

  return (
    <div className="w-full min-h-[300px] p-6 sm:p-8 bg-[var(--color-panel-bg)] backdrop-blur-md rounded-2xl shadow-inner shadow-black/20 border border-[var(--color-border)] flex items-center justify-center transition-all duration-500">
      {renderContent()}
    </div>
  );
};

export default StoryDisplay;