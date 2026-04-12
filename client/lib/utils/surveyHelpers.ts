import { SurveyAnswers } from '@/types/survey';

export function parseAnswers(raw: string): SurveyAnswers | null {
  try {
    return JSON.parse(raw) as SurveyAnswers;
  } catch {
    return null;
  }
}
