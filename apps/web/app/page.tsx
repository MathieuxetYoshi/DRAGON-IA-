"use client";

import { useEffect, useState } from "react";

type Agent = { id: string; name: string; specialty: string; status: string; description: string };
type Task = { id: string; title: string; description: string; status: string; created_at: string };

const API = process.env.NEXT_PUBLIC_API_URL ??
const TENANT = process.env.NEXT_PUBLIC_DEMO_TENANT ?? "entreprise-demo";

export default function Dashboard() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function refresh() {
    try {
      const headers = { "X-Tenant-ID": TENANT };
      const [a, t] = await Promise.all([
        fetch(`${API}/api/v1/agents`, { headers }),
        fetch(`${API}/api/v1/tasks`, { headers }),
      ]);
      if (!a.ok || !t.ok) throw new Error("API indisponible");
      setAgents(await a.json());
      setTasks(await t.json());
      setError("");
    } catch {
      setError("Impossible de joindre l'API. Vérifie que le serveur FastAPI tourne sur le port 8000.");
    }
  }

  useEffect(() => { refresh(); }, []);

  async function createTask(e: React.FormEvent) {
    e.preventDefault();
    if (title.trim().length < 3) return;
    setLoading(true);
    try {
      const response = await fetch(`${API}/api/v1/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Tenant-ID": TENANT },
        body: JSON.stringify({ title, description }),
      });
      if (!response.ok) throw new Error("Création impossible");
      setTitle("");
      setDescription("");
      await refresh();
    } catch {
      setError("La mission n'a pas pu être créée.");
    } finally {
      setLoading(false);
    }
  }

  const online = agents.filter((a) => a.status === "online").length;

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">D</span><span>DRAGON<span className="brand-light"> IA</span></span></div>
        <div className="nav-label">ESPACE DE TRAVAIL</div>
        <a className="nav active">◈　Vue générale</a>
        <a className="nav">⌘　Agents IA</a>
        <a className="nav">▤　Missions</a>
        <a className="nav">◷　Historique</a>
        <div className="sidebar-bottom"><div className="avatar">ED</div><div><b>Entreprise démo</b><small>Administrateur</small></div></div>
      </aside>

      <section className="content">
        <header className="topbar"><div><span className="eyebrow">PLATEFORME ENTREPRISE</span><h1>Vue générale</h1></div><div className="top-actions"><span className="status-dot"/> Système opérationnel <div className="user-chip">ED</div></div></header>

        <section className="hero">
          <div className="hero-copy"><span className="eyebrow">INTELLIGENCE ARTIFICIELLE • ENTREPRISE</span><h2>Votre intelligence.<br/><em>Sans limites.</em></h2><p>Coordonnez vos agents IA, pilotez vos missions et transformez vos opérations.</p><a href="#new-task" className="primary-link">Créer une mission <span>↗</span></a></div>
          <div className="orb-wrap"><div className="orb"><div className="orb-core">D</div></div><div className="orb-caption">DRAGON CORE <span>● EN LIGNE</span></div></div>
          <div className="hero-grid"/>
        </section>

        {error && <div className="error">{error}</div>}

        <section className="metrics">
          <Metric label="Agents disponibles" value={`${online}/${agents.length}`} note="Agents connectés"/>
          <Metric label="Missions enregistrées" value={String(tasks.length)} note="Dans cet espace de démonstration"/>
          <Metric label="Entreprise active" value="01" note="Espace de travail actuel"/>
        </section>

        <section className="section-head"><div><span className="eyebrow">VOTRE ÉCOSYSTÈME</span><h2>Agents intelligents</h2></div><span className="muted">Vue des agents</span></section>
        <section className="agent-grid">
          {agents.map((agent) => <article className="agent-card" key={agent.id}><div className="agent-icon">{agent.id === "director" ? "✳" : agent.id === "knowledge" ? "▤" : agent.id === "business" ? "⌁" : "⟳"}</div><div className="agent-status"><i className={agent.status === "online" ? "online" : ""}/>{agent.status === "online" ? "EN LIGNE" : "BIENTÔT"}</div><h3>{agent.name}</h3><span className="specialty">{agent.specialty}</span><p>{agent.description}</p></article>)}
        </section>

        <section className="lower-grid">
          <article className="panel" id="new-task"><div className="section-head compact"><div><span className="eyebrow">ORCHESTRATION</span><h2>Nouvelle mission</h2></div><span className="panel-icon">＋</span></div>
            <form onSubmit={createTask}><label>Titre de la mission</label><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex. Préparer le rapport trimestriel" required minLength={3}/><label>Instructions</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Décrivez l'objectif et le résultat attendu..." rows={3}/><button disabled={loading}>{loading ? "Création..." : "Créer la mission　→"}</button></form>
          </article>
          <article className="panel"><div className="section-head compact"><div><span className="eyebrow">ACTIVITÉ</span><h2>Missions récentes</h2></div></div>
            {tasks.length === 0 ? <div className="empty"><span>◷</span><b>Aucune mission pour le moment</b><small>Créez votre première mission pour commencer.</small></div> : <div className="task-list">{tasks.map(t => <div className="task-row" key={t.id}><div><b>{t.title}</b><small>{new Date(t.created_at).toLocaleString("fr-FR")}</small></div><span className="tag">{t.status}</span></div>)}</div>}
          </article>
        </section>
        <footer>DRAGON IA <span>•</span> Starter de démonstration — ne pas utiliser avec des données sensibles.</footer>
      </section>
    </main>
  );
}

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return <article className="metric"><span>{label}</span><strong>{value}</strong><small>{note}</small></article>;
}
