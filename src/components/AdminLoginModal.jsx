import React, { useState } from 'react';
import { Lock, X, KeyRound, AlertCircle, ShieldCheck } from 'lucide-react';
import { getAdminPassword } from '../utils/security';

export default function AdminLoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const correctPassword = getAdminPassword();

    if (password === correctPassword) {
      onLoginSuccess();
      setPassword('');
      setErrorMsg('');
      onClose();
    } else {
      setErrorMsg('비밀번호가 올바르지 않습니다. 다시 확인해주세요.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-container" 
        onClick={e => e.stopPropagation()} 
        style={{ maxWidth: 440 }}
      >
        <div className="modal-header">
          <h2>
            <Lock size={20} color="#0052cc" />
            <span>관리자 권한 인증 (Admin Auth)</span>
          </h2>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p style={{ fontSize: '0.88rem', color: 'var(--text-sub)', marginBottom: 16, lineHeight: 1.5 }}>
              필수 필드(Mandatory) 지정 및 커스텀 필드 제어는 <strong>관리자 권한</strong>이 필요합니다. 관리자 비밀번호를 입력해주세요.
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
                  className={`form-input ${errorMsg ? 'is-invalid' : ''}`}
                  style={{ paddingLeft: 34 }}
                  placeholder="관리자 비밀번호 입력"
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  autoFocus
                />
              </div>

              {errorMsg && (
                <div className="field-error-msg" style={{ marginTop: 8 }}>
                  <AlertCircle size={14} />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="btn-primary">
              <ShieldCheck size={16} />
              인증 및 관리자 모드 진입
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
