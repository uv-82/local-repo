import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
    Activity, Bell, Bot, CalendarClock, ChevronRight, CirclePower, Cpu, FileText,
    Globe2, Headphones, Home, Keyboard, MessageSquare, Mic, Monitor, Moon,
    Search, Settings, ShieldCheck, Sparkles, Sun, Volume2, Waves, X, Zap,
} from "lucide-react";
import "./styles.css";
import "./memory.css";

const nav = [["Home", Home], ["Chat", Bot], ["Voice", Mic], ["System", Activity], ["Tasks", CalendarClock], ["Files", FileText], ["Settings", Settings]];
const capabilities = [["Natural Language", Sparkles], ["Voice Recognition", Mic], ["System Control", Monitor], ["Web Intelligence", Globe2], ["Automation", Zap], ["Data Analysis", Activity]];
const moduleDefinitions = [["Core Engine", Sparkles], ["Voice Module", Mic], ["Memory Bank", FileText], ["Web Access", Globe2], ["Automation", Zap], ["Security Layer", ShieldCheck]];
const themes = [["Cosmic Blue", "blue"], ["Neon Purple", "purple"], ["Matrix Green", "green"], ["Amber Orange", "amber"], ["Crimson Red", "red"]];
const starterActivities = [
    { title: "Interface ready", detail: "VORTEX frontend session started", time: "Just now" },
    { title: "System scan", detail: "Demo diagnostics loaded", time: "Just now" },
    { title: "Voice module", detail: "Push-to-talk controls armed", time: "Just now" },
    { title: "Privacy check", detail: "No cloud services are connected", time: "Just now" },
    { title: "Theme engine", detail: "Five local color themes available", time: "Just now" },
];

const clamp = (number, min, max) => Math.max(min, Math.min(max, number));
const activityTime = () => new Intl.DateTimeFormat([], { hour: "2-digit", minute: "2-digit" }).format(new Date());

