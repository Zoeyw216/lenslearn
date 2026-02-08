-- Supabase 数据库初始化脚本
-- 请在 Supabase SQL Editor 中执行此脚本

-- 创建 saved_words 表
CREATE TABLE IF NOT EXISTS saved_words (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    word TEXT NOT NULL,
    translation TEXT NOT NULL,
    secondary_translation TEXT,
    language TEXT NOT NULL,
    user_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_saved_words_language ON saved_words(language);
CREATE INDEX IF NOT EXISTS idx_saved_words_created_at ON saved_words(created_at DESC);

-- 启用 RLS (Row Level Security) - 可选，用于多用户场景
-- ALTER TABLE saved_words ENABLE ROW LEVEL SECURITY;

-- 如果启用 RLS，添加策略允许所有操作（开发模式）
-- CREATE POLICY "Allow all operations" ON saved_words FOR ALL USING (true);

-- 插入一些示例数据（可选）
-- INSERT INTO saved_words (word, translation, secondary_translation, language) VALUES
-- ('el gato', 'the cat', '猫', 'Spanish'),
-- ('コーヒー', 'coffee', '咖啡', 'Japanese'),
-- ('la mesa', 'the table', '桌子', 'Spanish');
