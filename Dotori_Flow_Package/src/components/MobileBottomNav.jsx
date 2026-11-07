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

import React from 'react';
import { Kanban, ListFilter, Sliders, Plus, Lock } from 'lucide-react';

export default function MobileBottomNav({
  currentTab,
  setCurrentTab,
  onOpenCreateModal,
  isAdmin,
  onOpenLoginModal
}) {
  const handleTabClick = (tabId) => {
    if (tabId === 'admin' && !isAdmin) {
      onOpenLoginModal();
      return;
    }
    setCurrentTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className="mobile-bottom-nav" aria-label="하단 네비게이션">
      <button
        type="button"
        className={`mobile-nav-btn ${currentTab === 'board' ? 'active' : ''}`}
        onClick={() => handleTabClick('board')}
      >
        <div className="mobile-nav-icon-wrapper">
          <Kanban size={20} />
        </div>
        <span className="mobile-nav-label">칸반 보드</span>
      </button>

      <button
        type="button"
        className={`mobile-nav-btn ${currentTab === 'list' ? 'active' : ''}`}
        onClick={() => handleTabClick('list')}
      >
        <div className="mobile-nav-icon-wrapper">
          <ListFilter size={20} />
        </div>
        <span className="mobile-nav-label">이슈 목록</span>
      </button>

      <button
        type="button"
        className="mobile-nav-create-btn"
        onClick={onOpenCreateModal}
        aria-label="버그 리포트 등록"
      >
        <div className="create-fab-inner">
          <Plus size={24} strokeWidth={2.5} />
        </div>
        <span className="mobile-nav-label">버그 리포트</span>
      </button>

      <button
        type="button"
        className={`mobile-nav-btn ${currentTab === 'admin' ? 'active' : ''}`}
        onClick={() => handleTabClick('admin')}
      >
        <div className="mobile-nav-icon-wrapper" style={{ position: 'relative' }}>
          <Sliders size={20} />
          {!isAdmin && (
            <span className="mobile-admin-lock-badge">
              <Lock size={10} />
            </span>
          )}
        </div>
        <span className="mobile-nav-label">필드 관리</span>
      </button>
    </nav>
  );
}
