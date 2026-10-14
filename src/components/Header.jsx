import React from 'react';
import { Layers, Kanban, ListFilter, Sliders, Plus, ShieldCheck, Lock, Unlock, LogOut, User } from 'lucide-react';

export default function Header({ 
  currentTab, 
  setCurrentTab, 
  onOpenCreateModal, 
  mandatoryCount,
  isAdmin,
  onOpenLoginModal,
  onLogout
}) {
  const handleTabClick = (tabId) => {
    if (tabId === 'admin' && !isAdmin) {
      onOpenLoginModal();
      return;
    }
    setCurrentTab(tabId);
  };

  return (
    <header className="navbar">
      <div className="nav-left">
        <div className="brand" onClick={() => setCurrentTab('board')}>
          <div className="brand-icon">
            <Layers size={18} />
          </div>
          <span>Dotori Flow</span>
        </div>

        <div className="project-badge">
          <span>Project:</span>
          <strong>FLOW (Alpha Core)</strong>
        </div>

        <nav className="nav-tabs">
          <button 
            className={`nav-tab-btn ${currentTab === 'board' ? 'active' : ''}`}
            onClick={() => handleTabClick('board')}
          >
            <Kanban size={16} />
            칸반 보드
          </button>
          
          <button 
            className={`nav-tab-btn ${currentTab === 'list' ? 'active' : ''}`}
            onClick={() => handleTabClick('list')}
          >
            <ListFilter size={16} />
            이슈 목록
          </button>

          <button 
            className={`nav-tab-btn ${currentTab === 'admin' ? 'active' : ''}`}
            onClick={() => handleTabClick('admin')}
          >
            <Sliders size={16} />
            필드 관리 (Admin)
            {!isAdmin && <Lock size={12} style={{ marginLeft: 3, opacity: 0.7 }} />}
          </button>
        </nav>
      </div>

      <div className="nav-right">
        {/* Role & Auth Status */}
        {isAdmin ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="admin-tag" style={{ backgroundColor: '#36b37e', color: '#ffffff' }} title="관리자 권한 활성화됨">
              <ShieldCheck size={13} style={{ display: 'inline', marginRight: 4 }} />
              Admin
            </div>
            <button 
              onClick={onLogout}
              className="btn-secondary"
              style={{ padding: '6px 10px', fontSize: '0.8rem', backgroundColor: 'rgba(255,255,255,0.18)', color: 'white' }}
              title="관리자 모드 종료"
            >
              <LogOut size={13} style={{ display: 'inline', marginRight: 4 }} />
              로그아웃
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ 
              fontSize: '0.78rem', 
              color: 'rgba(255,255,255,0.85)', 
              display: 'flex', 
              alignItems: 'center', 
              gap: 4,
              backgroundColor: 'rgba(255,255,255,0.12)',
              padding: '4px 8px',
              borderRadius: 4
            }}>
              <User size={13} />
              <span>Member</span>
            </div>
            <button 
              onClick={onOpenLoginModal}
              className="btn-secondary"
              style={{ padding: '6px 10px', fontSize: '0.8rem', backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
              title="관리자 권한 획득을 위해 로그인"
            >
              <Lock size={13} style={{ display: 'inline', marginRight: 4 }} />
              관리자 로그인
            </button>
          </div>
        )}

        <button 
          className="btn-create-issue" 
          onClick={onOpenCreateModal}
          title="새로운 티켓 생성"
        >
          <Plus size={16} />
          이슈 만들기
        </button>
      </div>
    </header>
  );
}
