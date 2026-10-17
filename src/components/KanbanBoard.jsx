import React, { useState } from 'react';
import { 
  Bug, 
  Bookmark, 
  CheckSquare, 
  TrendingUp, 
  ArrowUp, 
  ArrowDown, 
  Minus, 
  User, 
  ChevronLeft, 
  ChevronRight,
  Plus
} from 'lucide-react';
import { ISSUE_STATUSES } from '../constants/initialData';
import { useIsMobile } from '../utils/useIsMobile';

export default function KanbanBoard({ 
  issues, 
  fields, 
  onSelectIssue, 
  onChangeIssueStatus,
  onOpenCreateModal 
}) {
  const isMobile = useIsMobile();
  const [activeMobileStatus, setActiveMobileStatus] = useState('todo');

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

  // Helper to render individual card
  const renderCard = (issue) => (
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
            <span className="badge-text" style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>
              {issue.issueType}
            </span>
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
          <User size={14} />
          <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>{issue.assignee || '미지정'}</span>
        </div>

        {/* 빠른 상태 변경 셀렉트 */}
        <select
          className="status-change-select"
          value={issue.status}
          onChange={(e) => onChangeIssueStatus(issue.id, e.target.value)}
          title="상태 변경"
          aria-label="상태 변경"
        >
          {ISSUE_STATUSES.map(s => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  // --- MOBILE LAYOUT ---
  if (isMobile) {
    const currentIndex = ISSUE_STATUSES.findIndex(s => s.id === activeMobileStatus);
    const activeStatusObj = ISSUE_STATUSES[currentIndex] || ISSUE_STATUSES[0];
    const columnIssues = issues.filter(issue => issue.status === activeStatusObj.id);

    const handlePrev = () => {
      const prevIdx = (currentIndex - 1 + ISSUE_STATUSES.length) % ISSUE_STATUSES.length;
      setActiveMobileStatus(ISSUE_STATUSES[prevIdx].id);
    };

    const handleNext = () => {
      const nextIdx = (currentIndex + 1) % ISSUE_STATUSES.length;
      setActiveMobileStatus(ISSUE_STATUSES[nextIdx].id);
    };

    return (
      <div className="mobile-kanban-container">
        {/* Mobile Column Segmented Tabs */}
        <div className="mobile-column-tabs">
          {ISSUE_STATUSES.map(status => {
            const count = issues.filter(i => i.status === status.id).length;
            const isActive = status.id === activeMobileStatus;
            return (
              <button
                key={status.id}
                type="button"
                className={`mobile-col-tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => setActiveMobileStatus(status.id)}
                style={{
                  borderBottomColor: isActive ? status.badgeColor : 'transparent'
                }}
              >
                <span 
                  className="status-dot" 
                  style={{ backgroundColor: status.badgeColor }}
                />
                <span className="col-tab-label">{status.label}</span>
                <span 
                  className="col-tab-count"
                  style={{
                    backgroundColor: isActive ? status.badgeColor : 'rgba(9,30,66,0.08)',
                    color: isActive ? '#ffffff' : 'inherit'
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Column Header & Quick Navigation */}
        <div className="mobile-active-col-banner" style={{ borderLeftColor: activeStatusObj.badgeColor }}>
          <div className="mobile-col-info">
            <span style={{ fontWeight: 700, fontSize: '1rem', color: activeStatusObj.badgeColor }}>
              {activeStatusObj.label}
            </span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-sub)' }}>
              총 {columnIssues.length}개의 티켓
            </span>
          </div>

          <div className="mobile-col-nav-arrows">
            <button 
              type="button" 
              className="arrow-btn" 
              onClick={handlePrev} 
              aria-label="이전 상태"
              title="이전 컬럼"
            >
              <ChevronLeft size={18} />
            </button>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {currentIndex + 1} / {ISSUE_STATUSES.length}
            </span>
            <button 
              type="button" 
              className="arrow-btn" 
              onClick={handleNext} 
              aria-label="다음 상태"
              title="다음 컬럼"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Cards in Active Column */}
        <div className="mobile-cards-list">
          {columnIssues.length === 0 ? (
            <div className="mobile-empty-state">
              <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>📋</div>
              <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: 4 }}>
                '{activeStatusObj.label}' 상태의 이슈가 없습니다
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                새로운 작업을 등록하거나 다른 상태의 카드를 이 상태로 변경해보세요.
              </p>
              {onOpenCreateModal && (
                <button 
                  type="button"
                  className="btn-primary" 
                  onClick={onOpenCreateModal}
                  style={{ margin: '0 auto', fontSize: '0.85rem', padding: '8px 16px' }}
                >
                  <Plus size={15} />
                  새 이슈 등록하기
                </button>
              )}
            </div>
          ) : (
            columnIssues.map(renderCard)
          )}
        </div>
      </div>
    );
  }

  // --- DESKTOP LAYOUT ---
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
                columnIssues.map(renderCard)
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
