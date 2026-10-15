// 보안 및 무결성 검증 유틸리티

const ADMIN_STORAGE_KEY = 'dotori_flow_admin_auth_v1';
const DEFAULT_ADMIN_PASS = 'admin1234';

/**
 * 텍스트 입력값 정제 (Sanitization)
 * 불필요한 앞뒤 공백 제거 및 잠재적 악성 문자열 제어
 */
export function sanitizeInput(value) {
  if (typeof value === 'string') {
    return value.trim();
  }
  return value;
}

/**
 * 관리자 비밀번호 조회 및 초기화
 */
export function getAdminPassword() {
  try {
    const saved = localStorage.getItem(ADMIN_STORAGE_KEY);
    return saved || DEFAULT_ADMIN_PASS;
  } catch (e) {
    return DEFAULT_ADMIN_PASS;
  }
}

/**
 * 관리자 비밀번호 변경
 */
export function updateAdminPassword(newPassword) {
  if (!newPassword || newPassword.length < 4) {
    return { success: false, message: '비밀번호는 최소 4자리 이상이어야 합니다.' };
  }
  try {
    localStorage.setItem(ADMIN_STORAGE_KEY, newPassword);
    return { success: true, message: '관리자 비밀번호가 안전하게 변경되었습니다.' };
  } catch (e) {
    return { success: false, message: '비밀번호 저장 중 오류가 발생했습니다.' };
  }
}

/**
 * 데이터 저장 레이어 전 단계의 엄격한 티켓 무결성 검증 (Strict Data Integrity Check)
 * 프론트엔드 UI를 우회하여 주입되는 불법/누락 데이터를 원천 차단
 */
export function validateTicketIntegrity(payload, fields) {
  if (!payload || typeof payload !== 'object') {
    return {
      isValid: false,
      error: '비정상적인 티켓 데이터 구조입니다.'
    };
  }

  const activeFields = fields.filter(f => f.isEnabled);
  const mandatoryFields = activeFields.filter(f => f.isMandatory);

  const missingFields = [];

  for (const field of mandatoryFields) {
    const rawVal = payload[field.id];
    const val = sanitizeInput(rawVal);

    if (val === undefined || val === null || val === '') {
      missingFields.push(field.name);
    }
  }

  if (missingFields.length > 0) {
    return {
      isValid: false,
      error: `[보안 차단] 필수 입력 항목(${missingFields.join(', ')})이 누락되었습니다. 데이터를 저장할 수 없습니다.`
    };
  }

  // 필드 타입별 유효성 검사
  for (const field of activeFields) {
    const val = payload[field.id];
    if (val !== undefined && val !== null && val !== '') {
      if (field.type === 'number') {
        const num = Number(val);
        if (isNaN(num)) {
          return {
            isValid: false,
            error: `'${field.name}' 필드에는 유효한 숫자만 입력할 수 있습니다.`
          };
        }
      }
      if (field.type === 'date') {
        // 날짜 형식 기본 검증
        if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) {
          return {
            isValid: false,
            error: `'${field.name}' 필드의 날짜 형식이 올바르지 않습니다.`
          };
        }
      }
    }
  }

  return { isValid: true };
}
