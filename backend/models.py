"""
Pydantic 数据模型，与前端 TypeScript 类型对应
"""

from pydantic import BaseModel
from typing import Optional
from enum import Enum
from datetime import datetime


class Language(str, Enum):
    SPANISH = "Spanish"
    JAPANESE = "Japanese"
    ENGLISH = "English"
    FRENCH = "French"
    GERMAN = "German"
    KOREAN = "Korean"


class SavedWord(BaseModel):
    """保存的单词"""
    id: str
    word: str
    translation: str
    secondary_translation: Optional[str] = None
    language: Language
    user_id: Optional[str] = None
    created_at: Optional[datetime] = None


class CreateWordRequest(BaseModel):
    """创建单词请求"""
    word: str
    translation: str
    secondary_translation: Optional[str] = None
    language: Language
    user_id: Optional[str] = None


class IdentifiedObject(BaseModel):
    """识别到的物体"""
    name: str
    translation: str
    x: float
    y: float


class IdentifyRequest(BaseModel):
    """图片识别请求"""
    image_base64: str
    target_language: Language


class PronunciationRequest(BaseModel):
    """发音请求"""
    text: str
    language: Language
