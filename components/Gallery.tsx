import React, { useState, useEffect } from 'react';
import { HeartIcon, LevelStarIcon } from './IconComponents';

type CreatorLevel = 'bronze' | 'silver' | 'gold';

interface Story {
  id: number;
  title: string;
  creator: string;
  content: string;
  votes: number;
}

const sampleStories: Story[] = [
  {
    id: 1,
    title: 'The Dragon Who Baked Pastries',
    creator: 'Aria a.k.a. The Myth-Maker',
    content: 'In a cavern lined with glittering crystals, lived a shy dragon named Ignis. Unlike his kin, who hoarded gold, Ignis hoarded recipes. His greatest treasure was a flaky croissant that shimmered with enchanted sugar...',
    votes: 21,
  },
  {
    id: 2,
    title: 'The Clockwork Gardener',
    creator: 'Leo the Tinkerer',
    content: 'Elara was a girl made of gears and springs, her heart a softly ticking clock. She tended a garden of metallic flowers, polishing their silver petals and ensuring their copper stems were perfectly wound each morning...',
    votes: 14,
  },
    {
    id: 3,
    title: 'Whispers of the Star-Tide',
    creator: 'Seraphina Starlight',
    content: 'Once a cycle, the ocean on planet Lumina doesn\'t reflect the stars, it inhales them. A young fisherboy named Kael discovers he can hear the stars whispering secrets of the cosmos when the tide is low...',
    votes: 7,
  },
  {
    id: 4,
    title: 'The Librarian of Lost Languages',
    creator: 'Orion the Sage',
    content: 'In a library that existed between worlds, an old man was the sole keeper of forgotten languages. He could speak in the tongue of rustling leaves, the dialect of falling rain, and the silent grammar of moonlight...',
    votes: 3,
  },
];

const Gallery: React.FC = () => {
    const [stories, setStories] = useState<Story[]>(sampleStories);
    const [votedStories, setVotedStories] = useState<Set<number>>(new Set());

    useEffect(() => {
        const storedVotes = localStorage.getItem('story-weaver-votes');
        if (storedVotes) {
            setVotedStories(new Set(JSON.parse(storedVotes)));
        }
    }, []);

    const handleVote = (storyId: number) => {
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

    const getCreatorLevel = (votes: number): CreatorLevel | null => {
        if (votes >= 20) return 'gold';
        if (votes >= 10) return 'silver';
        if (votes >= 5) return 'bronze';
        return null;
    };

    return (
        <div className="w-full animate-fade-in-up">
            <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-header-from)] to-[var(--color-header-to)] mb-2">
                Community Showcase
            </h2>
            <p className="text-center text-[var(--color-text-secondary)] mb-8">Discover and celebrate tales from fellow weavers.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {stories.sort((a,b) => b.votes - a.votes).map(story => {
                    const level = getCreatorLevel(story.votes);
                    const hasVoted = votedStories.has(story.id);
                    return (
                        <div key={story.id} className="p-6 bg-[var(--color-panel-bg)] backdrop-blur-md rounded-2xl shadow-lg border border-[var(--color-border)] flex flex-col text-left">
                            <div className="flex-grow">
                                <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">{story.title}</h3>
                                <div className="flex items-center space-x-2 mb-4 text-sm text-[var(--color-text-tertiary)]">
                                    {level && <LevelStarIcon level={level} className="w-5 h-5" title={`${level.charAt(0).toUpperCase() + level.slice(1)} Creator`} />}
                                    <span>By {story.creator}</span>
                                </div>
                                <p className="text-[var(--color-text-secondary)] leading-relaxed">{story.content}</p>
                            </div>
                            <div className="mt-6 pt-4 border-t border-[var(--color-border)] flex justify-between items-center">
                                <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent-from)] to-[var(--color-accent-to)]">
                                    {story.votes} Votes
                                </span>
                                <button
                                    onClick={() => handleVote(story.id)}
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
                    );
                })}
            </div>
        </div>
    );
};

export default Gallery;