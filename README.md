# Vortex AI v0.1 — Frontend Baseline

This is the new Vortex AI starting point based on the selected futuristic blue desktop-assistant concept.

## Current status

This repository now contains a functioning **frontend prototype**. It is not yet a fully operational desktop AI assistant.

Completed in the UI:

- Responsive desktop and mobile navigation
- Theme selection saved locally in the browser
- Functional local chat commands (`open voice`, `show system`, and theme changes)
- Push-to-talk controls using the browser Web Speech API when supported
- Keyboard Spacebar voice shortcut outside text fields
- Online/offline state, notifications, accessible labels and focus states
- Local activity feed, animated demo diagnostics, and clear demo-data labels

Still to be built:

- A local backend / desktop agent and secure API contract
- Speech-to-text fallback for browsers without the Web Speech API
- LLM orchestration, real conversation history, and tool calling
- Permission-aware desktop, file, web, task, and automation integrations
- Real system metrics, persistent data model, tests, and desktop packaging

## Design decisions locked for v0.1

- Option-one style dark space/neural background
- Left vertical navigation
- VORTEX AI ONLINE system status
- Quick Access cards
- Large 3D/neural core visual
- Voice-first layout
- Push-to-Talk control
- 06:00 AM → 06:00 PM day-cycle system
- Theme selector
- AI Assistant Status
- Quick Stats
- System Performance
- Memory Usage
- Active Modules
- Recent Activity
- Voice Status / Voice Activity
- Weather / Notes / Upcoming
- No primary text command box on the home screen

## Run

```bash
npm install
npm run dev
npm run build
```

Then open the Vite local URL.

## Local memory backend

Vortex AI now includes a local FastAPI + SQLite memory service. It stores raw conversations in `backend/data/vortex.db` and only creates long-term memories when you explicitly say `remember …`.

Open two terminals in this project folder.

Terminal 1 — install the Python dependencies once, then start the local backend:

```powershell
python -m pip install -r backend/requirements.txt
npm run backend
```

Terminal 2 — start the frontend:

```powershell
npm run dev
```

The frontend proxies `/api` requests to `http://127.0.0.1:8787`; the service listens only on your own computer.

### Memory commands

- `Remember that I prefer concise answers.` saves a long-term memory.
- `What do you remember about me?` lists saved memories.
- `Forget concise answers.` removes matching memories.
- The Chat sidebar reopens saved conversations.

You can also inspect the API at `http://127.0.0.1:8787/docs` while the backend is running. The API supports listing or deleting individual conversations and memories. Keep the database file private and back it up if you want to preserve Vortex AI’s history.

## Voice replies

Vortex AI can read each assistant reply aloud using the voices installed in your browser or operating system. Voice replies are enabled by default and can be toggled from the Voice screen, dashboard, or Settings. Select **Play voice sample** on the Voice screen to hear the current browser voice.

The default delivery is calm, low-pitched, and British-inspired; it is deliberately not an imitation of any actor or fictional character. Voice settings are saved locally in your browser.

## Recommended implementation phases

1. Define a localhost API contract and connect a Python Vortex AI backend.
2. Add Whisper/STT as a fallback for environments without browser speech recognition.
3. Add LLM orchestration, conversation storage, and audited tool calling.
4. Add permission-aware Windows, files, web, tasks, and automation adapters.
5. Replace simulated diagnostics with backend telemetry and add automated tests.
6. Package the verified app as a desktop application.

The UI intentionally stays separate from the AI backend so the visual layer can evolve without rewriting the assistant.
