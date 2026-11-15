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

import { useRef } from 'react';

/**
 * 모달 바깥(overlay) 클릭 시 닫힘을 처리하되,
 * 모달 내부에서 마우스 다운(텍스트 드래그 선택 등) 후 바깥에서 마우스 업할 때는
 * 모달이 닫히지 않도록 방지하는 훅
 */
export function useBackdropClose(onClose) {
  const mouseDownOnBackdropRef = useRef(false);

  const onMouseDown = (e) => {
    mouseDownOnBackdropRef.current = e.target === e.currentTarget;
  };

  const onClick = (e) => {
    if (mouseDownOnBackdropRef.current && e.target === e.currentTarget) {
      onClose();
    }
    mouseDownOnBackdropRef.current = false;
  };

  return { onMouseDown, onClick };
}
