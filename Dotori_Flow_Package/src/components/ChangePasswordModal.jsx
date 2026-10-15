import React, { useState } from 'react';
import { KeyRound, X, CheckCircle, AlertCircle } from 'lucide-react';
import { updateAdminPassword } from '../utils/security';

export default function ChangePasswordModal({ isOpen, onClose, onSuccess }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newPassword.length < 4) {
      setErrorMsg('비밀번호는 최소 4자리 이상이어야 합니다.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    const result = updateAdminPassword(newPassword);
    if (result.success) {
      onSuccess(result.message);
      setNewPassword('');
      setConfirmPassword('');
      setErrorMsg('');
      onClose();
    } else {
      setErrorMsg(result.message);
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
            <KeyRound size={20} color="#0052cc" />
            <span>관리자 비밀번호 변경</span>
          </h2>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginBottom: 16 }}>
              새롭게 사용할 관리자 비밀번호를 입력해주세요.
            </p>

            <div className="form-group">
              <label className="form-label">새 비밀번호 (4자리 이상)</label>
              <input
                type="password"
                className="form-input"
                placeholder="새로운 비밀번호 입력"
                value={newPassword}
                onChange={e => {
                  setNewPassword(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">새 비밀번호 확인</label>
              <input
                type="password"
                className="form-input"
                placeholder="비밀번호 다시 입력"
                value={confirmPassword}
                onChange={e => {
                  setConfirmPassword(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                required
              />
            </div>

            {errorMsg && (
              <div className="field-error-msg" style={{ marginTop: 8 }}>
                <AlertCircle size={14} />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="btn-primary">
              비밀번호 변경 완료
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
