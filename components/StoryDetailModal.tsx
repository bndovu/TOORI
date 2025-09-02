
import React, { useState, useEffect, useRef } from 'react';
import { CommunityStory, Comment } from '../App';
import { CloseIcon, UserIcon } from './IconComponents';

interface StoryDetailModalProps {
  story: CommunityStory;
  user: { name: string; isAdmin: boolean };
  onClose: () => void;
  onAddComment: (storyId: number, commentText: string) => void;
}

const StoryDetailModal: React.FC<StoryDetailModalProps> = ({ story, user, onClose, onAddComment }) => {
  const [newComment, setNewComment] = useState('');
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(story.id, newComment.trim());
      setNewComment('');
    }
  };

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [story.comments]);

  const timeSince = (dateString: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000);
    if (seconds < 5) return "just now";
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

  return (
    <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="story-detail-title"
    >
      <div 
        className="bg-gradient-to-br from-[var(--color-bg-via)] to-[var(--color-bg-to)] w-full max-w-3xl h-[90vh] flex flex-col rounded-2xl shadow-2xl border border-[var(--color-border)] p-6 sm:p-8 text-left relative overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: story.backgroundImageUrl ? `url(${story.backgroundImageUrl})` : 'none' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-bg-via)]/90 to-[var(--color-bg-to)]/90 backdrop-blur-sm"></div>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-[var(--color-text-secondary)] hover:bg-white/10 transition-colors z-20"
          aria-label="Close story view"
        >
          <CloseIcon className="w-6 h-6" />
        </button>

        <div className="relative z-10 w-full h-full flex flex-col">
          <header className="flex-shrink-0">
            <h2 id="story-detail-title" className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-header-from)] to-[var(--color-header-to)] mb-2 pr-12">
                {story.title}
            </h2>
            <p className="text-sm text-[var(--color-text-tertiary)] mb-4">By {story.creator}</p>
          </header>

          <main className="flex-grow overflow-y-auto pr-4 -mr-4 space-y-4 text-[var(--color-text-secondary)] leading-relaxed mb-6">
              {story.content.split('\n').filter(p => p.trim() !== '').map((para, index) => (
                <p key={index}>{para}</p>
              ))}
          </main>

          <footer className="flex-shrink-0 pt-4 border-t border-[var(--color-border)]/50 flex flex-col">
            <h3 className="text-xl font-semibold text-[var(--color-text-secondary)] mb-4">Weaver Responses ({story.comments.length})</h3>
            <div className="flex-grow space-y-4 max-h-40 overflow-y-auto pr-2 mb-4">
              {story.comments.length > 0 ? (
                  story.comments.map(comment => (
                      <div key={comment.id} className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--color-panel-bg)] flex items-center justify-center border border-[var(--color-border)]">
                            <UserIcon className="w-5 h-5 text-[var(--color-text-tertiary)]" />
                          </div>
                          <div>
                              <div className="flex items-baseline space-x-2">
                                  <p className="font-semibold text-sm text-[var(--color-text-primary)]">{comment.author}</p>
                                  <p className="text-xs text-[var(--color-text-muted)]">{timeSince(comment.createdAt)}</p>
                              </div>
                              <p className="text-sm text-[var(--color-text-secondary)] break-words">{comment.text}</p>
                          </div>
                      </div>
                  ))
              ) : (
                  <p className="text-sm text-[var(--color-text-tertiary)] text-center py-4">Be the first to respond to this tale.</p>
              )}
              <div ref={commentsEndRef} />
            </div>

            <form onSubmit={handleSubmitComment} className="flex items-start space-x-3 pt-4 border-t border-[var(--color-border)]/50">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--color-panel-bg)] flex items-center justify-center border border-[var(--color-border)]">
                  <UserIcon className="w-5 h-5 text-[var(--color-text-tertiary)]" />
              </div>
              <div className="flex-grow">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={`Responding as ${user.name}...`}
                  className="w-full p-2 bg-black/20 text-[var(--color-text-primary)] rounded-lg border-2 border-transparent focus:border-[var(--color-accent-to)] focus:ring-1 focus:ring-[var(--color-focus-ring)] transition-all duration-300 resize-none placeholder-[var(--color-text-placeholder)] text-sm"
                  rows={2}
                />
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="mt-2 px-4 py-1.5 text-sm font-semibold text-white bg-gradient-to-r from-[var(--color-accent-from)] to-[var(--color-accent-to)] rounded-md shadow-sm hover:shadow-md transition-all disabled:opacity-50"
                >
                  Post Response
                </button>
              </div>
            </form>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default StoryDetailModal;
