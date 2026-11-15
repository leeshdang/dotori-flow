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

export function normalizeAttachments(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }
  if (typeof value === 'object') {
    return [value];
  }
  if (typeof value === 'string' && value.trim()) {
    return [{ id: `legacy_${value.slice(0, 12)}`, kind: 'link', name: value.trim(), url: value.trim() }];
  }
  return [];
}

export function hasAttachments(value) {
  return normalizeAttachments(value).length > 0;
}

export function detectCloudProvider(url) {
  if (!url) return { label: '외부 링크', bg: '#f1f5f9', color: '#475569' };
  const lower = String(url).toLowerCase();
  if (lower.includes('drive.google.com') || lower.includes('docs.google.com')) {
    return { label: 'Google Drive', bg: '#e8f0fe', color: '#1967d2' };
  }
  if (lower.includes('onedrive.live.com') || lower.includes('1drv.ms') || lower.includes('sharepoint.com')) {
    return { label: 'OneDrive', bg: '#e6f2fb', color: '#0078d4' };
  }
  if (lower.includes('dropbox.com') || lower.includes('db.tt')) {
    return { label: 'Dropbox', bg: '#eaf2ff', color: '#0061ff' };
  }
  return { label: '외부 링크', bg: '#f1f5f9', color: '#475569' };
}

export function formatAttachmentSummary(value) {
  const items = normalizeAttachments(value);
  if (items.length === 0) return '';
  if (items.length === 1) {
    return items[0].name || items[0].url || '링크 1건';
  }
  return `${items[0].name || '링크'} 외 ${items.length - 1}건`;
}
