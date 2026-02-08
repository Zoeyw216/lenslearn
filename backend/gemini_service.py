"""
Gemini AI 服务 - 图片识别和发音功能
"""

import os
import json
from google import genai
from google.genai import types
from dotenv import load_dotenv
from models import Language

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("请设置 GEMINI_API_KEY 环境变量")

# 初始化 Gemini 客户端
client = genai.Client(api_key=GEMINI_API_KEY)


async def identify_objects_in_image(base64_image: str, target_language: Language) -> list:
    """
    使用 Gemini 识别图片中的物体
    
    Args:
        base64_image: Base64 编码的图片数据
        target_language: 目标语言
    
    Returns:
        识别到的物体列表
    """
    prompt = f"""Identify 3 to 5 clear, distinct everyday objects in this image.
For each object, provide:
1. Its name in {target_language.value}.
2. Its translation in Chinese (Simplified).
3. Its approximate center coordinates (x, y) as percentages (0-100) of the image dimensions.

Return the result strictly as a JSON array of objects with keys: "name", "translation", "x", "y"."""

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=[
                types.Content(
                    parts=[
                        types.Part.from_bytes(
                            data=bytes.fromhex(base64_image) if all(c in '0123456789abcdefABCDEF' for c in base64_image[:10]) else __import__('base64').b64decode(base64_image),
                            mime_type="image/jpeg"
                        ),
                        types.Part.from_text(text=prompt)
                    ]
                )
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )

        result_text = response.text
        if result_text:
            return json.loads(result_text)
        return []
    except Exception as e:
        print(f"Gemini 识别错误: {e}")
        raise e


async def get_pronunciation(text: str, language: Language) -> str | None:
    """
    使用 Gemini TTS 获取发音
    
    Args:
        text: 要发音的文本
        language: 语言
    
    Returns:
        Base64 编码的音频数据
    """
    # 根据语言选择声音
    voice_name = 'Kore'
    if language == Language.JAPANESE:
        voice_name = 'Puck'

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash-preview-tts",
            contents=f"Say clearly: {text}",
            config=types.GenerateContentConfig(
                response_modalities=["AUDIO"],
                speech_config=types.SpeechConfig(
                    voice_config=types.VoiceConfig(
                        prebuilt_voice_config=types.PrebuiltVoiceConfig(
                            voice_name=voice_name
                        )
                    )
                )
            )
        )

        # 提取音频数据
        if response.candidates and response.candidates[0].content.parts:
            for part in response.candidates[0].content.parts:
                if hasattr(part, 'inline_data') and part.inline_data:
                    import base64
                    return base64.b64encode(part.inline_data.data).decode('utf-8')
        return None
    except Exception as e:
        print(f"Gemini TTS 错误: {e}")
        raise e
