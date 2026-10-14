import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import KanbanBoard from './components/KanbanBoard';
import ListView from './components/ListView';
import AdminFieldSettings from './components/AdminFieldSettings';
import CreateIssueModal from './components/CreateIssueModal';
import IssueDetailModal from './components/IssueDetailModal';
import AdminLoginModal from './components/AdminLoginModal';
import { INITIAL_FIELDS, INITIAL_ISSUES } from './constants/initialData';
import { validateTicketIntegrity } from './utils/security';
import { CheckCircle2, ShieldCheck, AlertTriangle } from 'lucide-react';

const STORAGE_KEY_FIELDS = 'dotori_flow_fields_v1';
const STORAGE_KEY_ISSUES = 'dotori_flow_issues_v1';
const STORAGE_KEY_ADMIN_SESSION = 'dotori_flow_admin_session_v1';

export default function App() {
  // 로컬스토리지에서 필드 및 이슈 복원
  const [fields, setFields] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FIELDS);
      return saved ? JSON.parse(saved) : INITIAL_FIELDS;
    } catch (e) {
      return INITIAL_FIELDS;
    }
  });

  const [issues, setIssues] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ISSUES);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map(item => ({
          ...item,
          id: item.id.replace('JIRA-', 'FLOW-')
        }));
      }
      return INITIAL_ISSUES;
    } catch (e) {
      return INITIAL_ISSUES;
    }
  });

  // 관리자 인증 상태 (세션 기반)
  const [isAdmin, setIsAdmin] = useState(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEY_ADMIN_SESSION) === 'true';
    } catch (e) {
      return false;
    }
  });

  const [currentTab, setCurrentTab] = useState('board'); // 'board' | 'list' | 'admin'
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [bannerNotice, setBannerNotice] = useState(null);

  // 로컬스토리지 자동 저장
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_FIELDS, JSON.stringify(fields));
  }, [fields]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ISSUES, JSON.stringify(issues));
  }, [issues]);

  // 관리자 세션 저장
  useEffect(() => {
    try {
      if (isAdmin) {
        sessionStorage.setItem(STORAGE_KEY_ADMIN_SESSION, 'true');
      } else {
        sessionStorage.removeItem(STORAGE_KEY_ADMIN_SESSION);
      }
    } catch (e) {}
  }, [isAdmin]);

  // 필수 필드 계산
  const mandatoryFields = fields.filter(f => f.isEnabled && f.isMandatory);

  // 알림 토스트 헬퍼
  const showNotification = (msg, isError = false) => {
    setBannerNotice({ text: msg, isError });
    setTimeout(() => setBannerNotice(null), 4500);
  };

  // 관리자 로그인 처리
  const handleLoginSuccess = () => {
    setIsAdmin(true);
    showNotification('관리자(Admin) 권한으로 성공적으로 인증되었습니다! 이제 모든 필드를 설정할 수 있습니다.');
    if (currentTab === 'admin') {
      // 이미 admin 탭에 있었다면 화면 갱신
    }
  };

  // 관리자 로그아웃 처리
  const handleLogout = () => {
    setIsAdmin(false);
    showNotification('관리자 모드에서 로그아웃되었습니다. (일반 사용자 모드로 전환)');
    if (currentTab === 'admin') {
      setCurrentTab('board');
    }
  };

  // 티켓 생성 처리 (보안 무결성 검증 레이어 포함)
  const handleCreateIssue = (formData) => {
    // 1. 보안 레이어: 데이터 무결성 검증 (Bypass 시도 원천 차단)
    const integrityCheck = validateTicketIntegrity(formData, fields);
    if (!integrityCheck.isValid) {
      showNotification(integrityCheck.error, true);
      alert(integrityCheck.error);
      return;
    }

    // 2. 신규 키 생성
    const nextNum = issues.length > 0
      ? Math.max(...issues.map(i => parseInt(i.id.replace('FLOW-', '')) || 100)) + 1
      : 101;
    const newId = `FLOW-${nextNum}`;

    const newIssue = {
      id: newId,
      status: 'todo',
      createdAt: new Date().toISOString(),
      ...formData
    };

    setIssues(prev => [newIssue, ...prev]);

    // 성공 노티스
    showNotification(`티켓 [${newId}]이 성공적으로 생성되었습니다! 필수 입력 항목(${mandatoryFields.length}개)이 모두 완벽히 충족되었습니다.`);
  };

  // 이슈 상태 변경
  const handleChangeIssueStatus = (issueId, newStatus) => {
    setIssues(prev => prev.map(item => {
      if (item.id === issueId) {
        return { ...item, status: newStatus };
      }
      return item;
    }));

    if (selectedIssue && selectedIssue.id === issueId) {
      setSelectedIssue(prev => ({ ...prev, status: newStatus }));
    }
  };

  // 이슈 삭제
  const handleDeleteIssue = (issueId) => {
    if (window.confirm(`정말로 이슈 [${issueId}]를 삭제하시겠습니까?`)) {
      setIssues(prev => prev.filter(i => i.id !== issueId));
      setSelectedIssue(null);
      showNotification(`이슈 [${issueId}]가 삭제되었습니다.`);
    }
  };

  return (
    <div className="app-container">
      {/* Navbar with Auth State */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        mandatoryCount={mandatoryFields.length}
        isAdmin={isAdmin}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main View Area */}
      <main className="main-content">
        {/* Success / Alert Banner */}
        {bannerNotice && (
          <div style={{
            backgroundColor: bannerNotice.isError ? '#ffebe6' : '#e3fcef',
            border: `1px solid ${bannerNotice.isError ? '#ffbdad' : '#abf5d1'}`,
            borderRadius: 6,
            padding: '12px 18px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            color: bannerNotice.isError ? '#bf2600' : '#006644',
            fontWeight: 600,
            fontSize: '0.9rem',
            animation: 'fadeIn 0.2s ease'
          }}>
            {bannerNotice.isError ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
            <span>{bannerNotice.text}</span>
          </div>
        )}

        {/* View Header */}
        <div className="view-header">
          <div className="view-title-group">
            <h1>
              {currentTab === 'board' && '칸반 보드 (Board)'}
              {currentTab === 'list' && '이슈 리스트 (All Issues)'}
              {currentTab === 'admin' && '관리자 필드 관리 콘솔'}
            </h1>
            <div className="view-subtitle">
              {currentTab === 'admin' ? (
                <span>
                  {isAdmin ? (
                    <span style={{ color: '#006644', fontWeight: 600 }}>
                      <ShieldCheck size={14} style={{ display: 'inline', marginRight: 4 }} />
                      인증된 관리자 모드: 티켓 필수 항목 및 커스텀 필드를 자유롭게 설정할 수 있습니다.
                    </span>
                  ) : (
                    <span>관리자 인증 후 필수(Mandatory) 필드 및 커스텀 필드를 제어할 수 있습니다.</span>
                  )}
                </span>
              ) : (
                <span>
                  현재 필수(Mandatory) 필드: <strong>{mandatoryFields.map(f => f.name).join(', ')}</strong> ({mandatoryFields.length}개)
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {currentTab !== 'admin' && (
              <button 
                className="btn-secondary"
                onClick={() => {
                  if (isAdmin) {
                    setCurrentTab('admin');
                  } else {
                    setIsLoginModalOpen(true);
                  }
                }}
                style={{ fontSize: '0.85rem' }}
              >
                {isAdmin ? '필수 필드 설정 ⚙️' : '필드 설정 (관리자 전용 🔒)'}
              </button>
            )}
          </div>
        </div>

        {/* Tab Views */}
        {currentTab === 'board' && (
          <KanbanBoard
            issues={issues}
            fields={fields}
            onSelectIssue={setSelectedIssue}
            onChangeIssueStatus={handleChangeIssueStatus}
          />
        )}

        {currentTab === 'list' && (
          <ListView
            issues={issues}
            fields={fields}
            onSelectIssue={setSelectedIssue}
            onChangeIssueStatus={handleChangeIssueStatus}
          />
        )}

        {currentTab === 'admin' && (
          <AdminFieldSettings
            fields={fields}
            setFields={setFields}
            isAdmin={isAdmin}
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
          />
        )}
      </main>

      {/* Create Issue Modal (핵심 기능: 필수 필드 미입력 시 생성 불가) */}
      <CreateIssueModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        fields={fields}
        onCreateIssue={handleCreateIssue}
      />

      {/* Issue Detail Modal */}
      {selectedIssue && (
        <IssueDetailModal
          issue={selectedIssue}
          fields={fields}
          onClose={() => setSelectedIssue(null)}
          onChangeIssueStatus={handleChangeIssueStatus}
          onDeleteIssue={handleDeleteIssue}
        />
      )}

      {/* Admin Login Modal (보안 인증 모달) */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
