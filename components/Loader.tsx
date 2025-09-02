import React from 'react';

interface LoaderProps {
    message?: string;
}

const Loader: React.FC<LoaderProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="flex space-x-2">
        <div className="w-3 h-3 bg-[var(--color-icon-1)] rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
        <div className="w-3 h-3 bg-[var(--color-icon-2)] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-3 h-3 bg-[var(--color-text-tertiary)] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
      </div>
      <p className="text-[var(--color-text-secondary)]">{message || 'The story is unfolding...'}</p>
    </div>
  );
};

export default Loader;