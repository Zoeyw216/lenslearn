
export enum Language {
  SPANISH = 'Spanish',
  JAPANESE = 'Japanese',
  ENGLISH = 'English',
  FRENCH = 'French',
  GERMAN = 'German',
  KOREAN = 'Korean'
}

export interface IdentifiedObject {
  id: string;
  name: string;
  translation: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  pronunciation?: string;
  language: Language;
}

export interface SavedWord {
  id: string;
  word: string;
  translation: string;
  language: Language;
  secondaryTranslation?: string;
  timestamp: number;
}