function App() {
    const [page, setPage] = useState("Home");
    const [online, setOnline] = useState(true);
    const [listening, setListening] = useState(false);
    const [theme, setTheme] = useState(() => localStorage.getItem("vortex-theme") || "blue");
    const [now, setNow] = useState(new Date());
    const [stats, setStats] = useState({ cpu: 23, ram: 46, gpu: 31, disk: 38 });
    const [transcript, setTranscript] = useState("Press and hold Space, or use the microphone button.");
    const [voiceSupported, setVoiceSupported] = useState(true);
    const [notice, setNotice] = useState("");
    const [activities, setActivities] = useState(starterActivities);
    const [activeCoreTab, setActiveCoreTab] = useState("Core");
    const [messages, setMessages] = useState([{ id: 1, role: "assistant", text: "VORTEX is running locally. I can help you explore this interface, switch themes, or open a module." }]);
    const [conversationId, setConversationId] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [memoryStatus, setMemoryStatus] = useState("checking");
    const [voiceReplies, setVoiceReplies] = useState(() => localStorage.getItem("vortex-voice-replies") !== "off");
    const [speaking, setSpeaking] = useState(false);
    const recognitionRef = useRef(null);

    const addActivity = (title, detail) => setActivities(current => [{ title, detail, time: activityTime() }, ...current].slice(0, 5));
    const showNotice = message => setNotice(message);
    const speakText = (text, force = false) => {
        if ((!voiceReplies && !force) || !("speechSynthesis" in window)) return;
        const speech = window.speechSynthesis;
        speech.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = speech.getVoices();
        utterance.voice = voices.find(voice => voice.lang.toLowerCase().startsWith("en-gb")) || voices.find(voice => voice.lang.toLowerCase().startsWith("en")) || null;
        utterance.lang = utterance.voice?.lang || "en-GB";
        utterance.rate = 0.92;
        utterance.pitch = 0.86;
        utterance.volume = 0.95;
        utterance.onstart = () => setSpeaking(true);
        utterance.onend = utterance.onerror = () => setSpeaking(false);
        speech.speak(utterance);
    };
    const toggleVoiceReplies = () => {
        setVoiceReplies(enabled => {
            const next = !enabled;
            if (!next && "speechSynthesis" in window) window.speechSynthesis.cancel();
            showNotice(next ? "Voice replies enabled: British-inspired assistant tone." : "Voice replies disabled.");
            return next;
        });
    };

    useEffect(() => {
        const timer = window.setInterval(() => setNow(new Date()), 1000);
        return () => window.clearInterval(timer);
    }, []);

    useEffect(() => {
        const timer = window.setInterval(() => setStats({
            cpu: clamp(Math.round(20 + Math.random() * 18), 8, 85), ram: clamp(Math.round(43 + Math.random() * 9), 8, 85),
            gpu: clamp(Math.round(27 + Math.random() * 14), 8, 85), disk: clamp(Math.round(33 + Math.random() * 8), 8, 85),
        }), 1600);
        return () => window.clearInterval(timer);
    }, []);

    useEffect(() => localStorage.setItem("vortex-theme", theme), [theme]);
    useEffect(() => localStorage.setItem("vortex-voice-replies", String(voiceReplies)), [voiceReplies]);
    useEffect(() => () => { if ("speechSynthesis" in window) window.speechSynthesis.cancel(); }, []);
    useEffect(() => {
        if (!notice) return undefined;
        const timer = window.setTimeout(() => setNotice(""), 4200);
        return () => window.clearTimeout(timer);
    }, [notice]);

    useEffect(() => {
        let active = true;
        const checkMemoryService = async () => {
            try {
                const response = await fetch("/api/health");
                if (!response.ok) throw new Error("Memory service unavailable");
                if (active) setMemoryStatus("connected");
            } catch {
                if (active) setMemoryStatus("offline");
            }
        };
        checkMemoryService();
        const timer = window.setInterval(checkMemoryService, 30_000);
        return () => { active = false; window.clearInterval(timer); };
    }, []);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) { setVoiceSupported(false); return undefined; }
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = navigator.language || "en-US";
        recognition.onstart = () => { setListening(true); setTranscript("Listening for your command…"); };
        recognition.onresult = event => {
            const text = Array.from(event.results).map(result => result[0].transcript).join("").trim();
            if (text) setTranscript(text);
            if (event.results[event.results.length - 1].isFinal && text) addActivity("Voice command", `Captured “${text.slice(0, 38)}${text.length > 38 ? "…" : ""}”`);
        };
        recognition.onerror = event => {
            const errors = { "not-allowed": "Microphone access was not granted.", "no-speech": "No speech detected. Try again when you are ready.", "audio-capture": "No microphone is available to the browser." };
            setTranscript(errors[event.error] || "Voice input could not start. Please try again.");
            setListening(false);
        };
        recognition.onend = () => setListening(false);
        recognitionRef.current = recognition;
        return () => recognition.abort();
    }, []);

    const stopVoice = () => { recognitionRef.current?.stop(); setListening(false); };
    const startVoice = () => {
        if (!online) { showNotice("Turn VORTEX on before starting voice input."); return; }
        if (!recognitionRef.current) {
            setVoiceSupported(false); setTranscript("Voice recognition is not available in this browser.");
            showNotice("This browser does not provide built-in speech recognition."); return;
        }
        try { recognitionRef.current.start(); setListening(true); } catch { setListening(true); }
    };
    const toggleVoice = () => (listening ? stopVoice() : startVoice());

    useEffect(() => {
        const editable = target => target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
        const down = event => { if (event.code !== "Space" || event.repeat || editable(event.target)) return; event.preventDefault(); startVoice(); };
        const up = event => { if (event.code !== "Space" || editable(event.target)) return; event.preventDefault(); stopVoice(); };
        window.addEventListener("keydown", down); window.addEventListener("keyup", up);
        return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
    }, [listening, online]);
    useEffect(() => { if (!online) stopVoice(); }, [online]);

    const cycle = useMemo(() => {
        const minutes = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
        const raw = clamp((minutes - 360) / 720, 0, 1);
        return { degrees: raw * 180 - 90, isDaytime: minutes >= 360 && minutes <= 1080 };
    }, [now]);
    const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const date = now.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric", year: "numeric" });
    const selectTheme = nextTheme => { setTheme(nextTheme); addActivity("Theme updated", `${themes.find(([, id]) => id === nextTheme)?.[0] || "Custom"} selected`); };
    const runQuickAction = action => {
        const actions = {
            "Open Application": () => { setPage("Files"); showNotice("Application launching will be added with the desktop backend."); },
            "System Control": () => { setPage("System"); showNotice("Showing the current local demo metrics."); },
            "Web Search": () => { setPage("Chat"); showNotice("Use Chat to describe what you want to search for."); },
        };
        actions[action]?.(); addActivity(action, "Opened from Quick Access");
    };
    const selectCoreTab = tab => { setActiveCoreTab(tab); showNotice(`${tab} workspace selected — backend data will appear here when connected.`); };
    const refreshConversations = async () => {
        if (memoryStatus !== "connected") return;
        try {
            const response = await fetch("/api/conversations");
            if (!response.ok) throw new Error("Unable to load conversations");
            setConversations(await response.json());
        } catch {
            setMemoryStatus("offline");
        }
    };
    const startNewConversation = () => {
        setConversationId(null);
        setMessages([{ id: Date.now(), role: "assistant", text: "New local conversation started. Say “remember …” when a detail should be kept for future chats." }]);
    };
    const openConversation = async id => {
        try {
            const response = await fetch(`/api/conversations/${id}`);
            if (!response.ok) throw new Error("Conversation unavailable");
            const data = await response.json();
            setConversationId(data.id);
            setMessages(data.messages.map(message => ({ id: message.id, role: message.role, text: message.content })));
        } catch {
            showNotice("That saved conversation could not be loaded.");
        }
    };
    useEffect(() => { if (page === "Chat") refreshConversations(); }, [page, memoryStatus]);
    const sendMessage = async rawMessage => {
        const text = rawMessage.trim(); if (!text) return;
        const messageId = Date.now(); setMessages(current => [...current, { id: messageId, role: "user", text }]); addActivity("Chat prompt", text.slice(0, 48));
        const normalized = text.toLowerCase(); let localReply = null;
        const navigationRequest = /^(open|show|go to|navigate to)\b/.test(normalized);
        if (navigationRequest && normalized.includes("voice")) { setPage("Voice"); localReply = "I opened Voice. Hold Space or hold the microphone control to use browser speech recognition."; }
        else if (navigationRequest && (normalized.includes("system") || normalized.includes("diagnostic"))) { setPage("System"); localReply = "I opened System. These metrics are simulated until a desktop agent is connected."; }
        else {
            const requested = themes.find(([name, id]) => normalized.includes(id) || normalized.includes(name.toLowerCase()));
            if (requested || normalized.includes("settings") || normalized.includes("theme")) {
                if (requested) selectTheme(requested[1]); else setPage("Settings");
                localReply = requested ? `${requested[0]} is now active and saved on this device.` : "I opened Settings. You can choose a saved interface theme there.";
            } else if (normalized.includes("help")) localReply = "Try “open voice”, “show system”, “remember that I prefer concise answers”, or “forget concise answers”.";
        }
        try {
            const response = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: text, conversation_id: conversationId }) });
            if (!response.ok) throw new Error("Chat request failed");
            const data = await response.json();
            setMemoryStatus("connected");
            setConversationId(data.conversation_id);
            const reply = localReply || data.response;
            setMessages(current => [...current, { id: `${messageId}-assistant`, role: "assistant", text: reply }]);
            speakText(reply);
            addActivity("Conversation saved", data.memories_used.length ? `${data.memories_used.length} relevant memories available` : "Saved to local VORTEX database");
            refreshConversations();
        } catch {
            setMemoryStatus("offline");
            const fallback = localReply || "The local memory service is not running yet. Start the FastAPI backend to save this conversation and build long-term memory.";
            setMessages(current => [...current, { id: `${messageId}-assistant`, role: "assistant", text: fallback }]);
            speakText(fallback);
        }
    };

    const pages = {
        Home: <HomePage stats={stats} listening={listening} online={online} voiceSupported={voiceSupported} startVoice={startVoice} stopVoice={stopVoice} toggleVoice={toggleVoice} cycle={cycle} theme={theme} selectTheme={selectTheme} activities={activities} onQuickAction={runQuickAction} onCoreTab={selectCoreTab} activeCoreTab={activeCoreTab} memoryStatus={memoryStatus} voiceReplies={voiceReplies} speaking={speaking} toggleVoiceReplies={toggleVoiceReplies} />,
        Chat: <ChatPage messages={messages} onSend={sendMessage} conversationId={conversationId} conversations={conversations} memoryStatus={memoryStatus} onNewConversation={startNewConversation} onOpenConversation={openConversation} />,
        Voice: <VoicePage listening={listening} toggleVoice={toggleVoice} transcript={transcript} supported={voiceSupported} voiceReplies={voiceReplies} speaking={speaking} onToggleVoiceReplies={toggleVoiceReplies} onSpeakTest={() => speakText("Good evening. VORTEX voice replies are online and ready to assist.", true)} />,
        System: <SystemPage stats={stats} />,
        Tasks: <SimplePage title="Tasks & Routines" eyebrow="AUTOMATION" icon={CalendarClock} text="Scheduling and desktop automation are staged for the VORTEX backend. This screen is ready to receive your real task queue." />,
        Files: <SimplePage title="Desktop Files" eyebrow="DESKTOP CONTROL" icon={FileText} text="The UI is ready for a permission-aware file layer. File listing and actions will stay disabled until a local backend is attached." />,
        Settings: <SettingsPage online={online} setOnline={setOnline} theme={theme} setTheme={selectTheme} voiceReplies={voiceReplies} toggleVoiceReplies={toggleVoiceReplies} />,
    };

    return <div className={`vortex-app theme-${theme} ${online ? "is-online" : "is-offline"} ${listening ? "is-listening" : ""}`}>
        <div className="space-bg" aria-hidden="true" /><div className="grid-bg" aria-hidden="true" />
        <aside className="sidebar glass" aria-label="Primary navigation">
            <div className="brand"><div className="brand-core"><Sparkles size={20} /></div><div><div className="brand-name">VORTEX</div><div className="brand-sub">AI DESKTOP ASSISTANT</div></div></div>
            <nav className="nav">{nav.map(([label, Icon]) => <button key={label} className={`nav-btn ${page === label ? "active" : ""}`} onClick={() => setPage(label)} aria-current={page === label ? "page" : undefined} aria-label={label} title={label}><Icon size={17} /><span>{label}</span></button>)}</nav>
            <div className="side-bottom"><button className="power-side" onClick={() => setOnline(value => !value)} aria-pressed={online}><CirclePower size={16} />{online ? "Turn VORTEX off" : "Turn VORTEX on"}</button></div>
        </aside>
        <main className="workspace">
            <header className="topbar glass-line"><div className="top-status"><span className="tiny-lamp" /><span className="status-copy">SYSTEM STATUS</span><span className="status-value">{online ? "ONLINE" : "OFFLINE"}</span></div><div className="top-center"><span>YOUR INTELLIGENT COMPANION.</span><span>{online ? memoryStatus === "connected" ? "LOCAL MEMORY CONNECTED." : "LOCAL MEMORY SERVICE OFFLINE." : "SYSTEM PAUSED."}</span></div><div className="top-right"><div className="time"><strong>{time}</strong><span>{date}</span></div><button className="window-btn" onClick={() => showNotice("No new alerts. VORTEX is running entirely in this browser.")} aria-label="View notifications" title="Notifications"><Bell size={16} /></button><button className="window-btn" onClick={() => setPage("Settings")} aria-label="Open settings" title="Settings"><Settings size={16} /></button></div></header>
            <div className="page-area">{pages[page]}</div>
            <footer className="feature-bar glass" aria-label="VORTEX capabilities"><Feature icon={Mic} title="VOICE FIRST" copy="Push-to-talk ready" /><Feature icon={Sparkles} title="LOCAL MEMORY" copy={memoryStatus === "connected" ? "Conversation storage online" : "Start the memory backend"} /><Feature icon={Monitor} title="SYSTEM CONTROL" copy="Permission-aware design" /><Feature icon={Zap} title="AUTOMATION" copy="Routines coming next" /><Feature icon={ShieldCheck} title="PRIVATE BY DEFAULT" copy="No cloud connected" /><Feature icon={Waves} title="LOCAL SESSION" copy="Settings saved locally" /></footer>
        </main>
        {notice && <div className="toast" role="status"><Sparkles size={16} /><span>{notice}</span><button aria-label="Dismiss notification" onClick={() => setNotice("")}><X size={15} /></button></div>}
    </div>;
}

