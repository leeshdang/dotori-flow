import React, { useState, useEffect, useRef } from 'react';
import { X, AlertCircle, CheckCircle2, Asterisk } from 'lucide-react';

export default function CreateIssueModal({ isOpen, onClose, fields, onCreateIssue }) {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-container" 
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-header">
          <h2>
            <span>새 이슈 만들기</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)', fontWeight: 500 }}>
              (필수 항목: {mandatoryFields.length}개)
            </span>
          </h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="닫기">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className="modal-body">
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
            <button type="button" className="btn-secondary" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="btn-primary">
              <CheckCircle2 size={16} />
              티켓 생성하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
