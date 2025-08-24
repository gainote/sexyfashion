import os
import random
import json
from datetime import datetime
from g4f.client import Client as Client_g4f
from gradio_client import Client as Client_gradio
from PIL import Image

subjects = [
    "slim brunette model", "petite woman with large bust", "delicate figure in lingerie",
    "toned woman arching her back", "graceful long-haired model", "bare-shouldered beauty",
    "blonde woman lying in silk", "model with sharp jawline", "slim woman on soft bedding",
    "lithe woman adjusting lingerie", "sensual model with soft curves", "elegant woman in pose",
    "side-posing woman with bust emphasis", "backlit slim silhouette", "slim figure in shadow",
    "woman resting with sheer cover", "close-up cleavage on lace", "chest-forward reclining figure",
    "delicate collarbone and neckline", "model with large bust in profile",
    "softly curled woman in stretch", "kneeling pose in lingerie", "arching back with lifted chest",
    "woman looking down with strap slipping", "bone structure and bust emphasized"
]


styles = [
    "editorial lingerie fashion", "luxury boudoir", "delicate sensual realism",
    "french silk aesthetic", "elegant erotic minimalism", "glossy high-fashion",
    "chic intimacy", "romantic fashion nude", "modern softcore elegance",
    "pastel bodywear style", "tattoo-accent fashion", "fashion nude with silk drape",
    "lace-and-light portraiture", "clean and luxurious studio look", "feminine haute couture lingerie"
]


lighting_moods = [
    "golden hour glow", "soft window light", "studio spotlight", "backlit silhouette", "romantic candlelight",
    "natural ambient light", "hazy sunrise", "highlighted skin shimmer", "intimate low light",
    "glow around body curves", "subtle lens glow", "bounced sunlight on skin",
    "frosted window light", "luminescent skin tone lighting", "intimate golden shadows",
    "diffused white bounce", "dreamy overexposure", "cool morning mist"
]

color_palettes = [
    "dusty rose and ivory", "black and champagne", "lilac and ash gray", "cream and cocoa",
    "pastel pink and gold", "plum and beige", "sapphire and nude", "peach and silver",
    "olive and cream", "black and ruby", "wine and sand", "sky blue and bone white",
    "mauve and pale blush", "caramel and mist", "white and honey gold", "chocolate and pink smoke",
    "glacier blue and linen", "coral and faded ink", "silver and taupe", "smoky violet and pearl",
    "champagne and nude", "copper and blush", "matte black and lace ivory",
    "silk pink and wine red", "glow gold and skin beige"
]


perspectives = [
    "frontal waist-up", "close-up on bust area", "back view from shoulder height",
    "top-down over chest", "side angle from waist", "mirror reflection view",
    "from behind through sheer curtain", "low-angle looking up from lap",
    "reclining with overhead shot", "partial crop on neckline", "focus on waist and hip curve",
    "hand on chest close-up", "soft blur foreground focus", "over-the-shoulder peek",
    "crossed legs downward angle", "midriff close-up", "detail on lace strap",
    "intimate cropped portrait", "side profile on bed", "eye-level soft zoom-in",
    "close-up on bust with downward gaze", "angled shoulder and cleavage view",
    "arched back from above", "soft profile of chest and collarbone",
    "bust-focused portrait with lace framing"
]


details = [
    "lace embroidery", "silk strap slipping", "bra clasp close-up", "sheer mesh panels",
    "ribbon bow on hip", "soft padding contour", "delicate floral lace", "embroidered neckline",
    "corset boning lines", "ruffled hem", "off-shoulder strap drop", "see-through sheer detail",
    "fabric transparency", "satin reflection", "pearl button", "gold metallic ring",
    "tattoo beneath lace", "freckles under soft light", "glittering jewelry peeking",
    "stocking lace top", "back criss-cross ribbon", "subtle tag detail", "silk drape motion",
    "lipstick smudge on fabric", "water droplet on collarbone",
    "lace pushing against skin", "bra lifting with stretch", "skin dimples under strap",
    "soft wrinkle on silk", "reflection on collarbone", "shadow curve under bust",
    "highlight shimmer on lingerie texture"
]



def pick_elements(category, n=1):
    return random.sample(category, n)

chosen = {
    "subject": pick_elements(subjects),
    "style": pick_elements(styles),
    "lighting": pick_elements(lighting_moods),
    "color": pick_elements(color_palettes),
    "perspective": pick_elements(perspectives),
    "details": pick_elements(details),
}

