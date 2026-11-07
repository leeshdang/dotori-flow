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

import { useState, useEffect } from 'react';

/**
 * Hook to detect whether the user is viewing from a mobile screen or mobile device.
 * Defaults to 768px breakpoint.
 */
export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    const matchMedia = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const isMobileUA = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(navigator.userAgent);
    return matchMedia.matches || isMobileUA;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mql = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const checkIsMobile = () => {
      const isMobileUA = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(navigator.userAgent);
      setIsMobile(mql.matches || isMobileUA);
    };

    checkIsMobile();

    // Listen to changes
    if (mql.addEventListener) {
      mql.addEventListener('change', checkIsMobile);
      return () => mql.removeEventListener('change', checkIsMobile);
    } else {
      mql.addListener(checkIsMobile);
      return () => mql.removeListener(checkIsMobile);
    }
  }, [breakpoint]);

  return isMobile;
}
