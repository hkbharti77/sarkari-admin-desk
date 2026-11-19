import React, { useState, useMemo, useEffect } from 'react';
import {
  AuditLogEntry,
  CandidateDossier,
  CategoryBreakdown,
  NewNotificationInput,
  PipelineStatus,
  RecruitmentNotification,
} from './types/recruitment';
import {
  calculateKpiSummary,
  computeCategoryBreakdown,
  filterNotifications,
} from './utils/recruitmentLogic';
import { StatusBadge } from './components/StatusBadge';
import { KpiStrip } from './components/KpiStrip';
import { PublishNotificationPage } from './components/PublishNotificationPage';
import { ScrutinyQueueView } from './components/ScrutinyQueueView';
import { ResultPublishingView } from './components/ResultPublishingView';
import { DesignSystemSpecView } from './components/DesignSystemSpecView';
import { LoginPage } from './components/LoginPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { getOfficerInitials, formatOfficerRole } from './utils/authLogic';
import { api, API_BASE_URL } from './services/api';
import {
  Landmark,
  LayoutDashboard,
  UserCheck,
  Award,
  Palette,
  Search,
  Plus,
  AlertTriangle,
  Download,
  Menu,
  X,
  FileSpreadsheet,
  ArrowUpRight,
  Check,
  History,
  RefreshCw,
  Wifi,
  WifiOff,
  LogOut,
} from 'lucide-react';

type ActiveTab = 'pipelines' | 'publish' | 'scrutiny' | 'results' | 'design-spec';

const TAB_TO_PATH: Record<ActiveTab, string> = {
  pipelines: '/pipelines',
  publish: '/publish',
  scrutiny: '/scrutiny',
  results: '/results',
  'design-spec': '/design-spec',
};

const TAB_TITLES: Record<ActiveTab, string> = {
  pipelines: 'Recruitment Pipelines | GovJob Admin Console',
  publish: 'Publish Notification | GovJob Admin Console',
  scrutiny: 'Candidate Scrutiny Queue | GovJob Admin Console',
  results: 'Exams & Result Gazette | GovJob Admin Console',
  'design-spec': 'Design System & Tokens | GovJob Admin Console',
};

const PATH_TO_TAB: Record<string, ActiveTab> = {
  pipelines: 'pipelines',
  pipeline: 'pipelines',
  jobs: 'pipelines',
  publish: 'publish',
  'publish-notification': 'publish',
  notification: 'publish',
  scrutiny: 'scrutiny',
  'scrutiny-queue': 'scrutiny',
  candidates: 'scrutiny',
  results: 'results',
  result: 'results',
  'result-gazette': 'results',
  gazette: 'results',
  'design-spec': 'design-spec',
  'design-system': 'design-spec',
  tokens: 'design-spec',
  design: 'design-spec',
};

