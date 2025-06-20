import os
from PIL import Image

# 設定目標資料夾與縮圖寬度
target_folder = "images/2025_06_18"  # 改為你的資料夾
thumbnail_width = 400

# 處理每張 .webp 圖
for filename in os.listdir(target_folder):
    if filename.lower().endswith(".webp") and "_thumb" not in filename:
        webp_path = os.path.join(target_folder, filename)
        base_name = os.path.splitext(filename)[0]
        thumb_path = os.path.join(target_folder, f"{base_name}_thumb.webp")

        # 若縮圖已存在就略過
        if os.path.exists(thumb_path):
            # print(f"⏭ 已存在縮圖：{thumb_path}")

            continue

        try:
            with Image.open(webp_path) as img:
                # 計算縮圖尺寸（等比例）
                ratio = thumbnail_width / img.width
                new_size = (thumbnail_width, int(img.height * ratio))

                # 轉為 RGB 並儲存縮圖
                thumb = img.convert("RGB").resize(new_size, Image.LANCZOS)
                thumb.save(thumb_path, "WEBP", quality=80)

                # print(f"✅ 已建立縮圖：{thumb_path}")
        except Exception as e:
            # print(f"⚠️ 錯誤處理 {filename}：{e}")
            print('error')
