import React from 'react';
import { 
  Bug, 
  Bookmark, 
  CheckSquare, 
  TrendingUp, 
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Minus,
  User,
  Calendar
} from 'lucide-react';
import { ISSUE_STATUSES } from '../constants/initialData';

export default function KanbanBoard({ 
  issues, 
  fields, 
  onSelectIssue, 
  onChangeIssueStatus 
}) {
  // 이슈 타입 아이콘 매핑
  const renderTypeIcon = (type) => {
    switch (type) {
      case 'Bug':
        return <Bug size={14} color="#e5493a" />;
      case 'Story':
        return <Bookmark size={14} color="#36b37e" />;
      case 'Epic':
        return <TrendingUp size={14} color="#6554c0" />;
      default:
        return <CheckSquare size={14} color="#4bade8" />;
    }
  };

  // 우선순위 아이콘 매핑
  const renderPriorityIcon = (priority) => {
    switch (priority) {
      case 'Highest':
        return <ArrowUp size={14} color="#de350b" strokeWidth={2.5} />;
      case 'High':
        return <ArrowUp size={14} color="#ff5630" />;
      case 'Medium':
        return <Minus size={14} color="#ffab00" strokeWidth={2.5} />;
      case 'Low':
        return <ArrowDown size={14} color="#36b37e" />;
      case 'Lowest':
        return <ArrowDown size={14} color="#0065ff" />;
      default:
        return null;
    }
  };

  // 커스텀 필드 목록 (활성화된 것 중)
  const customFields = fields.filter(f => !f.isSystem && f.isEnabled);

  return (
    <div className="kanban-board">
      {ISSUE_STATUSES.map(status => {
        const columnIssues = issues.filter(issue => issue.status === status.id);

        return (
          <div className="kanban-column" key={status.id}>
            <div className="column-header">
              <div className="column-title" style={{ color: status.badgeColor }}>
                <span style={{ 
                  display: 'inline-block', 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  backgroundColor: status.badgeColor 
                }}></span>
                {status.label}
              </div>
              <span className="column-count">{columnIssues.length}</span>
            </div>

            <div className="column-cards">
              {columnIssues.length === 0 ? (
                <div style={{
                  padding: '24px 12px',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem',
                  border: '1px dashed #c1c7d0',
                  borderRadius: 4
                }}>
                  등록된 이슈가 없습니다.
                </div>
              ) : (
                columnIssues.map(issue => (
                  <div 
                    key={issue.id} 
                    className="issue-card"
                    onClick={() => onSelectIssue(issue)}
                  >
                    <div className="card-top">
                      <span className="card-key">{issue.id}</span>
                      
                      <div className="card-badges-left">
                        <span className="type-badge" title={`유형: ${issue.issueType}`}>
                          {renderTypeIcon(issue.issueType)}
                        </span>
                        <span className="priority-badge" title={`우선순위: ${issue.priority}`}>
                          {renderPriorityIcon(issue.priority)}
                        </span>
                      </div>
                    </div>

                    <div className="card-title">
                      {issue.summary}
                    </div>

                    {/* 커스텀 필드 값 프리뷰 배지 */}
                    {customFields.some(cf => issue[cf.id]) && (
                      <div className="card-custom-badges">
                        {customFields.map(cf => {
                          const val = issue[cf.id];
                          if (!val) return null;
                          return (
                            <span key={cf.id} className="custom-tag" title={`${cf.name}: ${val}`}>
                              <strong>{cf.name}:</strong> {typeof val === 'string' && val.length > 18 ? val.slice(0, 18) + '...' : val}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    <div className="card-footer" onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-sub)' }}>
                        <User size={13} />
                        <span style={{ fontSize: '0.78rem' }}>{issue.assignee || '미지정'}</span>
                      </div>

                      {/* 빠른 상태 변경 셀렉트 */}
                      <select
                        className="status-change-select"
                        value={issue.status}
                        onChange={(e) => onChangeIssueStatus(issue.id, e.target.value)}
                        title="상태 변경"
                      >
                        {ISSUE_STATUSES.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
