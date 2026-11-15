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

import { ISSUE_STATUSES } from '../constants/initialData.js';
import { normalizeAttachments } from './attachments.js';

function escapeXml(value) {
  if (value === undefined || value === null) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function getStatusLabel(statusId) {
  const found = ISSUE_STATUSES.find(s => s.id === statusId);
  return found ? found.label : (statusId || '');
}

function formatCellValue(val, fieldType) {
  if (val === undefined || val === null) return '';
  if (fieldType === 'file' || Array.isArray(val)) {
    const items = normalizeAttachments(val);
    return items.map(item => (item.url ? `${item.name || '링크'}: ${item.url}` : item.name || '')).join('\n');
  }
  return String(val);
}

function buildRowXml(cells, isHeader = false) {
  const styleAttr = isHeader ? ' ss:StyleID="Header"' : ' ss:StyleID="Cell"';
  const cellsXml = cells
    .map(cell => `<Cell${styleAttr}><Data ss:Type="String">${escapeXml(cell)}</Data></Cell>`)
    .join('');
  return `<Row>${cellsXml}</Row>`;
}

/**
 * Generates an Excel 2003 SpreadsheetML (.xls) XML string containing
 * Issues, Activity History, and Field Settings worksheets.
 */
export function buildIssuesXlsContent(issues = [], fields = []) {
  const customFields = fields.filter(f => !f.isSystem);

  // Sheet 1: Issues
  const issueHeaders = [
    '키 (Key)',
    '요약 (Summary)',
    '상태 (Status)',
    '유형 (Type)',
    '우선순위 (Priority)',
    '담당자 (Assignee)',
    '작성자 (Reporter)',
    '작성자 이메일',
    '마감 기한 (Due Date)',
    '생성 일시',
    '수정 일시',
    '상세 설명 (Description)',
    ...customFields.map(cf => cf.name),
  ];

  const issueRows = issues.map(issue => [
    issue.id || '',
    issue.summary || '',
    getStatusLabel(issue.status),
    issue.issueType || '',
    issue.priority || '',
    issue.assignee || '',
    issue.reporter || '',
    issue.reporterEmail || '',
    issue.dueDate || '',
    issue.createdAt || '',
    issue.updatedAt || '',
    issue.description || '',
    ...customFields.map(cf => formatCellValue(issue[cf.id], cf.type)),
  ]);

  const issuesSheetXml =
    `<Worksheet ss:Name="전체 티켓">` +
    `<Table>` +
    buildRowXml(issueHeaders, true) +
    issueRows.map(r => buildRowXml(r, false)).join('') +
    `</Table></Worksheet>`;

  // Sheet 2: Activity History
  const historyHeaders = ['이슈 키', '일시', '작업자', '변경 내용'];
  const historyRows = [];
  issues.forEach(issue => {
    const logs = Array.isArray(issue.history) ? issue.history : [];
    logs.forEach(entry => {
      const summary = Array.isArray(entry.changes)
        ? entry.changes.map(c => c.summaryText).filter(Boolean).join(' / ')
        : '';
      historyRows.push([
        issue.id || '',
        entry.timestamp || '',
        entry.actor || '',
        summary,
      ]);
    });
  });

  const historySheetXml =
    `<Worksheet ss:Name="수정 내역 로그">` +
    `<Table>` +
    buildRowXml(historyHeaders, true) +
    historyRows.map(r => buildRowXml(r, false)).join('') +
    `</Table></Worksheet>`;

  // Sheet 3: Fields
  const fieldHeaders = ['필드 ID', '필드명', '타입', '필수 여부', '사용 여부', '선택 옵션'];
  const fieldRows = fields.map(f => [
    f.id || '',
    f.name || '',
    f.type || '',
    f.isMandatory ? '필수' : '선택',
    f.isEnabled ? '사용 중' : '비활성',
    Array.isArray(f.options) ? f.options.join(', ') : '',
  ]);

  const fieldsSheetXml =
    `<Worksheet ss:Name="필드 설정">` +
    `<Table>` +
    buildRowXml(fieldHeaders, true) +
    fieldRows.map(r => buildRowXml(r, false)).join('') +
    `</Table></Worksheet>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:x="urn:schemas-microsoft-com:office:excel"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="Header">
      <Font ss:Bold="1" ss:Color="#FFFFFF"/>
      <Interior ss:Color="#0052CC" ss:Pattern="Solid"/>
      <Alignment ss:Vertical="Center"/>
    </Style>
    <Style ss:ID="Cell">
      <Alignment ss:Vertical="Top" ss:WrapText="1"/>
    </Style>
  </Styles>
  ${issuesSheetXml}
  ${historySheetXml}
  ${fieldsSheetXml}
</Workbook>`;
}

export function downloadIssuesXls(issues = [], fields = []) {
  const xml = buildIssuesXlsContent(issues, fields);
  const blob = new Blob(['\uFEFF', xml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const dateStr = new Date().toISOString().slice(0, 10);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Dotori_Flow_Backup_${dateStr}.xls`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
