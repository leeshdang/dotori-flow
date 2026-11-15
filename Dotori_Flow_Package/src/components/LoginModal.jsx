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
import { 
  X, 
  Lock, 
  KeyRound, 
  AlertCircle, 
  ShieldCheck, 
  ArrowRight,
  Shield
} from 'lucide-react';
import { getAdminPassword } from '../utils/security';
import { 
  PRESET_GOOGLE_ACCOUNTS, 
  saveStoredGoogleUser, 
  decodeJwtResponse, 
  checkIsAdminEmail 
} from '../utils/googleAuth';
import { useBackdropClose } from '../utils/useBackdropClose';

// Google 4-color SVG Icon
export function GoogleIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
    </svg>
  );
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const backdropProps = useBackdropClose(onClose);
  const [activeTab, setActiveTab] = useState('google'); // 'google' | 'password'
  
  // Custom Google sign in inputs
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [googleError, setGoogleError] = useState('');

  // Password sign in state
  const [password, setPassword] = useState('');
  const [passError, setPassError] = useState('');

  // Initialize Google Identity Services (GIS) if available
  useEffect(() => {
    if (!isOpen) return;

    if (window.google?.accounts?.id) {
      try {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1048604719582-sampleclientid.apps.googleusercontent.com';
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (response.credential) {
              const decoded = decodeJwtResponse(response.credential);
              if (decoded && decoded.email) {
                const userObj = {
                  id: decoded.sub || 'google_' + Date.now(),
                  name: decoded.name || decoded.email.split('@')[0],
                  email: decoded.email,
                  picture: decoded.picture || `https://api.dicebear.com/7.x/bottts/svg?seed=${decoded.email}`,
                  authProvider: 'google',
                  isAdmin: checkIsAdminEmail(decoded.email)
                };
                const saved = saveStoredGoogleUser(userObj);
                onLoginSuccess(saved, saved.isAdmin);
                onClose();
              }
            }
          }
        });

        // Try rendering button if target exists
        const btnContainer = document.getElementById('gsi_button_target');
        if (btnContainer) {
          window.google.accounts.id.renderButton(btnContainer, {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'continue_with',
            shape: 'rectangular',
            logo_alignment: 'left'
          });
        }
      } catch (e) {
        // Fallback silently to custom/preset selection
      }
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  // Preset Google account click handler
  const handleSelectPreset = (account) => {
    const userObj = {
      id: account.id,
      name: account.name,
      email: account.email,
      picture: account.picture,
      role: account.role,
      authProvider: 'google',
      isAdmin: account.isAdmin
    };
    const saved = saveStoredGoogleUser(userObj);
    onLoginSuccess(saved, saved.isAdmin);
    onClose();
  };

  // Custom Google account submission
  const handleCustomGoogleSubmit = (e) => {
    e.preventDefault();
    if (!customEmail || !customEmail.includes('@')) {
      setGoogleError('올바른 Google 이메일 주소를 입력해주세요.');
      return;
    }
    const derivedName = customName.trim() || customEmail.split('@')[0];
    const isAdmin = checkIsAdminEmail(customEmail);
    const userObj = {
      id: 'google_' + Date.now(),
      name: derivedName,
      email: customEmail.trim(),
      picture: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(customEmail)}`,
      role: isAdmin ? 'Admin' : 'Member',
      authProvider: 'google',
      isAdmin: isAdmin
    };
    const saved = saveStoredGoogleUser(userObj);
    onLoginSuccess(saved, saved.isAdmin);
    onClose();
  };

  // Password submission handler
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    const correctPassword = getAdminPassword();

    if (password === correctPassword) {
      const adminUser = {
        id: 'admin_master',
        name: '관리자 (Admin)',
        email: 'leeshdang@gmail.com',
        picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
        role: 'Master Admin',
        authProvider: 'password',
        isAdmin: true
      };
      saveStoredGoogleUser(adminUser);
      onLoginSuccess(adminUser, true);
      setPassword('');
      setPassError('');
      onClose();
    } else {
      setPassError('비밀번호가 올바르지 않습니다. 다시 확인해주세요.');
    }
  };

  return (
    <div className="modal-overlay" {...backdropProps}>
      <div 
        className="modal-container" 
        onClick={e => e.stopPropagation()} 
        style={{ maxWidth: 480 }}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--theme-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <GoogleIcon size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.05rem', margin: 0, fontWeight: 700, color: 'var(--text-main)' }}>
                도토리 플로우 로그인
              </h2>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-sub)' }}>
                Google 소셜 로그인 및 관리자 인증
              </span>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="닫기">
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          padding: '8px 16px 0',
          gap: 8,
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid var(--theme-border)'
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('google')}
            style={{
              padding: '10px 12px',
              border: 'none',
              backgroundColor: 'transparent',
              borderBottom: activeTab === 'google' ? '2px solid #0052cc' : '2px solid transparent',
              color: activeTab === 'google' ? '#0052cc' : 'var(--text-sub)',
              fontWeight: activeTab === 'google' ? 700 : 500,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}
          >
            <GoogleIcon size={16} />
            Google 계정 로그인
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab('password')}
            style={{
              padding: '10px 12px',
              border: 'none',
              backgroundColor: 'transparent',
              borderBottom: activeTab === 'password' ? '2px solid #0052cc' : '2px solid transparent',
              color: activeTab === 'password' ? '#0052cc' : 'var(--text-sub)',
              fontWeight: activeTab === 'password' ? 700 : 500,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}
          >
            <Lock size={15} />
            관리자 암호 인증
          </button>
        </div>

        <div className="modal-body" style={{ padding: '20px' }}>
          {activeTab === 'google' ? (
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginBottom: 16, lineHeight: 1.5 }}>
                Google 계정으로 로그인하면 버그 리포트 작성 시 보고자 정보가 자동 연동되며, 관리자 이메일 로그인 시 관리자 권한이 즉시 부여됩니다.
              </p>

              {/* GIS Container if rendered */}
              <div id="gsi_button_target" style={{ marginBottom: 12 }}></div>

              {/* Quick Select Preset Accounts */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-sub)', marginBottom: 8 }}>
                  원클릭 Google 계정 로그인
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {PRESET_GOOGLE_ACCOUNTS.map(account => (
                    <button
                      key={account.id}
                      type="button"
                      onClick={() => handleSelectPreset(account)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: '1px solid #e2e8f0',
                        backgroundColor: '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        textAlign: 'left'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = '#0052cc';
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = '#e2e8f0';
                        e.currentTarget.style.backgroundColor = '#ffffff';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <img 
                          src={account.picture} 
                          alt={account.name}
                          style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }} 
                        />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <strong style={{ fontSize: '0.88rem', color: 'var(--text-main)' }}>{account.name}</strong>
                            <span style={{ 
                              fontSize: '0.68rem', 
                              backgroundColor: '#e3fcef', 
                              color: '#00875a', 
                              padding: '1px 6px', 
                              borderRadius: 4,
                              fontWeight: 700 
                            }}>
                              {account.role}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.76rem', color: 'var(--text-sub)' }}>{account.email}</div>
                        </div>
                      </div>
                      <ArrowRight size={16} color="#94a3b8" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Google Account Input Toggle */}
              {!showCustomInput ? (
                <button
                  type="button"
                  onClick={() => setShowCustomInput(true)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    fontSize: '0.8rem',
                    color: '#0052cc',
                    background: 'none',
                    border: '1px dashed #cbd5e1',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  + 다른 Google 계정으로 로그인하기
                </button>
              ) : (
                <form onSubmit={handleCustomGoogleSubmit} style={{ marginTop: 12, padding: '12px', backgroundColor: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: 8 }}>
                    Google 계정 정보 입력
                  </div>
                  {googleError && (
                    <div style={{ fontSize: '0.78rem', color: '#de350b', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <AlertCircle size={13} />
                      {googleError}
                    </div>
                  )}
                  <div style={{ marginBottom: 8 }}>
                    <input 
                      type="email"
                      className="form-input"
                      placeholder="Google 이메일 (예: user@gmail.com)"
                      value={customEmail}
                      onChange={e => { setCustomEmail(e.target.value); setGoogleError(''); }}
                      required
                      style={{ fontSize: '0.84rem' }}
                    />
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <input 
                      type="text"
                      className="form-input"
                      placeholder="표시 이름 (선택: 미입력 시 이메일 앞부분 사용)"
                      value={customName}
                      onChange={e => setCustomName(e.target.value)}
                      style={{ fontSize: '0.84rem' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button type="submit" className="btn-primary" style={{ flex: 1, padding: '7px 12px', fontSize: '0.82rem' }}>
                      <GoogleIcon size={14} />
                      Google 계정으로 로그인
                    </button>
                    <button 
                      type="button" 
                      className="btn-secondary" 
                      onClick={() => setShowCustomInput(false)}
                      style={{ padding: '7px 12px', fontSize: '0.82rem' }}
                    >
                      취소
                    </button>
                  </div>
                </form>
              )}

              {/* Security Privacy Notice */}
              <div style={{
                marginTop: 16,
                padding: '8px 12px',
                backgroundColor: '#f1f5f9',
                borderRadius: 6,
                fontSize: '0.74rem',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                <Shield size={14} color="#0052cc" style={{ flexShrink: 0 }} />
                <span>도토리툴즈는 사용자의 비밀번호나 개인정보를 일체 수집하거나 서버에 저장하지 않습니다 (Zero Data Collection).</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handlePasswordSubmit}>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-sub)', marginBottom: 16, lineHeight: 1.5 }}>
                필수 필드(Mandatory) 설정 및 시스템 구성을 위해 <strong>관리자 비밀번호</strong>를 입력해주세요.
              </p>

              <div style={{
                backgroundColor: '#deebff',
                border: '1px solid #b3d4ff',
                borderRadius: 6,
                padding: '10px 14px',
                fontSize: '0.8rem',
                color: '#0747a6',
                marginBottom: 16
              }}>
                💡 <strong>초기 기본 비밀번호:</strong> <code>admin1234</code><br />
                (관리자 로그인 후 비밀번호를 직접 변경하실 수 있습니다.)
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="admin-pass-input">
                  <span>비밀번호 (Password)</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <KeyRound size={16} style={{ position: 'absolute', left: 10, top: 11, color: 'var(--text-sub)' }} />
                  <input
                    id="admin-pass-input"
                    type="password"
                    className={`form-input ${passError ? 'is-invalid' : ''}`}
                    style={{ paddingLeft: 34 }}
                    placeholder="관리자 비밀번호 입력"
                    value={password}
                    onChange={e => {
                      setPassword(e.target.value);
                      if (passError) setPassError('');
                    }}
                    autoFocus
                  />
                </div>
                {passError && (
                  <div className="field-error-msg" style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6, color: '#de350b', fontSize: '0.8rem' }}>
                    <AlertCircle size={14} />
                    {passError}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
                <button type="button" className="btn-secondary" onClick={onClose}>
                  취소
                </button>
                <button type="submit" className="btn-primary">
                  <ShieldCheck size={16} />
                  인증 및 관리자 모드 진입
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
