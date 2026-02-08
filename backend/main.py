"""
LensLearn 后端 API - FastAPI 主入口
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import uuid

from models import (
    SavedWord, 
    CreateWordRequest, 
    IdentifyRequest, 
    PronunciationRequest,
    IdentifiedObject
)
from database import get_supabase
from gemini_service import identify_objects_in_image, get_pronunciation

app = FastAPI(
    title="LensLearn API",
    description="语言学习应用后端 API",
    version="1.0.0"
)

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境应该限制具体域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    """健康检查"""
    return {"status": "healthy", "service": "lenslearn-api"}


@app.get("/api/words", response_model=List[SavedWord])
async def get_words(user_id: Optional[str] = None):
    """获取用户保存的单词"""
    try:
        supabase = get_supabase()
        query = supabase.table("saved_words").select("*")
        
        if user_id:
            query = query.eq("user_id", user_id)
            
        response = query.order("created_at", desc=True).execute()
        
        words = []
        for row in response.data:
            words.append(SavedWord(
                id=row["id"],
                word=row["word"],
                translation=row["translation"],
                secondary_translation=row.get("secondary_translation"),
                language=row["language"],
                created_at=row.get("created_at")
            ))
        return words
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取单词失败: {str(e)}")


@app.post("/api/words", response_model=SavedWord)
async def create_word(request: CreateWordRequest):
    """保存新单词"""
    try:
        supabase = get_supabase()
        word_id = str(uuid.uuid4())
        
        data = {
            "id": word_id,
            "word": request.word,
            "translation": request.translation,
            "secondary_translation": request.secondary_translation,
            "language": request.language.value,
            "user_id": request.user_id
        }
        
        response = supabase.table("saved_words").insert(data).execute()
        
        if response.data:
            row = response.data[0]
            return SavedWord(
                id=row["id"],
                word=row["word"],
                translation=row["translation"],
                secondary_translation=row.get("secondary_translation"),
                language=row["language"],
                created_at=row.get("created_at")
            )
        raise HTTPException(status_code=500, detail="保存单词失败")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"保存单词失败: {str(e)}")


@app.delete("/api/words/{word_id}")
async def delete_word(word_id: str, user_id: Optional[str] = None):
    """删除单词"""
    try:
        supabase = get_supabase()
        query = supabase.table("saved_words").delete().eq("id", word_id)
        
        if user_id:
            query = query.eq("user_id", user_id)
            
        response = query.execute()
        
        if response.data:
            return {"message": "删除成功", "id": word_id}
        raise HTTPException(status_code=404, detail="单词不存在")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"删除单词失败: {str(e)}")


@app.post("/api/identify", response_model=List[IdentifiedObject])
async def identify_image(request: IdentifyRequest):
    """识别图片中的物体"""
    try:
        results = await identify_objects_in_image(
            request.image_base64, 
            request.target_language
        )
        
        return [
            IdentifiedObject(
                name=obj["name"],
                translation=obj["translation"],
                x=obj["x"],
                y=obj["y"]
            )
            for obj in results
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"图片识别失败: {str(e)}")


@app.post("/api/pronunciation")
async def get_word_pronunciation(request: PronunciationRequest):
    """获取单词发音"""
    try:
        audio_base64 = await get_pronunciation(request.text, request.language)
        
        if audio_base64:
            return {"audio": audio_base64}
        raise HTTPException(status_code=500, detail="生成发音失败")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取发音失败: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
