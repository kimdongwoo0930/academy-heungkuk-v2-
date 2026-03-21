import { CLASSROOM_CATEGORIES, CLASSROOM_PRICE, ClassroomCategory } from '@/lib/constants/classrooms';

export interface PriceSettings {
  classrooms: Record<ClassroomCategory, number>;
  roomPrice: number;
  mealPrice: number;
  specialMealPrice: number;
}

export interface ContactSettings {
  representative: string;  // 대표이사
  manager: string;         // 담당자
  phone: string;
  fax: string;
  email: string;
}

export interface AppSettings {
  prices: PriceSettings;
  contact: ContactSettings;
}

const CACHE_KEY = 'appSettingsCache';

export function getDefaultPriceSettings(): PriceSettings {
  const classrooms = {} as Record<ClassroomCategory, number>;
  for (const cat of CLASSROOM_CATEGORIES) {
    classrooms[cat] = CLASSROOM_PRICE[cat].pricePerDay;
  }
  return {
    classrooms,
    roomPrice: 85_000,
    mealPrice: 8_300,
    specialMealPrice: 35_000,
  };
}

export function getDefaultContactSettings(): ContactSettings {
  return {
    representative: '임형준',
    manager: '김 대 술 소장',
    phone: '031-283-6157',
    fax: '031-284-5323',
    email: 'hka6157@naver.com',
  };
}

export function getDefaultAppSettings(): AppSettings {
  return {
    prices: getDefaultPriceSettings(),
    contact: getDefaultContactSettings(),
  };
}

// 서버에서 받은 flat Map → AppSettings 변환
export function parseSettings(raw: Record<string, string>): AppSettings {
  const defaults = getDefaultAppSettings();
  const classrooms = { ...defaults.prices.classrooms };

  for (const cat of CLASSROOM_CATEGORIES) {
    const key = `price.classroom.${cat}`;
    if (raw[key] !== undefined) classrooms[cat] = Number(raw[key]);
  }

  return {
    prices: {
      classrooms,
      roomPrice: raw['price.room'] !== undefined ? Number(raw['price.room']) : defaults.prices.roomPrice,
      mealPrice: raw['price.meal'] !== undefined ? Number(raw['price.meal']) : defaults.prices.mealPrice,
      specialMealPrice: raw['price.specialMeal'] !== undefined ? Number(raw['price.specialMeal']) : defaults.prices.specialMealPrice,
    },
    contact: {
      representative: raw['contact.representative'] ?? defaults.contact.representative,
      manager: raw['contact.manager'] ?? defaults.contact.manager,
      phone: raw['contact.phone'] ?? defaults.contact.phone,
      fax: raw['contact.fax'] ?? defaults.contact.fax,
      email: raw['contact.email'] ?? defaults.contact.email,
    },
  };
}

// AppSettings → 서버로 보낼 flat Map 변환
export function serializeSettings(settings: AppSettings): Record<string, string> {
  const flat: Record<string, string> = {};
  for (const cat of CLASSROOM_CATEGORIES) {
    flat[`price.classroom.${cat}`] = String(settings.prices.classrooms[cat]);
  }
  flat['price.room'] = String(settings.prices.roomPrice);
  flat['price.meal'] = String(settings.prices.mealPrice);
  flat['price.specialMeal'] = String(settings.prices.specialMealPrice);
  flat['contact.representative'] = settings.contact.representative;
  flat['contact.manager'] = settings.contact.manager;
  flat['contact.phone'] = settings.contact.phone;
  flat['contact.fax'] = settings.contact.fax;
  flat['contact.email'] = settings.contact.email;
  return flat;
}

// 로컬 캐시 (견적서 렌더 시 동기적으로 읽기 위함)
export function getCachedSettings(): AppSettings {
  if (typeof window === 'undefined') return getDefaultAppSettings();
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return getDefaultAppSettings();
    return JSON.parse(raw) as AppSettings;
  } catch {
    return getDefaultAppSettings();
  }
}

export function setCachedSettings(settings: AppSettings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CACHE_KEY, JSON.stringify(settings));
}

// 하위 호환: 기존 코드가 getPriceSettings() 를 직접 호출하는 부분
export function getPriceSettings(): PriceSettings {
  return getCachedSettings().prices;
}
