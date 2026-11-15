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

import React, { useState } from 'react';
import { Link2, ExternalLink, Trash2, AlertTriangle, HelpCircle } from 'lucide-react';
import { normalizeAttachments, detectCloudProvider } from '../utils/attachments';

export default function AttachmentFieldInput({
  id,
  value,
  onChange,
  disabled = false,
  placeholder,
  hasError = false,
}) {
  const [linkUrl, setLinkUrl] = useState('');
  const [linkLabel, setLinkLabel] = useState('');
  const [errorNotice, setErrorNotice] = useState('');

  const items = normalizeAttachments(value);

  const handleAddLink = () => {
    if (disabled) return;
    const rawUrl = linkUrl.trim();
    if (!rawUrl) {
      setErrorNotice('연결할 Google Drive, OneDrive 또는 Dropbox 공유 링크를 입력해 주세요.');
      return;
    }

    const normalizedUrl = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
    try {
      new URL(normalizedUrl);
    } catch {
      setErrorNotice('올바른 URL 형식(예: https://drive.google.com/...)을 입력해 주세요.');
      return;
    }

    const provider = detectCloudProvider(normalizedUrl);
    const newLinkItem = {
      id: `lnk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      kind: 'link',
      name: linkLabel.trim() || `${provider.label} 첨부 파일`,
      url: normalizedUrl,
    };

    onChange([...items, newLinkItem]);
    setLinkUrl('');
    setLinkLabel('');
    setErrorNotice('');
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
      {/* Cloud Link Usage Guide + Input Controls */}
      {!disabled && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* 간략한 사용법 안내 */}
          <div
            style={{
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: 6,
              padding: '9px 11px',
              fontSize: '0.77rem',
              color: '#1e3a8a',
              lineHeight: 1.5,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontWeight: 700, marginBottom: 4 }}>
              <HelpCircle size={14} style={{ flexShrink: 0 }} />
              <span>클라우드 링크 첨부 방법 (Google Drive · OneDrive · Dropbox)</span>
            </div>
            <ol style={{ margin: 0, paddingLeft: 18 }}>
              <li>스크린샷·영상·로그 파일을 <strong>Google Drive, OneDrive, Dropbox</strong> 중 편한 곳에 업로드하세요.</li>
              <li>파일 우클릭 ➔ <strong>공유(링크 복사)</strong>에서 권한을 <strong>“링크가 있는 모든 사용자(보기 가능)”</strong>로 설정하세요.</li>
              <li>복사한 URL을 아래 입력란에 붙여넣고 <strong>[링크 추가]</strong>를 누르면 티켓에 연결됩니다.</li>
            </ol>
          </div>

          {/* Link Input Row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
            <input
              type="url"
              className="form-input"
              style={{ flex: '1 1 220px', fontSize: '0.82rem', padding: '7px 10px' }}
              placeholder={placeholder || 'https://drive.google.com/... 또는 OneDrive / Dropbox 공유 링크'}
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
              style={{ flex: '0 1 150px', fontSize: '0.82rem', padding: '7px 10px' }}
              placeholder="링크 설명 (선택)"
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
              style={{
                fontSize: '0.82rem',
                padding: '7px 12px',
                whiteSpace: 'nowrap',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <Link2 size={14} />
              링크 추가
            </button>
          </div>
        </div>
      )}

      {/* Validation Notice */}
      {errorNotice && (
        <div
          role="alert"
          style={{
            marginTop: 10,
            padding: '8px 10px',
            borderRadius: 6,
            backgroundColor: '#ffebe6',
            border: '1px solid #ffbdad',
            color: '#bf2600',
            fontSize: '0.79rem',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <AlertTriangle size={15} style={{ flexShrink: 0 }} />
          <span>{errorNotice}</span>
        </div>
      )}

      {/* Attached Links List */}
      {items.length > 0 ? (
        <div style={{ marginTop: disabled ? 0 : 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {items.map(item => {
            const targetUrl = item.url || '';
            const provider = detectCloudProvider(targetUrl);
            return (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  padding: '7px 10px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #dfe1e6',
                  borderRadius: 5,
                  fontSize: '0.8rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
                  <span
                    style={{
                      backgroundColor: provider.bg,
                      color: provider.color,
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: 4,
                      flexShrink: 0,
                    }}
                  >
                    {provider.label}
                  </span>
                  {targetUrl ? (
                    <a
                      href={targetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: '#0052cc',
                        fontWeight: 600,
                        textDecoration: 'underline',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        minWidth: 0,
                        wordBreak: 'break-all',
                      }}
                    >
                      <span>{item.name || targetUrl}</span>
                      <ExternalLink size={12} style={{ flexShrink: 0 }} />
                    </a>
                  ) : (
                    <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{item.name}</span>
                  )}
                </div>

                {!disabled && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    title="링크 삭제"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#de350b',
                      cursor: 'pointer',
                      padding: 4,
                      display: 'inline-flex',
                      alignItems: 'center',
                      borderRadius: 4,
                      flexShrink: 0,
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        disabled && (
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Link2 size={14} />
            <span>연결된 클라우드 링크가 없습니다.</span>
          </div>
        )
      )}
    </div>
  );
}
