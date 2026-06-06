import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { FACTIONS, getFaction } from "./data/factions";
import { createHistory, defaultRunState, loadRunState, saveRunState } from "./state";
import { Faction, FactionId, RunState } from "./types";

const FAVOR_GAIN = 3;

function unique(values: string[]): string[] {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
}

function App() {
  const [run, setRun] = useState<RunState>(() => loadRunState());
  const [draftName, setDraftName] = useState(run.runName || "Ashen Pact");
  const [draftFaction, setDraftFaction] = useState<FactionId>("druids");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    saveRunState(run);
  }, [run]);

  const activeFactionIds = useMemo(() => {
    return [run.startingFactionId, ...run.alliedFactionIds].filter(Boolean) as FactionId[];
  }, [run.startingFactionId, run.alliedFactionIds]);

  const activeFactions = useMemo(() => {
    return activeFactionIds.map((id) => getFaction(id)).filter(Boolean) as Faction[];
  }, [activeFactionIds]);

  const allowedContent = useMemo(() => {
    return {
      themes: unique(activeFactions.flatMap((faction) => faction.allowedThemes)),
      regions: unique(activeFactions.flatMap((faction) => faction.regions)),
      skills: unique(activeFactions.flatMap((faction) => faction.skills)),
      gear: unique(activeFactions.flatMap((faction) => faction.gear))
    };
  }, [activeFactions]);

  const lockedFactions = FACTIONS.filter((faction) => !activeFactionIds.includes(faction.id));
  const startingFaction = getFaction(run.startingFactionId);

  function startRun() {
    const faction = getFaction(draftFaction);
    setRun({
      ...defaultRunState,
      runName: draftName.trim() || "Favorbound Run",
      startingFactionId: draftFaction,
      history: [
        createHistory("Run bound", `${draftName.trim() || "Favorbound Run"} swore first loyalty to ${faction?.name}.`)
      ]
    });
  }

  function addFavor(reason: string, amount = FAVOR_GAIN) {
    setRun((current) => ({
      ...current,
      favor: current.favor + amount,
      history: [createHistory("Favor earned", `${reason} (+${amount} Favor)`), ...current.history]
    }));
  }

  function completeDuty(faction: Faction, dutyId: string) {
    const duty = faction.duties.find((item) => item.id === dutyId);
    if (!duty || run.completedDutyIds.includes(dutyId)) return;
    setRun((current) => ({
      ...current,
      favor: current.favor + duty.favor,
      completedDutyIds: [...current.completedDutyIds, dutyId],
      history: [createHistory("Duty completed", `${faction.name}: ${duty.label} (+${duty.favor} Favor)`), ...current.history]
    }));
  }

  function unlockAlliance(faction: Faction) {
    if (run.favor < faction.allianceCost || activeFactionIds.includes(faction.id)) return;
    setRun((current) => ({
      ...current,
      favor: current.favor - faction.allianceCost,
      alliedFactionIds: [...current.alliedFactionIds, faction.id],
      history: [createHistory("Alliance forged", `${faction.name} joined the run for ${faction.allianceCost} Favor.`), ...current.history]
    }));
  }

  function resetRun() {
    setRun(defaultRunState);
    setDraftName("Ashen Pact");
    setDraftFaction("druids");
    setCopied(false);
  }

  async function copySummary() {
    const summary = [
      `${run.runName || "Favorbound Run"} | ${run.favor} Favor`,
      `Starting faction: ${startingFaction?.name || "None"}`,
      `Alliances: ${activeFactions.map((faction) => faction.name).join(", ") || "None"}`,
      `Allowed skills: ${allowedContent.skills.join(", ") || "None"}`
    ].join("\n");
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(summary);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  if (!run.startingFactionId) {
    return (
      <main className="app-shell setup-shell">
        <section className="setup-panel">
          <div>
            <p className="system-label">Favorbound Companion</p>
            <h1>Bind the account to its first faction.</h1>
            <p className="lede">
              Choose the group your OSRS account serves first. Their identity defines what content is allowed until
              you earn enough Favor to form alliances.
            </p>
          </div>

          <label className="field">
            <span>Run name</span>
            <input value={draftName} onChange={(event) => setDraftName(event.target.value)} />
          </label>

          <div className="setup-grid">
            {FACTIONS.map((faction) => (
              <button
                key={faction.id}
                className={`setup-card ${draftFaction === faction.id ? "is-selected" : ""}`}
                style={{ "--accent": faction.accent } as CSSProperties}
                type="button"
                onClick={() => setDraftFaction(faction.id)}
              >
                <span className="sigil">{faction.sigil}</span>
                <strong>{faction.name}</strong>
                <span>{faction.tagline}</span>
              </button>
            ))}
          </div>

          <button className="primary-action" type="button" onClick={startRun}>
            Start Favorbound Run
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="run-header">
        <div>
          <p className="system-label">Favorbound Companion</p>
          <h1>{run.runName}</h1>
        </div>
        <div className="run-stats" aria-label="Run stats">
          <article>
            <strong>{run.favor}</strong>
            <span>Favor</span>
          </article>
          <article>
            <strong>{activeFactions.length}</strong>
            <span>Factions</span>
          </article>
          <article>
            <strong>{run.completedDutyIds.length}</strong>
            <span>Duties</span>
          </article>
        </div>
        <div className="header-actions">
          <button type="button" onClick={copySummary}>{copied ? "Copied" : "Copy summary"}</button>
          <button type="button" className="danger" onClick={resetRun}>Reset</button>
        </div>
      </header>

      <section className="command-grid">
        <section className="panel faction-panel">
          <div className="panel-heading">
            <span>Factions</span>
            <strong>{startingFaction?.name} origin</strong>
          </div>
          <div className="faction-list">
            {FACTIONS.map((faction) => (
              <FactionCard
                key={faction.id}
                faction={faction}
                state={run.startingFactionId === faction.id ? "origin" : run.alliedFactionIds.includes(faction.id) ? "allied" : "locked"}
                favor={run.favor}
                onUnlock={() => unlockAlliance(faction)}
              />
            ))}
          </div>
        </section>

        <section className="panel allowed-panel">
          <div className="panel-heading">
            <span>Allowed Content</span>
            <strong>{activeFactions.map((faction) => faction.name).join(" + ")}</strong>
          </div>
          <AllowedGroup title="Themes" items={allowedContent.themes} />
          <AllowedGroup title="Regions" items={allowedContent.regions} />
          <AllowedGroup title="Skills" items={allowedContent.skills} />
          <AllowedGroup title="Gear logic" items={allowedContent.gear} />
        </section>

        <aside className="side-stack">
          <section className="panel favor-panel">
            <div className="panel-heading">
              <span>Favor</span>
              <strong>Earn and spend loyalty</strong>
            </div>
            <button type="button" className="primary-action" onClick={() => addFavor("Manual favor award")}>
              Add {FAVOR_GAIN} Favor
            </button>
            <p>Use manual Favor for player-defined milestones, quest completions, or session awards.</p>
          </section>

          <section className="panel duties-panel">
            <div className="panel-heading">
              <span>Duties</span>
              <strong>Faction work</strong>
            </div>
            {activeFactions.map((faction) => (
              <div className="duty-group" key={faction.id}>
                <h3>{faction.name}</h3>
                {faction.duties.map((duty) => {
                  const done = run.completedDutyIds.includes(duty.id);
                  return (
                    <button
                      type="button"
                      key={duty.id}
                      className={`duty ${done ? "is-done" : ""}`}
                      onClick={() => completeDuty(faction, duty.id)}
                      disabled={done}
                    >
                      <span>{duty.label}</span>
                      <strong>{done ? "Done" : `+${duty.favor}`}</strong>
                    </button>
                  );
                })}
              </div>
            ))}
          </section>

          <section className="panel history-panel">
            <div className="panel-heading">
              <span>History</span>
              <strong>Run trail</strong>
            </div>
            <div className="history-list">
              {run.history.length ? run.history.slice(0, 8).map((entry) => (
                <article key={entry.id}>
                  <strong>{entry.message}</strong>
                  <p>{entry.detail}</p>
                </article>
              )) : <p>No actions recorded yet.</p>}
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}

function FactionCard({
  faction,
  state,
  favor,
  onUnlock
}: {
  faction: Faction;
  state: "origin" | "allied" | "locked";
  favor: number;
  onUnlock: () => void;
}) {
  const canUnlock = state === "locked" && favor >= faction.allianceCost;
  return (
    <article className={`faction-card ${state}`} style={{ "--accent": faction.accent } as CSSProperties}>
      <div className="faction-top">
        <span className="sigil">{faction.sigil}</span>
        <span className="state-label">{state === "origin" ? "Origin" : state === "allied" ? "Allied" : "Locked"}</span>
      </div>
      <h2>{faction.name}</h2>
      <p>{faction.ethos}</p>
      {state === "locked" ? (
        <button type="button" onClick={onUnlock} disabled={!canUnlock}>
          {canUnlock ? `Forge alliance (${faction.allianceCost})` : `${faction.allianceCost} Favor needed`}
        </button>
      ) : (
        <div className="active-note">{faction.tagline}</div>
      )}
    </article>
  );
}

function AllowedGroup({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="allowed-group">
      <h3>{title}</h3>
      <div className="chip-list">
        {items.map((item) => <span key={item}>{item}</span>)}
      </div>
    </section>
  );
}

export default App;
