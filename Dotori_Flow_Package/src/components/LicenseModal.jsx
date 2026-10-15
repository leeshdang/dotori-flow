import React from 'react';
import { X, ShieldCheck, Scale, FileText } from 'lucide-react';

export default function LicenseModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-container" 
        onClick={e => e.stopPropagation()} 
        style={{ maxWidth: 640 }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Scale size={20} color="#0052cc" />
            <h2>라이선스 및 법적 고지 (License Notice)</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ lineHeight: 1.6, fontSize: '0.85rem' }}>
          {/* Trademark Independence Notice */}
          <div style={{
            backgroundColor: '#fff9f8',
            border: '1px solid #ffbdad',
            borderRadius: 6,
            padding: '12px 16px',
            marginBottom: 20
          }}>
            <h4 style={{ color: '#de350b', fontWeight: 700, fontSize: '0.88rem', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              <ShieldCheck size={16} />
              상표권 독립성 고지 (Trademark Independence)
            </h4>
            <p style={{ color: '#5e6c84', fontSize: '0.82rem' }}>
              <strong>Dotori Flow</strong>는 독자적으로 설계 및 개발된 독립 오픈소스 지향 소프트웨어입니다.
              본 시스템은 호주 Atlassian Pty Ltd의 Jira®, Confluence® 또는 그 계열사의 공식 서비스와 아무런 제휴나 승인, 후원 관계가 없음을 명시합니다.
            </p>
          </div>

          {/* Software License */}
          <div style={{ marginBottom: 20 }}>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 6 }}>
              📄 Dotori Flow Software License (MIT License)
            </h4>
            <div style={{
              backgroundColor: '#fafbfc',
              border: '1px solid var(--theme-border)',
              borderRadius: 6,
              padding: '12px',
              fontFamily: 'monospace',
              fontSize: '0.78rem',
              color: 'var(--text-sub)'
            }}>
              Copyright (c) 2026 Dotori Tools<br /><br />
              Permission is hereby granted, free of charge, to any person obtaining a copy
              of this software and associated documentation files (the "Software"), to deal
              in the Software without restriction, including without limitation the rights
              to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
              copies of the Software, subject to the standard MIT conditions.
            </div>
          </div>

          {/* Third-Party Libraries and Fonts */}
          <div>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 6 }}>
              📚 서드파티 오픈소스 라이선스 고지
            </h4>
            <ul style={{ listStyle: 'none', paddingLeft: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li style={{ padding: '8px 12px', backgroundColor: '#f4f5f7', borderRadius: 4 }}>
                <strong>React & React-DOM</strong> — MIT License (Meta Platforms, Inc.)
              </li>
              <li style={{ padding: '8px 12px', backgroundColor: '#f4f5f7', borderRadius: 4 }}>
                <strong>Lucide Icons</strong> — ISC License (Lucide Contributors)
              </li>
              <li style={{ padding: '8px 12px', backgroundColor: '#f4f5f7', borderRadius: 4 }}>
                <strong>Inter & JetBrains Mono Fonts</strong> — SIL Open Font License 1.1 (Rasmus Andersson, JetBrains)
              </li>
              <li style={{ padding: '8px 12px', backgroundColor: '#f4f5f7', borderRadius: 4 }}>
                <strong>Vite</strong> — MIT License (Evan You & Vite Contributors)
              </li>
            </ul>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-primary" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
