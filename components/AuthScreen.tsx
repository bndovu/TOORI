import React, { useState } from 'react';
import { StarIcon, MagicWandIcon } from './IconComponents';

interface AuthScreenProps {
  onLogin: (name: string) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (name.trim()) {
      onLogin(name);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-bg-from)] via-[var(--color-bg-via)] to-[var(--color-bg-to)] text-[var(--color-text-primary)] p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center transition-colors duration-500">
      <div className="w-full max-w-md mx-auto text-center animate-fade-in-up">
        <header className="mb-8">
          <div className="flex items-center justify-center space-x-3">
            <StarIcon className="w-8 h-8 text-[var(--color-icon-1)]" />
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-header-from)] to-[var(--color-header-to)]">
              AI Story Weaver
            </h1>
            <StarIcon className="w-8 h-8 text-[var(--color-icon-2)]" />
          </div>
          <p className="mt-4 text-lg text-[var(--color-text-secondary)]">Welcome, Weaver. Tell us your name to begin.</p>
        </header>

        <main className="w-full p-6 bg-[var(--color-panel-bg)] backdrop-blur-md rounded-2xl shadow-2xl shadow-[var(--color-shadow)] border border-[var(--color-border)]">
          <form onSubmit={handleSubmit}>
            <label htmlFor="creator-name" className="block text-lg font-semibold text-[var(--color-text-secondary)] mb-3 text-center">
              Enter Your Creator Name
            </label>
            <input
              id="creator-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Aria the Myth-Maker"
              className="w-full p-4 bg-black/20 text-[var(--color-text-primary)] rounded-lg border-2 border-transparent focus:border-[var(--color-accent-to)] focus:ring-2 focus:ring-[var(--color-focus-ring)] transition-all duration-300 text-center placeholder-[var(--color-text-placeholder)]"
              autoFocus
            />
            <button
              type="submit"
              disabled={!name.trim()}
              className="mt-6 w-full flex items-center justify-center px-6 py-3 font-bold text-white bg-gradient-to-r from-[var(--color-accent-from)] to-[var(--color-accent-to)] rounded-lg shadow-lg hover:shadow-[var(--color-shadow)] transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            >
              <MagicWandIcon className="w-5 h-5 mr-2" />
              Start Weaving
            </button>
          </form>
        </main>
      </div>
    </div>
  );
};

export default AuthScreen;
