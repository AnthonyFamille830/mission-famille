import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Zap, Star, Users } from 'lucide-react';
import { useStore } from '@/lib/store';
import { WEEKLY_CHALLENGES } from '@/lib/challenges';

const RANK_BADGES = ['🥇', '🥈', '🥉'];

function getChallengeXpForWeekKey(weekKey: string): number {
  const part = weekKey.split('-W')[1];
  const weekNum = parseInt(part ?? '0', 10);
  return WEEKLY_CHALLENGES[weekNum % WEEKLY_CHALLENGES.length]?.bonusXp ?? 0;
}

const ENCOURAGING_LABELS = [
  'Champion des défis !',
  'Super participant !',
  'En pleine progression !',
  'Beau départ !',
];

export function ChallengeLeaderboard({ activeProfileId }: { activeProfileId?: string }) {
  const { profiles, challengeCompletedBy } = useStore();

  const stats = useMemo(() => {
    return profiles.map(p => {
      let challengesDone = 0;
      let challengeXp = 0;

      for (const [weekKey, completedIds] of Object.entries(challengeCompletedBy)) {
        if (completedIds.includes(p.id)) {
          challengesDone++;
          challengeXp += getChallengeXpForWeekKey(weekKey);
        }
      }

      return { ...p, challengesDone, challengeXp };
    }).sort((a, b) => b.challengesDone - a.challengesDone || b.challengeXp - a.challengeXp);
  }, [profiles, challengeCompletedBy]);

  if (profiles.length === 0) return null;

  const totalDone = stats.reduce((s, p) => s + p.challengesDone, 0);
  const familyAvg = profiles.length > 0
    ? (totalDone / profiles.length).toFixed(1)
    : '0';
  const totalChallengeXp = stats.reduce((s, p) => s + p.challengeXp, 0);

  return (
    <div className="mt-6">
      {/* Section header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 bg-amber-100 rounded-lg">
          <Zap size={14} className="text-amber-600" strokeWidth={2.5} fill="currentColor" />
        </div>
        <h3 className="font-black text-sm text-foreground">Défis de la semaine — Palmarès</h3>
      </div>

      {/* Rows */}
      <div className="space-y-2">
        {stats.map((p, i) => {
          const isMe = p.id === activeProfileId;
          const label = ENCOURAGING_LABELS[Math.min(i, ENCOURAGING_LABELS.length - 1)];
          const badge = RANK_BADGES[i];

          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`rounded-2xl border-2 p-3.5 flex items-center gap-3 transition-all ${
                isMe
                  ? 'border-amber-300 bg-amber-50'
                  : 'border-border bg-card'
              }`}
            >
              {/* Rank */}
              <div className="text-xl w-7 text-center flex-shrink-0">
                {badge ?? <span className="text-sm font-black text-muted-foreground">{i + 1}</span>}
              </div>

              {/* Avatar */}
              <div className="text-2xl flex-shrink-0">{p.avatar}</div>

              {/* Name + label */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-black text-sm text-foreground">{p.name}</span>
                  {isMe && (
                    <span className="text-[10px] font-bold bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded-full">Toi</span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground font-medium mt-0.5">{label}</p>
              </div>

              {/* Stats */}
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <div className="flex items-center gap-1">
                  <Zap size={11} className="text-amber-500" fill="currentColor" />
                  <span className="text-sm font-black text-amber-700">
                    {p.challengesDone}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {p.challengesDone === 1 ? 'défi' : 'défis'}
                  </span>
                </div>
                {p.challengeXp > 0 && (
                  <div className="flex items-center gap-0.5">
                    <Star size={10} className="fill-yellow-400 text-yellow-400" />
                    <span className="text-[11px] font-bold text-foreground">+{p.challengeXp} XP</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Family summary bar */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: stats.length * 0.07 + 0.1 }}
        className="mt-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-3.5 flex items-center gap-4"
      >
        <div className="p-2 bg-amber-100 rounded-xl flex-shrink-0">
          <Users size={16} className="text-amber-600" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-black text-amber-900">Résultats famille</p>
          <p className="text-[11px] text-amber-700 font-medium mt-0.5">
            {totalDone} défi{totalDone !== 1 ? 's' : ''} relevé{totalDone !== 1 ? 's' : ''} au total · Moyenne : {familyAvg} par personne
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="flex items-center gap-0.5 justify-end">
            <Star size={11} className="fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-black text-amber-800">{totalChallengeXp}</span>
          </div>
          <p className="text-[10px] text-amber-600 font-medium">XP bonus</p>
        </div>
      </motion.div>

      {totalDone === 0 && (
        <p className="text-center text-xs text-muted-foreground font-medium mt-3">
          Complétez votre premier défi hebdomadaire pour apparaître ici ! ⚡
        </p>
      )}
    </div>
  );
}
