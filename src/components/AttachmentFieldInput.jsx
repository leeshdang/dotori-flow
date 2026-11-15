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

import React, { useRef, useState } from 'react';
import { Paperclip, Upload, Link2, ExternalLink, Download, Trash2, AlertTriangle, FileText } from 'lucide-react';
import {
  MAX_ATTACHMENT_BYTES,
  MAX_ATTACHMENT_MB,
  normalizeAttachments,
  formatFileSize,
  readFileAsDataUrl,
} from '../utils/attachments';

export default function AttachmentFieldInput({
  id,
  value,
  onChange,
  disabled = false,
  placeholder,
  hasError = false,
}) {
  const fileInputRef = useRef(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkLabel, setLinkLabel] = useState('');
  const [limitNotice, setLimitNotice] = useState('');

  const items = normalizeAttachments(value);

  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    e.target.value = '';
    if (selectedFiles.length === 0 || disabled) return;

    const oversized = [];
    const validFiles = [];

    selectedFiles.forEach(file => {
      if (file.size > MAX_ATTACHMENT_BYTES) {
        oversized.push(`${file.name} (${formatFileSize(file.size)})`);
      } else {
        validFiles.push(file);
      }
    });

    if (oversized.length > 0) {
      setLimitNotice(
        `파일 용량 한도(${MAX_ATTACHMENT_MB}MB)를 초과했습니다: ${oversized.join(', ')}. ` +
        `10MB를 초과하는 파일은 Google Drive, Dropbox, OneDrive 등 외부 저장소에 저장한 후 아래 "외부 링크 연결"란에 URL을 연결해 주세요.`
      );
    } else {
      setLimitNotice('');
    }

    if (validFiles.length === 0) return;

    try {
      const newItems = await Promise.all(
        validFiles.map(async (file) => {
          const dataUrl = await readFileAsDataUrl(file);
          return {
            id: `att_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            kind: 'file',
            name: file.name,
            size: file.size,
            mimeType: file.type || 'application/octet-stream',
            dataUrl,
          };
        })
      );
      onChange([...items, ...newItems]);
    } catch {
      setLimitNotice('선택한 파일을 읽는 중 오류가 발생했습니다. 다시 시도해 주세요.');
    }
  };

  const handleAddLink = () => {
    if (disabled) return;
    const rawUrl = linkUrl.trim();
    if (!rawUrl) {
      setLimitNotice('연결할 외부 저장소 URL을 입력해 주세요.');
      return;
    }

    const normalizedUrl = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
    try {
      new URL(normalizedUrl);
    } catch {
      setLimitNotice('올바른 URL 형식(예: https://drive.google.com/...)을 입력해 주세요.');
      return;
    }

    const newLinkItem = {
      id: `lnk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      kind: 'link',
      name: linkLabel.trim() || normalizedUrl,
      url: normalizedUrl,
    };

    onChange([...items, newLinkItem]);
    setLinkUrl('');
    setLinkLabel('');
    setLimitNotice('');
  };

  const handleRemoveItem = (itemId) => {
    if (disabled) return;
    onChange(items.filter(item => item.id !== itemId));
  };

  return (
    <div
      id={id}
      style={{
        border: `1px solid ${hasError ? '#de350b' : '#dfe1e6'}`,
        borderRadius: 6,
        padding: 12,
        backgroundColor: disabled ? '#f4f5f7' : '#fafbfc',
      }}
    >
      {/* Upload & External Link Controls */}
      {!disabled && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => fileInputRef.current?.click()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '0.82rem',
                padding: '7px 12px',
              }}
            >
              <Upload size={14} />
              파일 선택 (최대 {MAX_ATTACHMENT_MB}MB)
            </button>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              {placeholder || `파일당 최대 ${MAX_ATTACHMENT_MB}MB까지 직접 첨부 가능 (초과 시 외부 링크 연결)`}
            </span>
          </div>

          {/* External Link Input (for >10MB files or cloud links) */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: 'var(--text-sub)', fontWeight: 600 }}>
              <Link2 size={14} />
              <span>외부 링크 연결:</span>
            </div>
            <input
              type="url"
              className="form-input"
              style={{ flex: '1 1 200px', fontSize: '0.8rem', padding: '6px 10px' }}
              placeholder="https://drive.google.com/... (10MB 초과 파일 링크)"
              value={linkUrl}
              onChange={e => setLinkUrl(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddLink();
                }
              }}
            />
            <input
              type="text"
              className="form-input"
              style={{ flex: '0 1 150px', fontSize: '0.8rem', padding: '6px 10px' }}
              placeholder="링크 이름 (선택)"
              value={linkLabel}
              onChange={e => setLinkLabel(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddLink();
                }
              }}
            />
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleAddLink}
              style={{ fontSize: '0.8rem', padding: '6px 10px', whiteSpace: 'nowrap' }}
            >
              링크 추가
            </button>
          </div>
        </div>
      )}

      {/* 10MB Limit Exceeded / Validation Notice */}
      {limitNotice && (
        <div
          role="alert"
          style={{
            marginTop: 10,
            padding: '10px 12px',
            borderRadius: 6,
            backgroundColor: '#ffebe6',
            border: '1px solid #ffbdad',
            color: '#bf2600',
            fontSize: '0.8rem',
            lineHeight: 1.5,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 8,
          }}
        >
          <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>{limitNotice}</div>
        </div>
      )}

      {/* Attached Files & Links List */}
      {items.length > 0 ? (
        <div style={{ marginTop: disabled ? 0 : 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {items.map(item => {
            const isImage = item.kind === 'file' && item.mimeType?.startsWith('image/') && item.dataUrl;
            return (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  padding: '6px 10px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #dfe1e6',
                  borderRadius: 5,
                  fontSize: '0.8rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
                  {isImage ? (
                    <img
                      src={item.dataUrl}
                      alt={item.name}
                      style={{ width: 30, height: 30, objectFit: 'cover', borderRadius: 4, flexShrink: 0, border: '1px solid #e2e8f0' }}
                    />
                  ) : item.kind === 'link' ? (
                    <Link2 size={15} style={{ color: '#0052cc', flexShrink: 0 }} />
                  ) : (
                    <FileText size={15} style={{ color: '#42526e', flexShrink: 0 }} />
                  )}

                  <div style={{ minWidth: 0, flex: 1 }}>
                    {item.kind === 'link' ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: '#0052cc',
                          fontWeight: 600,
                          textDecoration: 'underline',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          wordBreak: 'break-all',
                        }}
                      >
                        <span>{item.name || item.url}</span>
                        <ExternalLink size={12} style={{ flexShrink: 0 }} />
                      </a>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-main)', wordBreak: 'break-all' }}>
                          {item.name}
                        </span>
                        <span style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
                          ({formatFileSize(item.size)})
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                  {item.kind === 'file' && item.dataUrl && (
                    <a
                      href={item.dataUrl}
                      download={item.name}
                      title="파일 다운로드"
                      style={{
                        color: '#0052cc',
                        padding: 4,
                        display: 'inline-flex',
                        alignItems: 'center',
                        borderRadius: 4,
                      }}
                    >
                      <Download size={14} />
                    </a>
                  )}
                  {!disabled && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      title="첨부 삭제"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#de350b',
                        cursor: 'pointer',
                        padding: 4,
                        display: 'inline-flex',
                        alignItems: 'center',
                        borderRadius: 4,
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        disabled && (
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Paperclip size={14} />
            <span>첨부된 파일 또는 외부 링크가 없습니다.</span>
          </div>
        )
      )}
    </div>
  );
}
