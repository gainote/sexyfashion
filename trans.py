import os
from PIL import Image

# 設定你要轉換的資料夾路徑
target_folder = "images/2025_06_20"  # ← 請改成你的資料夾名稱

# 遍歷該資料夾下所有 .png 檔
for filename in os.listdir(target_folder):
    if filename.lower().endswith(".png"):
        png_path = os.path.join(target_folder, filename)

        # 建立對應的 .webp 檔名
        base_name = os.path.splitext(filename)[0]
        webp_filename = f"{base_name}.webp"
        webp_path = os.path.join(target_folder, webp_filename)

        try:
            # 開啟 PNG 並轉存為 WEBP
            with Image.open(png_path) as img:
                img.convert("RGB").save(webp_path, "WEBP", quality=85)

            # 成功後刪除原本的 PNG
            os.remove(png_path)
            # print(f"✅ 已轉換並刪除：{filename}")
        except Exception as e:
            # print(f"⚠️ 錯誤：{filename} 無法處理。原因：{e}")
            print(error)
