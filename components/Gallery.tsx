
import React, { useState, useEffect } from 'react';
import { HeartIcon, LevelStarIcon, ShareIcon, CommentIcon } from './IconComponents';
import { CommunityStory } from '../App';

type CreatorLevel = 'bronze' | 'silver' | 'gold';

interface GalleryProps {
  stories: CommunityStory[];
  setStories: React.Dispatch<React.SetStateAction<CommunityStory[]>>;
  onSelectStory: (story: CommunityStory) => void;
}

const Gallery: React.FC<GalleryProps> = ({ stories, setStories, onSelectStory }) => {
    const [votedStories, setVotedStories] = useState<Set<number>>(new Set());
    const [copiedId, setCopiedId] = useState<number | null>(null);

    useEffect(() => {
        const storedVotes = localStorage.getItem('story-weaver-votes');
        if (storedVotes) {
            setVotedStories(new Set(JSON.parse(storedVotes)));
        }
    }, []);

    const handleVote = (e: React.MouseEvent, storyId: number) => {
        e.stopPropagation();
        if (votedStories.has(storyId)) return;

        setStories(prevStories => 
            prevStories.map(story => 
                story.id === storyId ? { ...story, votes: story.votes + 1 } : story
            )
        );

        const newVotedStories = new Set(votedStories).add(storyId);
        setVotedStories(newVotedStories);
        localStorage.setItem('story-weaver-votes', JSON.stringify(Array.from(newVotedStories)));
    };

    const handleShare = async (e: React.MouseEvent, story: CommunityStory) => {
        e.stopPropagation(); // Prevent the modal from opening
        const shareData = {
            title: `AI Story Weaver: "${story.title}"`,
            text: `Check out this story, "${story.title}", created with AI Story Weaver!`,
            url: window.location.href,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error("Error sharing:", err);
            }
        } else {
            // Fallback: copy link/text to clipboard
            try {
                await navigator.clipboard.writeText(`${shareData.title}\n${shareData.url}`);
                setCopiedId(story.id);
                setTimeout(() => setCopiedId(null), 2000);
            } catch (err) {
                console.error("Failed to copy:", err);
                alert("Sharing is not supported on this browser. You can copy the link manually from the address bar.");
            }
        }
    };

    const getCreatorLevel = (votes: number): CreatorLevel | null => {
        if (votes >= 20) return 'gold';
        if (votes >= 10) return 'silver';
        if (votes >= 5) return 'bronze';
        return null;
    };

    if (stories.length === 0) {
        return (
            <div className="w-full text-center text-[var(--color-text-tertiary)] animate-fade-in-up">
                <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-header-from)] to-[var(--color-header-to)] mb-2">
                    Community Showcase
                </h2>
                <p className="text-lg mt-4">The showcase is empty.</p>
                <p>Be the first to publish a story!</p>
            </div>
        )
    }

    return (
        <div className="w-full animate-fade-in-up">
            <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-header-from)] to-[var(--color-header-to)] mb-2">
                Community Showcase
            </h2>
            <p className="text-center text-[var(--color-text-secondary)] mb-8">Discover and celebrate tales from fellow weavers.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...stories].sort((a,b) => b.votes - a.votes).map(story => {
                    const level = getCreatorLevel(story.votes);
                    const hasVoted = votedStories.has(story.id);
                    const contentPreview = story.content.split(' ').slice(0, 40).join(' ') + (story.content.split(' ').length > 40 ? '...' : '');
                    const latestComment = story.comments.length > 0 ? story.comments[story.comments.length - 1] : null;
                    
                    return (
                        <div 
                            key={story.id} 
                            className="p-6 rounded-2xl shadow-lg border border-[var(--color-border)] flex flex-col text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-[var(--color-shadow)] cursor-pointer relative bg-cover bg-center overflow-hidden"
                            style={{ backgroundImage: story.backgroundImageUrl ? `url(${story.backgroundImageUrl})` : 'none' }}
                            onClick={() => onSelectStory(story)}
                        >
                            <div className="absolute inset-0 bg-[var(--color-bg-via)]/70 backdrop-blur-sm"></div>
                            <div className="relative flex-grow flex flex-col">
                                <div className="flex-grow">
                                    <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">{story.title}</h3>
                                    <div className="flex items-center space-x-2 mb-4 text-sm text-[var(--color-text-tertiary)]">
                                        {level && <LevelStarIcon level={level} className="w-5 h-5" title={`${level.charAt(0).toUpperCase() + level.slice(1)} Creator`} />}
                                        <span>By {story.creator}</span>
                                    </div>
                                    <p className="text-[var(--color-text-secondary)] leading-relaxed">{contentPreview}</p>
                                </div>
                                <div className="mt-6 pt-4 border-t border-[var(--color-border)]/50 flex flex-col space-y-4">
                                    {latestComment && (
                                        <div className="flex items-start space-x-3">
                                            <CommentIcon className="w-5 h-5 text-sky-400 flex-shrink-0 mt-0.5" />
                                            <div className="flex-1 overflow-hidden">
                                                <p className="text-xs text-[var(--color-text-muted)]">
                                                    Latest response from <span className="font-bold text-[var(--color-text-tertiary)]">{latestComment.author}</span>
                                                </p>
                                                <p className="text-sm text-[var(--color-text-secondary)] italic truncate">"{latestComment.text}"</p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center space-x-4 text-sm">
                                            <div className="flex items-center space-x-1.5">
                                                <HeartIcon className="w-5 h-5 text-pink-400" />
                                                <span className="font-bold text-[var(--color-text-secondary)]">{story.votes}</span>
                                            </div>
                                            <div className="flex items-center space-x-1.5">
                                                <CommentIcon className="w-5 h-5 text-sky-400" />
                                                <span className="font-bold text-[var(--color-text-secondary)]">{story.comments.length}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={(e) => handleShare(e, story)}
                                                aria-label="Share story"
                                                className="p-2 rounded-full transition-colors duration-300 bg-white/5 text-[var(--color-text-tertiary)] hover:bg-white/10 hover:text-[var(--color-text-primary)]"
                                            >
                                                <ShareIcon className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={(e) => handleVote(e, story.id)}
                                                disabled={hasVoted}
                                                className={`flex items-center space-x-2 px-4 py-2 font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed ${
                                                    hasVoted 
                                                    ? 'bg-pink-600/50 text-white' 
                                                    : 'bg-gradient-to-r from-[var(--color-accent-from)] to-[var(--color-accent-to)] text-white shadow-md'
                                                }`}
                                            >
                                                <HeartIcon className={`w-5 h-5 ${hasVoted ? 'fill-current' : ''}`} />
                                                <span>{hasVoted ? 'Voted' : 'Vote'}</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Gallery;
