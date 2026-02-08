
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Volume2, Heart } from 'lucide-react';
import { IdentifiedObject, Language } from '../types';
import { getPronunciationFromAPI } from '../services/api';
import { decodeBase64Audio, decodeAudioData } from './gemini';

interface ResultViewProps {
  image: string;
  objects: IdentifiedObject[];
  onBack: () => void;
  onSave: (obj: IdentifiedObject) => void;
  targetLanguage: Language;
}

const ResultView: React.FC<ResultViewProps> = ({ image, objects, onBack, onSave, targetLanguage }) => {
  const [selectedObject, setSelectedObject] = useState<IdentifiedObject | null>(objects[0] || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setAudioContext(new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 }));
    return () => {
      if (audioContext) audioContext.close();
    };
  }, []);

  const handleSaveClick = async (obj: IdentifiedObject) => {
    if (savedIds.has(obj.id)) return;
    onSave(obj);
    setSavedIds(prev => new Set(prev).add(obj.id));
  };

  const handlePlaySound = async () => {
    if (!selectedObject || !audioContext) return;
    setIsPlaying(true);
    try {
      // 调用后端 API 获取发音
      const base64Audio = await getPronunciationFromAPI(selectedObject.name, targetLanguage);
      if (base64Audio) {
        const bytes = decodeBase64Audio(base64Audio);
        const buffer = await decodeAudioData(bytes, audioContext);
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.onended = () => setIsPlaying(false);
        source.start();
      } else {
        setIsPlaying(false);
      }
    } catch (e) {
      console.error(e);
      setIsPlaying(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto pb-10">
      <div className="max-w-md mx-auto min-h-screen px-6 pt-6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center bg-white border border-gray-100 rounded-xl shadow-sm"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          <span className="text-[11px] font-bold tracking-[0.2em] text-gray-400 uppercase">识别结果</span>
          <div className="w-10"></div>
        </div>

        {/* Image Display */}
        <div className="relative w-full aspect-square rounded-[40px] overflow-hidden bg-gray-100 mb-10 shadow-lg">
          <img src={image} alt="Captured" className="w-full h-full object-cover" />
          {objects.map((obj) => (
            <div
              key={obj.id}
              className={`pulse-marker ${selectedObject?.id === obj.id ? 'scale-125 ring-4 ring-white/30' : ''} ${savedIds.has(obj.id) ? 'bg-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.5)]' : ''}`}
              style={{ left: `${obj.x}%`, top: `${obj.y}%` }}
              onClick={() => setSelectedObject(obj)}
            />
          ))}
        </div>

        {/* Detail Card */}
        {selectedObject && (
          <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-6xl font-extrabold text-gray-900 mb-2 tracking-tight">
              {selectedObject.name}
            </h2>
            <p className="text-2xl text-gray-400 font-medium mb-12">
              {selectedObject.translation}
            </p>

            <div className="flex gap-12">
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={handlePlaySound}
                  disabled={isPlaying}
                  className={`w-14 h-14 flex items-center justify-center rounded-2xl transition-all ${isPlaying ? 'bg-gray-100 scale-95' : 'bg-gray-50 hover:bg-gray-100 shadow-sm'}`}
                >
                  <Volume2 size={24} className={isPlaying ? 'text-gray-400' : 'text-gray-900'} />
                </button>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">发音</span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => handleSaveClick(selectedObject)}
                  className={`w-14 h-14 flex items-center justify-center rounded-2xl shadow-sm transition-all ${savedIds.has(selectedObject.id) ? 'bg-pink-50 text-pink-500 scale-105' : 'bg-gray-50 hover:bg-pink-50 hover:text-pink-500'}`}
                >
                  <Heart size={24} fill={savedIds.has(selectedObject.id) ? "currentColor" : "none"} />
                </button>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  {savedIds.has(selectedObject.id) ? '已保存' : '保存'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultView;
