
import React, { useState, useEffect, useRef } from 'react';
import { Camera, ChevronDown, Loader2 } from 'lucide-react';
import { Language, SavedWord, IdentifiedObject } from './types';
import { LANGUAGES } from './constants';
import WordCard from './components/WordCard';
import ResultView from './components/ResultView';
import CameraView from './components/CameraView';
import AuthPage from './components/AuthPage';
import { supabase } from './services/supabase';
import { fetchWords, saveWord as saveWordAPI, identifyObjects } from './services/api';
import { Session } from '@supabase/supabase-js';

const App: React.FC = () => {
  const [learningLanguage, setLearningLanguage] = useState<Language>(Language.ENGLISH);
  const [filterLanguage, setFilterLanguage] = useState<'All' | Language>('All');
  const [savedWords, setSavedWords] = useState<SavedWord[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [identifiedObjects, setIdentifiedObjects] = useState<IdentifiedObject[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // 检查当前会话
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 从后端加载单词数据
  useEffect(() => {
    if (!session?.user) return;

    const loadWords = async () => {
      try {
        const words = await fetchWords(session.user.id);
        setSavedWords(words);
      } catch (error) {
        console.error('加载单词失败:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadWords();
  }, [session]);

  const filteredWords = filterLanguage === 'All'
    ? savedWords
    : savedWords.filter(w => w.language === filterLanguage);

  const handleCameraClick = () => {
    setShowCamera(true);
  };

  const handleCapture = async (cleanBase64: string) => {
    setShowCamera(false);
    setIsProcessing(true);
    setCapturedImage(`data:image/jpeg;base64,${cleanBase64}`);

    try {
      const results = await identifyObjects(cleanBase64, learningLanguage);
      setIdentifiedObjects(results);
    } catch (err) {
      console.error("识别错误", err);
      alert("无法识别照片中的物体，请换一张图片试试。");
      setCapturedImage(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);

    // Read file as base64
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target?.result as string;
      const cleanBase64 = base64Data.split(',')[1];

      setCapturedImage(base64Data);

      try {
        const results = await identifyObjects(cleanBase64, learningLanguage);
        setIdentifiedObjects(results);
      } catch (err) {
        console.error("识别错误", err);
        alert("无法识别照片中的物体，请换一张图片试试。");
        setCapturedImage(null);
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveWord = async (obj: IdentifiedObject) => {
    try {
      // 调用后端 API 保存单词
      const newWord = await saveWordAPI({
        word: obj.name,
        translation: obj.language === Language.ENGLISH ? 'the ' + obj.name : obj.name,
        secondaryTranslation: obj.translation,
        language: obj.language,
        userId: session?.user.id
      });

      setSavedWords(prev => [newWord, ...prev]);
    } catch (error) {
      console.error('保存单词失败:', error);
      alert('保存单词失败，请重试。');
    }
  };

  if (!session) {
    return <AuthPage />;
  }

  return (
    <div className="max-w-[340px] mx-auto min-h-screen bg-[#fcfcfc] relative flex flex-col shadow-xl">
      {/* Header Section */}
      <header className="px-6 pt-16 pb-6 flex flex-col items-center">
        <div className="flex justify-between w-full mb-8">
          <div className="w-10"></div>
          <div className="relative flex items-center gap-1 group cursor-pointer inline-flex">
            <span className="text-gray-900 font-bold text-sm">Learning: {learningLanguage}</span>
            <ChevronDown size={14} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
            <select
              className="absolute inset-0 opacity-0 cursor-pointer w-full"
              value={learningLanguage}
              onChange={(e) => setLearningLanguage(e.target.value as Language)}
            >
              {LANGUAGES.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => supabase.auth.signOut()}
            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest">Out</span>
          </button>
        </div>

        {/* Filter Tabs - Scrollable Container */}
        <div className="w-full flex gap-3 overflow-x-auto no-scrollbar pb-2">
          <button
            onClick={() => setFilterLanguage('All')}
            className={`flex-shrink-0 px-5 py-2 rounded-xl font-bold text-xs transition-all whitespace-nowrap border ${filterLanguage === 'All' ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-gray-500 border-transparent hover:border-gray-100'}`}
          >
            All
          </button>
          {LANGUAGES.map(lang => (
            <button
              key={lang}
              onClick={() => setFilterLanguage(lang)}
              className={`flex-shrink-0 px-5 py-2 rounded-xl font-bold text-xs transition-all whitespace-nowrap border ${filterLanguage === lang ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-gray-500 border-transparent hover:border-gray-100'}`}
            >
              {lang}
            </button>
          ))}
          <button className="flex-shrink-0 px-5 py-2 rounded-xl font-bold text-xs bg-white text-gray-500 border-transparent whitespace-nowrap">
            More
          </button>
        </div>
      </header>

      {/* Main List */}
      <main className="flex-1 px-6 pb-32">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Loader2 className="animate-spin text-gray-400 mb-4" size={32} />
            <p className="text-gray-400 font-medium">加载中...</p>
          </div>
        ) : filteredWords.length > 0 ? (
          filteredWords.map(word => (
            <WordCard key={word.id} word={word} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Camera size={32} className="text-gray-300" />
            </div>
            <p className="text-gray-400 font-medium">还没有保存任何单词。<br />拍张照片开始学习吧！</p>
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 safe-bottom">
        <button
          onClick={handleCameraClick}
          disabled={isProcessing}
          className="w-20 h-20 bg-zinc-900 rounded-[28px] flex items-center justify-center text-white shadow-[0_20px_40px_rgba(0,0,0,0.15)] active:scale-95 transition-transform disabled:bg-zinc-400"
        >
          {isProcessing ? (
            <Loader2 className="animate-spin" size={32} />
          ) : (
            <Camera size={32} strokeWidth={2.5} />
          )}
        </button>
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />

      {/* Camera View Overlay */}
      {showCamera && (
        <CameraView
          onCapture={handleCapture}
          onClose={() => setShowCamera(false)}
        />
      )}

      {/* Result View Overlay */}
      {capturedImage && identifiedObjects.length > 0 && (
        <ResultView
          image={capturedImage}
          objects={identifiedObjects}
          targetLanguage={learningLanguage}
          onBack={() => {
            setCapturedImage(null);
            setIdentifiedObjects([]);
          }}
          onSave={handleSaveWord}
        />
      )}

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[100] flex flex-col items-center justify-center">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-zinc-100 border-t-zinc-900 rounded-full animate-spin"></div>
            <Camera className="absolute inset-0 m-auto text-zinc-900" size={32} />
          </div>
          <p className="mt-6 text-zinc-900 font-bold text-xl">正在识别物体...</p>
          <p className="text-gray-500 font-medium">AI正在分析您的照片</p>
        </div>
      )}
    </div>
  );
};

export default App;
