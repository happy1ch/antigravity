import asyncio
import edge_tts
import os

VOICE = "ko-KR-SunHiNeural"
OUTPUT_DIR = "public/audio"

if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

# Updated texts to include supplementary explanations for the voiceover
TEXTS = {
    "intro": "2026년 2월 19일, 오늘의 주요 정치 뉴스입니다. 변화하는 대한민국 정무의 현재를 전해드립니다.",
    "news1": "윤석열 전 대통령 1심 선고. 내란 수괴 혐의 무기징역. 비상계엄 선포 이후 443일 만의 법적 판단입니다. 헌재의 파면 결정에 이은 역사적인 판결로 기록될 전망입니다.",
    "news2": "이재명 대통령 지지율 63% 기록. 민생 행보 및 부동산 정책 호평. 부동산 시장 안정화에 대한 국민적 기대감이 지지율 상승을 견인했습니다. 취약계층을 위한 민생 대책 역량 집중이 긍정적 평가를 받았습니다.",
    "news3": "한국경제 대도약 원년 선포. 성장전략 및 민생 대책 발표. SMR 특별법 통과와 대규모 민생 자금 공급이 예정되었습니다. 2026년을 경제 선도국 도약의 해로 삼겠다는 국정 의지가 반영되었습니다.",
    "outro": "국민의 목소리에 귀 기울이는 대한민국 정치를 응원합니다. 더 투명하고 정의로운 내일을 응원합니다. 시청해 주셔서 감사합니다."
}

async def generate_tts():
    for name, text in TEXTS.items():
        output_file = os.path.join(OUTPUT_DIR, f"{name}.mp3")
        print(f"Generating {output_file}...")
        communicate = edge_tts.Communicate(text, VOICE)
        await communicate.save(output_file)

if __name__ == "__main__":
    asyncio.run(generate_tts())
