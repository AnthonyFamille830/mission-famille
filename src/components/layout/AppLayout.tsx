import React, { useState, useRef, useEffect } from 'react';
import { Link, useRoute, useLocation } from 'wouter';
import { Home, ListTodo, Trophy, Settings, Gift, Bell, Check, X, ChevronRight, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useStore, type AppNotification } from '@/lib/store';

interface AppLayoutProps {
  children: React.ReactNode;
  profileId?: string;
}

function NotificationTypeConfig(type: AppNotification['type']) {
  switch (type) {
    case 'claim_approved':     return { label: 'Récompense accordée',  color: 'text-emerald-600', bg: 'bg-emerald-50',  dot: 'bg-emerald-400' };
    case 'claim_rejected':     return { label: 'Récompense refusée',   color: 'text-destructive', bg: 'bg-destructive/5', dot: 'bg-destructive' };
    case 'new_claim':          return { label: 'Nouvelle demande',     color: 'text-primary',     bg: 'bg-primary/5',   dot: 'bg-primary'     };
    case 'new_custom_mission': return { label: 'Nouvelle mission',     color: 'text-amber-700',   bg: 'bg-amber-50',    dot: 'bg-amber-400'   };
  }
}

function NotificationPanel({
  profileId,
  onClose,
}: {
  profileId: string;
  onClose: () => void;
}) {
  const [, navigate] = useLocation();
  const { notifications, markNotificationRead, markAllNotificationsRead, clearNotifications } = useStore();
  const myNotifs = notifications
    .filter(n => n.profileId === profileId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 20);

  const unreadCount = myNotifs.filter(n => !n.read).length;

  function handleClick(n: AppNotification) {
    markNotificationRead(n.id);
    onClose();
    if (n.type === 'new_claim') navigate(`/recompenses/${profileId}`);
    if (n.type === 'claim_approved' || n.type === 'claim_rejected') navigate(`/recompenses/${profileId}`);
    if (n.type === 'new_custom_mission') navigate(`/missions/${profileId}`);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.15 }}
      className="absolute top-14 right-3 z-50 w-80 max-w-[calc(100vw-1.5rem)] bg-card border border-card-border rounded-2xl shadow-xl overflow-hidden"
    >
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="font-black text-sm text-foreground">Notifications</span>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={() => markAllNotificationsRead(profileId)}
              className="text-xs text-primary font-bold hover:opacity-70 transition-opacity"
            >
              Tout lire
            </button>
          )}
          {myNotifs.length > 0 && (
            <button
              onClick={() => clearNotifications(profileId)}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors font-medium"
            >
              Effacer
            </button>
          )}
        </div>
      </div>

      {/* Notification list */}
      <div className="max-h-80 overflow-y-auto">
        {myNotifs.length === 0 && (
          <div className="text-center py-8 px-4">
            <div className="text-3xl mb-2">🔔</div>
            <p className="text-sm text-muted-foreground font-medium">Aucune notification</p>
          </div>
        )}

        {myNotifs.map((n, i) => {
          const cfg = NotificationTypeConfig(n.type);
          return (
            <button
              key={n.id}
              onClick={() => handleClick(n)}
              className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/50 border-b border-border/50 last:border-0 ${!n.read ? cfg.bg : ''}`}
            >
              {/* Unread dot */}
              <div className="flex-shrink-0 mt-1.5">
                {!n.read
                  ? <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                  : <div className="w-2 h-2 rounded-full bg-transparent" />
                }
              </div>

              {/* Icon + content */}
              <div className="flex-shrink-0">
                {n.type === 'new_custom_mission' ? (
                  <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
                    <Shield size={16} className="fill-amber-500 text-amber-500" />
                  </div>
                ) : (
                  <span className="text-xl">{n.rewardIcon}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-bold ${cfg.color} mb-0.5`}>{cfg.label}</p>
                <p className="text-xs text-foreground font-medium leading-snug">
                  {n.type === 'new_claim' && (
                    <><span className="font-bold">{n.fromAvatar} {n.fromName}</span> a demandé <span className="font-bold">{n.rewardTitle}</span></>
                  )}
                  {n.type === 'claim_approved' && (
                    <><span className="font-bold">{n.fromAvatar} {n.fromName}</span> a accordé <span className="font-bold">{n.rewardTitle}</span></>
                  )}
                  {n.type === 'claim_rejected' && (
                    <><span className="font-bold">{n.fromAvatar} {n.fromName}</span> a refusé <span className="font-bold">{n.rewardTitle}</span></>
                  )}
                  {n.type === 'new_custom_mission' && (
                    <>
                      Nouvelle mission de <span className="font-bold">{n.fromAvatar} {n.fromName}</span>
                      {' : '}
                      <span className="font-bold">{n.rewardTitle}</span>
                      {n.xpReward != null && (
                        <span className="text-amber-700 font-bold"> (+{n.xpReward} XP)</span>
                      )}
                    </>
                  )}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: fr })}
                </p>
              </div>

              <ChevronRight size={13} className="text-muted-foreground flex-shrink-0 mt-1" />
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

