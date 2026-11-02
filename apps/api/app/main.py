from datetime import datetime, timezone
from enum import Enum
from uuid import uuid4

from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(
    title="DRAGON IA API",
    version="0.1.0",
    description="API de démonstration du SaaS DRAGON IA. Ne pas utiliser en production sans authentification.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TaskStatus(str, Enum):
    pending = "pending"
    running = "running"
    needs_approval = "needs_approval"
    completed = "completed"


class Agent(BaseModel):
    id: str
    name: str
    specialty: str
    status: str
    description: str


class TaskCreate(BaseModel):
    title: str = Field(min_length=3, max_length=160)
    description: str = Field(default="", max_length=5000)


class Task(BaseModel):
    id: str
    tenant_id: str
    title: str
    description: str
    status: TaskStatus
    created_at: datetime


AGENTS = [
    Agent(id="director", name="Dragon Director", specialty="Orchestration", status="online",
          description="Comprend les objectifs et répartit les missions."),
    Agent(id="knowledge", name="Dragon Knowledge", specialty="Documents", status="online",
          description="Recherche et synthétise les documents autorisés."),
    Agent(id="business", name="Dragon Business", specialty="Analyse métier", status="planned",
          description="Prépare des analyses et rapports métier."),
    Agent(id="automation", name="Dragon Automation", specialty="Automatisation", status="planned",
          description="Exécute les workflows explicitement autorisés."),
]

# Stockage temporaire de démonstration. Remplacer par PostgreSQL avant un pilote réel.
TASKS: dict[str, list[Task]] = {}


def tenant_context(x_tenant_id: str | None) -> str:
    # En production, dériver le tenant du jeton OIDC validé côté serveur.
    if not x_tenant_id or len(x_tenant_id) > 80:
        raise HTTPException(status_code=401, detail="Contexte d'entreprise manquant.")
    return x_tenant_id


@app.get("/health")
def health():
    return {"status": "ok", "service": "dragon-ia-api"}


@app.get("/api/v1/agents", response_model=list[Agent])
def list_agents(x_tenant_id: str | None = Header(default=None)):
    tenant_context(x_tenant_id)
    return AGENTS


@app.get("/api/v1/tasks", response_model=list[Task])
def list_tasks(x_tenant_id: str | None = Header(default=None)):
    tenant = tenant_context(x_tenant_id)
    return TASKS.get(tenant, [])


@app.post("/api/v1/tasks", response_model=Task, status_code=201)
def create_task(payload: TaskCreate, x_tenant_id: str | None = Header(default=None)):
    tenant = tenant_context(x_tenant_id)
    task = Task(
        id=str(uuid4()),
        tenant_id=tenant,
        title=payload.title,
        description=payload.description,
        status=TaskStatus.pending,
        created_at=datetime.now(timezone.utc),
    )
    TASKS.setdefault(tenant, []).insert(0, task)
    return task
