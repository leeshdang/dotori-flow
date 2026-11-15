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

import React, { useState } from 'react';
import { 
  Sliders, 
  Plus, 
  Trash2, 
  CheckCircle, 
  RotateCcw,
  Sparkles,
  Info,
  Lock,
  KeyRound,
  ArrowLeft,
  Pencil,
  Download
} from 'lucide-react';
import { INITIAL_FIELDS } from '../constants/initialData';
import { updateAdminPassword } from '../utils/security';
import { useIsMobile } from '../utils/useIsMobile';
import { useBackdropClose } from '../utils/useBackdropClose';

export default function AdminFieldSettings({ 
  fields, 
  setFields, 
  onDownloadBackup,
  isAdmin, 
  onOpenLoginModal,
  onBackToBoard
}) {
  const isMobile = useIsMobile();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPlaceholder, setEditPlaceholder] = useState('');
  const [editOptions, setEditOptions] = useState([]);
  const [newOptionInput, setNewOptionInput] = useState('');
  const [optionError, setOptionError] = useState('');

  const addModalBackdropProps = useBackdropClose(() => setShowAddModal(false));
  const passwordModalBackdropProps = useBackdropClose(() => setShowPasswordModal(false));
  const editModalBackdropProps = useBackdropClose(() => setEditingField(null));
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
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
          {onBackToBoard && (
            <button 
              type="button"
              className="btn-secondary" 
              onClick={onBackToBoard}
              style={{ padding: '10px 18px', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <ArrowLeft size={16} />
              메인(칸반 보드)으로 돌아가기
            </button>
          )}
          <button 
            type="button"
            className="btn-primary" 
            onClick={onOpenLoginModal}
            style={{ padding: '10px 22px', fontSize: '0.95rem' }}
          >
            <Lock size={16} />
            관리자 암호로 로그인하기
          </button>
        </div>
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

  // 필드 및 Select 선택 항목 편집 모달 열기
  const handleOpenEditModal = (field) => {
    setEditingField(field);
    setEditName(field.name || '');
    setEditDescription(field.description || '');
    setEditPlaceholder(field.placeholder || '');
    setEditOptions(Array.isArray(field.options) ? [...field.options] : []);
    setNewOptionInput('');
    setOptionError('');
  };

  // Select 선택 항목(아이템) 추가
  const handleAddOptionItem = () => {
    const trimmed = newOptionInput.trim();
    if (!trimmed) {
      setOptionError('추가할 항목 이름을 입력해주세요.');
      return;
    }
    if (editOptions.some(opt => opt.trim().toLowerCase() === trimmed.toLowerCase())) {
      setOptionError(`'${trimmed}' 항목은 이미 존재합니다.`);
      return;
    }
    setEditOptions(prev => [...prev, trimmed]);
    setNewOptionInput('');
    setOptionError('');
  };

  // Select 선택 항목 수정
  const handleUpdateOptionItem = (index, value) => {
    setEditOptions(prev => prev.map((opt, idx) => (idx === index ? value : opt)));
    setOptionError('');
  };

  // Select 선택 항목 삭제
  const handleRemoveOptionItem = (index) => {
    if (editOptions.length <= 1) {
      setOptionError('Select 필드는 최소 1개 이상의 선택 항목이 필요합니다.');
      return;
    }
    setEditOptions(prev => prev.filter((_, idx) => idx !== index));
    setOptionError('');
  };

  // 필드 편집 저장
  const handleSaveFieldEdit = (e) => {
    e.preventDefault();
    if (!editingField) return;

    const trimmedName = editName.trim();
    if (!trimmedName) {
      setOptionError('필드 이름을 입력해주세요.');
      return;
    }

    let cleanedOptions = editingField.options;
    if (editingField.type === 'select') {
      cleanedOptions = editOptions.map(opt => opt.trim()).filter(Boolean);
      if (cleanedOptions.length === 0) {
        setOptionError('Select 필드는 최소 1개 이상의 선택 항목이 필요합니다.');
        return;
      }
    }

    setFields(prevFields =>
      prevFields.map(f => {
        if (f.id !== editingField.id) return f;
        return {
          ...f,
          name: f.isSystem ? f.name : trimmedName,
          description: editDescription.trim(),
          placeholder: editPlaceholder.trim(),
          ...(f.type === 'select' ? { options: cleanedOptions } : {})
        };
      })
    );

    showToast(
      editingField.type === 'select'
        ? `'${editingField.name}' 필드의 선택 항목(${cleanedOptions.length}개)이 저장되었습니다.`
        : `'${editingField.name}' 필드 정보가 업데이트되었습니다.`
    );
    setEditingField(null);
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

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          {onBackToBoard && (
            <button 
              type="button"
              className="btn-secondary" 
              onClick={onBackToBoard}
              style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.25)', color: '#ffffff', fontWeight: 600, border: '1px solid rgba(255,255,255,0.4)' }}
              title="메인 칸반 보드로 돌아가기"
            >
              <ArrowLeft size={15} />
              메인 보드로 돌아가기
            </button>
          )}

          <button 
            type="button"
            className="btn-secondary" 
            onClick={() => onDownloadBackup?.()}
            style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
            title="현재 티켓 전체를 엑셀(.xls)로 다운로드"
          >
            <Download size={15} />
            엑셀(.xls) 백업
          </button>

          <button 
            type="button"
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

      {/* Fields List: Mobile Cards vs Desktop Table */}
      {isMobile ? (
        <div className="mobile-admin-fields-list">
          {fields.map(field => {
            const isMandatory = field.isMandatory;
            const isEnabled = field.isEnabled;

            return (
              <div 
                key={field.id} 
                className="mobile-field-setting-card"
                style={{ opacity: isEnabled ? 1 : 0.65 }}
              >
                {/* Field Header */}
                <div className="mobile-field-card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <strong style={{ fontSize: '1rem', color: 'var(--text-main)' }}>{field.name}</strong>
                    {field.isSystem ? (
                      <span style={{ fontSize: '0.68rem', backgroundColor: '#ebecf0', color: '#5e6c84', padding: '2px 6px', borderRadius: 3 }}>
                        기본
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.68rem', backgroundColor: '#e3fcef', color: '#006644', padding: '2px 6px', borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Sparkles size={10} /> 커스텀
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(field)}
                      className="mobile-edit-btn"
                      style={{
                        background: 'none',
                        border: '1px solid #dfe1e6',
                        cursor: 'pointer',
                        color: 'var(--primary)',
                        padding: '5px 8px',
                        borderRadius: 6,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                      title="필드 및 옵션 편집"
                      aria-label="필드 편집"
                    >
                      <Pencil size={14} />
                      <span>편집</span>
                    </button>
                    {!field.isSystem && (
                      <button 
                        type="button"
                        onClick={() => handleDeleteField(field.id, field.name)}
                        className="mobile-delete-btn"
                        title="커스텀 필드 삭제"
                        aria-label="삭제"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Field Type & Description */}
                <div style={{ margin: '8px 0', fontSize: '0.82rem', color: 'var(--text-sub)' }}>
                  {field.type === 'select' ? (
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(field)}
                      style={{ 
                        fontFamily: 'monospace', 
                        fontSize: '0.75rem', 
                        backgroundColor: '#eff6ff', 
                        color: '#1d4ed8',
                        padding: '2px 8px', 
                        borderRadius: 4,
                        border: '1px solid #bfdbfe',
                        marginRight: 6,
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                      title="클릭하여 선택 항목 편집"
                    >
                      {`Select (${field.options ? field.options.length : 0}개 옵션) · 편집`}
                    </button>
                  ) : (
                    <span style={{ 
                      fontFamily: 'monospace', 
                      fontSize: '0.75rem', 
                      backgroundColor: '#f4f5f7', 
                      padding: '2px 6px', 
                      borderRadius: 4,
                      border: '1px solid #dfe1e6',
                      marginRight: 6
                    }}>
                      {field.type === 'textarea' ? 'Text Area (여러줄)' : 
                       field.type === 'date' ? 'Date (날짜)' : 
                       field.type === 'number' ? 'Number (숫자)' : 
                       field.type === 'file' ? 'Link (클라우드 첨부)' : 'Text (한줄)'}
                    </span>
                  )}
                  <span>{field.description || ''}</span>
                </div>

                {/* Toggles Row */}
                <div className="mobile-field-toggles-row">
                  {/* Mandatory Switch */}
                  <div className="mobile-toggle-group">
                    <label className="toggle-switch">
                      <input 
                        type="checkbox"
                        checked={isMandatory}
                        onChange={() => handleToggleMandatory(field.id)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                    <span style={{ 
                      fontSize: '0.82rem', 
                      fontWeight: 700, 
                      color: isMandatory ? 'var(--color-danger)' : 'var(--text-sub)' 
                    }}>
                      {isMandatory ? '★ 필수(Mandatory)' : '선택(Optional)'}
                    </span>
                  </div>

                  {/* Enabled Switch */}
                  <div className="mobile-toggle-group">
                    <label className="toggle-switch">
                      <input 
                        type="checkbox"
                        checked={isEnabled}
                        onChange={() => handleToggleEnabled(field.id)}
                      />
                      <span className="toggle-slider" style={{ backgroundColor: isEnabled ? '#0052cc' : '#dfe1e6' }}></span>
                    </label>
                    <span style={{ 
                      fontSize: '0.82rem', 
                      fontWeight: 600, 
                      color: isEnabled ? '#0052cc' : 'var(--text-muted)' 
                    }}>
                      {isEnabled ? '사용 중' : '비활성'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Desktop Table View */
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
                      {field.type === 'select' ? (
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(field)}
                          style={{ 
                            fontFamily: 'monospace', 
                            fontSize: '0.82rem', 
                            backgroundColor: '#eff6ff', 
                            color: '#1d4ed8',
                            padding: '3px 9px', 
                            borderRadius: 4,
                            border: '1px solid #bfdbfe',
                            cursor: 'pointer',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                          }}
                          title="클릭하여 선택 항목 추가/수정/삭제"
                        >
                          <span>{`Select (${field.options ? field.options.length : 0}개)`}</span>
                          <span style={{ fontSize: '0.72rem', opacity: 0.85 }}>옵션 편집</span>
                        </button>
                      ) : (
                        <span style={{ 
                          fontFamily: 'monospace', 
                          fontSize: '0.82rem', 
                          backgroundColor: '#f4f5f7', 
                          padding: '3px 8px', 
                          borderRadius: 4,
                          border: '1px solid #dfe1e6'
                        }}>
                          {field.type === 'textarea' ? 'Text Area (여러줄)' : 
                           field.type === 'date' ? 'Date (날짜)' : 
                           field.type === 'number' ? 'Number (숫자)' : 
                           field.type === 'file' ? 'Link (클라우드 첨부)' : 'Text (한줄)'}
                        </span>
                      )}
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
                      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(field)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', padding: 6, borderRadius: 4, display: 'inline-flex', alignItems: 'center' }}
                          title="필드 및 선택 옵션 편집"
                          aria-label="필드 편집"
                        >
                          <Pencil size={16} />
                        </button>
                        {!field.isSystem && (
                          <button 
                            type="button"
                            onClick={() => handleDeleteField(field.id, field.name)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#de350b', padding: 6, borderRadius: 4, display: 'inline-flex', alignItems: 'center' }}
                            title="커스텀 필드 삭제"
                            aria-label="커스텀 필드 삭제"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Custom Field Modal */}
      {showAddModal && (
        <div className="modal-overlay" {...addModalBackdropProps}>
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
                    <option value="file">첨부 링크 (Google Drive · OneDrive · Dropbox)</option>
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

      {/* Edit Field & Select Options Modal */}
      {editingField && (
        <div className="modal-overlay" {...editModalBackdropProps}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <h2>
                <Pencil size={20} />
                <span>필드 및 선택 항목 편집</span>
              </h2>
              <button type="button" className="modal-close-btn" onClick={() => setEditingField(null)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveFieldEdit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">필드 이름</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    placeholder="필드 이름을 입력하세요"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">설명 / 힌트</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editDescription}
                    onChange={e => setEditDescription(e.target.value)}
                    placeholder="사용자에게 표시할 안내 문구"
                  />
                </div>

                {editingField.type !== 'select' && editingField.type !== 'date' && (
                  <div className="form-group">
                    <label className="form-label">입력 안내 (Placeholder)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editPlaceholder}
                      onChange={e => setEditPlaceholder(e.target.value)}
                      placeholder="입력창 내부 안내 문구"
                    />
                  </div>
                )}

                {editingField.type === 'select' && (
                  <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>선택 항목 (Select 옵션)</span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-sub)', fontWeight: 500 }}>
                        총 {editOptions.length}개
                      </span>
                    </label>

                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <input
                        type="text"
                        className="form-input"
                        value={newOptionInput}
                        onChange={e => setNewOptionInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddOptionItem();
                          }
                        }}
                        placeholder="새 항목 입력 (예: pdf툴) 후 추가 또는 Enter"
                      />
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={handleAddOptionItem}
                        style={{ whiteSpace: 'nowrap', padding: '0 14px' }}
                      >
                        <Plus size={16} />
                        <span>추가</span>
                      </button>
                    </div>

                    {optionError && (
                      <div style={{ color: 'var(--color-danger)', fontSize: '0.82rem', marginBottom: 8 }}>
                        {optionError}
                      </div>
                    )}

                    <div
                      style={{
                        maxHeight: 240,
                        overflowY: 'auto',
                        border: '1px solid var(--border-color)',
                        borderRadius: 8,
                        padding: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6,
                        backgroundColor: 'var(--bg-subtle, #f8fafc)',
                      }}
                    >
                      {editOptions.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '16px 8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          등록된 선택 항목이 없습니다. 위 입력창에서 항목을 추가해 주세요.
                        </div>
                      ) : (
                        editOptions.map((opt, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', width: 22, textAlign: 'right', flexShrink: 0 }}>
                              {idx + 1}.
                            </span>
                            <input
                              type="text"
                              className="form-input"
                              value={opt}
                              onChange={e => handleUpdateOptionItem(idx, e.target.value)}
                              style={{ padding: '6px 10px', fontSize: '0.88rem' }}
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveOptionItem(idx)}
                              style={{
                                background: 'none',
                                border: '1px solid #fecaca',
                                color: '#dc2626',
                                borderRadius: 6,
                                padding: '6px 8px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                flexShrink: 0,
                              }}
                              title="항목 삭제"
                              aria-label={`${opt} 항목 삭제`}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setEditingField(null)}>
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

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" {...passwordModalBackdropProps}>
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