function Feature({ icon: Icon, title, copy }) { return <div className="feature"><Icon size={17} /><span><strong>{title}</strong><small>{copy}</small></span></div>; }
function PanelTitle({ title }) { return <div className="panel-title"><span>{title}</span></div>; }
function CoreSphere() { return <div className="core-sphere" aria-hidden="true"><div className="sphere-lines" /><div className="sphere-grid" /><div className="sphere-glow" />{Array.from({ length: 8 }).map((_, index) => <div key={index} className="sphere-orbit" style={{ transform: `rotate(${index * 22}deg)` }} />)}<div className="sphere-nucleus"><Sparkles size={30} /></div></div>; }
function WaveLine({ active = false }) { return <div className={`wave-line ${active ? "active" : ""}`} aria-hidden="true">{Array.from({ length: 54 }).map((_, index) => <i key={index} style={{ height: `${6 + ((index * 17) % 28)}px` }} />)}</div>; }
function SmallPanel({ title, children }) { return <div className="small-panel panel-inner"><PanelTitle title={title} />{children}</div>; }

function HomePage({ stats, listening, online, voiceSupported, startVoice, stopVoice, toggleVoice, cycle, theme, selectTheme, activities, onQuickAction, onCoreTab, activeCoreTab, memoryStatus, voiceReplies, speaking, toggleVoiceReplies }) {
    const voiceState = !online ? "Offline" : listening ? "Listening…" : voiceSupported ? "Ready" : "Unavailable";
    const modules = moduleDefinitions.map(([name, Icon]) => [name, online ? (name === "Automation" ? "Ready" : "Online") : "Offline", Icon]);
    return <div className="home-page"><div className="hero-layout">
        <section className="core-card glass"><div className="card-label">VORTEX CORE • PRIMARY INTERFACE</div><CoreSphere /><div className="core-bottom"><div className="core-info"><div className="hex-icon"><Sparkles size={22} /></div><div><strong>VORTEX CORE</strong><span>v0.1 • {online ? "UI engine online" : "UI engine paused"}</span><span>Memory: 5.0 GB / 8 GB (demo)</span></div></div><div className="power-ring"><div><strong>{online ? "100%" : "0%"}</strong><span>POWER LEVEL</span></div></div><div className="activity-bars"><div className="mini-label">ACTIVITY</div><div className="bars">{[18, 42, 28, 62, 35, 74, 48, 57, 31].map((height, index) => <i key={index} style={{ height: `${height}px` }} />)}</div></div></div><div className="core-toolbar" role="tablist" aria-label="Core workspaces">{["Core", "Voice", "Memory", "Web", "Tasks"].map(tab => <button key={tab} className={activeCoreTab === tab ? "sel" : ""} onClick={() => onCoreTab(tab)} role="tab" aria-selected={activeCoreTab === tab}>{tab}</button>)}</div></section>
        <section className="module-card glass"><div className="mini-grid top-grid"><QuickAccess onAction={onQuickAction} /><Performance stats={stats} /><Memory /></div><div className="mid-grid"><div className="capabilities panel-inner"><PanelTitle title="AI CAPABILITIES" />{capabilities.map(([name, Icon]) => <div className="cap-row" key={name}><Icon size={15} /><span>{name}</span></div>)}</div><div className="center-core" aria-hidden="true"><div className="orbit-xxl" /><div className="orbit-xl" /><div className="orbit-lg" /><div className="central-node"><Sparkles size={31} /></div><div className="cross c1" /><div className="cross c2" /></div><div className="modules panel-inner"><PanelTitle title="ACTIVE MODULES" />{modules.map(([name, status, Icon]) => <div className="module-row" key={name}><span className="module-icon"><Icon size={13} /></span><div><strong>{name}</strong><small>{status}</small></div><i className={online ? "" : "offline-dot"} /></div>)}</div></div><RecentActivity activities={activities} /></section>
        <section className="voice-card glass"><div className="voice-status"><span>VOICE STATUS</span><b>{speaking ? "Speaking…" : voiceState}</b><small>{voiceSupported ? "Browser speech recognition" : "Browser support required"} · Replies {voiceReplies ? "on" : "off"}</small></div><div className="voice-sphere"><div className="sphere-ring a" /><div className="sphere-ring b" /><div className="sphere-ring c" /><div className="voice-core"><Mic size={34} /></div><WaveLine active={listening || speaking} /></div><div className="voice-activity panel-inner"><PanelTitle title="VOICE ACTIVITY" /><WaveLine active={listening || speaking} /></div><div className="lower-voice-grid"><SmallPanel title="UPCOMING"><p>Project Meeting <b>Tomorrow, 10:00 AM</b></p><p>Code Review <b>Tomorrow, 02:00 PM</b></p><p>Gym Session <b>Today, 06:00 PM</b></p></SmallPanel><SmallPanel title="NOTES"><p>Complete UI design</p><p>Review AI model</p><p>Update documentation</p><p>Connect local backend</p></SmallPanel><SmallPanel title="WEATHER"><div className="weather-big"><span>29°C</span><b>Partly Cloudy</b><small>Mumbai, IN</small><Sun size={31} /></div></SmallPanel></div><div className="voice-controls"><button title="Hold Space to speak" aria-label="Keyboard push to talk"><Keyboard size={18} /><span>SPACEBAR</span></button><button className="active" onClick={toggleVoice} aria-pressed={listening} disabled={!online}><Mic size={20} /><span>{listening ? "STOP" : "VOICE"}</span></button><button className={voiceReplies ? "active" : ""} onClick={toggleVoiceReplies} aria-pressed={voiceReplies} aria-label="Toggle voice replies"><Volume2 size={18} /><span>{speaking ? "SPEAKING" : voiceReplies ? "REPLIES ON" : "REPLIES OFF"}</span></button><button onPointerDown={startVoice} onPointerUp={stopVoice} onPointerCancel={stopVoice} disabled={!online} aria-label="Hold microphone to talk"><Headphones size={18} /><span>HOLD TO TALK</span></button><button onClick={() => onQuickAction("System Control")}><Monitor size={18} /><span>SYSTEM</span></button></div></section>
    </div><div className="bottom-suite"><DayCycle cycle={cycle} /><PushToTalk listening={listening} online={online} onStart={startVoice} onStop={stopVoice} /><ThemePreview theme={theme} onSelect={selectTheme} /><AssistantStatus online={online} /><QuickStats count={activities.length} memoryStatus={memoryStatus} /></div></div>;
}

