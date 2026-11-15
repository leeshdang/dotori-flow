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
import { X, Calendar, User, Trash2, Save, Lock, History, UserCheck } from 'lucide-react';
import { ISSUE_STATUSES } from '../constants/initialData';
import { useBackdropClose } from '../utils/useBackdropClose';
import { canUserEditIssue, formatKoreanDateTime } from '../utils/issuePermissions';
import AttachmentFieldInput from './AttachmentFieldInput';
import { normalizeAttachments } from '../utils/attachments';

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
    next[cf.id] = cf.type === 'file' ? normalizeAttachments(issue[cf.id]) : (issue[cf.id] ?? '');
  });
  return next;
}

export default function IssueDetailModal({
  issue,
  fields,
  currentUser,
  onOpenLoginModal,
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

  const canEditFull = useMemo(
    () => canUserEditIssue(issue, currentUser),
    [issue, currentUser]
  );

  const isDirty = useMemo(() => {
    if (!issue) return false;
    const base = buildDraft(issue, customFields);
    return Object.keys(base).some(key => {
      const a = draft[key] ?? '';
      const b = base[key] ?? '';
      if (Array.isArray(a) || Array.isArray(b)) {
        return JSON.stringify(a) !== JSON.stringify(b);
      }
      return a !== b;
    });
  }, [draft, issue, customFields]);

  const isAssigneeChanged = useMemo(() => {
    if (!issue) return false;
    return (draft.assignee || '미지정') !== (issue.assignee || '미지정');
  }, [draft.assignee, issue]);

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

  const handleAssignToMe = () => {
    if (!currentUser) {
      if (onOpenLoginModal) onOpenLoginModal();
      return;
    }
    const myAssigneeName = currentUser.email
      ? currentUser.email.split('@')[0]
      : currentUser.name;
    if (!myAssigneeName) return;

    if (onUpdateIssue) {
      onUpdateIssue(issue.id, { assignee: myAssigneeName });
    }
  };

  const handleSave = (e) => {
    e.preventDefault();

    if (!canEditFull) {
      if (!isAssigneeChanged) return;
      const nextAssignee = String(draft.assignee || '').trim() || '미지정';
      if (onUpdateIssue) {
        onUpdateIssue(issue.id, { assignee: nextAssignee });
      }
      return;
    }

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

  const historyList = Array.isArray(issue.history) ? [...issue.history].reverse() : [];
  const reporterLabel = issue.reporter
    ? (issue.reporterEmail ? `${issue.reporter} (${issue.reporterEmail})` : issue.reporter)
    : '미기록 (기존 이슈)';

  const canSubmit = canEditFull ? isDirty : isAssigneeChanged;

  return (
    <div className="modal-overlay" {...backdropProps}>
      <div
        className="modal-container"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: 760 }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
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
              disabled={!canEditFull}
              style={{
                height: 30,
                fontSize: '0.82rem',
                padding: '0 24px 0 8px',
                width: 'auto',
                opacity: canEditFull ? 1 : 0.7,
                cursor: canEditFull ? 'pointer' : 'not-allowed',
              }}
              value={draft.issueType || 'Bug'}
              onChange={e => updateField('issueType', e.target.value)}
            >
              {renderSelectOptions(issueTypeOptions, draft.issueType).map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-sub)' }}>
              최초 작성자: <strong>{reporterLabel}</strong>
            </span>
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
            {!canEditFull && (
              <div style={{
                marginBottom: 14,
                padding: '10px 14px',
                borderRadius: 6,
                backgroundColor: '#fffbeb',
                border: '1px solid #fcd34d',
                color: '#92400e',
                fontSize: '0.83rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
                flexWrap: 'wrap',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                  <Lock size={16} style={{ flexShrink: 0 }} />
                  <span>
                    {currentUser
                      ? `이슈 수정 권한: 최초 작성자 또는 현재 담당자(${issue.assignee || '미지정'})만 내용을 수정할 수 있습니다. 수정하려면 먼저 담당자(Assignee)를 본인으로 변경해 주세요.`
                      : '이슈 수정 권한: 비로그인 상태입니다. 담당자(Assignee) 변경만 가능하며, 내용을 수정하려면 로그인 후 담당자로 지정되어야 합니다.'}
                  </span>
                </div>
                {currentUser ? (
                  <button
                    type="button"
                    onClick={handleAssignToMe}
                    style={{
                      backgroundColor: '#0052cc',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: 5,
                      padding: '6px 10px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <UserCheck size={14} />
                    <span>나를 담당자로 지정</span>
                  </button>
                ) : (
                  onOpenLoginModal && (
                    <button
                      type="button"
                      onClick={onOpenLoginModal}
                      style={{
                        backgroundColor: '#0052cc',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: 5,
                        padding: '6px 10px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      로그인하기
                    </button>
                  )
                )}
              </div>
            )}

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
                disabled={!canEditFull}
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  backgroundColor: canEditFull ? '#ffffff' : '#f4f5f7',
                }}
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
                  disabled={!canEditFull}
                  style={{ height: 34, fontSize: '0.84rem', padding: '0 24px 0 8px', opacity: canEditFull ? 1 : 0.7 }}
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
                  disabled={!canEditFull}
                  style={{ height: 34, fontSize: '0.84rem', padding: '0 24px 0 8px', opacity: canEditFull ? 1 : 0.7 }}
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
                  disabled={!canEditFull}
                  style={{ height: 34, fontSize: '0.82rem', padding: '0 8px', opacity: canEditFull ? 1 : 0.7 }}
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
                disabled={!canEditFull}
                style={{
                  lineHeight: 1.6,
                  fontSize: '0.9rem',
                  backgroundColor: canEditFull ? '#ffffff' : '#f4f5f7',
                }}
                value={draft.description || ''}
                onChange={e => updateField('description', e.target.value)}
                placeholder="상세한 이슈 내용 및 배경을 입력해주세요"
              />
            </div>

            {/* Custom Fields Section */}
            {customFields.length > 0 && (
              <div style={{ marginBottom: 24 }}>
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
                            disabled={!canEditFull}
                            style={{ backgroundColor: canEditFull ? '#ffffff' : '#f4f5f7' }}
                            value={value}
                            onChange={e => updateField(cf.id, e.target.value)}
                            placeholder={cf.placeholder || `${cf.name} 입력`}
                          />
                        ) : cf.type === 'select' ? (
                          <select
                            id={`detail-cf-${cf.id}`}
                            className="form-select"
                            disabled={!canEditFull}
                            style={{ opacity: canEditFull ? 1 : 0.7 }}
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
                            disabled={!canEditFull}
                            style={{ backgroundColor: canEditFull ? '#ffffff' : '#f4f5f7' }}
                            value={value}
                            onChange={e => updateField(cf.id, e.target.value)}
                          />
                        ) : cf.type === 'number' ? (
                          <input
                            id={`detail-cf-${cf.id}`}
                            type="number"
                            className="form-input"
                            disabled={!canEditFull}
                            style={{ backgroundColor: canEditFull ? '#ffffff' : '#f4f5f7' }}
                            value={value}
                            onChange={e => updateField(cf.id, e.target.value)}
                            placeholder={cf.placeholder || `${cf.name} 입력`}
                          />
                        ) : cf.type === 'file' ? (
                          <AttachmentFieldInput
                            id={`detail-cf-${cf.id}`}
                            value={value}
                            onChange={nextVal => updateField(cf.id, nextVal)}
                            disabled={!canEditFull}
                            placeholder={cf.placeholder}
                          />
                        ) : (
                          <input
                            id={`detail-cf-${cf.id}`}
                            type="text"
                            className="form-input"
                            disabled={!canEditFull}
                            style={{ backgroundColor: canEditFull ? '#ffffff' : '#f4f5f7' }}
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

            {/* Activity / Modification History Log */}
            <div style={{ borderTop: '1px solid #dfe1e6', paddingTop: 18 }}>
              <h4 style={{
                fontSize: '0.85rem',
                color: 'var(--text-sub)',
                textTransform: 'uppercase',
                marginBottom: 12,
                letterSpacing: '0.04em',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}>
                <History size={15} />
                <span>수정 내역 로그 (Activity History · {historyList.length}건)</span>
              </h4>

              {historyList.length === 0 ? (
                <div style={{
                  padding: '12px 14px',
                  borderRadius: 6,
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  color: 'var(--text-muted)',
                  fontSize: '0.83rem',
                }}>
                  아직 기록된 수정 내역이 없습니다.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 220, overflowY: 'auto' }}>
                  {historyList.map(entry => (
                    <div key={entry.id} style={{
                      padding: '10px 12px',
                      borderRadius: 6,
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      fontSize: '0.82rem',
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: 4,
                        flexWrap: 'wrap',
                      }}>
                        <strong style={{ color: 'var(--text-main)' }}>{entry.actor}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)', fontFamily: 'monospace' }}>
                          {formatKoreanDateTime(entry.timestamp)}
                        </span>
                      </div>
                      <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--text-main)', lineHeight: 1.5 }}>
                        {(entry.changes || []).map((c, idx) => (
                          <li key={idx}>{c.summaryText}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={handleRequestClose}>
              {isDirty ? '취소' : '닫기'}
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={!canSubmit}
              style={!canSubmit ? { opacity: 0.55, cursor: 'not-allowed' } : undefined}
            >
              <Save size={16} />
              <span>{canEditFull ? '변경사항 저장' : '담당자 변경 저장'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
