import { ChangeEvent, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { FACTIONS, LOCKED_CONTENT, RANK_THRESHOLDS, getFaction } from "./data/factions";
import { createHistory, defaultRunState, loadRunState, saveRunState } from "./state";
import { ContentCategory, ContentItem, ContentStatus, Duty, Faction, FactionId, RankName, RunState } from "./types";

const STARTING_FAVOR = 1250;
const CONTENT_LABELS: Record<ContentCategory, string> = {
  regions: "Regions",
  skills: "Skills",
  gear: "Gear & Items",
  themes: "Themes & Activities"
};

function formatNumber(value: number): string {
  return value.toLocaleString("en-GB");
}

function rankForFavor(favor: number): RankName {
  return RANK_THRESHOLDS.reduce<RankName>((rank, threshold) => (favor >= threshold.favor ? threshold.name : rank), "Neutral");
}

function nextRankForFavor(favor: number) {
  return RANK_THRESHOLDS.find((threshold) => threshold.favor > favor);
}

function percent(value: number, max: number): number {
  if (!max) return 0;
  return Math.min(100, Math.round((value / max) * 100));
}

function mergeContent(factions: Faction[], category: ContentCategory): ContentItem[] {
  const byName = new Map<string, ContentItem>();
  factions.forEach((faction) => {
    faction[category].forEach((item) => {
      const existing = byName.get(item.name);
      if (!existing || existing.status === "locked" || item.status === "allowed") {
        byName.set(item.name, { ...item, status: item.status || "allowed" });
      }
    });
  });
  LOCKED_CONTENT[category].forEach((item) => {
    if (!byName.has(item.name)) byName.set(item.name, item);
  });
  return Array.from(byName.values()).sort((a, b) => a.name.localeCompare(b.name));
}

function timeAgo(timestamp: number): string {
  const minutes = Math.max(1, Math.round((Date.now() - timestamp) / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

function buildExport(run: RunState): string {
  return JSON.stringify({ app: "OSRS-Favorbound-Companion", version: 2, run }, null, 2);
}

function App() {
  const [run, setRun] = useState<RunState>(() => loadRunState());
  const [draftName, setDraftName] = useState(run.runName || "Ashen Pact");
  const [draftFaction, setDraftFaction] = useState<FactionId>("druids");
  const [selectedFactionId, setSelectedFactionId] = useState<FactionId>("druids");
  const [contentFilter, setContentFilter] = useState<ContentStatus | "all">("all");
  const [activeCategory, setActiveCategory] = useState<ContentCategory>("regions");
  const [toast, setToast] = useState("");
  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    saveRunState(run);
  }, [run]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 1800);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const activeFactionIds = useMemo(() => {
    return [run.startingFactionId, ...run.alliedFactionIds].filter(Boolean) as FactionId[];
  }, [run.startingFactionId, run.alliedFactionIds]);

  const activeFactions = useMemo(() => {
    return activeFactionIds.map((id) => getFaction(id)).filter(Boolean) as Faction[];
  }, [activeFactionIds]);

  const selectedFaction = getFaction(selectedFactionId) || getFaction(run.startingFactionId) || FACTIONS[0];
  const originFaction = getFaction(run.startingFactionId);
  const lockedFactions = FACTIONS.filter((faction) => !activeFactionIds.includes(faction.id));
  const nextAlliance = lockedFactions[0];
  const nextRank = nextRankForFavor(run.favor);

  const allowedContent = useMemo(() => {
    return {
      regions: mergeContent(activeFactions, "regions"),
      skills: mergeContent(activeFactions, "skills"),
      gear: mergeContent(activeFactions, "gear"),
      themes: mergeContent(activeFactions, "themes")
    };
  }, [activeFactions]);

  function updateRun(updater: (current: RunState) => RunState) {
    setRun((current) => updater(current));
  }

  function startRun() {
    const faction = getFaction(draftFaction);
    const runName = draftName.trim() || "Favorbound Run";
    setRun({
      ...defaultRunState,
      runName,
      startingFactionId: draftFaction,
      favor: STARTING_FAVOR,
      factionFavor: { [draftFaction]: STARTING_FAVOR },
      settings: run.settings,
      history: [
        createHistory("Run bound", `${runName} swore first loyalty to ${faction?.name}.`),
        createHistory("Origin favor granted", `${faction?.name} began at Trusted rank with ${formatNumber(STARTING_FAVOR)} Favor.`)
      ]
    });
    setSelectedFactionId(draftFaction);
  }

  function addFavor(factionId: FactionId, amount = run.settings.favorStep, reason = "Manual Favor award") {
    const faction = getFaction(factionId);
    updateRun((current) => ({
      ...current,
      favor: current.favor + amount,
      factionFavor: {
        ...current.factionFavor,
        [factionId]: (current.factionFavor[factionId] || 0) + amount
      },
      history: [createHistory("Favor earned", `${faction?.name}: ${reason} (+${formatNumber(amount)})`), ...current.history]
    }));
  }

  function advanceDuty(faction: Faction, duty: Duty, amount: number) {
    const currentProgress = run.dutyProgress[duty.id] || 0;
    const nextProgress = Math.min(duty.target, currentProgress + amount);
    const completedNow = nextProgress >= duty.target && !run.completedDutyIds.includes(duty.id);

    updateRun((current) => ({
      ...current,
      favor: completedNow ? current.favor + duty.favor : current.favor,
      factionFavor: completedNow
        ? { ...current.factionFavor, [faction.id]: (current.factionFavor[faction.id] || 0) + duty.favor }
        : current.factionFavor,
      dutyProgress: { ...current.dutyProgress, [duty.id]: nextProgress },
      completedDutyIds: completedNow ? [...current.completedDutyIds, duty.id] : current.completedDutyIds,
      history: completedNow
        ? [createHistory("Duty completed", `${faction.name}: ${duty.label} (+${formatNumber(duty.favor)} Favor)`), ...current.history]
        : current.history
    }));
  }

  function unlockAlliance(faction: Faction) {
    if (run.favor < faction.allianceCost || activeFactionIds.includes(faction.id)) return;
    updateRun((current) => ({
      ...current,
      alliedFactionIds: [...current.alliedFactionIds, faction.id],
      factionFavor: { ...current.factionFavor, [faction.id]: current.factionFavor[faction.id] || 0 },
      history: [createHistory("Alliance unlocked", `${faction.name} joined at ${formatNumber(faction.allianceCost)} total Favor.`), ...current.history]
    }));
    setSelectedFactionId(faction.id);
  }

  function resetRun() {
    setRun({ ...defaultRunState, settings: run.settings });
    setDraftName("Ashen Pact");
    setDraftFaction("druids");
    setSelectedFactionId("druids");
  }

  async function exportRun() {
    const summary = buildExport(run);
    const blob = new Blob([summary], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${run.runName || "favorbound-run"}.json`.replace(/[^a-z0-9._-]+/gi, "-");
    link.click();
    URL.revokeObjectURL(url);
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(summary);
      setToast("Run export downloaded and copied");
    } else {
      setToast("Run export downloaded");
    }
  }

  function importRun(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || "{}"));
        const nextRun = parsed.run || parsed;
        setRun({ ...defaultRunState, ...nextRun, settings: { ...defaultRunState.settings, ...(nextRun.settings || {}) } });
        setToast("Run imported");
      } catch {
        setToast("Import failed");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  function updateFavorStep(value: number) {
    updateRun((current) => ({
      ...current,
      settings: { ...current.settings, favorStep: Math.max(25, Math.min(1000, value || 25)) }
    }));
  }

  function toggleStrictMode() {
    updateRun((current) => ({
      ...current,
      settings: { ...current.settings, strictMode: !current.settings.strictMode }
    }));
  }

  if (!run.startingFactionId) {
    return (
      <main className="setup-view">
        <section className="setup-card">
          <div className="brand-lockup">
            <div className="compass-mark">FB</div>
            <div>
              <h1>Favorbound Companion</h1>
              <p>Faction-locked OSRS account tracker</p>
            </div>
          </div>
          <label className="field">
            <span>Run name</span>
            <input value={draftName} onChange={(event) => setDraftName(event.target.value)} />
          </label>
          <div className="origin-grid">
            {FACTIONS.map((faction) => (
              <button
                key={faction.id}
                className={`origin-card ${draftFaction === faction.id ? "is-selected" : ""}`}
                style={{ "--accent": faction.accent } as CSSProperties}
                type="button"
                onClick={() => setDraftFaction(faction.id)}
              >
                <span className="sigil-disc">{faction.sigil}</span>
                <strong>{faction.name}</strong>
                <span>{faction.tagline}</span>
              </button>
            ))}
          </div>
          <button className="primary-action" type="button" onClick={startRun}>Begin Run</button>
        </section>
      </main>
    );
  }

  return (
    <main className="ledger-shell">
      <header className="top-bar">
        <div className="brand-lockup">
          <div className="compass-mark">FB</div>
          <div>
            <h1>Favorbound Companion</h1>
            <p>Faction-Locked Account Tracker</p>
          </div>
        </div>
        <label className="run-name">
          <span>Run name</span>
          <input value={run.runName} onChange={(event) => updateRun((current) => ({ ...current, runName: event.target.value }))} />
        </label>
        <StatTile label="Favor" value={formatNumber(run.favor)} tone="green" />
        <StatTile label="Active factions" value={`${activeFactions.length} / ${FACTIONS.length}`} />
        <div className="top-actions">
          <button type="button" onClick={resetRun}>Reset Run</button>
          <button type="button" onClick={exportRun}>Export</button>
          <button type="button" onClick={() => importInputRef.current?.click()}>Import</button>
          <input ref={importInputRef} className="hidden-input" type="file" accept="application/json,.json" onChange={importRun} />
        </div>
      </header>

      <section className="workspace-grid">
        <aside className="faction-sidebar">
          <PanelTitle title="Factions" />
          <div className="faction-list">
            {FACTIONS.map((faction) => {
              const isOrigin = run.startingFactionId === faction.id;
              const isAllied = run.alliedFactionIds.includes(faction.id);
              const isActive = isOrigin || isAllied;
              const factionFavor = run.factionFavor[faction.id] || 0;
              return (
                <button
                  key={faction.id}
                  className={`faction-row ${selectedFactionId === faction.id ? "is-selected" : ""} ${isActive ? "is-active" : "is-locked"}`}
                  style={{ "--accent": faction.accent } as CSSProperties}
                  type="button"
                  onClick={() => setSelectedFactionId(faction.id)}
                >
                  <span className="sigil-disc">{faction.sigil}</span>
                  <span className="faction-copy">
                    <strong>{faction.name}</strong>
                    <em>{isOrigin ? "Origin" : isAllied ? "Allied" : "Locked"}</em>
                    <small>{faction.tagline}</small>
                  </span>
                  <span className="faction-meta">
                    <strong>{formatNumber(factionFavor)}</strong>
                    <small>{isActive ? rankForFavor(factionFavor) : `Unlock at ${formatNumber(faction.allianceCost)}`}</small>
                  </span>
                </button>
              );
            })}
          </div>
          <section className="guide-card">
            <strong>Faction Guide</strong>
            <p>{selectedFaction.ethos}</p>
          </section>
        </aside>

        <section className="ledger-panel">
          <div className="ledger-heading">
            <PanelTitle title="Allowed Content" />
            <div className="ledger-controls">
              <select value={activeCategory} onChange={(event) => setActiveCategory(event.target.value as ContentCategory)}>
                {Object.entries(CONTENT_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
              </select>
              <select value={contentFilter} onChange={(event) => setContentFilter(event.target.value as ContentStatus | "all")}>
                <option value="all">View: All</option>
                <option value="allowed">Allowed</option>
                <option value="conditional">Conditional</option>
                <option value="locked">Locked</option>
              </select>
            </div>
          </div>
          <div className="parchment">
            {(Object.keys(CONTENT_LABELS) as ContentCategory[]).map((category) => (
              <ContentSection
                key={category}
                category={category}
                title={CONTENT_LABELS[category]}
                items={allowedContent[category]}
                filter={contentFilter}
                isMuted={activeCategory !== category}
              />
            ))}
          </div>
          <div className="legend-row">
            <span><i className="status-dot allowed" />Allowed</span>
            <span><i className="status-dot conditional" />Conditional</span>
            <span><i className="status-dot locked" />Locked</span>
            <button type="button" onClick={() => setContentFilter("all")}>View Full Rules</button>
          </div>
        </section>

        <aside className="right-rail">
          <section className="panel favor-panel">
            <PanelTitle title="Favor Tracker" />
            <div className="favor-total">
              <span>Total Favor</span>
              <strong>{formatNumber(run.favor)}</strong>
              <small>{nextRank ? `${formatNumber(nextRank.favor - run.favor)} to ${nextRank.name}` : "Max rank threshold reached"}</small>
            </div>
            <ProgressBar value={run.favor} max={nextRank?.favor || run.favor || 1} tone="green" />
            <div className="breakdown-list">
              {activeFactions.map((faction) => {
                const factionFavor = run.factionFavor[faction.id] || 0;
                return (
                  <div className="breakdown-row" key={faction.id}>
                    <span>{faction.name}</span>
                    <ProgressBar value={factionFavor} max={Math.max(run.favor, 1)} tone="gold" />
                    <strong>{formatNumber(factionFavor)}</strong>
                  </div>
                );
              })}
            </div>
            <div className="favor-controls">
              <button type="button" onClick={() => addFavor(selectedFaction.id)}>+{formatNumber(run.settings.favorStep)} Favor</button>
              <input
                aria-label="Manual Favor step"
                type="number"
                min="25"
                max="1000"
                step="25"
                value={run.settings.favorStep}
                onChange={(event) => updateFavorStep(Number(event.target.value))}
              />
            </div>
          </section>

          <section className="panel planner-panel">
            <PanelTitle title="Alliance Unlock Planner" />
            {nextAlliance ? (
              <>
                <div className="planner-target">
                  <span className="sigil-disc" style={{ "--accent": nextAlliance.accent } as CSSProperties}>{nextAlliance.sigil}</span>
                  <div>
                    <strong>{nextAlliance.name}</strong>
                    <small>{formatNumber(Math.max(0, nextAlliance.allianceCost - run.favor))} Favor remaining</small>
                  </div>
                </div>
                <ProgressBar value={run.favor} max={nextAlliance.allianceCost} tone="red" />
                <button type="button" disabled={run.favor < nextAlliance.allianceCost} onClick={() => unlockAlliance(nextAlliance)}>
                  {run.favor >= nextAlliance.allianceCost ? "Forge Alliance" : `Unlock at ${formatNumber(nextAlliance.allianceCost)}`}
                </button>
              </>
            ) : (
              <p>All factions are allied. The account is fully favorbound.</p>
            )}
          </section>

          <section className="panel duties-panel">
            <PanelTitle title="Duties" />
            {selectedFaction.duties.map((duty) => {
              const progress = run.dutyProgress[duty.id] || 0;
              const done = run.completedDutyIds.includes(duty.id);
              return (
                <article className={`duty-row ${done ? "is-done" : ""}`} key={duty.id}>
                  <div>
                    <strong>{duty.label}</strong>
                    <small>{duty.detail}</small>
                  </div>
                  <span>{formatNumber(progress)} / {formatNumber(duty.target)} {duty.unit}</span>
                  <ProgressBar value={progress} max={duty.target} tone={done ? "green" : "gold"} />
                  <div className="duty-actions">
                    <button type="button" disabled={done} onClick={() => advanceDuty(selectedFaction, duty, 1)}>+1</button>
                    <button type="button" disabled={done} onClick={() => advanceDuty(selectedFaction, duty, Math.max(5, Math.ceil(duty.target / 4)))}>Chunk</button>
                  </div>
                </article>
              );
            })}
          </section>

          <section className="panel history-panel">
            <PanelTitle title="History Feed" />
            <div className="history-list">
              {run.history.slice(0, 7).map((entry) => (
                <article key={entry.id}>
                  <strong>{entry.message}</strong>
                  <span>{timeAgo(entry.timestamp)}</span>
                  <p>{entry.detail}</p>
                </article>
              ))}
            </div>
          </section>
        </aside>
      </section>

      <footer className="bottom-bar">
        <span>Last Saved: auto-save on</span>
        <button type="button" onClick={() => setSelectedFactionId(originFaction?.id || "druids")}>Rules</button>
        <button type="button" onClick={toggleStrictMode}>{run.settings.strictMode ? "Strict mode on" : "Strict mode off"}</button>
        <button type="button" onClick={exportRun}>Backup Run</button>
        <span>v2.0.0</span>
      </footer>
      {toast ? <div className="toast">{toast}</div> : null}
    </main>
  );
}

function StatTile({ label, value, tone }: { label: string; value: string; tone?: "green" }) {
  return (
    <div className={`stat-tile ${tone || ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function PanelTitle({ title }: { title: string }) {
  return (
    <div className="panel-title">
      <h2>{title}</h2>
    </div>
  );
}

function ProgressBar({ value, max, tone }: { value: number; max: number; tone: "green" | "gold" | "red" }) {
  return (
    <div className={`progress ${tone}`}>
      <span style={{ width: `${percent(value, max)}%` }} />
    </div>
  );
}

function ContentSection({
  category,
  title,
  items,
  filter,
  isMuted
}: {
  category: ContentCategory;
  title: string;
  items: ContentItem[];
  filter: ContentStatus | "all";
  isMuted: boolean;
}) {
  const visibleItems = filter === "all" ? items : items.filter((item) => (item.status || "allowed") === filter);
  return (
    <section className={`content-section ${isMuted ? "is-muted" : ""}`}>
      <h3>{title}</h3>
      <div className={`content-grid ${category}`}>
        {visibleItems.map((item) => {
          const status = item.status || "allowed";
          return (
            <span className={`content-item ${status}`} key={item.name}>
              <i className={`status-box ${status}`} />
              {item.name}
            </span>
          );
        })}
      </div>
    </section>
  );
}

export default App;
