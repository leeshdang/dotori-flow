import React from 'react';
import { X, Calendar, User, Tag, CheckCircle2, Clock, Trash2 } from 'lucide-react';
import { ISSUE_STATUSES } from '../constants/initialData';

export default function IssueDetailModal({ 
  issue, 
  fields, 
  onClose, 
  onChangeIssueStatus,
  onDeleteIssue
}) {
  if (!issue) return null;

  const currentStatusObj = ISSUE_STATUSES.find(s => s.id === issue.status) || ISSUE_STATUSES[0];
  const customFields = fields.filter(f => !f.isSystem && f.isEnabled);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-container" 
        onClick={e => e.stopPropagation()} 
        style={{ maxWidth: 720 }}
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
            <span style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>
              ({issue.issueType})
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button 
              className="modal-close-btn" 
              onClick={() => onDeleteIssue(issue.id)}
              title="이슈 삭제"
              style={{ color: '#de350b' }}
            >
              <Trash2 size={18} />
            </button>
            <button className="modal-close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="modal-body">
          {/* Summary / Title */}
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 16 }}>
            {issue.summary}
          </h2>

          {/* Quick Details Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
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
                style={{ height: 32, fontSize: '0.82rem', padding: '0 24px 0 8px' }}
                value={issue.status}
                onChange={e => onChangeIssueStatus(issue.id, e.target.value)}
              >
                {ISSUE_STATUSES.map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', fontWeight: 600, marginBottom: 4 }}>우선순위 (Priority)</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: 4 }}>
                {issue.priority}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', fontWeight: 600, marginBottom: 4 }}>담당자 (Assignee)</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                <User size={14} color="#5e6c84" />
                {issue.assignee || '미지정'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)', fontWeight: 600, marginBottom: 4 }}>마감 기한 (Due Date)</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Calendar size={14} color="#5e6c84" />
                {issue.dueDate || '미설정'}
              </div>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-sub)', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.04em' }}>
              상세 설명 (Description)
            </h4>
            <div style={{
              backgroundColor: '#fafbfc',
              border: '1px solid var(--theme-border)',
              borderRadius: 6,
              padding: '14px',
              fontSize: '0.9rem',
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
              color: 'var(--text-main)'
            }}>
              {issue.description || <span style={{ color: 'var(--text-muted)' }}>상세 설명 없음</span>}
            </div>
          </div>

          {/* Custom Fields Section */}
          {customFields.length > 0 && (
            <div>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--text-sub)', textTransform: 'uppercase', marginBottom: 12, letterSpacing: '0.04em' }}>
                커스텀 필드 정보 (Custom Fields)
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {customFields.map(cf => (
                  <div key={cf.id} style={{
                    border: '1px solid #dfe1e6',
                    borderRadius: 6,
                    padding: '12px 14px',
                    backgroundColor: '#ffffff'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-sub)' }}>
                        {cf.name}
                      </span>
                      {cf.isMandatory ? (
                        <span className="mandatory-badge">필수 항목</span>
                      ) : (
                        <span className="optional-badge">선택 항목</span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.88rem', color: 'var(--text-main)', whiteSpace: 'pre-wrap' }}>
                      {issue[cf.id] || <span style={{ color: 'var(--text-muted)' }}>(입력된 값 없음)</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
