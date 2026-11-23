const { useState, useEffect, useMemo, useRef } = React;

// --- Adaptador de Íconos Lucide para HTML + JS ---
const toPascalCase = (str) =>
  str
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

const createLucideIcon = (iconName) => {
  return function LucideIconComponent({ className = 'w-4 h-4', ...props }) {
    const ref = useRef(null);

    useEffect(() => {
      const iconsMap = window.lucide?.icons;
      const createEl = window.lucide?.createElement;
      if (!ref.current || !iconsMap || !createEl) return;

      const iconNode = iconsMap[iconName] || iconsMap[toPascalCase(iconName)];
      if (!iconNode) return;

      const svg = createEl(iconNode);
      const classes = ['lucide', `lucide-${iconName}`, ...className.split(' ').filter(Boolean)];
      svg.setAttribute('class', classes.join(' '));
      ref.current.innerHTML = '';
      ref.current.appendChild(svg);
    }, [iconName, className]);

    return <span ref={ref} className="inline-flex items-center justify-center shrink-0" {...props} />;
  };
};

const CalendarIcon = createLucideIcon('calendar');
const Stethoscope = createLucideIcon('stethoscope');
const BookOpen = createLucideIcon('book-open');
const Plus = createLucideIcon('plus');
const Trash2 = createLucideIcon('trash-2');
const CheckCircle2 = createLucideIcon('check-circle-2');
const Clock = createLucideIcon('clock');
const Baby = createLucideIcon('baby');
const Heart = createLucideIcon('heart');
const ChevronLeft = createLucideIcon('chevron-left');
const ChevronRight = createLucideIcon('chevron-right');
const Bell = createLucideIcon('bell');
const Search = createLucideIcon('search');
const Edit3 = createLucideIcon('edit-3');
const X = createLucideIcon('x');
const Activity = createLucideIcon('activity');
const Sparkles = createLucideIcon('sparkles');
const CalendarPlus = createLucideIcon('calendar-plus');
const Share2 = createLucideIcon('share-2');
const MessageSquare = createLucideIcon('message-square');
const Send = createLucideIcon('send');
const Users = createLucideIcon('users');
const Check = createLucideIcon('check');
const Copy = createLucideIcon('copy');
const Smartphone = createLucideIcon('smartphone');
const ShieldCheck = createLucideIcon('shield-check');
const LayoutDashboard = createLucideIcon('layout-dashboard');
const Cloud = createLucideIcon('cloud');
const CloudOff = createLucideIcon('cloud-off');
const RefreshCw = createLucideIcon('refresh-cw');
const Link2 = createLucideIcon('link-2');

// --- API Cliente ---
const rawApiUrl = window.CONTROL_API_URL || 'https://control-ju-na-backend.vercel.app';
const API_BASE_URL = String(rawApiUrl)
  .replace(/^\[.*\]\(/, '')
  .replace(/\)$/, '')
  .replace(/\/+$/, '');

async function fetchFamilySpace(familyCode) {
  const code = encodeURIComponent(familyCode.toUpperCase().trim());
  const res = await fetch(`${API_BASE_URL}/api/pregnancy/${code}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) {
    throw new Error(`Error al obtener datos (${res.status})`);
  }
  return res.json();
}

async function syncFamilySpace(familyCode, payload) {
  const code = encodeURIComponent(familyCode.toUpperCase().trim());
  const res = await fetch(`${API_BASE_URL}/api/pregnancy/${code}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    throw new Error(`Error al sincronizar datos (${res.status})`);
  }
  return res.json();
}
// --- Utilidades de Fecha ---
const toLocalISODate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const addDays = (dateStr, days) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return toLocalISODate(date);
};

