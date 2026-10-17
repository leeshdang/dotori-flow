import React from 'react';
import { X, Layers, CheckCircle2, ShieldCheck, Sparkles, Sliders } from 'lucide-react';
import { APP_VERSION } from '../constants/version';

export default function AboutModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-container" 
        onClick={e => e.stopPropagation()} 
        style={{ maxWidth: 580 }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="brand-icon" style={{ padding: 4 }}>
              <Layers size={18} />
            </div>
            <h2>About Dotori Flow</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ lineHeight: 1.6 }}>
          <div style={{ textAlign: 'center', padding: '16px 0 20px 0' }}>
            <h3 style={{ fontSize: '1.3rem', color: 'var(--text-main)', fontWeight: 700 }}>
              Dotori Flow (도토리 플로우)
            </h3>
            <div style={{
              display: 'inline-block',
              backgroundColor: '#deebff',
              color: '#0052cc',
              fontSize: '0.8rem',
              fontWeight: 700,
              padding: '4px 12px',
              borderRadius: 12,
              marginTop: 6,
              fontFamily: 'monospace'
            }}>
              {APP_VERSION}
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 6 }}>
              🎯 프로젝트 개요
            </h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-sub)' }}>
              <strong>Dotori Flow</strong>는 유연하고 강력한 티켓 관리 및 동적 폼 검증 엔진을 제공하는 모던 프로젝트 관리 시스템입니다.
              관리자가 비즈니스 요구사항에 따라 <strong>Mandatory(필수 입력) 필드를 자유롭게 정의</strong>하고, 작업자의 정확한 데이터 입력을 보장합니다.
            </p>
          </div>

          <div style={{ marginBottom: 20 }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 8 }}>
              ✨ 핵심 특징
            </h4>
            <ul style={{ listStyle: 'none', paddingLeft: 0, display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.85rem' }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <CheckCircle2 size={16} color="#00875a" style={{ flexShrink: 0, marginTop: 2 }} />
                <span><strong>동적 필수(Mandatory) 필드 제어:</strong> 원클릭 스위치로 어떤 필드든 필수로 전환 가능</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <CheckCircle2 size={16} color="#00875a" style={{ flexShrink: 0, marginTop: 2 }} />
                <span><strong>관리자 RBAC 보안 잠금:</strong> 일반 사용자의 임의 설정 변경을 차단하는 보안 인증</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <CheckCircle2 size={16} color="#00875a" style={{ flexShrink: 0, marginTop: 2 }} />
                <span><strong>다양한 커스텀 필드:</strong> 텍스트, 장문, 드롭다운, 날짜, 숫자 등 무제한 필드 확장</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <CheckCircle2 size={16} color="#00875a" style={{ flexShrink: 0, marginTop: 2 }} />
                <span><strong>직관적인 칸반 보드 & 목록 뷰:</strong> To Do, In Progress, Done 실시간 상태 트래킹</span>
              </li>
            </ul>
          </div>

          <div style={{
            backgroundColor: '#f4f5f7',
            padding: '12px 16px',
            borderRadius: 6,
            fontSize: '0.8rem',
            color: 'var(--text-sub)'
          }}>
            <strong>개발 생태계:</strong> React 19, Vite, Lucide Icons, Vanilla Modern CSS<br />
            <strong>소속:</strong> Dotori Tools Universe (<a href="https://dotoritools.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--theme-primary)' }}>dotoritools.com</a>)
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-primary" onClick={onClose}>
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
