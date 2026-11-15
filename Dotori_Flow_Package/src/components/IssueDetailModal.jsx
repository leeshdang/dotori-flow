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

import React, { useState, useEffect, useMemo } from 'react';
import { X, Calendar, User, Trash2, Save } from 'lucide-react';
import { ISSUE_STATUSES } from '../constants/initialData';
import { useBackdropClose } from '../utils/useBackdropClose';

const CUSTOM_ASSIGNEE_SENTINEL = '__custom_assignee__';

function buildDraft(issue, customFields) {
  if (!issue) return {};
  const next = {
    summary: issue.summary || '',
    issueType: issue.issueType || 'Bug',
    status: issue.status || ISSUE_STATUSES[0].id,
    priority: issue.priority || 'Medium',
    assignee: issue.assignee || '미지정',
    dueDate: issue.dueDate || '',
    description: issue.description || '',
  };
  customFields.forEach(cf => {
    next[cf.id] = issue[cf.id] ?? '';
  });
  return next;
}

export default function IssueDetailModal({
  issue,
  fields,
  onClose,
  onChangeIssueStatus,
  onUpdateIssue,
  onDeleteIssue,
}) {
  const customFields = useMemo(
    () => fields.filter(f => !f.isSystem && f.isEnabled),
    [fields]
  );

  const issueTypeField = useMemo(() => fields.find(f => f.id === 'issueType'), [fields]);
  const priorityField = useMemo(() => fields.find(f => f.id === 'priority'), [fields]);
  const assigneeField = useMemo(() => fields.find(f => f.id === 'assignee'), [fields]);

  const assigneeOptions = useMemo(
    () => assigneeField?.options || ['김개발 (Frontend)', '이백엔 (Backend)', '박기획 (PM)', '최디자 (UI/UX)', '정품질 (QA)', '미지정'],
    [assigneeField]
  );

  const [draft, setDraft] = useState(() => buildDraft(issue, customFields));
  const [isCustomAssignee, setIsCustomAssignee] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!issue) return;
    const initialDraft = buildDraft(issue, customFields);
    setDraft(initialDraft);
    setIsCustomAssignee(
      Boolean(initialDraft.assignee) && !assigneeOptions.includes(initialDraft.assignee)
    );
    setErrorMsg('');
  }, [issue, customFields, assigneeOptions]);

  const isDirty = useMemo(() => {
    if (!issue) return false;
    const base = buildDraft(issue, customFields);
    return Object.keys(base).some(key => (draft[key] ?? '') !== (base[key] ?? ''));
  }, [draft, issue, customFields]);

  const handleRequestClose = () => {
    if (isDirty) {
      if (!window.confirm('저장하지 않은 변경사항이 있습니다. 저장하지 않고 닫으시겠습니까?')) {
        return;
      }
    }
    onClose();
  };

  const backdropProps = useBackdropClose(handleRequestClose);
  if (!issue) return null;

  const updateField = (key, value) => {
    setDraft(prev => ({ ...prev, [key]: value }));
    if (errorMsg) setErrorMsg('');
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!String(draft.summary || '').trim()) {
      setErrorMsg('요약 (Summary)은 비워둘 수 없습니다.');
      return;
    }

    const payload = {
      ...draft,
      summary: String(draft.summary).trim(),
      assignee: String(draft.assignee || '').trim() || '미지정',
    };

    if (onUpdateIssue) {
      onUpdateIssue(issue.id, payload);
    } else if (onChangeIssueStatus && payload.status !== issue.status) {
      onChangeIssueStatus(issue.id, payload.status);
    }
    onClose();
  };

  const issueTypeOptions = issueTypeField?.options || ['Bug', 'Task', 'Story', 'Improvement', 'Epic'];
  const priorityOptions = priorityField?.options || ['Highest', 'High', 'Medium', 'Low', 'Lowest'];

  const renderSelectOptions = (options, currentValue) => {
    const list = Array.isArray(options) ? [...options] : [];
    if (currentValue && !list.includes(currentValue)) {
      list.unshift(currentValue);
    }
    return list;
  };

  return (
    <div className="modal-overlay" {...backdropProps}>
      <div
        className="modal-container"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: 740 }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              fontWeight: 700,
              color: 'var(--theme-primary)',
              backgroundColor: '#deebff',
              padding: '3px 8px',
              borderRadius: 4
            }}>
              {issue.id}
            </span>
            <select
              className="form-select"
              aria-label="이슈 유형"
              style={{ height: 30, fontSize: '0.82rem', padding: '0 24px 0 8px', width: 'auto' }}
              value={draft.issueType || 'Bug'}
              onChange={e => updateField('issueType', e.target.value)}
            >
              {renderSelectOptions(issueTypeOptions, draft.issueType).map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => onDeleteIssue(issue.id)}
              title="이슈 삭제"
              style={{ color: '#de350b' }}
            >
              <Trash2 size={18} />
            </button>
            <button type="button" className="modal-close-btn" onClick={handleRequestClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSave}>
          <div className="modal-body">
            {errorMsg && (
              <div style={{
                marginBottom: 12,
                padding: '10px 12px',
                borderRadius: 6,
                backgroundColor: '#ffebe6',
                color: '#bf2600',
                fontSize: '0.85rem',
                fontWeight: 600
              }}>
                {errorMsg}
              </div>
            )}

            {/* Summary / Title */}
            <div style={{ marginBottom: 16 }}>
              <label
                htmlFor="detail-summary-input"
                style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-sub)', fontWeight: 600, marginBottom: 4 }}
              >
                요약 (Summary)
              </label>
              <input
                id="detail-summary-input"
                type="text"
                className="form-input"
                style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}
                value={draft.summary || ''}
                onChange={e => updateField('summary', e.target.value)}
                placeholder="이슈 제목을 입력하세요"
                required
              />
            </div>

            {/* Quick Details Bar */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: 12,
              padding: '14px',
              backgroundColor: '#f4f5f7',
              borderRadius: 6,
              marginBottom: 20
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', fontWeight: 600, marginBottom: 4 }}>상태 (Status)</div>
                <select
                  className="form-select"
                  style={{ height: 34, fontSize: '0.84rem', padding: '0 24px 0 8px' }}
                  value={draft.status || ISSUE_STATUSES[0].id}
                  onChange={e => updateField('status', e.target.value)}
                >
                  {ISSUE_STATUSES.map(s => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', fontWeight: 600, marginBottom: 4 }}>우선순위 (Priority)</div>
                <select
                  className="form-select"
                  style={{ height: 34, fontSize: '0.84rem', padding: '0 24px 0 8px' }}
                  value={draft.priority || 'Medium'}
                  onChange={e => updateField('priority', e.target.value)}
                >
                  {renderSelectOptions(priorityOptions, draft.priority).map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', fontWeight: 600, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <User size={13} color="#5e6c84" />
                  <span>담당자 (Assignee)</span>
                </div>
                <select
                  className="form-select"
                  style={{ height: 34, fontSize: '0.84rem', padding: '0 24px 0 8px' }}
                  value={isCustomAssignee ? CUSTOM_ASSIGNEE_SENTINEL : (draft.assignee || '미지정')}
                  onChange={e => {
                    const val = e.target.value;
                    if (val === CUSTOM_ASSIGNEE_SENTINEL) {
                      setIsCustomAssignee(true);
                      if (assigneeOptions.includes(draft.assignee)) {
                        updateField('assignee', '');
                      }
                    } else {
                      setIsCustomAssignee(false);
                      updateField('assignee', val);
                    }
                  }}
                >
                  {assigneeOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                  <option value={CUSTOM_ASSIGNEE_SENTINEL}>+ 직접 입력...</option>
                </select>
                {isCustomAssignee && (
                  <input
                    type="text"
                    className="form-input"
                    style={{ marginTop: 6, height: 32, fontSize: '0.82rem', padding: '4px 8px' }}
                    value={draft.assignee || ''}
                    onChange={e => updateField('assignee', e.target.value)}
                    placeholder="담당자 이름 입력 (예: leeshdang)"
                    autoFocus
                  />
                )}
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', fontWeight: 600, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Calendar size={13} color="#5e6c84" />
                  <span>마감 기한 (Due Date)</span>
                </div>
                <input
                  type="date"
                  className="form-input"
                  style={{ height: 34, fontSize: '0.82rem', padding: '0 8px' }}
                  value={draft.dueDate || ''}
                  onChange={e => updateField('dueDate', e.target.value)}
                />
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: 24 }}>
              <label
                htmlFor="detail-description-input"
                style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.04em' }}
              >
                상세 설명 (Description)
              </label>
              <textarea
                id="detail-description-input"
                className="form-textarea"
                rows={4}
                style={{ lineHeight: 1.6, fontSize: '0.9rem' }}
                value={draft.description || ''}
                onChange={e => updateField('description', e.target.value)}
                placeholder="상세한 이슈 내용 및 배경을 입력해주세요"
              />
            </div>

            {/* Custom Fields Section */}
            {customFields.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-sub)', textTransform: 'uppercase', marginBottom: 12, letterSpacing: '0.04em' }}>
                  커스텀 필드 정보 (Custom Fields)
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {customFields.map(cf => {
                    const value = draft[cf.id] ?? '';
                    return (
                      <div key={cf.id} style={{
                        border: '1px solid #dfe1e6',
                        borderRadius: 6,
                        padding: '12px 14px',
                        backgroundColor: '#ffffff'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                          <label
                            htmlFor={`detail-cf-${cf.id}`}
                            style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-sub)' }}
                          >
                            {cf.name}
                          </label>
                          {cf.isMandatory ? (
                            <span className="mandatory-badge">필수 항목</span>
                          ) : (
                            <span className="optional-badge">선택 항목</span>
                          )}
                        </div>

                        {cf.type === 'textarea' ? (
                          <textarea
                            id={`detail-cf-${cf.id}`}
                            className="form-textarea"
                            rows={3}
                            value={value}
                            onChange={e => updateField(cf.id, e.target.value)}
                            placeholder={cf.placeholder || `${cf.name} 입력`}
                          />
                        ) : cf.type === 'select' ? (
                          <select
                            id={`detail-cf-${cf.id}`}
                            className="form-select"
                            value={value}
                            onChange={e => updateField(cf.id, e.target.value)}
                          >
                            <option value="">-- 선택 --</option>
                            {renderSelectOptions(cf.options, value).map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : cf.type === 'date' ? (
                          <input
                            id={`detail-cf-${cf.id}`}
                            type="date"
                            className="form-input"
                            value={value}
                            onChange={e => updateField(cf.id, e.target.value)}
                          />
                        ) : cf.type === 'number' ? (
                          <input
                            id={`detail-cf-${cf.id}`}
                            type="number"
                            className="form-input"
                            value={value}
                            onChange={e => updateField(cf.id, e.target.value)}
                            placeholder={cf.placeholder || `${cf.name} 입력`}
                          />
                        ) : (
                          <input
                            id={`detail-cf-${cf.id}`}
                            type="text"
                            className="form-input"
                            value={value}
                            onChange={e => updateField(cf.id, e.target.value)}
                            placeholder={cf.placeholder || `${cf.name} 입력`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={handleRequestClose}>
              {isDirty ? '취소' : '닫기'}
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={!isDirty}
              style={!isDirty ? { opacity: 0.55, cursor: 'not-allowed' } : undefined}
            >
              <Save size={16} />
              <span>변경사항 저장</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
