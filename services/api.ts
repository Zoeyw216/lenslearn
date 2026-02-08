/**
 * API 服务层 - 封装后端 API 调用
 */

import { Language, SavedWord, IdentifiedObject } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * 获取所有保存的单词
 */
export async function fetchWords(userId?: string): Promise<SavedWord[]> {
    const url = new URL(`${API_BASE_URL}/api/words`);
    if (userId) url.searchParams.append('user_id', userId);
    const response = await fetch(url.toString());

    if (!response.ok) {
        throw new Error('获取单词失败');
    }

    const data = await response.json();

    // 转换后端数据格式为前端格式
    return data.map((item: any) => ({
        id: item.id,
        word: item.word,
        translation: item.translation,
        secondaryTranslation: item.secondary_translation,
        language: item.language as Language,
        timestamp: new Date(item.created_at).getTime()
    }));
}

/**
 * 保存新单词
 */
export async function saveWord(word: {
    word: string;
    translation: string;
    secondaryTranslation?: string;
    language: Language;
    userId?: string;
}): Promise<SavedWord> {
    const response = await fetch(`${API_BASE_URL}/api/words`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            word: word.word,
            translation: word.translation,
            secondary_translation: word.secondaryTranslation,
            language: word.language,
            user_id: word.userId
        }),
    });

    if (!response.ok) {
        throw new Error('保存单词失败');
    }

    const data = await response.json();

    return {
        id: data.id,
        word: data.word,
        translation: data.translation,
        secondaryTranslation: data.secondary_translation,
        language: data.language as Language,
        timestamp: new Date(data.created_at).getTime()
    };
}

/**
 * 删除单词
 */
export async function deleteWord(wordId: string, userId?: string): Promise<void> {
    const url = new URL(`${API_BASE_URL}/api/words/${wordId}`);
    if (userId) url.searchParams.append('user_id', userId);
    const response = await fetch(url.toString(), {
        method: 'DELETE',
    });

    if (!response.ok) {
        throw new Error('删除单词失败');
    }
}

/**
 * 识别图片中的物体
 */
export async function identifyObjects(
    imageBase64: string,
    targetLanguage: Language
): Promise<IdentifiedObject[]> {
    const response = await fetch(`${API_BASE_URL}/api/identify`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            image_base64: imageBase64,
            target_language: targetLanguage
        }),
    });

    if (!response.ok) {
        throw new Error('图片识别失败');
    }

    const data = await response.json();

    return data.map((obj: any, idx: number) => ({
        id: `obj-${idx}`,
        name: obj.name,
        translation: obj.translation,
        x: obj.x,
        y: obj.y,
        language: targetLanguage
    }));
}

/**
 * 获取单词发音
 */
export async function getPronunciationFromAPI(
    text: string,
    language: Language
): Promise<string | null> {
    const response = await fetch(`${API_BASE_URL}/api/pronunciation`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            text,
            language
        }),
    });

    if (!response.ok) {
        throw new Error('获取发音失败');
    }

    const data = await response.json();
    return data.audio;
}