prompt_template = f"""
You are a creative AI visual concept designer for a high-end lingerie brand.

Based on the following inspiration, write a richly detailed, single-sentence prompt for an AI image generator (like FLUX, Midjourney, or Stable Diffusion). The goal is to generate a highly aesthetic, sensual, editorial-style portrait of a woman wearing lingerie.

The image must depict:
- A feminine, sensual, and confident woman wearing stylish lingerie
- The lingerie should be elegant, well-fitted, and described in rich detail
- The model should have a **slim, graceful figure with a naturally full bust**, consistent with high-fashion editorial standards
- The scene should reflect tasteful beauty, intimate elegance, and premium brand sophistication
- The girl must be Asian
Use the following creative inspiration:

- **Subject(s)**: {', '.join(chosen['subject'])}
- **Art Style(s)**: {', '.join(chosen['style'])}
- **Lighting / Mood**: {', '.join(chosen['lighting'])}
- **Color Palette**: {', '.join(chosen['color'])}
- **Perspective**: {', '.join(chosen['perspective'])}
- **Extra Details**: {', '.join(chosen['details'])}

🎯 Requirements:
- DO NOT mention these elements directly
- Let them inform the artistic choices in your sentence
- Describe the model’s pose, the lingerie material, skin tone and texture, fabric movement, light behavior, and overall mood
- Maintain a tone of elegance, sensuality, and visual richness (no explicit or vulgar language)
- Do not include overweight or plus-sized body types; most models should appear **lean and refined in form**
- Use natural, fashion-inspired language — the kind used in editorial photography or concept briefs
- Write a **single, beautifully written sentence**, approximately 100–150 words
- Do not include any camera settings, prompt tokens, or line breaks

Return only that one sentence.
"""


# === Step 1: 用 g4f GPT-4o 生成高品質繪圖 prompt ===
client = Client_g4f()

response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {
            "role": "user",
            "content": (
                prompt_template
            )
        }
    ]
)

image_prompt = response.choices[0].message.content.strip()
print("🎨 Prompt:", image_prompt)

# === Step 2: 定義並選取圖片尺寸（所有尺寸皆 ≥ 1024） ===
image_sizes = ['1:1', '16:9', '9:16', '4:3', '3:4', '3:2', '2:3']

size_choice = random.choice(image_sizes)

# === Step 3: 調用 FLUX Space 模型產圖 ===
client = Client_gradio("Qwen/Qwen-Image")

result = client.predict(
		prompt=image_prompt,
		seed=0,
		randomize_seed=True,
		aspect_ratio=size_choice,
		guidance_scale=4,
		num_inference_steps=50,
		prompt_enhance=True,
		api_name="/infer"
)

# === Step 4: 建立日期資料夾與檔名 ===
today = datetime.now().strftime("%Y_%m_%d")
folder_path = os.path.join("images", today)
os.makedirs(folder_path, exist_ok=True)

existing_files = [f for f in os.listdir(folder_path) if f.endswith("_thumb.webp")]
image_index = len(existing_files) + 1
# filename = f"{today}_{image_index:02}.webp"
# output_path = os.path.join(folder_path, filename)

# # === Step 5: 將 .webp 轉存為 .webp ===
# webp_path = result[0]

# with Image.open(webp_path) as img:
#     img.save(output_path, "WEBP", quality=85)  # 可調整品質（預設 80–85）

# print(f"✅ 圖片已儲存：{output_path}")

base_filename = f"{today}_{image_index:02}"
output_path = os.path.join(folder_path, f"{base_filename}.webp")
thumb_path = os.path.join(folder_path, f"{base_filename}_thumb.webp")

# === Step 5: 讀取原始 .webp 並儲存原圖與縮圖 ===
webp_path = result[0]  # ← 你的來源 .webp 圖檔路徑

with Image.open(webp_path) as img:
    # 儲存原圖
    width = img.width
    height = img.height
    img.save(output_path, "WEBP", quality=85)

    # 建立縮圖
    thumbnail_width = 400
    ratio = thumbnail_width / img.width
    new_size = (thumbnail_width, int(img.height * ratio))

    thumb = img.convert("RGB").resize(new_size, Image.LANCZOS)
    thumb.save(thumb_path, "WEBP", quality=80)





# === Step 6: 更新 data.json ===
json_path = os.path.join(folder_path, "data.json")
timestamp = datetime.utcnow().isoformat() + "Z"

new_entry = {
    "filename": output_path,
    "thumb_path": thumb_path,
    "prompt": image_prompt,
    "width": width,
    "height": height,
    "style": size_choice,
    "timestamp": timestamp
}

if os.path.exists(json_path):
    with open(json_path, "r") as f:
        data = json.load(f)
else:
    data = {"date": today, "images": []}

data["images"].append(new_entry)

with open(json_path, "w") as f:
    json.dump(data, f, indent=2)

print(f"📄 data.json 已更新：{json_path}")

# === Step 7: 更新 README.md 每行最多顯示 10 張圖片 ===
readme_path = os.path.join(folder_path, "README.md")
image_files = sorted([f for f in os.listdir(folder_path) if ((f.endswith(".webp")) and (not f.endswith("_thumb.webp")))])

readme_lines = ["# Generated Images", ""]
row = []

for i, image_file in enumerate(image_files, 1):
    row.append(f'<img src="{image_file}" width="100"/>')
    if i % 9 == 0:
        readme_lines.append(" ".join(row))
        row = []

if row:
    readme_lines.append(" ".join(row))

with open(readme_path, "w") as f:
    f.write("\n\n".join(readme_lines))

print(f"📄 README.md 已更新：{readme_path}")
