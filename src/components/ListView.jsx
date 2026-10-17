import React, { useState } from 'react';
import { Search, Filter, Bug, Bookmark, CheckSquare, TrendingUp, Calendar, User, Tag, ChevronRight } from 'lucide-react';
import { ISSUE_STATUSES } from '../constants/initialData';
import { useIsMobile } from '../utils/useIsMobile';

export default function ListView({ 
  issues, 
  fields, 
  onSelectIssue, 
  onChangeIssueStatus 
}) {
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const customFields = fields.filter(f => !f.isSystem && f.isEnabled);

  // 필터링
  const filteredIssues = issues.filter(issue => {
    const matchesSearch = 
      issue.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (issue.description && issue.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (statusId) => {
    const statusObj = ISSUE_STATUSES.find(s => s.id === statusId) || ISSUE_STATUSES[0];
    return (
      <span style={{
        backgroundColor: statusObj.bg,
        color: statusObj.badgeColor,
        padding: '3px 8px',
        borderRadius: 4,
        fontSize: '0.75rem',
        fontWeight: 700,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: statusObj.badgeColor }} />
        {statusObj.label}
      </span>
    );
  };

  return (
    <div className="list-view-container">
      {/* Search and Filters Bar */}
      <div className="list-controls-bar">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="이슈 키, 요약, 내용 검색..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="form-input search-input"
          />
        </div>

        <div className="status-filter-wrapper">
          <span className="filter-label">
            <Filter size={14} /> 상태:
          </span>
          <select 
            className="form-select filter-select" 
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">전체 상태 보기 ({issues.length})</option>
            {ISSUE_STATUSES.map(s => {
              const count = issues.filter(i => i.status === s.id).length;
              return (
                <option key={s.id} value={s.id}>{s.label} ({count})</option>
              );
            })}
          </select>
        </div>
      </div>

      {/* MOBILE APP LAYOUT: Touch-Friendly Card List */}
      {isMobile ? (
        <div className="mobile-list-cards">
          {filteredIssues.length === 0 ? (
            <div className="mobile-empty-state">
              <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>🔍</div>
              <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: 4 }}>
                일치하는 이슈가 없습니다
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                검색어나 상태 필터를 변경해보세요.
              </p>
            </div>
          ) : (
            filteredIssues.map(issue => (
              <div
                key={issue.id}
                className="mobile-list-item-card"
                onClick={() => onSelectIssue(issue)}
              >
                <div className="mobile-item-header">
                  <span className="card-key">{issue.id}</span>
                  {getStatusBadge(issue.status)}
                </div>

                <div className="mobile-item-title">
                  {issue.summary}
                </div>

                <div className="mobile-item-meta">
                  <span className="meta-chip">
                    {issue.issueType}
                  </span>
                  <span className="meta-chip" style={{
                    color: issue.priority === 'Highest' || issue.priority === 'High' ? '#de350b' : 'inherit',
                    fontWeight: 600
                  }}>
                    {issue.priority}
                  </span>
                  <span className="meta-chip assignee-chip">
                    <User size={12} />
                    {issue.assignee || '미지정'}
                  </span>
                </div>

                {/* Custom fields in mobile list card */}
                {customFields.some(cf => issue[cf.id]) && (
                  <div className="card-custom-badges" style={{ marginTop: 8, marginBottom: 0 }}>
                    {customFields.map(cf => {
                      const val = issue[cf.id];
                      if (!val) return null;
                      return (
                        <span key={cf.id} className="custom-tag">
                          <strong>{cf.name}:</strong> {typeof val === 'string' && val.length > 15 ? val.slice(0, 15) + '...' : val}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        /* DESKTOP LAYOUT: Full-featured Table */
        <div className="desktop-table-container">
          <table className="settings-table">
            <thead>
              <tr>
                <th style={{ width: '110px' }}>키 (Key)</th>
                <th style={{ minWidth: '240px' }}>요약 (Summary)</th>
                <th style={{ width: '120px' }}>상태</th>
                <th style={{ width: '100px' }}>유형</th>
                <th style={{ width: '100px' }}>우선순위</th>
                <th style={{ width: '130px' }}>담당자</th>
                {/* 동적 커스텀 필드 컬럼들 */}
                {customFields.map(cf => (
                  <th key={cf.id} style={{ minWidth: '140px' }}>
                    {cf.name}
                    {cf.isMandatory && <span style={{ color: 'var(--color-danger)' }}> *</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredIssues.length === 0 ? (
                <tr>
                  <td colSpan={6 + customFields.length} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                    조건에 일치하는 이슈가 없습니다.
                  </td>
                </tr>
              ) : (
                filteredIssues.map(issue => (
                  <tr 
                    key={issue.id} 
                    onClick={() => onSelectIssue(issue)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--theme-primary)' }}>
                        {issue.id}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                        {issue.summary}
                      </div>
                    </td>
                    <td>
                      {getStatusBadge(issue.status)}
                    </td>
                    <td>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-sub)' }}>
                        {issue.issueType}
                      </span>
                    </td>
                    <td>
                      <span style={{ 
                        fontSize: '0.8rem', 
                        fontWeight: 600,
                        color: issue.priority === 'Highest' || issue.priority === 'High' ? '#de350b' : '#172b4d' 
                      }}>
                        {issue.priority}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-sub)' }}>
                        {issue.assignee || '미지정'}
                      </span>
                    </td>
                    {/* 동적 커스텀 필드 값 렌더링 */}
                    {customFields.map(cf => (
                      <td key={cf.id} style={{ fontSize: '0.82rem', color: 'var(--text-sub)' }}>
                        {issue[cf.id] ? (
                          <span style={{ backgroundColor: '#f4f5f7', padding: '2px 6px', borderRadius: 4 }}>
                            {issue[cf.id]}
                          </span>
                        ) : (
                          <span style={{ color: '#c1c7d0' }}>-</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
