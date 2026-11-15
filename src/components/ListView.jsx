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

import React, { useState, useMemo } from 'react';
import { Search, Filter, User, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { ISSUE_STATUSES } from '../constants/initialData';
import { useIsMobile } from '../utils/useIsMobile';

const PRIORITY_RANK = {
  Highest: 5,
  High: 4,
  Medium: 3,
  Low: 2,
  Lowest: 1,
};

export default function ListView({ 
  issues, 
  fields, 
  onSelectIssue, 
  onChangeIssueStatus 
}) {
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'desc' });

  const customFields = fields.filter(f => !f.isSystem && f.isEnabled);

  const handleSort = (key) => {
    setSortConfig(prev => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'desc' ? 'asc' : 'desc' };
      }
      return { key, direction: 'desc' };
    });
  };

  // 필터링
  const filteredIssues = issues.filter(issue => {
    const matchesSearch = 
      issue.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (issue.description && issue.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // 정렬
  const sortedIssues = useMemo(() => {
    if (!sortConfig.key) return filteredIssues;
    const { key, direction } = sortConfig;
    const factor = direction === 'desc' ? -1 : 1;

    const getComparableValue = (issue) => {
      if (key === 'status') {
        const statusObj = ISSUE_STATUSES.find(s => s.id === issue.status);
        return statusObj ? statusObj.label : issue.status || '';
      }
      return issue[key];
    };

    return [...filteredIssues].sort((a, b) => {
      const valA = getComparableValue(a);
      const valB = getComparableValue(b);

      const isEmptyA = valA === undefined || valA === null || String(valA).trim() === '';
      const isEmptyB = valB === undefined || valB === null || String(valB).trim() === '';
      if (isEmptyA && isEmptyB) return 0;
      if (isEmptyA) return 1;
      if (isEmptyB) return -1;

      if (key === 'priority') {
        const rankA = PRIORITY_RANK[valA] ?? 0;
        const rankB = PRIORITY_RANK[valB] ?? 0;
        if (rankA !== rankB) return (rankA - rankB) * factor;
      }

      return String(valA).localeCompare(String(valB), 'ko', {
        numeric: true,
        sensitivity: 'base'
      }) * factor;
    });
  }, [filteredIssues, sortConfig]);

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown size={13} style={{ opacity: 0.35, flexShrink: 0 }} />;
    }
    return sortConfig.direction === 'desc'
      ? <ArrowDown size={13} style={{ color: 'var(--theme-primary)', flexShrink: 0 }} />
      : <ArrowUp size={13} style={{ color: 'var(--theme-primary)', flexShrink: 0 }} />;
  };

  const getSortableThProps = (key, extraStyle = {}) => ({
    onClick: () => handleSort(key),
    style: {
      cursor: 'pointer',
      userSelect: 'none',
      ...extraStyle
    },
    title: sortConfig.key === key && sortConfig.direction === 'desc'
      ? '클릭하여 오름차순 정렬'
      : '클릭하여 내림차순 정렬'
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
          {sortedIssues.length === 0 ? (
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
            sortedIssues.map(issue => (
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
                <th {...getSortableThProps('id', { width: '110px' })}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    키 (Key) {renderSortIcon('id')}
                  </span>
                </th>
                <th {...getSortableThProps('summary', { minWidth: '240px' })}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    요약 (Summary) {renderSortIcon('summary')}
                  </span>
                </th>
                <th {...getSortableThProps('status', { width: '120px' })}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    상태 {renderSortIcon('status')}
                  </span>
                </th>
                <th {...getSortableThProps('issueType', { width: '100px' })}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    유형 {renderSortIcon('issueType')}
                  </span>
                </th>
                <th {...getSortableThProps('priority', { width: '100px' })}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    우선순위 {renderSortIcon('priority')}
                  </span>
                </th>
                <th {...getSortableThProps('assignee', { width: '130px' })}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    담당자 {renderSortIcon('assignee')}
                  </span>
                </th>
                {/* 동적 커스텀 필드 컬럼들 */}
                {customFields.map(cf => (
                  <th key={cf.id} {...getSortableThProps(cf.id, { minWidth: '140px' })}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <span>
                        {cf.name}
                        {cf.isMandatory && <span style={{ color: 'var(--color-danger)' }}> *</span>}
                      </span>
                      {renderSortIcon(cf.id)}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedIssues.length === 0 ? (
                <tr>
                  <td colSpan={6 + customFields.length} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                    조건에 일치하는 이슈가 없습니다.
                  </td>
                </tr>
              ) : (
                sortedIssues.map(issue => (
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
