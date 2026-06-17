import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import type { UserProfile, Challenge } from '../services/mockServices';
import { mockFirestore } from '../services/mockServices';
import { LevelProgressCard } from './LevelProgressCard';
import { ActiveMissionsPanel } from './ActiveMissionsPanel';
import { BadgeGalleryPanel } from './BadgeGalleryPanel';

interface GamificationTabProps {
  user: UserProfile;
  challenges: Challenge[];
  onChallengeCompleted: () => void;
}

export const GamificationTab: React.FC<GamificationTabProps> = ({ 
  user, 
  challenges,
  onChallengeCompleted 
}) => {
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const triggerConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#06b6d4', '#3b82f6', '#ffffff']
    });
  };

  const handleCompleteChallenge = (id: string) => {
    setClaimingId(id);
    
    setTimeout(() => {
      mockFirestore.completeChallenge(id);
      triggerConfetti();
      setClaimingId(null);
      onChallengeCompleted();
    }, 800);
  };

  // Calculate XP progress bar parameters
  const xpNeededForNextLevel = 1000;
  const currentLevelXp = user.xp % xpNeededForNextLevel;
  const xpRemaining = xpNeededForNextLevel - currentLevelXp;
  const xpPercent = Math.min((currentLevelXp / xpNeededForNextLevel) * 100, 100);

  return (
    <div className="space-y-8">
      <LevelProgressCard
        user={user}
        xpPercent={xpPercent}
        xpRemaining={xpRemaining}
        currentLevelXp={currentLevelXp}
        xpNeededForNextLevel={xpNeededForNextLevel}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <ActiveMissionsPanel
          challenges={challenges}
          claimingId={claimingId}
          handleCompleteChallenge={handleCompleteChallenge}
        />

        <BadgeGalleryPanel user={user} />
      </div>
    </div>
  );
};
export default GamificationTab;
