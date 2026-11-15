/**
 * Copyright 2026 Dotori Tools
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import KanbanBoard from './components/KanbanBoard';
import ListView from './components/ListView';
import AdminFieldSettings from './components/AdminFieldSettings';
import CreateIssueModal from './components/CreateIssueModal';
import IssueDetailModal from './components/IssueDetailModal';
import LoginModal from './components/LoginModal';
import ChangePasswordModal from './components/ChangePasswordModal';
import SideMenuDrawer from './components/SideMenuDrawer';
import AboutModal from './components/AboutModal';
import LicenseModal from './components/LicenseModal';
import MobileBottomNav from './components/MobileBottomNav';
import { useIsMobile } from './utils/useIsMobile';
import { INITIAL_FIELDS, INITIAL_ISSUES } from './constants/initialData';
import { validateTicketIntegrity } from './utils/security';
import { getStoredGoogleUser, removeStoredGoogleUser } from './utils/googleAuth';
import { canUserEditIssue, formatActorLabel, buildIssueChangeLogs } from './utils/issuePermissions';
import { CheckCircle2, ShieldCheck, AlertTriangle, ArrowLeft } from 'lucide-react';
import ErrorBoundary from './components/ErrorBoundary';

const STORAGE_KEY_FIELDS = 'dotori_flow_fields_v1';
const STORAGE_KEY_ISSUES = 'dotori_flow_issues_v1';
const STORAGE_KEY_ADMIN_SESSION = 'dotori_flow_admin_session_v1';

// URL 해시(#board, #list, #admin)로부터 현재 탭 복원
const getTabFromHash = () => {
  if (typeof window === 'undefined') return 'board';
  const hash = window.location.hash.replace('#', '').trim();
  if (['board', 'list', 'admin'].includes(hash)) {
    return hash;
  }
  return 'board';
};

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
        return JSON.parse(saved);
      }
      return INITIAL_ISSUES;
    } catch (e) {
      return INITIAL_ISSUES;
    }
  });

  // Google 로그인 사용자 상태
  const [currentUser, setCurrentUser] = useState(() => getStoredGoogleUser());

  // 관리자 인증 상태 (세션 기반 및 Google 관리자 계정 연동)
  const [isAdmin, setIsAdmin] = useState(() => {
    try {
      const storedUser = getStoredGoogleUser();
      if (storedUser && storedUser.isAdmin) return true;
      return sessionStorage.getItem(STORAGE_KEY_ADMIN_SESSION) === 'true';
    } catch {
      return false;
    }
  });

  const isMobile = useIsMobile();
  const [currentTab, setCurrentTab] = useState(getTabFromHash);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isLicenseOpen, setIsLicenseOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [bannerNotice, setBannerNotice] = useState(null);

  // 탭 네비게이션 및 브라우저 히스토리/해시 연동 (뒤로가기 시 메인 보드 복귀 지원)
  const navigateToTab = (tabId, replace = false) => {
    if (tabId === 'admin' && !isAdmin) {
      setIsLoginModalOpen(true);
      return;
    }
    setCurrentTab(tabId);
    const targetHash = tabId === 'board' ? '' : `#${tabId}`;
    if (window.location.hash !== targetHash) {
      const newUrl = window.location.pathname + (targetHash ? targetHash : '');
      if (replace) {
        window.history.replaceState({ tab: tabId }, '', newUrl);
      } else {
        window.history.pushState({ tab: tabId }, '', newUrl);
      }
    }
  };

  // 브라우저 뒤로가기(Back) 및 URL 해시 변경 감지
  useEffect(() => {
    const handlePopState = () => {
      // 1. 모달이 열려 있는 상태에서 Back을 누르면 사이트 이탈 방지 및 모달 닫기
      if (isCreateModalOpen) {
        setIsCreateModalOpen(false);
        return;
      }
      if (selectedIssue) {
        setSelectedIssue(null);
        return;
      }
      if (isDrawerOpen) {
        setIsDrawerOpen(false);
        return;
      }
      if (isLoginModalOpen) {
        setIsLoginModalOpen(false);
        return;
      }
      if (isChangePasswordOpen) {
        setIsChangePasswordOpen(false);
        return;
      }
      if (isAboutOpen) {
        setIsAboutOpen(false);
        return;
      }
      if (isLicenseOpen) {
        setIsLicenseOpen(false);
        return;
      }

      // 2. 해시 변경에 따른 탭 동기화 (예: #admin에서 Back 누르면 메인 board로 복원)
      const tab = getTabFromHash();
      setCurrentTab(tab);
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, [
    isCreateModalOpen,
    selectedIssue,
    isDrawerOpen,
    isLoginModalOpen,
    isChangePasswordOpen,
    isAboutOpen,
    isLicenseOpen
  ]);

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

  // 로그인 성공 처리 (Google 로그인 및 관리자 인증)
  const handleLoginSuccess = (user, isAdminRole) => {
    if (user) {
      setCurrentUser(user);
    }
    if (isAdminRole) {
      setIsAdmin(true);
      sessionStorage.setItem(STORAGE_KEY_ADMIN_SESSION, 'true');
      showNotification(`인증 완료: ${user?.name ? `${user.name} 님의 ` : ''}관리자 권한이 활성화되었습니다.`);
      navigateToTab('admin');
    } else {
      showNotification(`${user?.name || '사용자'}님, Google 계정으로 로그인되었습니다.`);
    }
  };

  // 로그아웃 처리
  const handleLogout = () => {
    setIsAdmin(false);
    setCurrentUser(null);
    removeStoredGoogleUser();
    sessionStorage.removeItem(STORAGE_KEY_ADMIN_SESSION);
    showNotification('로그아웃되었습니다.');
    if (currentTab === 'admin') {
      navigateToTab('board', true);
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

    const createdTimestamp = new Date().toISOString();
    const newIssue = {
      id: newId,
      status: 'todo',
      createdAt: createdTimestamp,
      reporter: currentUser?.name || '익명 사용자',
      reporterEmail: currentUser?.email || '',
      history: [
        {
          id: `log_${Date.now()}`,
          timestamp: createdTimestamp,
          actor: formatActorLabel(currentUser),
          changes: [{ summaryText: '이슈를 최초 생성했습니다.' }],
        },
      ],
      ...formData
    };

    setIssues(prev => [newIssue, ...prev]);

    // 성공 노티스
    showNotification(`티켓 [${newId}]이 성공적으로 생성되었습니다! 필수 입력 항목(${mandatoryFields.length}개)이 모두 완벽히 충족되었습니다.`);
  };

  // 이슈 상태 변경
  const handleChangeIssueStatus = (issueId, newStatus) => {
    const targetIssue = issues.find(item => item.id === issueId);
    if (!targetIssue || targetIssue.status === newStatus) return;

    if (!canUserEditIssue(targetIssue, currentUser)) {
      showNotification(
        '티켓 수정 권한이 없습니다. 최초 작성자 또는 담당자(Assignee)만 수정할 수 있습니다. 먼저 담당자를 본인으로 변경해 주세요.',
        true
      );
      return;
    }

    const timestamp = new Date().toISOString();
    const changes = buildIssueChangeLogs(targetIssue, { status: newStatus }, fields);
    const nextHistory = [
      ...(Array.isArray(targetIssue.history) ? targetIssue.history : []),
      {
        id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        timestamp,
        actor: formatActorLabel(currentUser),
        changes,
      },
    ];

    setIssues(prev => prev.map(item => {
      if (item.id === issueId) {
        return { ...item, status: newStatus, updatedAt: timestamp, history: nextHistory };
      }
      return item;
    }));

    if (selectedIssue && selectedIssue.id === issueId) {
      setSelectedIssue(prev => ({ ...prev, status: newStatus, updatedAt: timestamp, history: nextHistory }));
    }
  };

  // 이슈 상세 정보 수정
  const handleUpdateIssue = (issueId, updatedFields) => {
    const targetIssue = issues.find(item => item.id === issueId);
    if (!targetIssue) return;

    const hasFullPermission = canUserEditIssue(targetIssue, currentUser);
    let allowedUpdates = updatedFields;

    if (!hasFullPermission) {
      if (!('assignee' in updatedFields) || updatedFields.assignee === targetIssue.assignee) {
        showNotification(
          '티켓 수정 권한이 없습니다. 먼저 담당자(Assignee)를 본인으로 변경한 후 다른 내용을 수정해 주세요.',
          true
        );
        return;
      }
      allowedUpdates = { assignee: updatedFields.assignee };
    }

    const changes = buildIssueChangeLogs(targetIssue, allowedUpdates, fields);
    if (changes.length === 0) return;

    const timestamp = new Date().toISOString();
    const nextHistory = [
      ...(Array.isArray(targetIssue.history) ? targetIssue.history : []),
      {
        id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        timestamp,
        actor: formatActorLabel(currentUser),
        changes,
      },
    ];

    setIssues(prev => prev.map(item => {
      if (item.id === issueId) {
        return { ...item, ...allowedUpdates, updatedAt: timestamp, history: nextHistory };
      }
      return item;
    }));

    if (selectedIssue && selectedIssue.id === issueId) {
      setSelectedIssue(prev => ({ ...prev, ...allowedUpdates, updatedAt: timestamp, history: nextHistory }));
    }

    showNotification(
      hasFullPermission
        ? `이슈 [${issueId}] 정보가 성공적으로 수정되었습니다.`
        : `이슈 [${issueId}] 담당자(Assignee)가 변경되었습니다.`
    );
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
    <div className={`app-container ${isMobile ? 'is-mobile-app' : 'is-desktop'}`}>
      {/* Navbar with Auth State */}
      <Header
        currentTab={currentTab}
        setCurrentTab={navigateToTab}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        mandatoryCount={mandatoryFields.length}
        isAdmin={isAdmin}
        currentUser={currentUser}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        onOpenChangePasswordModal={() => setIsChangePasswordOpen(true)}
        onOpenDrawer={() => setIsDrawerOpen(true)}
        isMobile={isMobile}
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
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            color: bannerNotice.isError ? '#bf2600' : '#006644',
            fontWeight: 600,
            fontSize: '0.88rem',
            animation: 'fadeIn 0.2s ease'
          }}>
            {bannerNotice.isError ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
            <span>{bannerNotice.text}</span>
          </div>
        )}

        {/* View Header */}
        <div className="view-header">
          <div className="view-title-group">
            <h1 style={currentTab === 'board' ? { fontSize: isMobile ? '1.02rem' : '1.25rem', lineHeight: 1.4, wordBreak: 'keep-all' } : {}}>
              {currentTab === 'board' && '안정적인 도토리툴즈 앱을 위해 버그 발견시 꼭 우상단 버그 리포트 하기 버튼을 눌러주세요~'}
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
            {currentTab === 'admin' && (
              <button 
                type="button"
                className="btn-secondary"
                onClick={() => navigateToTab('board')}
                style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}
                title="메인 칸반 보드로 돌아가기"
              >
                <ArrowLeft size={15} />
                메인(칸반 보드)으로 돌아가기
              </button>
            )}

            {!isMobile && currentTab !== 'admin' && (
              <button 
                type="button"
                className="btn-secondary"
                onClick={() => {
                  if (isAdmin) {
                    navigateToTab('admin');
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

        {/* Tab Views with ErrorBoundary Protection */}
        <ErrorBoundary onReset={() => navigateToTab('board')}>
          {currentTab === 'board' && (
            <KanbanBoard
              issues={issues}
              fields={fields}
              onSelectIssue={setSelectedIssue}
              onChangeIssueStatus={handleChangeIssueStatus}
              onOpenCreateModal={() => setIsCreateModalOpen(true)}
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
              onBackToBoard={() => navigateToTab('board')}
            />
          )}
        </ErrorBoundary>
      </main>

      {/* Mobile App Bottom Navigation Bar */}
      {isMobile && (
        <MobileBottomNav
          currentTab={currentTab}
          setCurrentTab={navigateToTab}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
          isAdmin={isAdmin}
          onOpenLoginModal={() => setIsLoginModalOpen(true)}
        />
      )}

      {/* Create Issue Modal (핵심 기능: 필수 필드 미입력 시 생성 불가) */}
      <CreateIssueModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        fields={fields}
        onCreateIssue={handleCreateIssue}
        currentUser={currentUser}
      />

      {/* Issue Detail Modal */}
      {selectedIssue && (
        <IssueDetailModal
          issue={selectedIssue}
          fields={fields}
          currentUser={currentUser}
          onOpenLoginModal={() => setIsLoginModalOpen(true)}
          onClose={() => setSelectedIssue(null)}
          onChangeIssueStatus={handleChangeIssueStatus}
          onUpdateIssue={handleUpdateIssue}
          onDeleteIssue={handleDeleteIssue}
        />
      )}

      {/* Google Login & Admin Authentication Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Change Password Modal (비밀번호 변경 모달) */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        onSuccess={(msg) => showNotification(msg)}
      />

      {/* Side Menu Drawer (패밀리 링크, About, License) */}
      <SideMenuDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenLicense={() => setIsLicenseOpen(true)}
      />

      {/* About Modal */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      {/* License Modal */}
      <LicenseModal
        isOpen={isLicenseOpen}
        onClose={() => setIsLicenseOpen(false)}
      />
    </div>
  );
}
