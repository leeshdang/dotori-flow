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

import React from 'react';
import { 
  Layers, 
  Kanban, 
  ListFilter, 
  Sliders, 
  Plus, 
  ShieldCheck, 
  Lock, 
  LogOut, 
  KeyRound, 
  Menu 
} from 'lucide-react';
import { GoogleIcon } from './LoginModal';

export default function Header({ 
  currentTab, 
  setCurrentTab, 
  onOpenCreateModal, 
  isAdmin,
  currentUser,
  onOpenLoginModal,
  onLogout,
  onOpenChangePasswordModal,
  onOpenDrawer,
  isMobile
}) {
  const handleTabClick = (tabId) => {
    if (tabId === 'admin' && !isAdmin) {
      onOpenLoginModal();
      return;
    }
    setCurrentTab(tabId);
  };

  return (
    <header className={`navbar ${isMobile ? 'navbar-mobile' : 'navbar-desktop'}`}>
      <div className="nav-left">
        {/* Brand Area with Drawer Trigger */}
        <div 
          className="brand" 
          onClick={onOpenDrawer}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, padding: '4px 6px', borderRadius: 6, transition: 'background-color 0.15s' }}
          title="클릭하여 메뉴 열기 (celebmypet.com, dotoritools.com, About, License)"
        >
          <div className="brand-icon brand-icon-clickable" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px' }}>
            <Menu size={18} />
            <Layers size={18} />
          </div>
          <span className="brand-title" style={{ fontWeight: 700, fontSize: '1.15rem', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 6 }}>
            Dotori Flow
            <span className="menu-indicator-badge" style={{ fontSize: '0.68rem', backgroundColor: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: 4, fontWeight: 500 }}>
              메뉴 ▾
            </span>
          </span>
        </div>

        <div className="project-badge">
          <span>Project:</span>
          <strong>FLOW</strong>
          <span className="project-subtext"> (Alpha)</span>
        </div>

        {/* Desktop Navigation Tabs (Hidden on mobile) */}
        <nav className="nav-tabs desktop-only">
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
        {currentUser ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* User Profile Info Pill */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: 'rgba(255,255,255,0.15)',
              padding: '4px 10px 4px 6px',
              borderRadius: 20
            }}>
              <img 
                src={currentUser.picture} 
                alt={currentUser.name}
                style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.5)' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <span className="desktop-only-inline" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ffffff', maxWidth: 110, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentUser.name}
              </span>
              {isAdmin ? (
                <span className="admin-tag" style={{ backgroundColor: '#36b37e', color: '#ffffff', fontSize: '0.68rem', padding: '1px 6px' }}>
                  <ShieldCheck size={11} style={{ display: 'inline', marginRight: 2 }} />
                  Admin
                </span>
              ) : (
                <span style={{ fontSize: '0.68rem', backgroundColor: 'rgba(255,255,255,0.22)', color: '#ffffff', padding: '1px 6px', borderRadius: 4, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <GoogleIcon size={11} />
                  Google
                </span>
              )}
            </div>

            {isAdmin && (
              <button 
                onClick={onOpenChangePasswordModal}
                className="btn-secondary nav-action-btn desktop-only"
                style={{ padding: '6px 10px', fontSize: '0.8rem', backgroundColor: 'rgba(255,255,255,0.22)', color: 'white', display: 'flex', alignItems: 'center', gap: 4 }}
                title="관리자 비밀번호 변경"
              >
                <KeyRound size={13} />
                <span className="desktop-only-inline">비번 변경</span>
              </button>
            )}

            <button 
              onClick={onLogout}
              className="btn-secondary nav-action-btn"
              style={{ padding: '6px 10px', fontSize: '0.8rem', backgroundColor: 'rgba(255,255,255,0.18)', color: 'white' }}
              title="로그아웃"
            >
              <LogOut size={13} style={{ display: 'inline', marginRight: 4 }} />
              <span className="desktop-only-inline">로그아웃</span>
            </button>
          </div>
        ) : isAdmin ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div className="admin-tag" style={{ backgroundColor: '#36b37e', color: '#ffffff' }} title="관리자 권한 활성화됨">
              <ShieldCheck size={13} style={{ display: 'inline', marginRight: 4 }} />
              Admin
            </div>
            <button 
              onClick={onOpenChangePasswordModal}
              className="btn-secondary nav-action-btn desktop-only"
              style={{ padding: '6px 10px', fontSize: '0.8rem', backgroundColor: 'rgba(255,255,255,0.22)', color: 'white', display: 'flex', alignItems: 'center', gap: 4 }}
              title="관리자 비밀번호 변경"
            >
              <KeyRound size={13} />
              <span className="desktop-only-inline">비밀번호 변경</span>
            </button>
            <button 
              onClick={onLogout}
              className="btn-secondary nav-action-btn"
              style={{ padding: '6px 10px', fontSize: '0.8rem', backgroundColor: 'rgba(255,255,255,0.18)', color: 'white' }}
              title="관리자 모드 종료"
            >
              <LogOut size={13} style={{ display: 'inline', marginRight: 4 }} />
              <span className="desktop-only-inline">로그아웃</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* Google Login Button */}
            <button 
              onClick={onOpenLoginModal}
              className="btn-google-login"
              style={{ 
                padding: '6px 12px', 
                fontSize: '0.82rem', 
                backgroundColor: '#ffffff', 
                color: '#1e293b',
                border: 'none',
                borderRadius: 4,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 1px 3px rgba(0,0,0,0.18)',
                cursor: 'pointer',
                transition: 'transform 0.1s ease, box-shadow 0.1s ease'
              }}
              title="Google 계정으로 로그인 또는 관리자 인증"
            >
              <GoogleIcon size={16} />
              <span>로그인</span>
            </button>
          </div>
        )}

        {/* Desktop Create Button: 버그 리포트 하기 */}
        <button 
          className="btn-create-issue desktop-only" 
          onClick={onOpenCreateModal}
          title="새로운 버그 리포트 작성"
        >
          <Plus size={16} />
          버그 리포트 하기
        </button>
      </div>
    </header>
  );
}
