
import React from 'react';
import { SavedWord, Language } from '../types';

interface WordCardProps {
  word: SavedWord;
}

const WordCard: React.FC<WordCardProps> = ({ word }) => {
  return (
    <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm border border-gray-100 flex justify-between items-start">
      <div>
        <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-1">
          {word.language}
        </span>
        <h3 className="text-2xl font-bold text-gray-900 mb-1 leading-tight">{word.word}</h3>
        <p className="text-gray-500 font-medium">{word.translation}</p>
      </div>
      <div className="text-right">
        <span className="text-lg font-medium text-gray-900 block">{word.secondaryTranslation}</span>
        <span className="text-[10px] text-gray-400">Chinese</span>
      </div>
    </div>
  );
};

export default WordCard;