function QuickAccess({ onAction }) { return <div className="panel-inner"><PanelTitle title="QUICK ACCESS" /><div className="quick-grid">{[["Open Application", Monitor], ["System Control", Cpu], ["Web Search", Search]].map(([name, Icon]) => <button key={name} onClick={() => onAction(name)}><Icon size={13} /><span>{name}</span></button>)}</div></div>; }
function Performance({ stats }) { return <div className="panel-inner"><PanelTitle title="SYSTEM PERFORMANCE" /><div className="line-chart"><svg viewBox="0 0 260 100" preserveAspectRatio="none" aria-label="Simulated system activity"><polyline points="0,76 18,68 32,73 48,54 62,62 83,40 99,56 120,46 137,61 155,38 170,50 188,32 205,48 223,23 239,36 260,17" fill="none" stroke="currentColor" strokeWidth="2" /></svg><div className="chart-axis"><span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span></div></div><div className="perf-values"><span>CPU {stats.cpu}%</span><span>RAM {stats.ram}%</span><span>DEMO</span></div></div>; }
function Memory() { return <div className="panel-inner memory-panel"><PanelTitle title="MEMORY USAGE" /><div className="memory-ring"><div><strong>62%</strong><span>5.0 GB / 8 GB</span></div></div></div>; }
function RecentActivity({ activities }) { return <div className="recent"><PanelTitle title="RECENT ACTIVITY" /><div className="recent-grid">{activities.map((activity, index) => <div className="recent-card" key={`${activity.title}-${index}`}><div className="recent-icon"><Activity size={14} /></div><strong>{activity.title}</strong><span>{activity.detail}</span><small>{activity.time}</small><div className="tiny-chart">{Array.from({ length: 14 }).map((_, chartIndex) => <i key={chartIndex} style={{ height: `${5 + ((chartIndex * 7 + index * 11) % 18)}px` }} />)}</div></div>)}</div></div>; }

