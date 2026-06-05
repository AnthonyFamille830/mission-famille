import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, ChevronUp, Calendar } from "lucide-react";
import { format, addDays } from "date-fns";
import { useStore, type Category } from "@/lib/store";

const CATEGORIES: { key: Category; icon: string; label: string; color: string; bg: string; border: string }[] = [
  { key: "Autonomie", icon: "🏠", label: "Autonomie", color: "text-blue-600",    bg: "bg-blue-50",    border: "border-blue-300"   },
  { key: "Argent",    icon: "💰", label: "Argent",    color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-300" },
  { key: "Relations", icon: "❤️", label: "Relations", color: "text-rose-600",    bg: "bg-rose-50",    border: "border-rose-300"   },
  { key: "Défis",     icon: "⚡", label: "Défis",     color: "text-orange-500",  bg: "bg-orange-50",  border: "border-orange-300" },
];

const XP_PRESETS = [15, 25, 50, 75, 100];

interface CreateMissionModalProps {
  parentId: string;
  onClose: () => void;
}

export function CreateMissionModal({ parentId, onClose }: CreateMissionModalProps) {
  const { profiles, createCustomMission } = useStore();
  const children = profiles.filter(p => p.role === 'enfant');

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [showDescription, setShowDescription] = useState(false);
  const [category, setCategory] = useState<Category>("Autonomie");
  const [xpReward, setXpReward] = useState(25);
  const [customXp, setCustomXp] = useState("");
  const [useCustomXp, setUseCustomXp] = useState(false);
  const [selectedChildren, setSelectedChildren] = useState<string[]>(children.map(c => c.id));
  const [dueDate, setDueDate] = useState("");
  const [scheduleType, setScheduleType] = useState<'once' | 'days'>('once');
  const [repeatDays, setRepeatDays] = useState(3);
  const [error, setError] = useState("");

  const effectiveXp = useCustomXp ? (parseInt(customXp) || 0) : xpReward;

  function toggleChild(id: string) {
    setSelectedChildren(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  }

  function toggleAllChildren() {
    if (selectedChildren.length === children.length) {
      setSelectedChildren([]);
    } else {
      setSelectedChildren(children.map(c => c.id));
    }
  }

  function handleSubmit() {
    if (!title.trim()) { setError("Le titre est obligatoire."); return; }
    if (selectedChildren.length === 0) { setError("Sélectionne au moins un enfant."); return; }
    if (effectiveXp <= 0 || effectiveXp > 500) { setError("XP entre 1 et 500."); return; }

    const today = format(new Date(), "yyyy-MM-dd");
    let dueDateValue: string | undefined;
    if (scheduleType === 'once' && dueDate) {
      dueDateValue = dueDate;
    } else if (scheduleType === 'days') {
      dueDateValue = format(addDays(new Date(), repeatDays - 1), "yyyy-MM-dd");
    }

    createCustomMission(
      { title: title.trim(), description: description.trim() || undefined, category, xpReward: effectiveXp, dueDate: dueDateValue },
      selectedChildren,
      parentId
    );

    onClose();
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        onClick={e => e.stopPropagation()}
        className="bg-card w-full max-w-md rounded-t-3xl shadow-2xl overflow-hidden max-h-[92dvh] flex flex-col"
      >
        {/* Handle + header */}
        <div className="flex-shrink-0 px-5 pt-4 pb-3 border-b border-border">
          <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />
          <div className="flex items-center justify-between">
            <h2 className="font-black text-base text-foreground">Nouvelle mission</h2>
            <button onClick={onClose} className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Scrollable form */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

          {/* Title */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Titre *</label>
            <input
              type="text"
              value={title}
              onChange={e => { setTitle(e.target.value); setError(""); }}
              placeholder="Ex: Ranger le salon…"
              maxLength={60}
              className="w-full bg-secondary border border-border rounded-xl px-3.5 py-2.5 text-sm font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
            />
          </div>

          {/* Description (collapsible) */}
          <div>
            <button
              onClick={() => setShowDescription(v => !v)}
              className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
            >
              {showDescription ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              Description (optionnelle)
            </button>
            <AnimatePresence>
              {showDescription && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Détails ou instructions…"
                    rows={2}
                    maxLength={150}
                    className="mt-1.5 w-full bg-secondary border border-border rounded-xl px-3.5 py-2.5 text-sm font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all resize-none"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Catégorie</label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => setCategory(cat.key)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${
                    category === cat.key
                      ? `${cat.bg} ${cat.color} ${cat.border}`
                      : "bg-secondary border-transparent text-muted-foreground hover:border-border"
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* XP Reward */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Récompense XP</label>
            <div className="flex gap-1.5 flex-wrap mb-2">
              {XP_PRESETS.map(xp => (
                <button
                  key={xp}
                  onClick={() => { setXpReward(xp); setUseCustomXp(false); setError(""); }}
                  className={`px-3 py-1.5 rounded-xl text-sm font-black border-2 transition-all ${
                    !useCustomXp && xpReward === xp
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary border-transparent text-foreground hover:border-border"
                  }`}
                >
                  {xp} XP
                </button>
              ))}
              <button
                onClick={() => { setUseCustomXp(true); setError(""); }}
                className={`px-3 py-1.5 rounded-xl text-sm font-black border-2 transition-all ${
                  useCustomXp
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-secondary border-transparent text-foreground hover:border-border"
                }`}
              >
                Autre
              </button>
            </div>
            <AnimatePresence>
              {useCustomXp && (
                <motion.input
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  type="number"
                  min={1}
                  max={500}
                  value={customXp}
                  onChange={e => { setCustomXp(e.target.value); setError(""); }}
                  placeholder="XP personnalisé…"
                  className="w-full bg-secondary border border-border rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                />
              )}
            </AnimatePresence>
          </div>

          {/* Assign to */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Assigner à *</label>
              {children.length > 1 && (
                <button
                  onClick={toggleAllChildren}
                  className="text-xs font-bold text-primary hover:opacity-70 transition-opacity"
                >
                  {selectedChildren.length === children.length ? "Déselectionner tout" : "Tous"}
                </button>
              )}
            </div>
            {children.length === 0 ? (
              <p className="text-sm text-muted-foreground font-medium bg-secondary rounded-xl p-3 text-center">
                Aucun profil enfant — créez-en un d'abord
              </p>
            ) : (
              <div className="space-y-2">
                {children.map(child => {
                  const checked = selectedChildren.includes(child.id);
                  return (
                    <button
                      key={child.id}
                      onClick={() => toggleChild(child.id)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl border-2 transition-all ${
                        checked
                          ? "border-primary/40 bg-primary/6"
                          : "border-transparent bg-secondary hover:border-border"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        checked ? "bg-primary border-primary" : "border-border"
                      }`}>
                        {checked && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <span className="text-xl">{child.avatar}</span>
                      <span className="text-sm font-bold text-foreground">{child.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Schedule */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Durée</label>
            <div className="flex gap-2 mb-3">
              {[
                { key: 'once' as const, label: 'Ponctuelle' },
                { key: 'days' as const, label: 'Plusieurs jours' },
              ].map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setScheduleType(opt.key)}
                  className={`flex-1 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                    scheduleType === opt.key
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary border-transparent text-foreground hover:border-border"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {scheduleType === 'once' && (
              <div className="relative">
                <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input
                  type="date"
                  value={dueDate}
                  min={format(new Date(), "yyyy-MM-dd")}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-xl pl-9 pr-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                />
                {dueDate && (
                  <button onClick={() => setDueDate("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <X size={13} />
                  </button>
                )}
              </div>
            )}

            {scheduleType === 'days' && (
              <div className="flex items-center gap-3 bg-secondary rounded-xl px-4 py-2.5">
                <span className="text-sm text-muted-foreground font-medium">Pendant</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setRepeatDays(d => Math.max(2, d - 1))}
                    className="w-7 h-7 rounded-lg bg-card border border-border font-black text-sm flex items-center justify-center hover:bg-secondary transition-colors"
                  >−</button>
                  <span className="text-base font-black text-foreground w-4 text-center">{repeatDays}</span>
                  <button
                    onClick={() => setRepeatDays(d => Math.min(14, d + 1))}
                    className="w-7 h-7 rounded-lg bg-card border border-border font-black text-sm flex items-center justify-center hover:bg-secondary transition-colors"
                  >+</button>
                </div>
                <span className="text-sm text-muted-foreground font-medium">jours</span>
              </div>
            )}
          </div>

          {error && (
            <p className="text-xs text-destructive font-bold bg-destructive/8 rounded-xl px-3 py-2">{error}</p>
          )}
        </div>

        {/* Sticky submit */}
        <div className="flex-shrink-0 px-5 py-4 border-t border-border bg-card">
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || selectedChildren.length === 0}
            className="w-full bg-primary text-primary-foreground font-black py-3 rounded-2xl text-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Créer la mission · +{effectiveXp} XP
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