const formatReadableDate = (dateStr) => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('es-AR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

// --- Generador de Calendario para iPhone / Apple Calendar (.ics) ---
const downloadAppleCalendarICS = ({
  title,
  date,
  time = '09:00',
  durationMinutes = 60,
  location = '',
  description = ''
}) => {
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = (time || '09:00').split(':').map(Number);

  const startDate = new Date(year, month - 1, day, hour, minute, 0);
  const endDate = new Date(startDate.getTime() + durationMinutes * 60000);

  const formatICSDate = (d) => {
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
  };

  const escapeICS = (str) =>
    (str || '')
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');

  const uid = `control-embarazo-${Date.now()}@control.app`;
  const nowStamp = formatICSDate(new Date());

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Control//Seguimiento Embarazo//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${nowStamp}`,
    `DTSTART:${formatICSDate(startDate)}`,
    `DTEND:${formatICSDate(endDate)}`,
    `SUMMARY:${escapeICS(title)}`,
    location ? `LOCATION:${escapeICS(location)}` : '',
    description ? `DESCRIPTION:${escapeICS(description)}` : '',
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    `DESCRIPTION:Recordatorio mañana: ${escapeICS(title)}`,
    'END:VALARM',
    'BEGIN:VALARM',
    'TRIGGER:-PT2H',
    'ACTION:DISPLAY',
    `DESCRIPTION:En 2 horas: ${escapeICS(title)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ]
    .filter(Boolean)
    .join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${title.toLowerCase().replace(/[^a-z0-9]+/gi, '-')}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// --- Categorías de Estudios ---
const STUDY_CATEGORIES = [
  { id: 'ecografia', label: 'Ecografía', badge: 'bg-[#E6D5B8]/15 text-[#E6D5B8] border-[#E6D5B8]/30' },
  { id: 'laboratorio', label: 'Laboratorio', badge: 'bg-sky-500/15 text-sky-300 border-sky-500/30' },
  { id: 'monitoreo', label: 'Monitoreo Fetal', badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  { id: 'cardiologico', label: 'Cardiológico / ECG', badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
  { id: 'vacuna', label: 'Vacunas', badge: 'bg-violet-500/15 text-violet-300 border-violet-500/30' },
  { id: 'cultivo', label: 'Cultivos / Hisopados', badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  { id: 'otro', label: 'Otro Estudio', badge: 'bg-stone-500/20 text-stone-300 border-stone-500/30' }
];

const getCategoryMeta = (id) =>
  STUDY_CATEGORIES.find((c) => c.id === id) || STUDY_CATEGORIES[STUDY_CATEGORIES.length - 1];

// --- Datos Iniciales ---
const getInitialData = (initialCode) => {
  const today = new Date();
  const todayStr = toLocalISODate(today);
  const defaultFum = addDays(todayStr, -140);

  return {
    familyCode: initialCode || 'BEBE-' + Math.floor(1000 + Math.random() * 9000),
    pregnancy: {
      fum: defaultFum,
      babyName: 'Bebé'
    },
    appointments: [],
    studies: [],
    notes: [],
    reminders: []
  };
};

const STORAGE_KEY = 'control_embarazo_v1';

function App() {
  const params = new URLSearchParams(window.location.search);
  const urlUser = params.get('user') || params.get('usuario');

  const [data, setData] = useState(() => {
    const urlCode = (params.get('codigo') || params.get('code') || '').toUpperCase().trim();

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (urlCode && urlCode !== parsed.familyCode) {
          return { ...parsed, familyCode: urlCode };
        }
        return parsed;
      }
    } catch (e) {
      console.error('Error al cargar datos:', e);
    }
    return getInitialData(urlCode);
  });

  const [syncStatus, setSyncStatus] = useState('local');
  const [hasLoadedRemote, setHasLoadedRemote] = useState(false);

  const [activeTab, setActiveTab] = useState('calendar');
  const [activeParent, setActiveParent] = useState(() => {
    if (urlUser === 'Na' || urlUser === 'Papá') return 'Papá';
    if (urlUser === 'Ju' || urlUser === 'Mamá') return 'Mamá';
    return 'Mamá';
  });

  const [showSettings, setShowSettings] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(() => toLocalISODate(new Date()));
  const [newReminderTitle, setNewReminderTitle] = useState('');
  const [newReminderTime, setNewReminderTime] = useState('09:00');
  const [newReminderDesc, setNewReminderDesc] = useState('');

  const [showAppModal, setShowAppModal] = useState(false);
  const [appForm, setAppForm] = useState({
    title: '',
    doctor: '',
    location: '',
    date: toLocalISODate(new Date()),
    time: '10:00',
    description: ''
  });

  const [studyFilter, setStudyFilter] = useState('todos');
  const [showStudyModal, setShowStudyModal] = useState(false);
  const [studyForm, setStudyForm] = useState({
    category: 'ecografia',
    customType: '',
    title: '',
    date: toLocalISODate(new Date()),
    time: '09:30',
    week: '',
    clinic: '',
    status: 'pendiente',
    description: ''
  });
  const [commentDrafts, setCommentDrafts] = useState({});

  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteSearch, setNoteSearch] = useState('');
  const [noteForm, setNoteForm] = useState({
    title: '',
    date: toLocalISODate(new Date()),
    mood: '',
    symptoms: [],
    description: ''
  });

  useEffect(() => {
    let cancelled = false;
    setHasLoadedRemote(false);

    const loadRemote = async () => {
      if (!data.familyCode?.trim()) return;
      try {
        setSyncStatus('syncing');
        const remote = await fetchFamilySpace(data.familyCode);
        if (cancelled || !remote) return;

        setData((prev) => ({
          ...prev,
          familyCode: remote.familyCode || prev.familyCode,
          pregnancy: remote.pregnancy || prev.pregnancy,
          appointments: Array.isArray(remote.appointments)
            ? remote.appointments
            : prev.appointments,
          studies: Array.isArray(remote.studies) ? remote.studies : prev.studies,
          notes: Array.isArray(remote.notes) ? remote.notes : prev.notes,
          reminders: Array.isArray(remote.reminders)
            ? remote.reminders
            : prev.reminders
        }));
        setSyncStatus('synced');
      } catch {
        if (!cancelled) setSyncStatus('offline');
      } finally {
        if (!cancelled) setHasLoadedRemote(true);
      }
    };

    loadRemote();
    return () => {
      cancelled = true;
    };
  }, [data.familyCode]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Error al guardar en localStorage:', e);
    }

    if (!hasLoadedRemote || !data.familyCode?.trim()) return;

    const timer = setTimeout(async () => {
      try {
        setSyncStatus('syncing');
        await syncFamilySpace(data.familyCode, {
          familyCode: data.familyCode,
          pregnancy: data.pregnancy,
          appointments: data.appointments,
          studies: data.studies,
          notes: data.notes,
          reminders: data.reminders
        });
        setSyncStatus('synced');
      } catch {
        setSyncStatus('offline');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [data, hasLoadedRemote]);

  const pregnancyStats = useMemo(() => {
    const fumStr = data.pregnancy.fum;
    const [y, m, d] = fumStr.split('-').map(Number);
    const fumDate = new Date(y, m - 1, d);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - fumDate.getTime();
    const totalDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
    const weeks = Math.floor(totalDays / 7);
    const days = totalDays % 7;

    const fppStr = addDays(fumStr, 280);
    const [fy, fm, fd] = fppStr.split('-').map(Number);
    const fppDate = new Date(fy, fm - 1, fd);
    const daysRemaining = Math.max(
      0,
      Math.ceil((fppDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    );

    const progress = Math.min(100, Math.max(0, Math.round((totalDays / 280) * 100)));
    let trimester = 1;
    if (weeks >= 28) trimester = 3;
    else if (weeks >= 14) trimester = 2;

    return {
      weeks,
      days,
      totalDays,
      fppStr,
      daysRemaining,
      progress,
      trimester
    };
  }, [data.pregnancy.fum]);

  const handleFumChange = (newFum) => {
    if (!newFum) return;
    setData((prev) => ({
      ...prev,
      pregnancy: { ...prev.pregnancy, fum: newFum }
    }));
  };

  const handleFppChange = (newFpp) => {
    if (!newFpp) return;
    const calculatedFum = addDays(newFpp, -280);
    setData((prev) => ({
      ...prev,
      pregnancy: { ...prev.pregnancy, fum: calculatedFum }
    }));
  };

  const eventsByDate = useMemo(() => {
    const map = {};
    const ensureDay = (d) => {
      if (!map[d]) map[d] = [];
    };

    data.appointments.forEach((a) => {
      ensureDay(a.date);
      map[a.date].push({
        type: 'turno',
        id: a.id,
        title: a.title,
        time: a.time,
        location: a.location,
        description: a.description,
        completed: a.completed
      });
    });

    data.studies.forEach((s) => {
      ensureDay(s.date);
      const cat = getCategoryMeta(s.category);
      map[s.date].push({
        type: 'estudio',
        categoryLabel: s.category === 'otro' && s.customType ? s.customType : cat.label,
        id: s.id,
        title: s.title,
        time: s.time || '09:00',
        location: s.clinic,
        description: s.description,
        status: s.status
      });
    });

    data.notes.forEach((n) => {
      ensureDay(n.date);
      map[n.date].push({
        type: 'comentario',
        id: n.id,
        title: n.title || 'Comentario',
        description: n.description
      });
    });

    data.reminders.forEach((r) => {
      ensureDay(r.date);
      map[r.date].push({
        type: 'recordatorio',
        id: r.id,
        title: r.title,
        time: r.time || '09:00',
        description: r.description
      });
    });

    return map;
  }, [data]);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(toLocalISODate(new Date(year, month, d)));
    }
    return cells;
  }, [currentMonth]);

  const addAppointment = (e) => {
    e.preventDefault();
    if (!appForm.title.trim()) return;
    const newItem = {
      id: 'app-' + Date.now(),
      ...appForm,
      completed: false,
      createdBy: activeParent
    };
    setData((prev) => ({
      ...prev,
      appointments: [...prev.appointments, newItem].sort((a, b) => a.date.localeCompare(b.date))
    }));
    setAppForm({
      title: '',
      doctor: '',
      location: '',
      date: toLocalISODate(new Date()),
      time: '10:00',
      description: ''
    });
    setShowAppModal(false);
  };

  const toggleAppointment = (id) => {
    setData((prev) => ({
      ...prev,
      appointments: prev.appointments.map((a) =>
        a.id === id ? { ...a, completed: !a.completed } : a
      )
    }));
  };

  const deleteAppointment = (id) => {
    setData((prev) => ({
      ...prev,
      appointments: prev.appointments.filter((a) => a.id !== id)
    }));
  };

  const addStudy = (e) => {
    e.preventDefault();
    if (!studyForm.title.trim()) return;
    const newItem = {
      id: 'stu-' + Date.now(),
      ...studyForm,
      week: studyForm.week || String(pregnancyStats.weeks),
      comments: []
    };
    setData((prev) => ({
      ...prev,
      studies: [newItem, ...prev.studies]
    }));
    setStudyForm({
      category: 'ecografia',
      customType: '',
      title: '',
      date: toLocalISODate(new Date()),
      time: '09:30',
      week: '',
      clinic: '',
      status: 'pendiente',
      description: ''
    });
    setShowStudyModal(false);
  };

  const toggleStudyStatus = (id) => {
    setData((prev) => ({
      ...prev,
      studies: prev.studies.map((s) =>
        s.id === id ? { ...s, status: s.status === 'realizado' ? 'pendiente' : 'realizado' } : s
      )
    }));
  };

  const addStudyComment = (studyId, e) => {
    e.preventDefault();
    const text = (commentDrafts[studyId] || '').trim();
    if (!text) return;

    const newComment = {
      id: 'com-' + Date.now(),
      author: activeParent,
      text,
      date: toLocalISODate(new Date())
    };

    setData((prev) => ({
      ...prev,
      studies: prev.studies.map((s) =>
        s.id === studyId ? { ...s, comments: [...(s.comments || []), newComment] } : s
      )
    }));

    setCommentDrafts((prev) => ({ ...prev, [studyId]: '' }));
  };

  const deleteStudyComment = (studyId, commentId) => {
    setData((prev) => ({
      ...prev,
      studies: prev.studies.map((s) =>
        s.id === studyId
          ? { ...s, comments: (s.comments || []).filter((c) => c.id !== commentId) }
          : s
      )
    }));
  };

  const deleteStudy = (id) => {
    setData((prev) => ({
      ...prev,
      studies: prev.studies.filter((s) => s.id !== id)
    }));
  };

  const addNote = (e) => {
    e.preventDefault();
    if (!noteForm.description.trim()) return;
    const newItem = {
      id: 'note-' + Date.now(),
      title: noteForm.title.trim(),
      date: noteForm.date,
      mood: noteForm.mood || '',
      symptoms: noteForm.symptoms,
      description: noteForm.description.trim(),
      author: activeParent
    };
    setData((prev) => ({
      ...prev,
      notes: [newItem, ...prev.notes]
    }));
    setNoteForm({
      title: '',
      date: toLocalISODate(new Date()),
      mood: '',
      symptoms: [],
      description: ''
    });
    setShowNoteModal(false);
  };

  const toggleSymptom = (sym) => {
    setNoteForm((prev) => ({
      ...prev,
      symptoms: prev.symptoms.includes(sym)
        ? prev.symptoms.filter((s) => s !== sym)
        : [...prev.symptoms, sym]
    }));
  };

  const deleteNote = (id) => {
    setData((prev) => ({
      ...prev,
      notes: prev.notes.filter((n) => n.id !== id)
    }));
  };

  const addReminder = (e) => {
    e.preventDefault();
    if (!newReminderTitle.trim()) return;
    setData((prev) => ({
      ...prev,
      reminders: [
        ...prev.reminders,
        {
          id: 'rem-' + Date.now(),
          date: selectedDate,
          time: newReminderTime || '09:00',
          title: newReminderTitle.trim(),
          description: newReminderDesc.trim()
        }
      ]
    }));
    setNewReminderTitle('');
    setNewReminderDesc('');
  };

  const deleteReminder = (id) => {
    setData((prev) => ({
      ...prev,
      reminders: prev.reminders.filter((r) => r.id !== id)
    }));
  };

  const shareableUrl = useMemo(() => {
    const base = `${window.location.origin}${window.location.pathname}`;
    return `${base}?codigo=${encodeURIComponent(data.familyCode)}&user=${encodeURIComponent(activeParent)}`;
  }, [data.familyCode, activeParent]);

  const copyFamilyCode = () => {
    navigator.clipboard?.writeText(data.familyCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyShareLink = () => {
    navigator.clipboard?.writeText(shareableUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const shareViaWhatsApp = () => {
    const text = `Control de embarazo (${pregnancyStats.weeks} semanas).\nCódigo familiar: ${data.familyCode}\nEnlace directo: ${shareableUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareSingleNote = (note) => {
    const lines = [
      `Control (${formatReadableDate(note.date)}) - ${note.author || activeParent}`,
      note.title ? `*${note.title}*` : '',
      note.description,
      note.mood ? `Emoción: ${note.mood}` : '',
      note.symptoms.length > 0 ? `Síntomas: ${note.symptoms.join(', ')}` : ''
    ].filter(Boolean);

    const text = lines.join('\n');
    if (navigator.share) {
      navigator.share({ title: note.title || 'Control', text }).catch(() => {});
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  const todayStr = toLocalISODate(new Date());
  const upcomingAppointments = data.appointments
    .filter((a) => !a.completed && a.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date));

  const filteredStudies = data.studies.filter((s) => {
    if (studyFilter === 'todos') return true;
    return s.category === studyFilter;
  });

  const filteredNotes = data.notes.filter(
    (n) =>
      (n.title || '').toLowerCase().includes(noteSearch.toLowerCase()) ||
      (n.description || '').toLowerCase().includes(noteSearch.toLowerCase()) ||
      (n.mood || '').toLowerCase().includes(noteSearch.toLowerCase()) ||
      n.symptoms.some((s) => s.toLowerCase().includes(noteSearch.toLowerCase()))
  );

  const selectedDayEvents = eventsByDate[selectedDate] || [];

  const symptomOptions = [
    'Movimientos fetales',
    'Cansancio',
    'Náuseas',
    'Acidez',
    'Buena energía',
    'Dolor lumbar',
    'Antojos',
    'Insomnio'
  ];

  const navTabs = [
    { id: 'calendar', label: 'Calendario', icon: CalendarIcon },
    { id: 'appointments', label: 'Turnos', icon: Stethoscope },
    { id: 'studies', label: 'Estudios', icon: Activity },
    { id: 'notes', label: 'Bitácora / Comentarios', icon: BookOpen },
    { id: 'dashboard', label: 'Resumen', icon: LayoutDashboard }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5EFE6] font-sans pb-24 md:pb-12 selection:bg-[#E6D5B8] selection:text-[#0A0A0A]">
      <header className="bg-[#121110]/95 backdrop-blur-md border-b border-[#292520] sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E6D5B8] flex items-center justify-center text-[#121110] shadow-md shadow-black/40">
              <Baby className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-bold tracking-tight text-[#F5EFE6]">Control</h1>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#E6D5B8]/15 text-[#E6D5B8] border border-[#E6D5B8]/30">
                  Sem. {pregnancyStats.weeks}+{pregnancyStats.days}
                </span>
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                    syncStatus === 'synced'
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25'
                      : syncStatus === 'syncing'
                      ? 'bg-amber-500/10 text-amber-300 border-amber-500/25'
                      : 'bg-stone-500/15 text-[#A89E90] border-[#332E28]'
                  }`}
                >
                  {syncStatus === 'synced' && <Cloud className="w-3 h-3" />}
                  {syncStatus === 'syncing' && <RefreshCw className="w-3 h-3 animate-spin" />}
                  {(syncStatus === 'offline' || syncStatus === 'local') && (
                    <CloudOff className="w-3 h-3" />
                  )}
                  {syncStatus === 'synced'
                    ? 'Sincronizado'
                    : syncStatus === 'syncing'
                    ? 'Sincronizando...'
                    : 'Local'}
                </span>
              </div>
              <p className="text-xs text-[#9C9183] flex items-center gap-1">
                <span>{data.pregnancy.babyName}</span>
                <span>•</span>
                <span className="text-[#C8B08E] font-medium">
                  Trimestre {pregnancyStats.trimester}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#1C1A17] p-1 rounded-xl border border-[#2E2924] text-xs font-medium">
              <button
                onClick={() => setActiveParent('Mamá')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  activeParent === 'Mamá'
                    ? 'bg-[#E6D5B8] text-[#121110] font-semibold shadow-sm'
                    : 'text-[#9C9183] hover:text-[#F5EFE6]'
                }`}
              >
                Mamá
              </button>
              <button
                onClick={() => setActiveParent('Papá')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  activeParent === 'Papá'
                    ? 'bg-[#E6D5B8] text-[#121110] font-semibold shadow-sm'
                    : 'text-[#9C9183] hover:text-[#F5EFE6]'
                }`}
              >
                Papá
              </button>
            </div>

            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#E6D5B8]/12 hover:bg-[#E6D5B8]/20 text-[#E6D5B8] border border-[#E6D5B8]/25 text-xs font-semibold transition-colors"
            >
              <Users className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Compartir</span>
            </button>

            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1C1A17] hover:bg-[#26231F] text-[#D8CBB8] border border-[#2E2924] text-xs font-medium transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#E6D5B8]" />
              <span className="hidden sm:inline">FUM / FPP</span>
            </button>
          </div>
        </div>

        <nav className="hidden md:block max-w-5xl mx-auto px-4 border-t border-[#221F1B]">
          <div className="flex gap-2 py-2">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? 'bg-[#E6D5B8] text-[#121110] font-semibold shadow-sm'
                      : 'text-[#9C9183] hover:bg-[#1C1A17] hover:text-[#F5EFE6]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </nav>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-6">
        {activeTab === 'calendar' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-[#141312] rounded-3xl p-5 md:p-6 border border-[#292520] shadow-xl shadow-black/40">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold capitalize text-[#F5EFE6]">
                    {currentMonth.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
                  </h2>
                  <p className="text-xs text-[#9C9183]">
                    Tocá un día para ver eventos o exportar recordatorios al iPhone
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() =>
                      setCurrentMonth(
                        new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
                      )
                    }
                    className="p-2 rounded-xl hover:bg-[#221F1B] text-[#C8B08E] border border-[#292520]"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      const now = new Date();
                      setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
                      setSelectedDate(toLocalISODate(now));
                    }}
                    className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-[#E6D5B8]/15 text-[#E6D5B8] hover:bg-[#E6D5B8]/25 border border-[#E6D5B8]/30"
                  >
                    Hoy
                  </button>
                  <button
                    onClick={() =>
                      setCurrentMonth(
                        new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
                      )
                    }
                    className="p-2 rounded-xl hover:bg-[#221F1B] text-[#C8B08E] border border-[#292520]"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d) => (
                  <div key={d} className="text-xs font-semibold text-[#8A7F72] py-1">
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1.5">
                {calendarDays.map((dateStr, idx) => {
                  if (!dateStr) return <div key={`empty-${idx}`} className="h-14 md:h-16" />;
                  const dayNum = Number(dateStr.split('-')[2]);
                  const isSelected = dateStr === selectedDate;
                  const isToday = dateStr === todayStr;
                  const isFpp = dateStr === pregnancyStats.fppStr;
                  const dayEvents = eventsByDate[dateStr] || [];

                  return (
                    <button
                      key={dateStr}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`h-14 md:h-16 rounded-2xl p-1.5 flex flex-col items-center justify-between border transition-all ${
                        isSelected
                          ? 'bg-[#E6D5B8] text-[#121110] border-[#E6D5B8] shadow-md shadow-black/40 font-bold'
                          : isToday
                          ? 'bg-[#24201B] text-[#E6D5B8] border-[#E6D5B8]/50 font-semibold'
                          : 'bg-[#191816] hover:bg-[#22201D] border-[#26231F] text-[#E5DDD0]'
                      }`}
                    >
                      <span className="text-xs">{dayNum}</span>
                      <div className="flex items-center gap-1 flex-wrap justify-center">
                        {isFpp && (
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isSelected ? 'bg-[#121110]' : 'bg-[#E6D5B8]'
                            }`}
                          />
                        )}
                        {dayEvents.some((e) => e.type === 'turno') && (
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isSelected ? 'bg-[#121110]' : 'bg-[#D4B483]'
                            }`}
                          />
                        )}
                        {dayEvents.some((e) => e.type === 'estudio') && (
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isSelected ? 'bg-[#121110]' : 'bg-sky-400'
                            }`}
                          />
                        )}
                        {dayEvents.some((e) => e.type === 'comentario') && (
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isSelected ? 'bg-[#121110]' : 'bg-emerald-400'
                            }`}
                          />
                        )}
                        {dayEvents.some((e) => e.type === 'recordatorio') && (
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isSelected ? 'bg-[#121110]' : 'bg-amber-400'
                            }`}
                          />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-5 pt-4 border-t border-[#24201C] text-xs text-[#9C9183]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E6D5B8]" /> FPP ({formatReadableDate(pregnancyStats.fppStr)})
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#D4B483]" /> Turno
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-400" /> Estudio
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> Comentario
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" /> Recordatorio
                </span>
              </div>
            </div>

            <div className="bg-[#141312] rounded-3xl p-5 md:p-6 border border-[#292520] shadow-xl shadow-black/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#C8B08E]">
                      Día seleccionado
                    </p>
                    <h3 className="text-base font-bold text-[#F5EFE6] capitalize">
                      {formatReadableDate(selectedDate)}
                    </h3>
                  </div>
                  {selectedDate === pregnancyStats.fppStr && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#E6D5B8]/15 text-[#E6D5B8] border border-[#E6D5B8]/30">
                      FPP
                    </span>
                  )}
                </div>

                <div className="space-y-2.5 mb-6 max-h-64 overflow-y-auto pr-1">
                  {selectedDayEvents.length === 0 ? (
                    <div className="text-center py-6 bg-[#1A1816] rounded-2xl border border-dashed border-[#2E2924]">
                      <p className="text-xs text-[#8A7F72]">No hay eventos cargados este día.</p>
                    </div>
                  ) : (
                    selectedDayEvents.map((ev, i) => (
                      <div
                        key={`${ev.id}-${i}`}
                        className="p-3 rounded-2xl bg-[#1A1816] border border-[#2B2621] space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span
                              className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-md mb-1 ${
                                ev.type === 'turno'
                                  ? 'bg-[#E6D5B8]/15 text-[#E6D5B8]'
                                  : ev.type === 'estudio'
                                  ? 'bg-sky-500/15 text-sky-300'
                                  : ev.type === 'comentario'
                                  ? 'bg-emerald-500/15 text-emerald-300'
                                  : 'bg-amber-500/15 text-amber-300'
                              }`}
                            >
                              {ev.type === 'estudio' && ev.categoryLabel ? ev.categoryLabel : ev.type}
                            </span>
                            <p className="text-sm font-semibold text-[#F5EFE6]">{ev.title}</p>
                            {ev.time && (
                              <p className="text-xs text-[#9C9183] flex items-center gap-1 mt-0.5">
                                <Clock className="w-3 h-3 text-[#C8B08E]" /> {ev.time} hs
                              </p>
                            )}
                            {ev.description && (
                              <p className="text-xs text-[#B5A999] mt-1">{ev.description}</p>
                            )}
                          </div>
                          {ev.type === 'recordatorio' && (
                            <button
                              onClick={() => deleteReminder(ev.id)}
                              className="text-[#8A7F72] hover:text-rose-400 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {(ev.type === 'turno' || ev.type === 'estudio' || ev.type === 'recordatorio') && (
                          <button
                            onClick={() =>
                              downloadAppleCalendarICS({
                                title: ev.title,
                                date: selectedDate,
                                time: ev.time || '09:00',
                                location: ev.location || '',
                                description: ev.description || ''
                              })
                            }
                            className="w-full py-1.5 px-2.5 rounded-xl bg-[#24211D] hover:bg-[#2E2A25] text-[#E6D5B8] border border-[#36312B] text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <CalendarPlus className="w-3.5 h-3.5" />
                            Agregar a Calendario iPhone (.ics)
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <form onSubmit={addReminder} className="pt-4 border-t border-[#26221E] space-y-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-[#E6D5B8] flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5" /> Nuevo recordatorio
                  </p>
                  <span className="text-[10px] text-[#8A7F72] flex items-center gap-1">
                    <Smartphone className="w-3 h-3" /> Alarma iPhone
                  </span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ej: Tomar vitaminas / Turno..."
                    value={newReminderTitle}
                    onChange={(e) => setNewReminderTitle(e.target.value)}
                    className="flex-1 text-sm px-3 py-2 rounded-xl bg-[#1C1A17] border border-[#2E2924] text-[#F5EFE6] placeholder-[#786E62] focus:outline-none focus:border-[#E6D5B8]"
                  />
                  <input
                    type="time"
                    value={newReminderTime}
                    onChange={(e) => setNewReminderTime(e.target.value)}
                    className="w-24 text-xs px-2 py-2 rounded-xl bg-[#1C1A17] border border-[#2E2924] text-[#F5EFE6] focus:outline-none focus:border-[#E6D5B8]"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Nota opcional para el calendario..."
                  value={newReminderDesc}
                  onChange={(e) => setNewReminderDesc(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl bg-[#1C1A17] border border-[#2E2924] text-[#F5EFE6] placeholder-[#786E62] focus:outline-none focus:border-[#E6D5B8]"
                />
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="submit"
                    className="py-2.5 px-3 rounded-xl bg-[#24211D] hover:bg-[#2E2A25] text-[#F5EFE6] border border-[#36312B] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-[#E6D5B8]" /> Guardar aquí
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const titleToExport = newReminderTitle.trim() || 'Recordatorio Control';
                      if (newReminderTitle.trim()) {
                        setData((prev) => ({
                          ...prev,
                          reminders: [
                            ...prev.reminders,
                            {
                              id: 'rem-' + Date.now(),
                              date: selectedDate,
                              time: newReminderTime || '09:00',
                              title: newReminderTitle.trim(),
                              description: newReminderDesc.trim()
                            }
                          ]
                        }));
                        setNewReminderTitle('');
                        setNewReminderDesc('');
                      }
                      downloadAppleCalendarICS({
                        title: titleToExport,
                        date: selectedDate,
                        time: newReminderTime || '09:00',
                        description: newReminderDesc.trim()
                      });
                    }}
                    className="py-2.5 px-3 rounded-xl bg-[#E6D5B8] hover:bg-[#EFE2CA] text-[#121110] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <CalendarPlus className="w-4 h-4" /> Enviar a iPhone
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#141312] p-5 rounded-3xl border border-[#292520]">
              <div>
                <h2 className="text-lg font-bold text-[#F5EFE6]">Turnos y controles médicos</h2>
                <p className="text-xs text-[#9C9183]">
                  Agendá consultas, llevá el detalle y sumalas al calendario del iPhone
                </p>
              </div>
              <button
                onClick={() => {
                  setAppForm((prev) => ({ ...prev, date: selectedDate || todayStr }));
                  setShowAppModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#E6D5B8] hover:bg-[#EFE2CA] text-[#121110] text-sm font-bold shadow-md transition-colors"
              >
                <Plus className="w-4 h-4" /> Nuevo turno
              </button>
            </div>

            {data.appointments.length === 0 ? (
              <div className="bg-[#141312] rounded-3xl p-10 text-center border border-[#292520]">
                <Stethoscope className="w-10 h-10 text-[#C8B08E] mx-auto mb-3 opacity-80" />
                <p className="font-semibold text-[#F5EFE6]">Todavía no hay turnos agendados</p>
                <p className="text-xs text-[#9C9183] mt-1">
                  Agregá tu próximo control obstétrico para tener fecha, hora y alarma lista.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.appointments.map((app) => (
                  <div
                    key={app.id}
                    className={`bg-[#141312] rounded-3xl p-5 border transition-all ${
                      app.completed
                        ? 'border-[#221F1B] opacity-60'
                        : 'border-[#292520] hover:border-[#3D362E]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => toggleAppointment(app.id)}
                          className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center border transition-colors ${
                            app.completed
                              ? 'bg-[#E6D5B8] border-[#E6D5B8] text-[#121110]'
                              : 'border-[#574E43] hover:border-[#E6D5B8]'
                          }`}
                        >
                          {app.completed && <CheckCircle2 className="w-4 h-4" />}
                        </button>
                        <div>
                          <h3
                            className={`font-bold text-base ${
                              app.completed ? 'line-through text-[#8A7F72]' : 'text-[#F5EFE6]'
                            }`}
                          >
                            {app.title}
                          </h3>
                          <p className="text-xs font-medium text-[#C8B08E] mt-0.5">
                            {formatReadableDate(app.date)} • {app.time} hs
                          </p>
                          {(app.doctor || app.location) && (
                            <p className="text-xs text-[#9C9183] mt-1">
                              {app.doctor} {app.doctor && app.location ? '•' : ''} {app.location}
                            </p>
                          )}
                          {app.description && (
                            <p className="text-xs text-[#B5A999] mt-2 bg-[#1B1917] p-2.5 rounded-xl border border-[#282420]">
                              {app.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteAppointment(app.id)}
                        className="text-[#8A7F72] hover:text-rose-400 p-1.5 rounded-xl hover:bg-[#1E1C19]"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#221F1B] flex items-center justify-between">
                      <span className="text-[11px] text-[#8A7F72]">
                        Cargado por {app.createdBy || 'Mamá'}
                      </span>
                      <button
                        onClick={() =>
                          downloadAppleCalendarICS({
                            title: `Turno: ${app.title}`,
                            date: app.date,
                            time: app.time,
                            location: app.location,
                            description: app.description || `Profesional: ${app.doctor || ''}`
                          })
                        }
                        className="text-xs font-semibold text-[#E6D5B8] hover:text-[#F5EFE6] flex items-center gap-1"
                      >
                        <CalendarPlus className="w-3.5 h-3.5" /> Calendario iPhone
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'studies' && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#141312] p-5 rounded-3xl border border-[#292520]">
              <div>
                <h2 className="text-lg font-bold text-[#F5EFE6]">Estudios médicos y controles</h2>
                <p className="text-xs text-[#9C9183]">
                  Ecografías, análisis, monitoreos y comentarios entre Mamá y Papá
                </p>
              </div>
              <button
                onClick={() => {
                  setStudyForm((prev) => ({
                    ...prev,
                    date: selectedDate || todayStr,
                    week: String(pregnancyStats.weeks)
                  }));
                  setShowStudyModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#E6D5B8] hover:bg-[#EFE2CA] text-[#121110] text-sm font-bold shadow-md transition-colors"
              >
                <Plus className="w-4 h-4" /> Cargar estudio
              </button>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setStudyFilter('todos')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border ${
                  studyFilter === 'todos'
                    ? 'bg-[#E6D5B8] text-[#121110] border-[#E6D5B8]'
                    : 'bg-[#141312] text-[#9C9183] border-[#292520] hover:text-[#F5EFE6]'
                }`}
              >
                Todos ({data.studies.length})
              </button>
              {STUDY_CATEGORIES.map((cat) => {
                const count = data.studies.filter((s) => s.category === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setStudyFilter(cat.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border ${
                      studyFilter === cat.id
                        ? 'bg-[#E6D5B8] text-[#121110] border-[#E6D5B8]'
                        : 'bg-[#141312] text-[#9C9183] border-[#292520] hover:text-[#F5EFE6]'
                    }`}
                  >
                    {cat.label} {count > 0 ? `(${count})` : ''}
                  </button>
                );
              })}
            </div>

            {filteredStudies.length === 0 ? (
              <div className="bg-[#141312] rounded-3xl p-10 text-center border border-[#292520]">
                <Activity className="w-10 h-10 text-[#C8B08E] mx-auto mb-3 opacity-80" />
                <p className="font-semibold text-[#F5EFE6]">No hay estudios en esta categoría</p>
                <p className="text-xs text-[#9C9183] mt-1">
                  Registrá ecografías, análisis de sangre o controles y comenten juntos cada resultado.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredStudies.map((study) => {
                  const catMeta = getCategoryMeta(study.category);
                  const categoryDisplay =
                    study.category === 'otro' && study.customType ? study.customType : catMeta.label;
                  const comments = study.comments || [];

                  return (
                    <div
                      key={study.id}
                      className="bg-[#141312] rounded-3xl p-5 border border-[#292520] space-y-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${catMeta.badge}`}
                            >
                              {categoryDisplay}
                            </span>
                            {study.week && (
                              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#221F1B] text-[#D8CBB8] border border-[#332E28]">
                                Semana {study.week}
                              </span>
                            )}
                            <button
                              onClick={() => toggleStudyStatus(study.id)}
                              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border transition-colors ${
                                study.status === 'realizado'
                                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                  : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                              }`}
                            >
                              {study.status === 'realizado' ? 'Realizado ✓' : 'Pendiente'}
                            </button>
                          </div>
                          <h3 className="font-bold text-base text-[#F5EFE6]">{study.title}</h3>
                          <p className="text-xs text-[#9C9183]">
                            {formatReadableDate(study.date)}
                            {study.time ? ` • ${study.time} hs` : ''}
                            {study.clinic ? ` • ${study.clinic}` : ''}
                          </p>
                        </div>
                        <button
                          onClick={() => deleteStudy(study.id)}
                          className="text-[#8A7F72] hover:text-rose-400 p-1.5 rounded-xl hover:bg-[#1E1C19]"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {study.description && (
                        <p className="text-sm text-[#D8CBB8] bg-[#1A1816] p-3.5 rounded-2xl border border-[#282420] whitespace-pre-line">
                          {study.description}
                        </p>
                      )}

                      <div className="pt-3 border-t border-[#23201C] space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#C8B08E] flex items-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5" />
                            Comentarios del estudio ({comments.length})
                          </span>
                          <span className="text-[11px] text-[#8A7F72]">
                            Comentando como <strong className="text-[#E6D5B8]">{activeParent}</strong>
                          </span>
                        </div>

                        {comments.length > 0 && (
                          <div className="space-y-2">
                            {comments.map((c) => (
                              <div
                                key={c.id}
                                className="flex items-start justify-between gap-2 bg-[#1A1816] px-3.5 py-2.5 rounded-2xl border border-[#282420]"
                              >
                                <div className="text-xs">
                                  <div className="flex items-center gap-2 mb-0.5">
                                    <span className="font-bold text-[#E6D5B8]">{c.author}</span>
                                    <span className="text-[10px] text-[#8A7F72]">
                                      {formatReadableDate(c.date)}
                                    </span>
                                  </div>
                                  <p className="text-[#E5DDD0]">{c.text}</p>
                                </div>
                                <button
                                  onClick={() => deleteStudyComment(study.id, c.id)}
                                  className="text-[#786E62] hover:text-rose-400 p-1"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        <form
                          onSubmit={(e) => addStudyComment(study.id, e)}
                          className="flex items-center gap-2"
                        >
                          <input
                            type="text"
                            placeholder={`Escribir comentario como ${activeParent}...`}
                            value={commentDrafts[study.id] || ''}
                            onChange={(e) =>
                              setCommentDrafts((prev) => ({
                                ...prev,
                                [study.id]: e.target.value
                              }))
                            }
                            className="flex-1 text-xs px-3.5 py-2.5 rounded-xl bg-[#1C1A17] border border-[#2E2924] text-[#F5EFE6] placeholder-[#786E62] focus:outline-none focus:border-[#E6D5B8]"
                          />
                          <button
                            type="submit"
                            className="px-3.5 py-2.5 rounded-xl bg-[#E6D5B8] hover:bg-[#EFE2CA] text-[#121110] text-xs font-bold flex items-center gap-1 transition-colors"
                          >
                            <Send className="w-3.5 h-3.5" /> Comentar
                          </button>
                        </form>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#141312] p-5 rounded-3xl border border-[#292520]">
              <div>
                <h2 className="text-lg font-bold text-[#F5EFE6]">Bitácora y comentarios</h2>
                <p className="text-xs text-[#9C9183]">
                  Escribí libremente lo que quieras recordar o compartir sin campos obligatorios extra
                </p>
              </div>
              <button
                onClick={() => {
                  setNoteForm({
                    title: '',
                    date: selectedDate || todayStr,
                    mood: '',
                    symptoms: [],
                    description: ''
                  });
                  setShowNoteModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#E6D5B8] hover:bg-[#EFE2CA] text-[#121110] text-sm font-bold shadow-md transition-colors"
              >
                <Plus className="w-4 h-4" /> Nuevo comentario
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-[#8A7F72] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar en comentarios, síntomas o notas..."
                value={noteSearch}
                onChange={(e) => setNoteSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#141312] border border-[#292520] text-sm text-[#F5EFE6] placeholder-[#786E62] focus:outline-none focus:border-[#E6D5B8]"
              />
            </div>

            {filteredNotes.length === 0 ? (
              <div className="bg-[#141312] rounded-3xl p-10 text-center border border-[#292520]">
                <BookOpen className="w-10 h-10 text-[#C8B08E] mx-auto mb-3 opacity-80" />
                <p className="font-semibold text-[#F5EFE6]">Todavía no hay comentarios guardados</p>
                <p className="text-xs text-[#9C9183] mt-1">
                  Anotá dudas para el médico, sensaciones del día o momentos especiales.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNotes.map((note) => (
                  <div
                    key={note.id}
                    className="bg-[#141312] rounded-3xl p-5 border border-[#292520] space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-[#C8B08E]">
                            {formatReadableDate(note.date)}
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#221F1B] text-[#E6D5B8] border border-[#332E28] font-medium">
                            {note.author || 'Mamá'}
                          </span>
                          {note.mood && (
                            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-[#E6D5B8]/12 text-[#E6D5B8]">
                              {note.mood}
                            </span>
                          )}
                        </div>
                        {note.title && (
                          <h3 className="font-bold text-base text-[#F5EFE6] mt-1">{note.title}</h3>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => shareSingleNote(note)}
                          className="text-[#9C9183] hover:text-[#E6D5B8] p-1.5 rounded-xl hover:bg-[#1E1C19]"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteNote(note.id)}
                          className="text-[#8A7F72] hover:text-rose-400 p-1.5 rounded-xl hover:bg-[#1E1C19]"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-sm text-[#E5DDD0] whitespace-pre-line leading-relaxed">
                      {note.description}
                    </p>

                    {note.symptoms && note.symptoms.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {note.symptoms.map((sym) => (
                          <span
                            key={sym}
                            className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-[#1E1C19] text-[#C8B08E] border border-[#2E2924]"
                          >
                            {sym}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-[#191714] via-[#141312] to-[#1C1813] rounded-3xl p-6 border border-[#332D26] shadow-xl shadow-black/50">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-[#E6D5B8]/15 text-[#E6D5B8] border border-[#E6D5B8]/25 mb-2">
                    <Sparkles className="w-3.5 h-3.5" /> Trimestre {pregnancyStats.trimester} •{' '}
                    {data.pregnancy.babyName}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#F5EFE6]">
                    {pregnancyStats.weeks} semanas y {pregnancyStats.days}{' '}
                    {pregnancyStats.days === 1 ? 'día' : 'días'}
                  </h2>
                  <p className="text-sm text-[#9C9183] mt-1">
                    Fecha probable de parto (FPP):{' '}
                    <strong className="text-[#E6D5B8]">
                      {formatReadableDate(pregnancyStats.fppStr)}
                    </strong>{' '}
                    • Faltan <strong className="text-[#F5EFE6]">{pregnancyStats.daysRemaining}</strong>{' '}
                    días
                  </p>
                </div>

                <div className="bg-[#1E1C19] rounded-2xl p-4 border border-[#2F2A24] min-w-[175px]">
                  <p className="text-xs text-[#9C9183] font-medium">Progreso del embarazo</p>
                  <p className="text-2xl font-extrabold text-[#E6D5B8] mt-0.5">
                    {pregnancyStats.progress}%
                  </p>
                  <p className="text-[11px] text-[#8A7F72] mt-0.5">
                    Día {pregnancyStats.totalDays} de 280
                  </p>
                </div>
              </div>

              <div className="w-full h-3 bg-[#24211D] rounded-full overflow-hidden p-0.5 border border-[#302B25]">
                <div
                  className="h-full bg-gradient-to-r from-[#C8B08E] to-[#E6D5B8] rounded-full transition-all duration-500"
                  style={{ width: `${pregnancyStats.progress}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#141312] p-5 rounded-2xl border border-[#292520] flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#E6D5B8]/12 text-[#E6D5B8] flex items-center justify-center">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-[#9C9183] font-medium">Próximos turnos</p>
                  <p className="text-2xl font-bold text-[#F5EFE6]">{upcomingAppointments.length}</p>
                </div>
              </div>

              <div className="bg-[#141312] p-5 rounded-2xl border border-[#292520] flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/12 text-sky-300 flex items-center justify-center">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-[#9C9183] font-medium">Estudios cargados</p>
                  <p className="text-2xl font-bold text-[#F5EFE6]">{data.studies.length}</p>
                </div>
              </div>

              <div className="bg-[#141312] p-5 rounded-2xl border border-[#292520] flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/12 text-emerald-300 flex items-center justify-center">
                  <Heart className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-[#9C9183] font-medium">Comentarios</p>
                  <p className="text-2xl font-bold text-[#F5EFE6]">{data.notes.length}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-[#141312] rounded-3xl p-6 border border-[#292520]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-base text-[#F5EFE6] flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#E6D5B8]" /> Próximos turnos
                  </h3>
                  <button
                    onClick={() => setActiveTab('appointments')}
                    className="text-xs font-semibold text-[#E6D5B8] hover:underline"
                  >
                    Ver todos
                  </button>
                </div>

                {upcomingAppointments.length === 0 ? (
                  <p className="text-sm text-[#8A7F72] py-6 text-center">
                    No tenés turnos próximos agendados.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {upcomingAppointments.slice(0, 3).map((app) => (
                      <div
                        key={app.id}
                        className="p-3.5 rounded-2xl bg-[#1A1816] border border-[#282420] flex items-center justify-between gap-3"
                      >
                        <div>
                          <p className="font-semibold text-sm text-[#F5EFE6]">{app.title}</p>
                          <p className="text-xs text-[#9C9183]">
                            {formatReadableDate(app.date)} • {app.time} hs
                            {app.doctor ? ` • ${app.doctor}` : ''}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            downloadAppleCalendarICS({
                              title: `Turno: ${app.title}`,
                              date: app.date,
                              time: app.time,
                              location: app.location,
                              description: app.description
                            })
                          }
                          className="p-2 rounded-xl bg-[#24211D] hover:bg-[#2E2A25] text-[#E6D5B8] border border-[#342F29]"
                        >
                          <CalendarPlus className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-[#141312] rounded-3xl p-6 border border-[#292520]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-base text-[#F5EFE6] flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#E6D5B8]" /> Últimos comentarios
                  </h3>
                  <button
                    onClick={() => setActiveTab('notes')}
                    className="text-xs font-semibold text-[#E6D5B8] hover:underline"
                  >
                    Ver bitácora
                  </button>
                </div>

                {data.notes.length === 0 ? (
                  <p className="text-sm text-[#8A7F72] py-6 text-center">
                    Todavía no hay comentarios registrados.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {data.notes.slice(0, 3).map((note) => (
                      <div
                        key={note.id}
                        className="p-3.5 rounded-2xl bg-[#1A1816] border border-[#282420]"
                      >
                        <div className="flex items-center justify-between text-xs text-[#9C9183] mb-1">
                          <span className="font-semibold text-[#C8B08E]">
                            {note.title || 'Comentario'} • {note.author || 'Mamá'}
                          </span>
                          <span>{formatReadableDate(note.date)}</span>
                        </div>
                        <p className="text-sm text-[#E5DDD0] line-clamp-2">{note.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-[#121110]/95 backdrop-blur-md border-t border-[#292520] z-30">
        <div className="grid grid-cols-5 py-1.5">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center py-1 text-[10px] font-medium transition-colors ${
                  active ? 'text-[#E6D5B8] font-bold' : 'text-[#8A7F72]'
                }`}
              >
                <Icon className={`w-4 h-4 mb-0.5 ${active ? 'text-[#E6D5B8]' : ''}`} />
                <span className="truncate max-w-[64px]">
                  {tab.id === 'notes' ? 'Comentarios' : tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {showShareModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#161513] border border-[#2E2924] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#E6D5B8]" />
                <h3 className="text-lg font-bold text-[#F5EFE6]">Compartir acceso</h3>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-1.5 rounded-xl hover:bg-[#24211D] text-[#9C9183]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#1C1A17] p-4 rounded-2xl border border-[#2C2722] space-y-2">
              <p className="text-xs text-[#9C9183]">
                Compartí este código o enlace directo para abrir el mismo espacio desde otro celular o
                navegador:
              </p>
              <div className="flex items-center justify-between gap-2 pt-1">
                <span className="text-base font-extrabold tracking-wider text-[#E6D5B8]">
                  {data.familyCode}
                </span>
                <button
                  onClick={copyFamilyCode}
                  className="px-3 py-1.5 rounded-xl bg-[#26231F] hover:bg-[#302C27] text-xs font-semibold text-[#F5EFE6] border border-[#38332D] flex items-center gap-1.5"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" /> Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#E6D5B8]" /> Copiar código
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#C8B08E] flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5" /> Enlace directo del espacio
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareableUrl}
                  className="flex-1 text-xs px-3 py-2.5 rounded-xl bg-[#1C1A17] border border-[#2E2924] text-[#D8CBB8]"
                />
                <button
                  type="button"
                  onClick={copyShareLink}
                  className="px-3 py-2.5 rounded-xl bg-[#26231F] hover:bg-[#302C27] text-xs font-semibold text-[#E6D5B8] border border-[#38332D] flex items-center gap-1"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {copiedLink ? 'Listo' : 'Link'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#C8B08E] mb-1">
                Vincular con otro código existente
              </label>
              <input
                type="text"
                value={data.familyCode}
                onChange={(e) =>
                  setData((prev) => ({ ...prev, familyCode: e.target.value.toUpperCase() }))
                }
                placeholder="Ej: BEBE-1234"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1A17] border border-[#2E2924] text-sm uppercase text-[#F5EFE6] focus:outline-none focus:border-[#E6D5B8]"
              />
            </div>

            <div className="flex items-start gap-2.5 text-xs text-[#9C9183] bg-[#1A1816] p-3 rounded-2xl border border-[#26221E]">
              <ShieldCheck className="w-4 h-4 text-[#E6D5B8] shrink-0 mt-0.5" />
              <span>
                Ambos pueden cambiar entre <strong>Mamá</strong> y <strong>Papá</strong> arriba a la
                derecha para identificar quién escribe cada comentario o turno.
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={shareViaWhatsApp}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#E6D5B8] hover:bg-[#EFE2CA] text-[#121110] text-sm font-bold flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" /> Enviar por WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#161513] border border-[#2E2924] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#F5EFE6]">Configurar embarazo</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1.5 rounded-xl hover:bg-[#24211D] text-[#9C9183]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#C8B08E] mb-1">
                Nombre o apodo del bebé
              </label>
              <input
                type="text"
                value={data.pregnancy.babyName}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    pregnancy: { ...prev.pregnancy, babyName: e.target.value }
                  }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1A17] border border-[#2E2924] text-sm text-[#F5EFE6] focus:outline-none focus:border-[#E6D5B8]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#C8B08E] mb-1">
                Fecha de Última Menstruación (FUM)
              </label>
              <input
                type="date"
                value={data.pregnancy.fum}
                onChange={(e) => handleFumChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1A17] border border-[#2E2924] text-sm text-[#F5EFE6] focus:outline-none focus:border-[#E6D5B8]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#C8B08E] mb-1">
                Fecha Probable de Parto (FPP)
              </label>
              <input
                type="date"
                value={pregnancyStats.fppStr}
                onChange={(e) => handleFppChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1A17] border border-[#2E2924] text-sm text-[#F5EFE6] focus:outline-none focus:border-[#E6D5B8]"
              />
              <p className="text-[11px] text-[#8A7F72] mt-1">
                Si modificás la FPP, la FUM se recalcula automáticamente (40 semanas).
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowSettings(false)}
                className="px-5 py-2.5 rounded-xl bg-[#E6D5B8] hover:bg-[#EFE2CA] text-[#121110] text-sm font-bold"
              >
                Listo
              </button>
            </div>
          </div>
        </div>
      )}

      {showAppModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={addAppointment}
            className="bg-[#161513] border border-[#2E2924] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#F5EFE6]">Nuevo turno médico</h3>
              <button
                type="button"
                onClick={() => setShowAppModal(false)}
                className="p-1.5 rounded-xl hover:bg-[#24211D] text-[#9C9183]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#C8B08E] mb-1">
                Motivo o control *
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Control obstétrico mensual"
                value={appForm.title}
                onChange={(e) => setAppForm({ ...appForm, title: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1A17] border border-[#2E2924] text-sm text-[#F5EFE6] focus:outline-none focus:border-[#E6D5B8]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#C8B08E] mb-1">Fecha *</label>
                <input
                  type="date"
                  required
                  value={appForm.date}
                  onChange={(e) => setAppForm({ ...appForm, date: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#1C1A17] border border-[#2E2924] text-sm text-[#F5EFE6] focus:outline-none focus:border-[#E6D5B8]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#C8B08E] mb-1">Hora *</label>
                <input
                  type="time"
                  required
                  value={appForm.time}
                  onChange={(e) => setAppForm({ ...appForm, time: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#1C1A17] border border-[#2E2924] text-sm text-[#F5EFE6] focus:outline-none focus:border-[#E6D5B8]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#C8B08E] mb-1">
                  Profesional
                </label>
                <input
                  type="text"
                  placeholder="Ej: Dra. Pérez"
                  value={appForm.doctor}
                  onChange={(e) => setAppForm({ ...appForm, doctor: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#1C1A17] border border-[#2E2924] text-sm text-[#F5EFE6] focus:outline-none focus:border-[#E6D5B8]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#C8B08E] mb-1">
                  Lugar / Clínica
                </label>
                <input
                  type="text"
                  placeholder="Ej: Sanatorio"
                  value={appForm.location}
                  onChange={(e) => setAppForm({ ...appForm, location: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#1C1A17] border border-[#2E2924] text-sm text-[#F5EFE6] focus:outline-none focus:border-[#E6D5B8]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#C8B08E] mb-1">
                Notas o preguntas para el turno
              </label>
              <textarea
                rows={2}
                placeholder="Ej: Llevar estudios de sangre..."
                value={appForm.description}
                onChange={(e) => setAppForm({ ...appForm, description: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1A17] border border-[#2E2924] text-sm text-[#F5EFE6] focus:outline-none focus:border-[#E6D5B8]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAppModal(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-[#9C9183] hover:bg-[#221F1B]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#E6D5B8] hover:bg-[#EFE2CA] text-[#121110] text-sm font-bold"
              >
                Guardar turno
              </button>
            </div>
          </form>
        </div>
      )}

      {showStudyModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={addStudy}
            className="bg-[#161513] border border-[#2E2924] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#F5EFE6]">Cargar estudio médico</h3>
              <button
                type="button"
                onClick={() => setShowStudyModal(false)}
                className="p-1.5 rounded-xl hover:bg-[#24211D] text-[#9C9183]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#C8B08E] mb-1.5">
                Tipo de estudio
              </label>
              <div className="grid grid-cols-2 gap-2">
                {STUDY_CATEGORIES.map((cat) => (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setStudyForm({ ...studyForm, category: cat.id })}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold text-left border transition-all ${
                      studyForm.category === cat.id
                        ? 'bg-[#E6D5B8] text-[#121110] border-[#E6D5B8] font-bold'
                        : 'bg-[#1C1A17] text-[#D8CBB8] border-[#2E2924] hover:border-[#423B33]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {studyForm.category === 'otro' && (
              <div>
                <label className="block text-xs font-semibold text-[#C8B08E] mb-1">
                  Especificá el tipo de estudio
                </label>
                <input
                  type="text"
                  placeholder="Ej: Scan fetal, Doppler, Urocultivo..."
                  value={studyForm.customType}
                  onChange={(e) => setStudyForm({ ...studyForm, customType: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1A17] border border-[#2E2924] text-sm text-[#F5EFE6] focus:outline-none focus:border-[#E6D5B8]"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#C8B08E] mb-1">
                Nombre del estudio *
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Ecografía morfológica / Laboratorio 2do trimestre"
                value={studyForm.title}
                onChange={(e) => setStudyForm({ ...studyForm, title: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1A17] border border-[#2E2924] text-sm text-[#F5EFE6] focus:outline-none focus:border-[#E6D5B8]"
              />
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-[#C8B08E] mb-1">Fecha</label>
                <input
                  type="date"
                  value={studyForm.date}
                  onChange={(e) => setStudyForm({ ...studyForm, date: e.target.value })}
                  className="w-full px-2.5 py-2.5 rounded-xl bg-[#1C1A17] border border-[#2E2924] text-xs text-[#F5EFE6]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#C8B08E] mb-1">Hora</label>
                <input
                  type="time"
                  value={studyForm.time}
                  onChange={(e) => setStudyForm({ ...studyForm, time: e.target.value })}
                  className="w-full px-2.5 py-2.5 rounded-xl bg-[#1C1A17] border border-[#2E2924] text-xs text-[#F5EFE6]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#C8B08E] mb-1">Semana</label>
                <input
                  type="number"
                  min="1"
                  max="42"
                  placeholder={String(pregnancyStats.weeks)}
                  value={studyForm.week}
                  onChange={(e) => setStudyForm({ ...studyForm, week: e.target.value })}
                  className="w-full px-2.5 py-2.5 rounded-xl bg-[#1C1A17] border border-[#2E2924] text-xs text-[#F5EFE6]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#C8B08E] mb-1">
                  Centro / Laboratorio
                </label>
                <input
                  type="text"
                  placeholder="Ej: Diagnóstico Médico"
                  value={studyForm.clinic}
                  onChange={(e) => setStudyForm({ ...studyForm, clinic: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#1C1A17] border border-[#2E2924] text-sm text-[#F5EFE6]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#C8B08E] mb-1">Estado</label>
                <select
                  value={studyForm.status}
                  onChange={(e) => setStudyForm({ ...studyForm, status: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#1C1A17] border border-[#2E2924] text-sm text-[#F5EFE6]"
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="realizado">Realizado</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#C8B08E] mb-1">
                Resultados u observaciones
              </label>
              <textarea
                rows={3}
                placeholder="Anotá valores, percentilos, indicaciones médicas o detalles..."
                value={studyForm.description}
                onChange={(e) => setStudyForm({ ...studyForm, description: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1A17] border border-[#2E2924] text-sm text-[#F5EFE6]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowStudyModal(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-[#9C9183] hover:bg-[#221F1B]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#E6D5B8] hover:bg-[#EFE2CA] text-[#121110] text-sm font-bold"
              >
                Guardar estudio
              </button>
            </div>
          </form>
        </div>
      )}

      {showNoteModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={addNote}
            className="bg-[#161513] border border-[#2E2924] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#F5EFE6]">Nuevo comentario</h3>
                <p className="text-[11px] text-[#9C9183]">
                  Escribiendo como <strong className="text-[#E6D5B8]">{activeParent}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowNoteModal(false)}
                className="p-1.5 rounded-xl hover:bg-[#24211D] text-[#9C9183]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#C8B08E] mb-1">
                Comentario o nota *
              </label>
              <textarea
                rows={4}
                required
                placeholder="Escribí acá tu comentario, sensación o recordatorio..."
                value={noteForm.description}
                onChange={(e) => setNoteForm({ ...noteForm, description: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1A17] border border-[#2E2924] text-sm text-[#F5EFE6] focus:outline-none focus:border-[#E6D5B8]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#C8B08E] mb-1">
                  Título (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Primera patadita"
                  value={noteForm.title}
                  onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#1C1A17] border border-[#2E2924] text-xs text-[#F5EFE6]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#C8B08E] mb-1">Fecha</label>
                <input
                  type="date"
                  value={noteForm.date}
                  onChange={(e) => setNoteForm({ ...noteForm, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#1C1A17] border border-[#2E2924] text-xs text-[#F5EFE6]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#C8B08E] mb-1">
                Estado de ánimo (opcional)
              </label>
              <input
                type="text"
                placeholder="Opcional: escribí cómo te sentís..."
                value={noteForm.mood}
                onChange={(e) => setNoteForm({ ...noteForm, mood: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-[#1C1A17] border border-[#2E2924] text-xs text-[#F5EFE6]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#C8B08E] mb-1.5">
                Etiquetas / síntomas (opcional)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {symptomOptions.map((sym) => {
                  const active = noteForm.symptoms.includes(sym);
                  return (
                    <button
                      type="button"
                      key={sym}
                      onClick={() => toggleSymptom(sym)}
                      className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-colors ${
                        active
                          ? 'bg-[#E6D5B8] text-[#121110] border-[#E6D5B8] font-bold'
                          : 'bg-[#1C1A17] text-[#B5A999] border-[#2E2924] hover:border-[#423B33]'
                      }`}
                    >
                      {sym}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNoteModal(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-[#9C9183] hover:bg-[#221F1B]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#E6D5B8] hover:bg-[#EFE2CA] text-[#121110] text-sm font-bold"
              >
                Guardar comentario
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);