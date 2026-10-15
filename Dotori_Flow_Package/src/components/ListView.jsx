import React, { useState } from 'react';
import { Search, Filter, Bug, Bookmark, CheckSquare, TrendingUp, Calendar, User } from 'lucide-react';
import { ISSUE_STATUSES } from '../constants/initialData';

export default function ListView({ 
  issues, 
  fields, 
  onSelectIssue, 
  onChangeIssueStatus 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const activeFields = fields.filter(f => f.isEnabled && f.id !== 'summary' && f.id !== 'description');

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
        fontWeight: 700
      }}>
        {statusObj.label}
      </span>
    );
  };

  return (
    <div style={{ backgroundColor: 'white', borderRadius: 8, border: '1px solid var(--theme-border)', overflow: 'hidden' }}>
      {/* Search and Filters Bar */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--theme-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, maxWidth: 360 }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={16} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-sub)' }} />
            <input
              type="text"
              placeholder="이슈 키, 요약, 내용 검색..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ paddingLeft: 34, height: 36, fontSize: '0.85rem' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-sub)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Filter size={14} /> 상태:
          </span>
          <select 
            className="form-select" 
            style={{ width: 'auto', height: 36, fontSize: '0.85rem', padding: '0 28px 0 10px' }}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">전체 상태 보기</option>
            {ISSUE_STATUSES.map(s => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Issues Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="settings-table">
          <thead>
            <tr>
              <th style={{ width: '110px' }}>키 (Key)</th>
              <th style={{ minWidth: '240px' }}>요약 (Summary)</th>
              <th style={{ width: '110px' }}>상태</th>
              <th style={{ width: '100px' }}>유형</th>
              <th style={{ width: '100px' }}>우선순위</th>
              <th style={{ width: '130px' }}>담당자</th>
              {/* 동적 커스텀 필드 컬럼들 */}
              {fields.filter(f => !f.isSystem && f.isEnabled).map(cf => (
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
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
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
                  {fields.filter(f => !f.isSystem && f.isEnabled).map(cf => (
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
    </div>
  );
}