export function AppLayout({ children, profileId }: AppLayoutProps) {
  const [isDashboard] = useRoute('/dashboard/:id');
  const [isMissions] = useRoute('/missions/:id');
  const [isLeaderboard] = useRoute('/classement');
  const [isRewards] = useRoute('/recompenses/:id');

  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  const { notifications } = useStore();
  const unreadCount = profileId
    ? notifications.filter(n => n.profileId === profileId && !n.read).length
    : 0;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false);
      }
    }
    if (bellOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [bellOpen]);

  return (
    <div className="min-h-[100dvh] bg-background max-w-md mx-auto shadow-xl relative flex flex-col">

      {/* Top bar — only when a profile is active */}
      {profileId && (
        <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/60 px-4 py-2.5 flex items-center justify-between">
          <span className="text-sm font-black text-foreground tracking-tight">Mission Famille</span>

          {/* Bell */}
          <div ref={bellRef} className="relative">
            <button
              onClick={() => setBellOpen(v => !v)}
              className={`relative p-2 rounded-xl transition-all ${bellOpen ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`}
            >
              <Bell size={20} strokeWidth={bellOpen ? 2.5 : 2} />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-destructive text-destructive-foreground text-[10px] font-black rounded-full flex items-center justify-center leading-none"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.span>
              )}
            </button>

            <AnimatePresence>
              {bellOpen && profileId && (
                <NotificationPanel
                  profileId={profileId}
                  onClose={() => setBellOpen(false)}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Page content */}
      <main className="flex-1 overflow-y-auto w-full p-4 pb-24 relative z-10">
        {children}
      </main>

      {/* Bottom nav */}
      {profileId && (
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-border z-50 px-2 py-2 flex justify-between items-center rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <Link href={`/dashboard/${profileId}`} className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-colors ${isDashboard ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}>
            <div className={`p-1.5 rounded-xl ${isDashboard ? 'bg-primary/10' : ''}`}>
              <Home size={22} strokeWidth={isDashboard ? 2.5 : 2} />
            </div>
            <span className="text-[10px] font-bold">Accueil</span>
          </Link>

          <Link href={`/missions/${profileId}`} className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-colors ${isMissions ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}>
            <div className={`p-1.5 rounded-xl ${isMissions ? 'bg-primary/10' : ''}`}>
              <ListTodo size={22} strokeWidth={isMissions ? 2.5 : 2} />
            </div>
            <span className="text-[10px] font-bold">Missions</span>
          </Link>

          <Link href={`/recompenses/${profileId}`} className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-colors ${isRewards ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}>
            <div className={`p-1.5 rounded-xl ${isRewards ? 'bg-primary/10' : ''}`}>
              <Gift size={22} strokeWidth={isRewards ? 2.5 : 2} />
            </div>
            <span className="text-[10px] font-bold">Récompenses</span>
          </Link>

          <Link href={profileId ? `/classement/${profileId}` : '/classement'} className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-colors ${isLeaderboard ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}>
            <div className={`p-1.5 rounded-xl ${isLeaderboard ? 'bg-primary/10' : ''}`}>
              <Trophy size={22} strokeWidth={isLeaderboard ? 2.5 : 2} />
            </div>
            <span className="text-[10px] font-bold">Classement</span>
          </Link>

          <Link href="/" className="flex flex-col items-center gap-0.5 px-3 py-1 transition-colors text-muted-foreground hover:text-primary">
            <div className="p-1.5 rounded-xl">
              <Settings size={22} strokeWidth={2} />
            </div>
            <span className="text-[10px] font-bold">Profils</span>
          </Link>
        </nav>
      )}
    </div>
  );
}
