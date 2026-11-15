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

export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024; // 10MB
export const MAX_ATTACHMENT_MB = 10;

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

export function formatFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function formatAttachmentSummary(value) {
  const items = normalizeAttachments(value);
  if (items.length === 0) return '';
  if (items.length === 1) {
    return items[0].name || items[0].url || '첨부 1건';
  }
  return `${items[0].name || '첨부'} 외 ${items.length - 1}건`;
}

export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('파일을 읽는 중 오류가 발생했습니다.'));
    reader.readAsDataURL(file);
  });
}
