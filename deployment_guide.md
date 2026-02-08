# LensLearn 部署指南

本指南将帮助你使用 Vercel CLI 部署前端，并使用 Render 部署后端。

## 1. 后端部署 (FastAPI)

后端建议使用 **Render.com**。

1.  登录 [Render](https://render.com)。
2.  点击 **"New +"** -> **"Web Service"**。
3.  连接你的 GitHub 仓库。
4.  在配置页面设置：
    *   **Environment**: `Python 3`
    *   **Build Command**: `pip install -r backend/requirements.txt`
    *   **Start Command**: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
5.  点击 **"Advanced"** -> **"Add Environment Variable"**，添加以下变量：
    *   `SUPABASE_URL`: 你的 Supabase 项目 URL
    *   `SUPABASE_KEY`: 你的 Supabase Key
    *   `GEMINI_API_KEY`: 你的 Google Gemini API Key
6.  部署完成后，复制 Render 提供的 URL（例如：`https://lenslearn-api.onrender.com`）。

## 2. 前端部署 (Vercel)

由于你已经在本地安装了 Vercel CLI，我们可以直接在终端操作。

1.  在项目根目录下，运行：
    ```bash
    vercel login
    ```
2.  登录成功后，运行以下命令进行初始化部署：
    ```bash
    vercel
    ```
    *   按照提示完成项目关联。
3.  **设置环境变量**：
    运行以下命令添加必要的变量（或者在 Vercel 网页后台添加）：
    ```bash
    vercel env add VITE_SUPABASE_URL <你的URL>
    vercel env add VITE_SUPABASE_ANON_KEY <你的KEY>
    vercel env add VITE_API_URL <刚才复制的Render后端URL>
    ```
4.  最后，运行以下命令发布到生产环境：
    ```bash
    vercel --prod
    ```

## 3. 常见问题
*   **跨域错误 (CORS)**：后端 `main.py` 中已经配置了 `allow_origins=["*"]`，理论上不会有 CORS 问题。
*   **Vite 变量**：前端代码中使用了 `import.meta.env.VITE_...`，所以环境变量必须以 `VITE_` 开头。
