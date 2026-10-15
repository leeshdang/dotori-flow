import React from 'react';
import { 
  X, 
  ExternalLink, 
  Info, 
  FileText, 
  Globe, 
  Sparkles, 
  Layers,
  Heart,
  ShieldCheck,
  BookOpen,
  Download
} from 'lucide-react';

export default function SideMenuDrawer({ 
  isOpen, 
  onClose, 
  onOpenAbout, 
  onOpenLicense 
}) {
  if (!isOpen) return null;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div 
        className="drawer-container" 
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="drawer-brand">
            <div className="brand-icon">
              <Layers size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)' }}>Dotori Tools</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>Universe & Service Menu</div>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="메뉴 닫기">
            <X size={20} />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="drawer-body">
          {/* Section: Family Sites */}
          <div className="drawer-section">
            <div className="drawer-section-title">
              <Globe size={14} />
              <span>패밀리 서비스 (Family Services)</span>
            </div>
            <div className="drawer-nav-list">
              <a 
                href="https://celebmypet.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="drawer-nav-item"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="drawer-icon-box" style={{ backgroundColor: '#fff0b3', color: '#ff991f' }}>
                    <Heart size={16} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>celebmypet.com</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>반려동물 라이프스타일 & 셀럽 플랫폼</div>
                  </div>
                </div>
                <ExternalLink size={15} style={{ color: 'var(--text-muted)' }} />
              </a>

              <a 
                href="https://dotoritools.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="drawer-nav-item"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="drawer-icon-box" style={{ backgroundColor: '#deebff', color: '#0052cc' }}>
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>dotoritools.com</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>도토리 툴즈 공식 허브 & 생산성 도구</div>
                  </div>
                </div>
                <ExternalLink size={15} style={{ color: 'var(--text-muted)' }} />
              </a>
            </div>
          </div>

          {/* Section: Information & Legal */}
          <div className="drawer-section">
            <div className="drawer-section-title">
              <ShieldCheck size={14} />
              <span>서비스 정보 및 법적 고지</span>
            </div>
            <div className="drawer-nav-list">
              <a 
                href="/Dotori_Flow_Setup_Manual.html" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="drawer-nav-item"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="drawer-icon-box" style={{ backgroundColor: '#deebff', color: '#0052cc' }}>
                    <BookOpen size={16} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>독립 환경 구축 매뉴얼</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>나만의 독립 Jira 환경 만들기 상세 가이드</div>
                  </div>
                </div>
                <ExternalLink size={15} style={{ color: 'var(--text-muted)' }} />
              </a>

              <a 
                href="/Dotori_Flow_Starter_Kit.zip" 
                download="Dotori_Flow_Starter_Kit.zip" 
                className="drawer-nav-item"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="drawer-icon-box" style={{ backgroundColor: '#fff0b3', color: '#b45309' }}>
                    <Download size={16} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>스타터 킷 다운로드 (ZIP)</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>배포용 소스코드 패키지 (.zip)</div>
                  </div>
                </div>
              </a>

              <button 
                type="button" 
                className="drawer-nav-item" 
                onClick={() => {
                  onClose();
                  onOpenAbout();
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="drawer-icon-box" style={{ backgroundColor: '#e3fcef', color: '#00875a' }}>
                    <Info size={16} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>About Dotori Flow</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>소개, 핵심 아키텍처 및 버전 정보 (v1.0)</div>
                  </div>
                </div>
              </button>

              <button 
                type="button" 
                className="drawer-nav-item" 
                onClick={() => {
                  onClose();
                  onOpenLicense();
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="drawer-icon-box" style={{ backgroundColor: '#eae6ff', color: '#6554c0' }}>
                    <FileText size={16} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>License & Legal Notice</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>오픈소스 라이선스 및 상표권 독립성 고지</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="drawer-footer">
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            © 2026 Dotori Tools. All rights reserved.<br />
            Powered by Modern React & Vite Architecture.
          </div>
        </div>
      </div>
    </div>
  );
}