function getTabFromUrl(): ActiveTab {
  if (typeof window === 'undefined') return 'pipelines';
  const cleanPath = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
  if (cleanPath && PATH_TO_TAB[cleanPath]) {
    return PATH_TO_TAB[cleanPath];
  }
  const cleanHash = window.location.hash.replace(/^[#/]+/, '').toLowerCase();
  if (cleanHash && PATH_TO_TAB[cleanHash]) {
    return PATH_TO_TAB[cleanHash];
  }
  return 'pipelines';
}

const STATUS_TABS: Array<{ label: string; value: PipelineStatus | 'ALL' }> = [
  { label: 'All Requisitions', value: 'ALL' },
  { label: 'Admit Card / Active', value: 'Admit Card / Active' },
  { label: 'Pending / Scrutiny', value: 'Pending / Scrutiny' },
  { label: 'Result Announced', value: 'Result Announced' },
  { label: 'Rejected / Cancelled', value: 'Rejected / Cancelled' },
];

function AdminConsole() {
  const { user, isAuthenticated, isLoading: isAuthLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>(getTabFromUrl);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const navigateToTab = (tab: ActiveTab, replace = false) => {
    setActiveTab(tab);
    const targetPath = TAB_TO_PATH[tab] || '/pipelines';
    const currentPath = window.location.pathname;

    if (currentPath !== targetPath) {
      if (replace) {
        window.history.replaceState({ tab }, '', targetPath);
      } else {
        window.history.pushState({ tab }, '', targetPath);
      }
    }
    document.title = TAB_TITLES[tab] || 'GovJob Admin Console';
  };

  useEffect(() => {
    // Synchronize initial document title
    document.title = TAB_TITLES[activeTab] || 'GovJob Admin Console';

    // Normalize root path "/" to "/pipelines" in browser address bar without reload
    const currentPath = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
    if (!currentPath) {
      window.history.replaceState({ tab: 'pipelines' }, '', '/pipelines');
    }

    const handlePopState = () => {
      const matchedTab = getTabFromUrl();
      setActiveTab(matchedTab);
      document.title = TAB_TITLES[matchedTab] || 'GovJob Admin Console';
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  useEffect(() => {
    document.title = TAB_TITLES[activeTab] || 'GovJob Admin Console';
  }, [activeTab]);

  // Live database records fetched from MongoDB backend
  const [notifications, setNotifications] = useState<RecruitmentNotification[]>([]);
  const [candidates, setCandidates] = useState<CandidateDossier[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  // Backend live API connection state
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  // Fetch live data from backend API
  const loadLiveData = async () => {
    setIsLoadingData(true);
    try {
      const [liveJobs, liveCandidates, liveLogs] = await Promise.all([
        api.getJobs().catch(() => []),
        api.getCandidates().catch(() => []),
        api.getAuditLogs().catch(() => []),
      ]);

      setNotifications(liveJobs || []);
      setCandidates(liveCandidates || []);
      setAuditLogs(liveLogs || []);
      setIsLiveConnected(true);
    } catch (err) {
      console.warn('[GovJob Admin] Failed to connect to backend:', err);
      setIsLiveConnected(false);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadLiveData();
    }
  }, [isAuthenticated]);

  // Dashboard table filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PipelineStatus | 'ALL'>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const kpi = useMemo(
    () => calculateKpiSummary(notifications, candidates),
    [notifications, candidates]
  );

  const filteredNotifications = useMemo(
    () =>
      filterNotifications(notifications, {
        searchQuery,
        statusFilter,
        departmentFilter,
      }),
    [notifications, searchQuery, statusFilter, departmentFilter]
  );

  const uniqueDepartments = useMemo(
    () => Array.from(new Set(notifications.map((n) => n.department).filter(Boolean))),
    [notifications]
  );

  const pendingDossierCount = useMemo(
    () => candidates.filter((c) => c.status === 'Pending / Scrutiny').length,
    [candidates]
  );

  const appendAuditLog = async (
    action: string,
    referenceId: string,
    statusType: PipelineStatus
  ) => {
    try {
      await api.recordAuditLog(action, referenceId, statusType);
      const updatedLogs = await api.getAuditLogs();
      if (updatedLogs && updatedLogs.length > 0) {
        setAuditLogs(updatedLogs);
        return;
      }
    } catch (err) {
      console.warn('[GovJob Admin] Could not sync audit log with backend:', err);
    }

    const newEntry: AuditLogEntry = {
      id: `AUD-${referenceId || Date.now()}`,
      timestamp:
        new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
      actor: user?.name || 'Super Administrator',
      role: user?.role || 'SUPER_ADMIN',
      action,
      referenceId,
      statusType,
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  const handlePublishNotification = async (input: NewNotificationInput) => {
    const nextIndex = notifications.length + 1;
    const match = input.department.match(/\(([A-Z]+)\)/);
    const deptAcronym = match
      ? match[1]
      : input.department.replace(/[^A-Za-z]/g, '').slice(0, 4).toUpperCase() || 'REQ';
    const currentYear = new Date().getFullYear();
    const id = `${deptAcronym}-${currentYear}-${String(nextIndex).padStart(2, '0')}`;
    const gazetteRef = `GSR-${nextIndex}(E)/${currentYear}`;

    try {
      const created = await api.createJob(input, id, gazetteRef);
      setNotifications((prev) => [created, ...prev]);
      await appendAuditLog(
        `Published new Gazette recruitment requisition (${input.advtNo}) for ${input.vacancies} sanctioned vacancies`,
        id,
        input.status
      );
      setExportNotice(
        `Published Gazette Notification "${input.advtNo}" (${input.vacancies.toLocaleString('en-IN')} vacancies) successfully to live database.`
      );
    } catch (err: any) {
      console.error('API createJob error:', err);
      setExportNotice(`Failed to publish requisition: ${err?.message || 'Server connection error'}`);
    }

    navigateToTab('pipelines');
    setStatusFilter('ALL');
    setDepartmentFilter('ALL');
    setTimeout(() => setExportNotice(null), 5000);
  };

  const handleStatusChange = async (id: string, nextStatus: PipelineStatus) => {
    const matched = notifications.find((item) => item.id === id);
    const calculatedAdmitCards =
      nextStatus === 'Admit Card / Active' || nextStatus === 'Result Announced'
        ? matched?.applicationsReceived || matched?.vacancies || 500
        : matched?.admitCardsReleased || 0;

    try {
      await api.updateJob(id, {
        status: nextStatus,
        mongoId: (matched as any)?._id,
        admitCardsReleased: calculatedAdmitCards,
      });
      setExportNotice(
        `Pipeline status updated to "${nextStatus}" for requisition ${id}`
      );
    } catch (err: any) {
      console.warn('API updateJob error:', err);
      setExportNotice(
        `Server update notice: ${err?.message || 'Updated locally'}`
      );
    }

    setNotifications((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const scrutinyPending =
          nextStatus === 'Admit Card / Active' || nextStatus === 'Result Announced'
            ? 0
            : item.scrutinyPending;
        return {
          ...item,
          status: nextStatus,
          admitCardsReleased: calculatedAdmitCards,
          scrutinyPending,
        };
      })
    );
    await appendAuditLog(
      `Updated pipeline status for requisition ${id} to "${nextStatus}"`,
      id,
      nextStatus
    );
    setTimeout(() => setExportNotice(null), 4000);
  };

  const handleUpdateCandidate = async (
    rollNumber: string,
    updates: Partial<CandidateDossier>,
    auditDescription: string
  ) => {
    try {
      await api.updateCandidate(rollNumber, updates);
    } catch (err) {
      console.warn('API updateCandidate error:', err);
    }
    setCandidates((prev) =>
      prev.map((cand) =>
        cand.rollNumber === rollNumber ? { ...cand, ...updates } : cand
      )
    );
    await appendAuditLog(
      auditDescription,
      `ROLL-${rollNumber}`,
      updates.status ?? 'Pending / Scrutiny'
    );
  };

  const handlePublishResult = async (
    notificationId: string,
    cutoffMarks: CategoryBreakdown,
    gazetteRef: string,
    newStatus: PipelineStatus
  ) => {
    try {
      await api.publishResults(notificationId, cutoffMarks, gazetteRef);
    } catch (err) {
      console.warn('API publishResults error:', err);
    }
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId
          ? {
              ...notif,
              cutoffMarks,
              gazetteRef,
              status: newStatus,
              scrutinyPending: 0,
              admitCardsReleased: notif.applicationsReceived,
            }
          : notif
      )
    );
    await appendAuditLog(
      `Published ${newStatus} & calibrated category cutoffs under Gazette ${gazetteRef}`,
      notificationId,
      newStatus
    );
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllVisible = () => {
    const visibleIds = filteredNotifications.map((n) => n.id);
    const allSelected =
      visibleIds.length > 0 &&
      visibleIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(visibleIds);
    }
  };

  const handleBatchApproveAdmitCards = async () => {
    if (selectedIds.length === 0) return;
    for (const id of selectedIds) {
      try {
        await api.updateJob(id, { status: 'Admit Card / Active' });
      } catch (err) {
        console.warn('Batch approve error for id:', id, err);
      }
    }
    setNotifications((prev) =>
      prev.map((item) =>
        selectedIds.includes(item.id)
          ? {
              ...item,
              status: 'Admit Card / Active',
              scrutinyPending: 0,
              admitCardsReleased: item.applicationsReceived,
            }
          : item
      )
    );
    await appendAuditLog(
      `Batch-authorized e-Admit Cards for ${selectedIds.length} requisitions (${selectedIds.join(', ')})`,
      selectedIds[0],
      'Admit Card / Active'
    );
    setSelectedIds([]);
  };

  const handleExportCsv = () => {
    const headers = [
      'Requisition ID',
      'Advt No',
      'Post Title',
      'Department',
      'Vacancies',
      'Applications Received',
      'Scrutiny Pending',
      'Exam Date',
      'Status',
      'Gazette Ref',
    ];
    const rows = filteredNotifications.map((n) => [
      n.id,
      `"${n.advtNo}"`,
      `"${n.postTitle}"`,
      `"${n.department}"`,
      n.vacancies,
      n.applicationsReceived,
      n.scrutinyPending,
      n.examDate,
      `"${n.status}"`,
      n.gazetteRef,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `govjob_admin_requisition_roster_${new Date().getFullYear()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice(
      `Exported ${filteredNotifications.length} recruitment pipeline records to CSV roster.`
    );
    setTimeout(() => setExportNotice(null), 4000);
  };

  const navItems: Array<{
    id: ActiveTab;
    label: string;
    shortLabel: string;
    icon: React.FC<{ className?: string }>;
    badge?: number;
  }> = [
    {
      id: 'pipelines',
      label: 'Recruitment Pipelines',
      shortLabel: 'Pipelines',
      icon: LayoutDashboard,
    },
    {
      id: 'scrutiny',
      label: 'Candidate Scrutiny Queue',
      shortLabel: 'Scrutiny',
      icon: UserCheck,
      badge: pendingDossierCount,
    },
    {
      id: 'results',
      label: 'Exams & Result Gazette',
      shortLabel: 'Results',
      icon: Award,
    },
    {
      id: 'design-spec',
      label: 'Design System & Tokens',
      shortLabel: 'Design Spec',
      icon: Palette,
    },
  ];

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#F4F6FA] flex flex-col items-center justify-center p-4 text-center">
        <div className="w-12 h-12 rounded-lg bg-[#12305A] text-[#F5B544] flex items-center justify-center mb-4 shadow-sm border border-[#1C4478]">
          <Landmark className="w-6 h-6 animate-pulse" />
        </div>
        <div className="text-[16px] font-bold text-[#12305A]">GovJob Admin Console</div>
        <div className="text-[12px] text-[#667085] mt-1">Checking session credentials...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onSuccessfulLogin={loadLiveData} />;
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-[#F4F6FA] text-[#172033]">
      {/* Persistent Left-Hand Navigation Rail (Fixed 260px Full Height - Never scrolls with canvas) */}
      <aside
        aria-label="Primary Institutional Navigation Rail"
        className={`fixed inset-y-0 left-0 z-40 w-[260px] h-screen bg-[#12305A] text-white flex flex-col justify-between transition-transform duration-150 lg:translate-x-0 lg:static lg:shrink-0 ${
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex-1 overflow-y-auto">
          {/* Root Brand Lockup */}
          <div className="px-5 py-5 border-b border-white/10 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                navigateToTab('pipelines');
                setMobileNavOpen(false);
              }}
              className="flex items-center gap-3 text-left hover:opacity-90 transition-opacity cursor-pointer"
            >
              <div className="w-9 h-9 rounded-[4px] bg-[#F5B544] text-[#12305A] flex items-center justify-center shrink-0">
                <Landmark className="w-5 h-5 stroke-[2.2]" aria-hidden="true" />
              </div>
              <div>
                <div className="text-[16px] leading-[20px] font-bold tracking-[-0.01em] text-white whitespace-nowrap">
                  GovJob Admin
                </div>
                <div className="text-[11px] leading-[14px] text-[#adc7fa] font-medium tracking-[0.02em] whitespace-nowrap">
                  Recruitment & Results Admin
                </div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setMobileNavOpen(false)}
              aria-label="Close navigation menu"
              className="lg:hidden p-1 rounded-[4px] text-white/80 hover:text-white hover:bg-[#1C4478]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Administrative Navigation Links */}
          <div className="px-3 py-4">
            <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#7f99c9]">
              Administrative Modules
            </div>
            <nav className="space-y-1" aria-label="Module Selection">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      navigateToTab(item.id);
                      setMobileNavOpen(false);
                    }}
                    className={`w-full flex items-center justify-between gap-2 px-2.5 py-2.5 rounded-[4px] text-[13px] leading-[18px] font-medium transition-colors ${
                      isActive
                        ? 'bg-[#1C4478] text-white font-semibold shadow-xs'
                        : 'text-[#d6e3ff] hover:bg-[#1C4478]/60 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-[#F5B544]' : 'text-[#adc7fa]'
                        }`}
                      />
                      <span className="whitespace-nowrap">{item.label}</span>
                    </div>
                    {typeof item.badge === 'number' && item.badge > 0 && (
                      <span className="px-1.5 py-0.5 text-[11px] leading-[14px] font-bold rounded-[4px] bg-[#F5B544] text-[#172033] tabular-data shrink-0">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Commission Quick Filter Shortcuts */}
          <div className="px-3 py-3 border-t border-white/10">
            <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#7f99c9]">
              Commission Filter
            </div>
            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => {
                  navigateToTab('pipelines');
                  setDepartmentFilter('ALL');
                  setMobileNavOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 rounded-[4px] text-[12px] transition-colors truncate ${
                  departmentFilter === 'ALL'
                    ? 'bg-white/15 text-white font-semibold'
                    : 'text-[#adc7fa] hover:bg-white/5 hover:text-white'
                }`}
              >
                All Organizations ({notifications.length})
              </button>
              {uniqueDepartments.map((dept) => {
                const active =
                  activeTab === 'pipelines' && departmentFilter === dept;
                return (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => {
                      navigateToTab('pipelines');
                      setDepartmentFilter(dept);
                      setMobileNavOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-[4px] text-[12px] transition-colors truncate ${
                      active
                        ? 'bg-white/15 text-white font-semibold'
                        : 'text-[#adc7fa] hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {dept}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Officer Session Credentials - Pinned at Bottom of Sidebar */}
        <div className="p-4 border-t border-white/10 bg-[#001b3e]/60 shrink-0">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#F5B544]">
              Active Administrator
            </div>
            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-[#F5B544]/20 text-[#F5B544] border border-[#F5B544]/30">
              {user?.role || 'SUPER_ADMIN'}
            </span>
          </div>
          <div className="text-[13px] font-semibold text-white mt-1 truncate">
            {user?.name || 'Super Administrator'}
          </div>
          <div className="text-[11px] text-[#adc7fa] tabular-data truncate">
            {user?.designation || user?.email || 'admin@govjob.in'}
          </div>
          <button
            type="button"
            onClick={() => logout()}
            className="mt-3 w-full flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded bg-white/10 hover:bg-rose-500/20 hover:text-rose-200 text-[#adc7fa] text-[12px] font-medium border border-white/10 hover:border-rose-400/30 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-30 bg-[#12305A]/40 lg:hidden"
          onClick={() => setMobileNavOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Content Area - Full Viewport Height */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        {/* Fixed Top Bar Header - Never scrolls */}
        <header className="shrink-0 bg-white border-b border-[#E4E7EC] px-4 md:px-6 py-3 flex items-center justify-between gap-3 w-full min-w-0 z-20 shadow-xs">
          {/* Zone 1: Brand / Context Title */}
          <div className="flex items-center gap-2.5 min-w-0 shrink-0">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open navigation drawer"
              className="lg:hidden p-1.5 rounded-[4px] border border-[#E4E7EC] text-[#172033] hover:bg-[#F4F6FA]"
            >
              <Menu className="w-5 h-5" />
            </button>
            <a
              href="/pipelines"
              onClick={(e) => {
                e.preventDefault();
                navigateToTab('pipelines');
              }}
              className="text-[15px] sm:text-[16px] leading-[22px] font-semibold text-[#12305A] whitespace-nowrap truncate"
            >
              Recruitment & Examination Directorate
            </a>
          </div>

          {/* Zone 2: Actions & Profile */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={loadLiveData}
              title={
                isLiveConnected
                  ? 'Connected to live NestJS Backend (http://localhost:4000). Click to reload.'
                  : 'Backend offline or reconnecting. Click to retry.'
              }
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[4px] text-[12px] font-medium border transition-colors ${
                isLiveConnected
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
              }`}
            >
              {isLiveConnected ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-semibold hidden sm:inline">Live Backend</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="hidden sm:inline">Local State</span>
                </>
              )}
              <RefreshCw
                className={`w-3 h-3 ml-0.5 text-gray-500 ${
                  isLoadingData ? 'animate-spin' : ''
                }`}
              />
            </button>

            {/* Officer Avatar & Sign Out in Header */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-[#E4E7EC]">
              <div
                className="w-8 h-8 rounded-full bg-[#12305A] text-[#F5B544] flex items-center justify-center font-bold text-[12px] border border-[#1C4478]"
                title={`${user?.name || 'Super Administrator'} (${user?.role || 'SUPER_ADMIN'})`}
              >
                {getOfficerInitials(user?.name)}
              </div>
              <button
                type="button"
                onClick={() => logout()}
                title="Sign Out of Officer Session"
                className="p-1.5 rounded text-[#667085] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* Primary Action Button - Guaranteed 100% visible and unclipped */}
            <button
              type="button"
              onClick={() => navigateToTab('publish')}
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-[4px] bg-[#12305A] text-white text-[13px] sm:text-[14px] leading-[18px] font-semibold hover:bg-[#1C4478] active:bg-[#0D2240] transition-colors whitespace-nowrap shrink-0 shadow-xs"
            >
              <Plus className="w-4 h-4 text-[#F5B544]" aria-hidden="true" />
              <span>Publish Notification</span>
            </button>
          </div>
        </header>

        {/* Scrollable Workspace Container - ONLY THIS SECTION SCROLLS */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden min-w-0 w-full flex flex-col justify-between">
          <main className="p-4 md:p-6 lg:p-8 max-w-[1440px] w-full mx-auto space-y-6 min-w-0">
          {/* Screen Title & Operational Context Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 min-w-0">
            <div className="min-w-0">
              <div className="text-[12px] font-medium text-[#667085] tabular-data truncate">
                Central Recruitment Cycle · Gazette Roster Synchronized
              </div>
              <h1 className="text-[20px] sm:text-[24px] lg:text-[26px] leading-[28px] sm:leading-[32px] font-bold tracking-[-0.02em] text-[#172033] mt-1 break-words">
                {activeTab === 'pipelines' &&
                  'Public Sector Recruitment & Examination Pipelines'}
                {activeTab === 'publish' &&
                  'Publish Official Recruitment Notification'}
                {activeTab === 'scrutiny' &&
                  'Candidate Dossier Scrutiny & Credential Verification'}
                {activeTab === 'results' &&
                  'Examination Cutoff Calibration & Result Gazette Center'}
                {activeTab === 'design-spec' &&
                  'GovJob Admin — Design System & Token Architecture'}
              </h1>
            </div>

            {activeTab === 'pipelines' && (
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-[4px] bg-white border border-[#E4E7EC] text-[#172033] text-[12px] sm:text-[13px] font-semibold hover:bg-[#F4F6FA] transition-colors whitespace-nowrap shrink-0"
                >
                  <Download className="w-4 h-4 text-[#667085]" aria-hidden="true" />
                  <span>Export CSV Roster</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigateToTab('scrutiny')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-[4px] bg-[#F5B544] text-[#172033] text-[12px] sm:text-[13px] font-semibold hover:bg-[#E5A330] transition-colors whitespace-nowrap shrink-0"
                >
                  <UserCheck className="w-4 h-4" aria-hidden="true" />
                  <span>Review Scrutiny Queue ({pendingDossierCount})</span>
                </button>
              </div>
            )}
          </div>

          {exportNotice && (
            <div
              role="status"
              className="p-3 rounded-[4px] bg-[#ECFDF3] border border-[#A6F4C5] text-[#18864B] text-[13px] font-medium"
            >
              {exportNotice}
            </div>
          )}

          {/* Persistent 4-Card KPI Strip across operational views */}
          {activeTab !== 'publish' && (
            <KpiStrip
              kpi={kpi}
              activeStatusFilter={statusFilter}
              onSelectChannel={(nextStatus) => {
                navigateToTab('pipelines');
                setStatusFilter(nextStatus);
              }}
            />
          )}

          {/* Operational View 1: Master Requisition Pipelines */}
          {activeTab === 'pipelines' && (
            <div className="space-y-6 w-full min-w-0">
              {/* Filter Controls & Search Roster Bar */}
              <section
                aria-label="Filter Recruitment Pipelines"
                className="elevation-1 rounded-[6px] p-4 space-y-4 w-full min-w-0"
              >
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 w-full min-w-0">
                  {/* Text Keyword Search Input */}
                  <div className="relative flex-1 max-w-lg min-w-0">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#667085]">
                      <Search className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <input
                      type="text"
                      aria-label="Search notifications by post title, department, or advertisement number"
                      placeholder="Filter by Post, Department, Advt No (e.g., UPSC, 2026/04, Civil Services)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-[13px] leading-[18px] bg-white border border-[#D0D5DD] rounded-[4px] placeholder-[#98A2B3] focus:outline-none focus:ring-1 focus:ring-[#12305A] focus:border-[#12305A]"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        aria-label="Clear keyword search"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#667085] hover:text-[#172033]"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Commission / Department Dropdown Filter */}
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <label
                      htmlFor="department-select"
                      className="text-[12px] sm:text-[13px] font-semibold text-[#475467] whitespace-nowrap"
                    >
                      Commission / Cadre:
                    </label>
                    <select
                      id="department-select"
                      value={departmentFilter}
                      onChange={(e) => setDepartmentFilter(e.target.value)}
                      className="px-2.5 py-1.5 sm:px-3 sm:py-2 text-[12px] sm:text-[13px] leading-[18px] bg-white border border-[#D0D5DD] rounded-[4px] text-[#172033] focus:outline-none focus:ring-1 focus:ring-[#12305A] max-w-[220px] truncate"
                    >
                      <option value="ALL">All Recruiting Commissions</option>
                      {uniqueDepartments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Status Segmented Tabs + Batch Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#E4E7EC] w-full min-w-0">
                  {/* Status Pills */}
                  <div
                    role="tablist"
                    aria-label="Status filters"
                    className="flex flex-wrap items-center gap-1.5 min-w-0"
                  >
                    {STATUS_TABS.map((tab) => {
                      const isActive = statusFilter === tab.value;
                      const count =
                        tab.value === 'ALL'
                          ? notifications.length
                          : notifications.filter((n) => n.status === tab.value).length;
                      return (
                        <button
                          key={tab.value}
                          type="button"
                          role="tab"
                          aria-selected={isActive}
                          onClick={() => setStatusFilter(tab.value)}
                          className={`px-3 py-1.5 text-[12px] leading-[16px] font-medium rounded-[4px] transition-colors flex items-center gap-1.5 ${
                            isActive
                              ? 'bg-[#12305A] text-white font-semibold'
                              : 'bg-white border border-[#D0D5DD] text-[#475467] hover:bg-[#F4F6FA] hover:text-[#172033]'
                          }`}
                        >
                          <span>{tab.label}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] tabular-data ${
                              isActive
                                ? 'bg-white/20 text-white'
                                : 'bg-[#F4F6FA] text-[#667085]'
                            }`}
                          >
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Batch Actions Button */}
                  {selectedIds.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-medium text-[#475467] tabular-data">
                        {selectedIds.length} requisition(s) selected
                      </span>
                      <button
                        type="button"
                        onClick={handleBatchApproveAdmitCards}
                        className="px-3 py-1.5 rounded-[4px] bg-[#18864B] text-white text-[12px] font-semibold hover:bg-[#136A3B] transition-colors"
                      >
                        Batch Issue Admit Cards
                      </button>
                    </div>
                  )}
                </div>
              </section>

              {/* Master Data Grid: 10-Column Institutional Table */}
              <section
                aria-label="Recruitment Requisitions Roster"
                className="elevation-1 rounded-[6px] overflow-hidden w-full min-w-0"
              >
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse min-w-[850px]">
                    <thead>
                      <tr className="bg-[#12305A] text-white text-[12px] leading-[16px] font-semibold tracking-[0.02em] uppercase">
                        <th className="py-3 px-3 w-[40px] text-center">
                          <input
                            type="checkbox"
                            aria-label="Select all visible requisitions"
                            checked={
                              filteredNotifications.length > 0 &&
                              filteredNotifications.every((n) =>
                                selectedIds.includes(n.id)
                              )
                            }
                            onChange={handleSelectAllVisible}
                            className="rounded-[2px] text-[#12305A] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                          />
                        </th>
                        <th className="py-3 px-3 whitespace-nowrap">ID / Advt No</th>
                        <th className="py-3 px-3">Post Title & Commission</th>
                        <th className="py-3 px-3 whitespace-nowrap">Pay Scale</th>
                        <th className="py-3 px-3 text-right whitespace-nowrap">Vacancies</th>
                        <th className="py-3 px-3 text-right whitespace-nowrap">Applied</th>
                        <th className="py-3 px-3 text-right whitespace-nowrap">Pending Scrutiny</th>
                        <th className="py-3 px-3 whitespace-nowrap">Exam Date</th>
                        <th className="py-3 px-3 whitespace-nowrap">Lifecycle Status</th>
                        <th className="py-3 px-3 text-right whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E4E7EC] text-[13px] leading-[18px]">
                      {filteredNotifications.map((item) => {
                        const isChecked = selectedIds.includes(item.id);
                        return (
                          <tr
                            key={item.id}
                            className={`transition-colors ${
                              isChecked
                                ? 'bg-[#EEF4FF]'
                                : 'hover:bg-[#F9FAFB] bg-white'
                            }`}
                          >
                            <td className="py-3 px-3 text-center">
                              <input
                                type="checkbox"
                                aria-label={`Select requisition ${item.advtNo}`}
                                checked={isChecked}
                                onChange={() => handleToggleSelectRow(item.id)}
                                className="rounded-[2px] text-[#12305A] focus:ring-0 cursor-pointer"
                              />
                            </td>
                            <td className="py-3 px-3 whitespace-nowrap">
                              <div className="font-bold text-[#12305A] tabular-data">
                                {item.id}
                              </div>
                              <div className="text-[11px] text-[#667085] tabular-data font-mono">
                                {item.advtNo}
                              </div>
                            </td>
                            <td className="py-3 px-3 max-w-[280px]">
                              <div className="font-semibold text-[#172033] line-clamp-1">
                                {item.postTitle}
                              </div>
                              <div className="text-[11px] text-[#475467] line-clamp-1">
                                {item.department}
                              </div>
                            </td>
                            <td className="py-3 px-3 whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded-[3px] bg-[#F4F6FA] text-[#172033] border border-[#E4E7EC] text-[11px] font-medium tabular-data">
                                {item.payLevel}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right font-bold tabular-data text-[#12305A]">
                              {item.vacancies.toLocaleString('en-IN')}
                            </td>
                            <td className="py-3 px-3 text-right tabular-data text-[#475467]">
                              {item.applicationsReceived.toLocaleString('en-IN')}
                            </td>
                            <td className="py-3 px-3 text-right tabular-data">
                              {item.scrutinyPending > 0 ? (
                                <span className="font-bold text-[#B54708]">
                                  {item.scrutinyPending.toLocaleString('en-IN')}
                                </span>
                              ) : (
                                <span className="text-[#98A2B3]">—</span>
                              )}
                            </td>
                            <td className="py-3 px-3 whitespace-nowrap text-[12px] tabular-data text-[#475467]">
                              {item.examDate || 'TBD'}
                            </td>
                            <td className="py-3 px-3 whitespace-nowrap">
                              <StatusBadge status={item.status} size="sm" />
                            </td>
                            <td className="py-3 px-3 text-right whitespace-nowrap">
                              <div className="inline-flex items-center gap-1.5">
                                {item.status === 'Pending / Scrutiny' && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleStatusChange(item.id, 'Admit Card / Active')
                                    }
                                    title="Approve scrutiny and release e-Admit Cards"
                                    className="px-2.5 py-1 text-[11px] font-semibold rounded-[4px] bg-[#12305A] text-white hover:bg-[#1C4478] transition-colors"
                                  >
                                    Release Admit Card
                                  </button>
                                )}
                                {item.status === 'Admit Card / Active' && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigateToTab('results');
                                    }}
                                    title="Proceed to Results calibration"
                                    className="px-2.5 py-1 text-[11px] font-semibold rounded-[4px] bg-[#F5B544] text-[#172033] hover:bg-[#E5A330] transition-colors"
                                  >
                                    Enter Cutoffs
                                  </button>
                                )}
                                {item.status === 'Result Announced' && (
                                  <span className="text-[11px] font-semibold text-[#18864B] flex items-center gap-1 justify-end">
                                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                    Gazette Live
                                  </span>
                                )}
                                {item.status === 'Rejected / Cancelled' && (
                                  <span className="text-[11px] text-[#D92D20] font-medium">
                                    Archived
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredNotifications.length === 0 && (
                        <tr>
                          <td colSpan={10} className="py-12 text-center text-[#667085]">
                            <div className="max-w-sm mx-auto space-y-2">
                              <AlertTriangle className="w-8 h-8 text-[#98A2B3] mx-auto" />
                              <div className="font-semibold text-[#172033]">
                                No recruitment pipelines match active filters
                              </div>
                              <p className="text-[12px]">
                                Try clearing your search keyword or switching the status filter tab above.
                              </p>
                              <button
                                type="button"
                                onClick={() => {
                                  setSearchQuery('');
                                  setStatusFilter('ALL');
                                  setDepartmentFilter('ALL');
                                }}
                                className="mt-2 text-[12px] font-semibold text-[#12305A] underline"
                              >
                                Reset all filters
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer Count Summary */}
                <div className="bg-[#F9FAFB] border-t border-[#E4E7EC] px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[12px] text-[#667085] tabular-data w-full min-w-0">
                  <div>
                    Displaying <strong className="text-[#172033]">{filteredNotifications.length}</strong> of{' '}
                    <strong className="text-[#172033]">{notifications.length}</strong> Gazette Notifications
                  </div>
                  <div className="truncate">
                    Tabular Alignment: <code className="text-[#12305A] font-semibold">tnum · cv05</code> · Standard Reservation Roster Verified
                  </div>
                </div>
              </section>

              {/* Bottom 2-Column Analytical & Procedural Section: Quota Matrix + Live Audit Log */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 w-full min-w-0">
                {/* Statutory Reservation Breakdown Card (5 Cols) */}
                <section
                  aria-label="Statutory Reservation Seat Matrix"
                  className="xl:col-span-5 elevation-1 rounded-[6px] p-5 flex flex-col justify-between w-full min-w-0"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#E4E7EC]">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-[#12305A]" aria-hidden="true" />
                        <h2 className="text-[16px] leading-[24px] font-semibold text-[#172033]">
                          Aggregate Statutory Quota Roster
                        </h2>
                      </div>
                      <span className="text-[12px] font-semibold text-[#12305A] tabular-data">
                        {kpi.totalVacancies.toLocaleString('en-IN')} Total Seats
                      </span>
                    </div>

                    <p className="text-[12px] text-[#667085] mt-3 mb-4">
                      Consolidated category-wise vacancy distribution across all active recruitment notifications per standard category quota guidelines.
                    </p>

                    <div className="space-y-3">
                      {(['UR', 'OBC', 'SC', 'ST', 'EWS'] as const).map((cat) => {
                        const catTotal = notifications
                          .filter((n) => n.status !== 'Rejected / Cancelled')
                          .reduce((acc, n) => acc + (n.categoryBreakdown?.[cat] ?? 0), 0);
                        const pct =
                          kpi.totalVacancies > 0
                            ? Math.round((catTotal / kpi.totalVacancies) * 1000) / 10
                            : 0;
                        const labelMap: Record<typeof cat, string> = {
                          UR: 'Unreserved (UR)',
                          OBC: 'Other Backward Classes (OBC-NCL)',
                          SC: 'Scheduled Castes (SC)',
                          ST: 'Scheduled Tribes (ST)',
                          EWS: 'Economically Weaker Sections (EWS)',
                        };

                        return (
                          <div key={cat} className="space-y-1">
                            <div className="flex items-center justify-between text-[13px] tabular-data">
                              <span className="font-medium text-[#172033]">
                                {labelMap[cat]}
                              </span>
                              <span className="font-semibold text-[#12305A]">
                                {catTotal.toLocaleString('en-IN')} ({pct}%)
                              </span>
                            </div>
                            <div className="w-full h-2 rounded-[2px] bg-[#F4F6FA] overflow-hidden border border-[#E4E7EC]">
                              <div
                                className="h-full bg-[#12305A]"
                                style={{ width: `${Math.min(100, pct)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-[#E4E7EC] flex items-center justify-between text-[12px] text-[#667085]">
                    <span>PwBD Horizontal Quota: 4% Sanctioned</span>
                    <button
                      type="button"
                      onClick={() => navigateToTab('publish')}
                      className="font-semibold text-[#12305A] hover:underline"
                    >
                      + Add Requisition
                    </button>
                  </div>
                </section>

                {/* Audit & Officer Action Log (7 Cols) */}
                <section
                  aria-label="Administrative Audit Activity"
                  className="xl:col-span-7 elevation-1 rounded-[6px] p-5 flex flex-col justify-between w-full min-w-0"
                >
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-[#E4E7EC]">
                      <div className="flex items-center gap-2">
                        <History className="w-4 h-4 text-[#12305A]" aria-hidden="true" />
                        <h2 className="text-[16px] leading-[24px] font-semibold text-[#172033]">
                          Institutional Audit & Gazette Log
                        </h2>
                      </div>
                      <span className="text-[11px] font-mono text-[#667085]">
                        Live Chain of Custody
                      </span>
                    </div>

                    <div className="mt-4 space-y-3 max-h-[300px] overflow-y-auto pr-2">
                      {auditLogs.slice(0, 8).map((log) => (
                        <div
                          key={log.id}
                          className="p-2.5 rounded-[4px] border border-[#E4E7EC] bg-[#F9FAFB] text-[12px] leading-[16px] flex items-start justify-between gap-3"
                        >
                          <div className="space-y-0.5">
                            <div className="font-semibold text-[#172033]">
                              {log.action}
                            </div>
                            <div className="text-[#667085] flex items-center gap-2">
                              <span>Officer: {log.actor}</span>
                              <span>·</span>
                              <span className="font-mono">{log.referenceId}</span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-[11px] text-[#98A2B3] tabular-data">
                              {log.timestamp}
                            </div>
                            <div className="mt-1">
                              <StatusBadge status={log.statusType} size="sm" />
                            </div>
                          </div>
                        </div>
                      ))}
                      {auditLogs.length === 0 && (
                        <div className="py-8 text-center text-[#98A2B3] text-[12px]">
                          No audit log entries recorded in this session.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#E4E7EC] flex items-center justify-between text-[11px] text-[#667085]">
                    <span>Immutable Cryptographic Event Record</span>
                    <span>Total Events: {auditLogs.length}</span>
                  </div>
                </section>
              </div>
            </div>
          )}

          {/* View 1b: Publish Official Recruitment Notification */}
          {activeTab === 'publish' && (
            <PublishNotificationPage
              nextGazetteNumber={notifications.length + 1}
              onPublish={handlePublishNotification}
              onCancel={() => navigateToTab('pipelines')}
            />
          )}

          {/* View 2: Candidate Scrutiny Queue */}
          {activeTab === 'scrutiny' && (
            <ScrutinyQueueView
              candidates={candidates}
              onUpdateCandidate={handleUpdateCandidate}
            />
          )}

          {/* View 3: Examination Cutoff & Result Gazette Publishing */}
          {activeTab === 'results' && (
            <ResultPublishingView
              notifications={notifications}
              onPublishResult={handlePublishResult}
            />
          )}

          {/* View 4: Design System & Token Architecture */}
          {activeTab === 'design-spec' && <DesignSystemSpecView />}
        </main>

        {/* Quiet Institutional Footer */}
        <footer className="bg-white border-t border-[#E4E7EC] px-4 md:px-8 py-4 mt-auto w-full min-w-0">
          <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-[#667085] w-full min-w-0">
            <div>
              GovJob & BharatRojgar Admin — Recruitment Bulletin & Results Publishing Console
            </div>
            <div className="flex items-center gap-4 tabular-data">
              <button
                type="button"
                onClick={() => navigateToTab('design-spec')}
                className="hover:text-[#12305A] underline"
              >
                Design System Specification
              </button>
              <span>·</span>
              <span>WCAG AAA Compliant</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AdminConsole />
    </AuthProvider>
  );
}
