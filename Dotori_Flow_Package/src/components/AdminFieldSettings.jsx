import React, { useState } from 'react';
import { 
  Sliders, 
  Plus, 
  Trash2, 
  AlertCircle, 
  CheckCircle, 
  RotateCcw,
  Sparkles,
  Info,
  Lock,
  KeyRound,
  ShieldAlert
} from 'lucide-react';
import { INITIAL_FIELDS } from '../constants/initialData';
import { updateAdminPassword } from '../utils/security';

export default function AdminFieldSettings({ 
  fields, 
  setFields, 
  isAdmin, 
  onOpenLoginModal 
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordStatusMsg, setPasswordStatusMsg] = useState(null);

  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState('text');
  const [newFieldOptions, setNewFieldOptions] = useState('');
  const [newFieldIsMandatory, setNewFieldIsMandatory] = useState(true);
  const [newFieldDescription, setNewFieldDescription] = useState('');
  const [newFieldPlaceholder, setNewFieldPlaceholder] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  // 안내 토스트 띄우기
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // 비인가 사용자 접근 차단 (Role-Based Access Control)
  if (!isAdmin) {
    return (
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid var(--theme-border)',
        borderRadius: 8,
        padding: '60px 24px',
        textAlign: 'center',
        maxWidth: 600,
        margin: '40px auto',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          backgroundColor: '#fff0b3',
          color: '#ff991f',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px auto'
        }}>
          <Lock size={32} />
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 10 }}>
          관리자 전용 보안 영역입니다
        </h2>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-sub)', lineHeight: 1.6, marginBottom: 24 }}>
          티켓의 필수 입력 필드(Mandatory)를 설정하거나 새로운 커스텀 필드를 추가/삭제하려면<br />
          <strong>관리자 권한 인증(로그인)</strong>이 필요합니다.
        </p>
        <button 
          className="btn-primary" 
          onClick={onOpenLoginModal}
          style={{ margin: '0 auto', padding: '10px 24px', fontSize: '0.95rem' }}
        >
          <Lock size={16} />
          관리자 암호로 로그인하기
        </button>
      </div>
    );
  }

  // 필수 여부 토글 (Mandatory Toggle)
  const handleToggleMandatory = (fieldId) => {
    setFields(prevFields => {
      const updated = prevFields.map(field => {
        if (field.id === fieldId) {
          const nextState = !field.isMandatory;
          showToast(`'${field.name}' 필드가 ${nextState ? '★ 필수(Mandatory)' : '선택(Optional)'} 항목으로 변경되었습니다.`);
          return { ...field, isMandatory: nextState };
        }
        return field;
      });
      return updated;
    });
  };

  // 활성화 여부 토글 (Enabled Toggle)
  const handleToggleEnabled = (fieldId) => {
    setFields(prevFields => {
      const updated = prevFields.map(field => {
        if (field.id === fieldId) {
          const nextState = !field.isEnabled;
          showToast(`'${field.name}' 필드가 ${nextState ? '표시' : '숨김'} 처리되었습니다.`);
          return { ...field, isEnabled: nextState };
        }
        return field;
      });
      return updated;
    });
  };

  // 커스텀 필드 삭제
  const handleDeleteField = (fieldId, fieldName) => {
    if (window.confirm(`'${fieldName}' 커스텀 필드를 삭제하시겠습니까?`)) {
      setFields(prev => prev.filter(f => f.id !== fieldId));
      showToast(`'${fieldName}' 필드가 성공적으로 삭제되었습니다.`);
    }
  };

  // 기본 설정으로 초기화
  const handleResetToDefault = () => {
    if (window.confirm('모든 필드 설정을 초기 기본값으로 되돌리시겠습니까?')) {
      setFields(INITIAL_FIELDS);
      showToast('필드 설정이 기본값으로 초기화되었습니다.');
    }
  };

  // 새 커스텀 필드 추가 핸들러
  const handleAddCustomField = (e) => {
    e.preventDefault();
    if (!newFieldName.trim()) {
      alert('필드 이름을 입력해주세요.');
      return;
    }

    const customId = `custom_${Date.now()}`;
    const parsedOptions = newFieldType === 'select' 
      ? newFieldOptions.split(',').map(s => s.trim()).filter(Boolean)
      : undefined;

    if (newFieldType === 'select' && (!parsedOptions || parsedOptions.length === 0)) {
      alert('드롭다운(선택박스)의 옵션을 최소 1개 이상 쉼표로 구분하여 입력해주세요.');
      return;
    }

    const newFieldObj = {
      id: customId,
      name: newFieldName.trim(),
      type: newFieldType,
      options: parsedOptions,
      isMandatory: newFieldIsMandatory,
      isEnabled: true,
      isSystem: false,
      canToggleMandatory: true,
      description: newFieldDescription.trim() || '관리자가 추가한 사용자 정의 필드입니다.',
      placeholder: newFieldPlaceholder.trim() || `${newFieldName} 입력`
    };

    setFields(prev => [...prev, newFieldObj]);
    showToast(`새 필드 '${newFieldName}'이(가) 추가되었습니다! (필수 여부: ${newFieldIsMandatory ? '필수' : '선택'})`);

    // 폼 초기화 및 닫기
    setNewFieldName('');
    setNewFieldType('text');
    setNewFieldOptions('');
    setNewFieldIsMandatory(true);
    setNewFieldDescription('');
    setNewFieldPlaceholder('');
    setShowAddModal(false);
  };

  // 관리자 비밀번호 변경 핸들러
  const handleChangePassword = (e) => {
    e.preventDefault();
    const result = updateAdminPassword(newPassword);
    if (result.success) {
      showToast(result.message);
      setNewPassword('');
      setShowPasswordModal(false);
      setPasswordStatusMsg(null);
    } else {
      setPasswordStatusMsg(result.message);
    }
  };

  return (
    <div className="settings-panel">
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          backgroundColor: '#172b4d',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: 6,
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          zIndex: 2000,
          fontWeight: 600,
          fontSize: '0.9rem'
        }}>
          <CheckCircle size={18} color="#36b37e" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Banner */}
      <div className="settings-header-banner">
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Sliders size={22} />
            관리자 필드 관리 콘솔 (Mandatory Field Settings)
          </h2>
          <p style={{ marginTop: 6, opacity: 0.9, fontSize: '0.88rem' }}>
            이슈 생성 시 필수로 입력받을 <strong>Mandatory 항목</strong>을 설정하고, 프로젝트 요구에 맞는 <strong>커스텀 필드</strong>를 제어합니다.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button 
            className="btn-secondary" 
            onClick={() => setShowPasswordModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: '#ffffff', color: '#0747a6', fontWeight: 700, border: '1px solid #ffffff' }}
            title="관리자 비밀번호 변경"
          >
            <KeyRound size={15} />
            🔑 비밀번호 변경
          </button>

          <button 
            className="btn-secondary" 
            onClick={handleResetToDefault}
            title="기본 필드 설정으로 리셋"
            style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
          >
            <RotateCcw size={15} />
            기본값 리셋
          </button>

          <button 
            className="btn-primary" 
            onClick={() => setShowAddModal(true)}
            style={{ backgroundColor: '#ffffff', color: '#0747a6', fontWeight: 700 }}
          >
            <Plus size={16} />
            커스텀 필드 추가
          </button>
        </div>
      </div>

      {/* Info Callout */}
      <div style={{
        padding: '14px 24px',
        backgroundColor: '#e6fcff',
        borderBottom: '1px solid #b3f5ff',
        color: '#0065ff',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontSize: '0.85rem'
      }}>
        <Info size={18} style={{ flexShrink: 0 }} />
        <span>
          <strong>보안 모드 적용 중:</strong> [필수 지정(Mandatory)] 스위치를 켜면, 작업자가 티켓을 생성할 때 해당 내용을 <strong>반드시 작성해야만 제출</strong>할 수 있도록 폼과 저장 엔진 양쪽에서 강제됩니다.
        </span>
      </div>

      {/* Fields Table */}
      <div className="settings-table-container">
        <table className="settings-table">
          <thead>
            <tr>
              <th style={{ width: '22%' }}>필드 이름</th>
              <th style={{ width: '14%' }}>필드 유형</th>
              <th style={{ width: '18%' }}>필수 입력 (Mandatory)</th>
              <th style={{ width: '14%' }}>필드 활성화</th>
              <th style={{ width: '22%' }}>설명 / 힌트</th>
              <th style={{ width: '10%', textAlign: 'center' }}>관리</th>
            </tr>
          </thead>
          <tbody>
            {fields.map(field => {
              const isMandatory = field.isMandatory;
              const isEnabled = field.isEnabled;

              return (
                <tr key={field.id} style={{ opacity: isEnabled ? 1 : 0.6 }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <strong style={{ color: 'var(--text-main)' }}>{field.name}</strong>
                      {field.isSystem ? (
                        <span style={{ fontSize: '0.7rem', backgroundColor: '#ebecf0', color: '#5e6c84', padding: '1px 6px', borderRadius: 3 }}>
                          기본
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.7rem', backgroundColor: '#e3fcef', color: '#006644', padding: '1px 6px', borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Sparkles size={10} /> 커스텀
                        </span>
                      )}
                    </div>
                  </td>

                  <td>
                    <span style={{ 
                      fontFamily: 'monospace', 
                      fontSize: '0.82rem', 
                      backgroundColor: '#f4f5f7', 
                      padding: '3px 8px', 
                      borderRadius: 4,
                      border: '1px solid #dfe1e6'
                    }}>
                      {field.type === 'textarea' ? 'Text Area (여러줄)' : 
                       field.type === 'select' ? `Select (${field.options ? field.options.length : 0}개)` : 
                       field.type === 'date' ? 'Date (날짜)' : 
                       field.type === 'number' ? 'Number (숫자)' : 'Text (한줄)'}
                    </span>
                  </td>

                  {/* Mandatory Toggle */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <label className="toggle-switch">
                        <input 
                          type="checkbox"
                          checked={isMandatory}
                          onChange={() => handleToggleMandatory(field.id)}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                      {isMandatory ? (
                        <span style={{ color: 'var(--color-danger)', fontWeight: 700, fontSize: '0.82rem' }}>
                          ★ 필수 (Required)
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                          선택 (Optional)
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Enabled Toggle */}
                  <td>
                    <label className="toggle-switch">
                      <input 
                        type="checkbox"
                        checked={isEnabled}
                        onChange={() => handleToggleEnabled(field.id)}
                      />
                      <span className="toggle-slider" style={{ backgroundColor: isEnabled ? '#0052cc' : '#dfe1e6' }}></span>
                    </label>
                    <span style={{ marginLeft: 8, fontSize: '0.82rem', color: isEnabled ? '#0052cc' : 'var(--text-muted)', fontWeight: 600 }}>
                      {isEnabled ? '사용 중' : '비활성'}
                    </span>
                  </td>

                  <td style={{ color: 'var(--text-sub)', fontSize: '0.82rem' }}>
                    {field.description || '-'}
                  </td>

                  <td style={{ textAlign: 'center' }}>
                    {!field.isSystem ? (
                      <button 
                        onClick={() => handleDeleteField(field.id, field.name)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#de350b', padding: 6, borderRadius: 4 }}
                        title="커스텀 필드 삭제"
                      >
                        <Trash2 size={16} />
                      </button>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>고정</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Custom Field Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <h2>
                <Plus size={20} />
                <span>새 커스텀 필드 생성</span>
              </h2>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCustomField}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">
                    <span>필드 이름 (Field Name) <span className="label-mandatory-mark">*</span></span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="예: 고객사 명, 배포 버전, 버그 심각도"
                    value={newFieldName}
                    onChange={e => setNewFieldName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">필드 타입 (Input Type)</label>
                  <select
                    className="form-select"
                    value={newFieldType}
                    onChange={e => setNewFieldType(e.target.value)}
                  >
                    <option value="text">텍스트 (단문 1줄)</option>
                    <option value="textarea">텍스트 영역 (장문 여러줄)</option>
                    <option value="select">드롭다운 선택박스 (Dropdown)</option>
                    <option value="date">날짜 (Date Picker)</option>
                    <option value="number">숫자 (Number)</option>
                  </select>
                </div>

                {newFieldType === 'select' && (
                  <div className="form-group">
                    <label className="form-label">
                      <span>선택 옵션 목록 (쉼표로 구분) <span className="label-mandatory-mark">*</span></span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="예: 서울 본사, 부산 지사, 미국 법인"
                      value={newFieldOptions}
                      onChange={e => setNewFieldOptions(e.target.value)}
                    />
                    <div className="field-hint">콤마(,)를 기준으로 분리되어 선택 드롭다운에 추가됩니다.</div>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">플레이스홀더 / 안내 힌트</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="입력란에 표시될 플레이스홀더 텍스트"
                    value={newFieldPlaceholder}
                    onChange={e => setNewFieldPlaceholder(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">필드 상세 설명</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="작업자에게 표시될 안내 문구"
                    value={newFieldDescription}
                    onChange={e => setNewFieldDescription(e.target.value)}
                  />
                </div>

                <div style={{
                  padding: '14px',
                  backgroundColor: '#fff9f8',
                  border: '1px solid #ffbdad',
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 10
                }}>
                  <div>
                    <strong style={{ color: 'var(--color-danger)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>★ 필수 입력 필드로 지정 (Mandatory)</span>
                    </strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-sub)', marginTop: 2 }}>
                      체크 시, 이 항목을 작성하지 않으면 티켓을 생성할 수 없습니다.
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    id="new-field-mandatory"
                    checked={newFieldIsMandatory}
                    onChange={e => setNewFieldIsMandatory(e.target.checked)}
                    style={{ width: 20, height: 20, cursor: 'pointer', accentColor: 'var(--color-danger)' }}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>
                  취소
                </button>
                <button type="submit" className="btn-primary">
                  필드 추가하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <h2>
                <KeyRound size={20} />
                <span>관리자 비밀번호 변경</span>
              </h2>
              <button className="modal-close-btn" onClick={() => setShowPasswordModal(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleChangePassword}>
              <div className="modal-body">
                <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginBottom: 14 }}>
                  새로운 관리자 비밀번호를 입력해주세요. (최소 4자리 이상)
                </p>

                <div className="form-group">
                  <label className="form-label">새 비밀번호</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="새로운 비밀번호 입력"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    autoFocus
                  />
                  {passwordStatusMsg && (
                    <div className="field-error-msg" style={{ marginTop: 6 }}>
                      {passwordStatusMsg}
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowPasswordModal(false)}>
                  취소
                </button>
                <button type="submit" className="btn-primary">
                  변경사항 저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
