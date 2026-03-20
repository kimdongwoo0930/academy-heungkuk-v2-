// 백엔드 공통 응답 형식
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
