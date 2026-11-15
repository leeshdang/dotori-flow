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

import { ISSUE_STATUSES } from '../constants/initialData';

export function isUserMatched(targetValue, user) {
  if (!targetValue || !user) return false;
  const normTarget = String(targetValue).trim().toLowerCase();
  if (!normTarget) return false;

  const emailLocal = user.email ? String(user.email).split('@')[0] : '';
  const candidates = [user.name, user.email, emailLocal]
    .filter(Boolean)
    .map(v => String(v).trim().toLowerCase());

  return candidates.some(
    c => normTarget === c || (c.length >= 2 && normTarget.includes(c))
  );
}

/**
 * Only the original issue reporter or current assignee can edit ticket contents.
 */
export function canUserEditIssue(issue, currentUser) {
  if (!issue || !currentUser) return false;
  return (
    isUserMatched(issue.reporter, currentUser) ||
    isUserMatched(issue.reporterEmail, currentUser) ||
    isUserMatched(issue.assignee, currentUser)
  );
}

export function formatActorLabel(currentUser) {
  if (!currentUser) return '비로그인 사용자';
  if (currentUser.email) {
    return `${currentUser.name} (${currentUser.email})`;
  }
  return currentUser.name || '알 수 없는 사용자';
}

export function formatKoreanDateTime(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return String(isoString);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hour = String(d.getHours()).padStart(2, '0');
  const minute = String(d.getMinutes()).padStart(2, '0');
  const second = String(d.getSeconds()).padStart(2, '0');
  return `${year}년 ${month}월 ${day}일 ${hour}:${minute}:${second}`;
}

function getStatusLabel(statusId) {
  const found = ISSUE_STATUSES.find(s => s.id === statusId);
  return found ? found.label : statusId;
}

function formatDisplayValue(val) {
  if (val === undefined || val === null || String(val).trim() === '') {
    return '(없음)';
  }
  const str = String(val);
  return str.length > 60 ? `${str.slice(0, 60)}...` : str;
}

/**
 * Builds structured change log items by comparing previous issue and updatedFields.
 */
export function buildIssueChangeLogs(prevIssue, updatedFields, fields = []) {
  const changes = [];
  const baseLabels = {
    summary: '요약 (Summary)',
    issueType: '이슈 유형 (Issue Type)',
    status: '상태 (Status)',
    priority: '우선순위 (Priority)',
    assignee: '담당자 (Assignee)',
    dueDate: '마감 기한 (Due Date)',
    description: '상세 설명 (Description)',
  };

  const trackedKeys = new Set([
    ...Object.keys(baseLabels),
    ...fields.filter(f => !f.isSystem).map(f => f.id),
  ]);

  trackedKeys.forEach(key => {
    if (!(key in updatedFields)) return;
    const prevVal = prevIssue[key] ?? '';
    const nextVal = updatedFields[key] ?? '';
    if (String(prevVal) === String(nextVal)) return;

    if (key === 'status') {
      const fromLabel = getStatusLabel(prevVal);
      const toLabel = getStatusLabel(nextVal);
      let actionNote = '';
      if (nextVal === 'done') {
        actionNote = ' (Close)';
      } else if (prevVal === 'done' && nextVal !== 'done') {
        actionNote = ' (Reopen)';
      }
      changes.push({
        fieldId: 'status',
        fieldLabel: '티켓 상태',
        from: fromLabel,
        to: toLabel,
        summaryText: `티켓 상태를 "${fromLabel}"에서 "${toLabel}"(으)로 변경${actionNote}`,
      });
      return;
    }

    const customField = fields.find(f => f.id === key);
    const label = baseLabels[key] || customField?.name || key;
    const fromText = formatDisplayValue(prevVal);
    const toText = formatDisplayValue(nextVal);

    changes.push({
      fieldId: key,
      fieldLabel: label,
      from: fromText,
      to: toText,
      summaryText: `${label}을(를) "${fromText}"에서 "${toText}"(으)로 수정`,
    });
  });

  return changes;
}