function DayCycle({ cycle }) { const CycleIcon = cycle.isDaytime ? Sun : Moon; return <div className="day-cycle glass"><div className="cycle-visual"><div className="cycle-orbit" /><div className="sun-dot" style={{ transform: `rotate(${cycle.degrees}deg) translateX(94px)` }}><CycleIcon size={16} /></div><div className="moon-dot"><Moon size={15} /></div><div className="cycle-time">12-HOUR CYCLE<small>{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</small></div><span className="cycle-start">06:00 AM</span><span className="cycle-end">06:00 PM</span></div><div className="cycle-copy"><PanelTitle title="DAY CYCLE SYSTEM" /><p>VORTEX maps the local time across a 06:00 AM–06:00 PM daytime cycle.</p><div className="cycle-points"><span>☀ 06:00 AM — Sunrise</span><span>◉ 12:00 PM — Day</span><span>☀ 06:00 PM — Sunset</span><span>☾ 12:00 AM — Night</span></div></div></div>; }
function PushToTalk({ listening, online, onStart, onStop }) { const start = event => { event.preventDefault(); onStart(); }; const stop = event => { event.preventDefault(); onStop(); }; return <div className="push-card glass"><div className="push-title">PUSH TO TALK</div><button className={`push-mic ${listening ? "active" : ""}`} onPointerDown={start} onPointerUp={stop} onPointerCancel={stop} onPointerLeave={listening ? stop : undefined} onKeyDown={event => { if (["Enter", " "].includes(event.key)) start(event); }} onKeyUp={event => { if (["Enter", " "].includes(event.key)) stop(event); }} disabled={!online} aria-label="Hold to talk"><div className="push-ring a" /><div className="push-ring b" /><Mic size={34} /></button><WaveLine active={listening} /><div className="push-help">HOLD SPACEBAR OR BUTTON TO TALK</div><div className="push-state">{!online ? "VORTEX is offline" : listening ? "Listening for your command…" : "Ready for your command…"}</div></div>; }
function ThemePreview({ theme, onSelect }) { return <div className="theme-card glass"><PanelTitle title="THEME SELECTOR" />{themes.map(([label, id]) => <button key={id} className={theme === id ? "selected" : ""} onClick={() => onSelect(id)} aria-pressed={theme === id}><i className={`color-dot ${id}`} /><span>{label}</span>{theme === id ? <b>ACTIVE</b> : <ChevronRight size={14} />}</button>)}</div>; }
function AssistantStatus({ online }) { return <div className="assistant-status glass"><PanelTitle title="AI ASSISTANT STATUS" /><div className="status-hero"><div className="status-hex"><Sparkles size={31} /></div><div><strong>VORTEX</strong><span>Frontend baseline</span><b>{online ? "ONLINE" : "OFFLINE"}</b></div></div><div className="status-foot"><i className={online ? "" : "offline-dot"} />{online ? "Interface operational" : "Assistant is powered down"}</div></div>; }
function QuickStats({ count, memoryStatus }) { return <div className="quick-stats glass"><PanelTitle title="SESSION STATS" />{[["Session actions", count], ["Themes available", "5"], ["Voice mode", "PTT"], ["Cloud services", "0"], ["Memory backend", memoryStatus === "connected" ? "Online" : "Offline"]].map(([label, value]) => <div className="stat-row" key={label}><span>{label}</span><b>{value}</b></div>)}</div>; }

function ChatPage({ messages, onSend, conversationId, conversations, memoryStatus, onNewConversation, onOpenConversation }) { const [draft, setDraft] = useState(""); const [sending, setSending] = useState(false); const submit = async event => { event.preventDefault(); if (!draft.trim() || sending) return; setSending(true); await onSend(draft); setDraft(""); setSending(false); }; const memoryLabel = memoryStatus === "connected" ? "LOCAL MEMORY ONLINE" : memoryStatus === "checking" ? "CHECKING MEMORY…" : "MEMORY SERVICE OFFLINE"; return <div className="chat-page glass"><div className="chat-heading"><div><div className="eyebrow">PRIVATE LOCAL CONVERSATION</div><h1>VORTEX Chat</h1><p>Your messages are saved by the local backend. Say “remember …” to retain a fact, or “forget …” to remove one.</p></div><span className={`local-badge ${memoryStatus}`}>{memoryLabel}</span></div><div className="chat-shell"><aside className="conversation-sidebar"><button className="new-conversation" onClick={onNewConversation}>+ New conversation</button><div className="history-label">PAST CONVERSATIONS</div>{memoryStatus === "connected" && conversations.length === 0 && <p>No saved conversations yet.</p>}{conversations.map(conversation => <button key={conversation.id} className={conversationId === conversation.id ? "selected" : ""} onClick={() => onOpenConversation(conversation.id)}><strong>{conversation.title}</strong><small>{new Date(conversation.updated_at).toLocaleDateString()}</small></button>)}</aside><div className="chat-content"><div className="message-list" aria-live="polite">{messages.map(message => <div key={message.id} className={`message ${message.role}`}><span>{message.role === "assistant" ? "VORTEX" : "YOU"}</span><p>{message.text}</p></div>)}</div><form className="chat-form" onSubmit={submit}><label className="sr-only" htmlFor="vortex-message">Message VORTEX</label><input id="vortex-message" value={draft} onChange={event => setDraft(event.target.value)} placeholder="Say “remember that I prefer concise answers”…" autoComplete="off" /><button type="submit" disabled={!draft.trim() || sending}>{sending ? "Saving…" : "Send"} <ChevronRight size={16} /></button></form></div></div></div>; }
function VoicePage({ listening, toggleVoice, transcript, supported, voiceReplies, speaking, onToggleVoiceReplies, onSpeakTest }) { return <div className="standalone-page voice-page glass"><div className="big-voice-orbit"><div className="voice-core"><Mic size={48} /></div></div><div className="eyebrow">VOICE FIRST</div><h1>Push to Talk</h1><p>{transcript}</p><p className="support-copy">{supported ? "Hold Space anywhere outside a text field, or use the controls below." : "This browser does not expose the Web Speech API. You can still use the local chat demo."}</p><div className="voice-page-actions"><button className="primary-button" onClick={toggleVoice} aria-pressed={listening} disabled={!supported}>{listening ? "Stop listening" : "Start listening"}</button><button className="secondary-button" onClick={onSpeakTest}>{speaking ? "Speaking…" : "Play voice sample"}</button><button className="secondary-button" onClick={onToggleVoiceReplies} aria-pressed={voiceReplies}>{voiceReplies ? "Voice replies on" : "Voice replies off"}</button></div><p className="voice-style-note">Voice style: calm, polished, British-inspired assistant — not an imitation of any actor or character.</p></div>; }
function SystemPage({ stats }) { return <div className="standalone-page glass"><div className="eyebrow">SYSTEM CONTROL</div><h1>Desktop Diagnostics</h1><div className="system-cards">{Object.entries(stats).map(([key, value]) => <div key={key}><span>{key.toUpperCase()}</span><strong>{value}%</strong><div><i style={{ width: `${value}%` }} /></div></div>)}</div><p>These are animated demo values. Connect a permission-aware desktop-agent layer to report real hardware data and take controlled actions.</p></div>; }
function SimplePage({ title, eyebrow, icon: Icon, text }) { return <div className="standalone-page glass"><Icon size={28} /><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{text}</p></div>; }
function SettingsPage({ online, setOnline, theme, setTheme, voiceReplies, toggleVoiceReplies }) { return <div className="standalone-page glass"><div className="eyebrow">CONFIGURATION</div><h1>VORTEX Settings</h1><div className="settings-stack"><button onClick={() => setOnline(value => !value)} aria-pressed={online}><span>Assistant Power</span><b>{online ? "ON" : "OFF"}</b></button><button onClick={toggleVoiceReplies} aria-pressed={voiceReplies}><span>Voice Replies</span><b>{voiceReplies ? "ON" : "OFF"}</b></button><div><span>Accent</span><div className="theme-pills">{themes.map(([, id]) => <button key={id} className={`pill ${id} ${theme === id ? "active" : ""}`} onClick={() => setTheme(id)} aria-label={`Use ${id} theme`} aria-pressed={theme === id} />)}</div></div></div></div>; }

createRoot(document.getElementById("root")).render(<App />);
