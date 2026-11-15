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

import React, { useState, useEffect, useRef } from 'react';
import { X, AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function CreateIssueModal({ isOpen, onClose, fields, onCreateIssue, currentUser }) {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const firstErrorRef = useRef(null);

  // 활성화된 필드만 추출
  const activeFields = fields.filter(f => f.isEnabled);
  const mandatoryFields = activeFields.filter(f => f.isMandatory);

  // 초기 폼 데이터 리셋
  useEffect(() => {
    if (isOpen) {
      const initial = {};
      activeFields.forEach(f => {
        if (f.type === 'select' && f.options && f.options.length > 0) {
          // 셀렉트 필드의 경우 첫 번째 기본값을 채우거나 빈값 유지
          // 사용자가 명시적으로 선택하게 하려면 빈 문자열로 둘 수도 있음
          // 기본 필드인 경우 첫 번째 옵션 기본 지정 (단, 필수인 경우 미선택 상태를 테스트할 수 있도록 빈 옵션 허용)
          initial[f.id] = f.id === 'issueType' ? f.options[0] : (f.id === 'priority' ? 'Medium' : '');
        } else {
          initial[f.id] = '';
        }
      });
      setFormData(initial);
      setErrors({});
      setHasAttemptedSubmit(false);
      setShowCancelConfirm(false);
    }
  }, [isOpen, fields]);

  if (!isOpen) return null;

  // 값 변경 핸들러
  const handleChange = (fieldId, value) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));

    // 사용자가 입력하면 즉시 해당 필드의 에러 해제
    if (errors[fieldId]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
  };

  // 폼 검증 로직 (핵심 요구사항)
  const validateForm = () => {
    const newErrors = {};

    mandatoryFields.forEach(field => {
      const val = formData[field.id];
      const isString = typeof val === 'string';
      const isEmpty = val === undefined || val === null || (isString && val.trim() === '');

      if (isEmpty) {
        newErrors[field.id] = `${field.name}은(는) 필수 입력 항목입니다.`;
      }
    });

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);

    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // 첫 번째 오류 필드로 스크롤 안내
      setTimeout(() => {
        if (firstErrorRef.current) {
          firstErrorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 50);
      return;
    }

    // 유효성 검사 통과 시 티켓 생성
    onCreateIssue(formData);
    onClose();
  };

  const missingFieldNames = mandatoryFields
    .filter(f => errors[f.id])
    .map(f => f.name);

  const handleRequestClose = () => {
    setShowCancelConfirm(true);
  };

  const handleConfirmDiscard = () => {
    setShowCancelConfirm(false);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div 
        className="modal-container" 
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-header">
          <h2>
            <span>버그 리포트 하기</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)', fontWeight: 500 }}>
              (필수 항목: {mandatoryFields.length}개)
            </span>
          </h2>
          <button type="button" className="modal-close-btn" onClick={handleRequestClose} aria-label="닫기">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className="modal-body">
            {/* 리포터 Google 계정 안내 */}
            {currentUser && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                backgroundColor: '#f1f5f9',
                padding: '8px 12px',
                borderRadius: 6,
                marginBottom: 16,
                fontSize: '0.82rem',
                color: '#334155',
                border: '1px solid #e2e8f0'
              }}>
                <img 
                  src={currentUser.picture} 
                  alt="" 
                  style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover' }} 
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <span>리포터: <strong>{currentUser.name}</strong> ({currentUser.email})</span>
              </div>
            )}

            {/* 필수 필드 미입력 시 상단 경고 배너 */}
            {hasAttemptedSubmit && missingFieldNames.length > 0 && (
              <div className="mandatory-summary-alert" ref={firstErrorRef}>
                <AlertCircle size={22} style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div className="alert-title">
                    필수 입력 항목을 작성해야 티켓을 생성할 수 있습니다!
                  </div>
                  <div>
                    아래 <strong>{missingFieldNames.length}개</strong>의 필수 항목이 누락되었습니다:
                  </div>
                  <ul className="alert-list">
                    {missingFieldNames.map((name, idx) => (
                      <li key={idx}><strong>{name}</strong></li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* 동적 필드 렌더링 */}
            {activeFields.map(field => {
              const isInvalid = !!errors[field.id];
              const value = formData[field.id] || '';

              return (
                <div className="form-group" key={field.id}>
                  <label className="form-label" htmlFor={`field-${field.id}`}>
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                      {field.name}
                      {field.isMandatory && (
                        <span className="label-mandatory-mark" title="필수 입력 항목">*</span>
                      )}
                    </span>
                    
                    {field.isMandatory ? (
                      <span className="mandatory-badge">필수 (Mandatory)</span>
                    ) : (
                      <span className="optional-badge">선택 (Optional)</span>
                    )}
                  </label>

                  {/* 필드 타입별 렌더링 */}
                  {field.type === 'textarea' ? (
                    <textarea
                      id={`field-${field.id}`}
                      className={`form-textarea ${isInvalid ? 'is-invalid' : ''}`}
                      rows={field.id === 'description' ? 4 : 3}
                      placeholder={field.placeholder || `${field.name}을 입력하세요`}
                      value={value}
                      onChange={e => handleChange(field.id, e.target.value)}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      id={`field-${field.id}`}
                      className={`form-select ${isInvalid ? 'is-invalid' : ''}`}
                      value={value}
                      onChange={e => handleChange(field.id, e.target.value)}
                    >
                      <option value="">-- {field.placeholder || `${field.name} 선택`} --</option>
                      {field.options && field.options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : field.type === 'date' ? (
                    <input
                      id={`field-${field.id}`}
                      type="date"
                      className={`form-input ${isInvalid ? 'is-invalid' : ''}`}
                      value={value}
                      onChange={e => handleChange(field.id, e.target.value)}
                    />
                  ) : field.type === 'number' ? (
                    <input
                      id={`field-${field.id}`}
                      type="number"
                      className={`form-input ${isInvalid ? 'is-invalid' : ''}`}
                      placeholder={field.placeholder || '숫자 입력'}
                      value={value}
                      onChange={e => handleChange(field.id, e.target.value)}
                    />
                  ) : (
                    <input
                      id={`field-${field.id}`}
                      type="text"
                      className={`form-input ${isInvalid ? 'is-invalid' : ''}`}
                      placeholder={field.placeholder || `${field.name}을 입력하세요`}
                      value={value}
                      onChange={e => handleChange(field.id, e.target.value)}
                    />
                  )}

                  {isInvalid ? (
                    <div className="field-error-msg">
                      <AlertCircle size={14} />
                      {errors[field.id]}
                    </div>
                  ) : field.description ? (
                    <div className="field-hint">{field.description}</div>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={handleRequestClose}>
              취소
            </button>
            <button type="submit" className="btn-primary">
              <CheckCircle2 size={16} />
              버그 리포트 제출하기
            </button>
          </div>
        </form>
      </div>

      {/* 취소 경고 확인창 */}
      {showCancelConfirm && (
        <div
          className="modal-overlay"
          style={{ zIndex: 1200, backgroundColor: 'rgba(9, 30, 66, 0.65)' }}
          role="alertdialog"
          aria-modal="true"
        >
          <div
            className="modal-container"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: 400, padding: 0, overflow: 'hidden' }}
          >
            <div className="modal-header" style={{ backgroundColor: '#fff7e6', borderBottom: '1px solid #ffe58f' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#b7410e', fontSize: '1.05rem' }}>
                <AlertTriangle size={20} color="#fa8c16" />
                <span>작성 취소 확인</span>
              </h2>
            </div>
            <div className="modal-body" style={{ padding: '20px 24px' }}>
              <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: 1.6, fontWeight: 500 }}>
                작성하시던 내용 삭제됩니다. 정말 취소하시겠습니까?
              </p>
            </div>
            <div className="modal-footer" style={{ padding: '12px 20px', gap: 10 }}>
              <button
                type="button"
                className="btn-primary"
                onClick={() => setShowCancelConfirm(false)}
              >
                아니요 (계속 작성)
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleConfirmDiscard}
                style={{ color: '#de350b', borderColor: '#ffbdad', backgroundColor: '#ffebe6' }}
              >
                예 (창 닫기)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
