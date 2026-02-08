
import { Language, SavedWord } from './types';

export const INITIAL_SAVED_WORDS: SavedWord[] = [
  {
    id: '1',
    word: 'el gato',
    translation: 'the cat',
    secondaryTranslation: '猫',
    language: Language.SPANISH,
    timestamp: Date.now() - 1000000
  },
  {
    id: '2',
    word: 'コーヒー (kōhī)',
    translation: 'the coffee',
    secondaryTranslation: '咖啡',
    language: Language.JAPANESE,
    timestamp: Date.now() - 2000000
  },
  {
    id: '3',
    word: 'tree',
    translation: 'el árbol',
    secondaryTranslation: '树',
    language: Language.ENGLISH,
    timestamp: Date.now() - 3000000
  },
  {
    id: '4',
    word: 'la silla',
    translation: 'the chair',
    secondaryTranslation: '椅子',
    language: Language.SPANISH,
    timestamp: Date.now() - 4000000
  },
  {
    id: '5',
    word: 'la mesa',
    translation: 'the table',
    secondaryTranslation: '桌子',
    language: Language.SPANISH,
    timestamp: Date.now() - 5000000
  }
];

export const LANGUAGES = Object.values(Language);
