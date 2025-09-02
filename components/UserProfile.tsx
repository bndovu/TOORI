
import React from 'react';
import { UserIcon } from './IconComponents';

interface UserProfileProps {
  user: {
    name: string;
    isAdmin: boolean;
  } | null;
}

const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  if (!user) {
    return null;
  }

  return (
    <div 
      className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center space-x-2 bg-[var(--color-panel-bg)] px-3 py-1.5 rounded-full border border-[var(--color-border)] transition-all duration-300 hover:bg-white/10 hover:scale-105 cursor-pointer"
      aria-label={`Current user: ${user.name}${user.isAdmin ? ' (Administrator)' : ''}`}
      role="button"
      tabIndex={0}
    >
      <UserIcon className="w-5 h-5 text-[var(--color-text-secondary)]" />
      <span className="font-semibold text-[var(--color-text-secondary)] text-sm">
        {user.name} {user.isAdmin && <span className="text-[var(--color-header-to)] font-bold">(Admin)</span>}
      </span>
    </div>
  );
};

export default UserProfile;