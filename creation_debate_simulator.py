import json
import random
import time
import sys

# Ensure UTF-8 Output for Console
sys.stdout.reconfigure(encoding='utf-8')

# --- Agent Personas ---
AGENTS = {
    "Linguist": {
        "name": "Dr. Cohen (Hebrew Linguist)",
        "stance": "Textual/Semitic",
        "bio": "Expert in Ancient Near East linguistics. Focuses on syntax, not theology.",
        "style": "Analytical, precise, cites BDB/HALOT lexicons."
    },
    "Trad_Theologian": {
        "name": "Rev. Calvin (Traditionalist)",
        "stance": "Young Earth / Literal",
        "bio": "Confessional Reformed theologian. Views Genesis 1 as historical narrative.",
        "style": "Dogmatic, reverent, cites Westminster Confession."
    },
    "Mod_Theologian": {
        "name": "Dr. Barth (Modernist)",
        "stance": "Literary Framework",
        "bio": "Neo-orthodox scholar. Views Gen 1 as polemic against Enuma Elish.",
        "style": "Abstract, thematic, focuses on theological purpose."
    },
    "Scientist": {
        "name": "Dr. Sagan (Scientist)",
        "stance": "Theistic Evolution",
        "bio": "Astrophysicist & believer. Seeks harmony between Big Bang and Bible.",
        "style": "Empirical, questions chronology, emphasizes 'God's Two Books'."
    }
}

# --- Mock Knowledge Base / Debate Scripts ---
# In a real LLM scenario, specific prompts would generate these.
# Here, we script the logic to demonstrate the ARCHITECTURE.

ROUNDS = [
    {
        "round_id": 1,
        "theme_ko": "창세기 1장의 '날(Yom)'과 '태초(Reshit)'의 의미",
        "theme_en": "The meaning of 'Yom' (Day) and 'Reshit' (Beginning)",
        "dialogues": [
            {
                "speaker": "Linguist",
                "thought_ko": "[생각] 히브리어 '욤(Yom)'은 문맥에 따라 12시간, 24시간, 혹은 긴 시대를 의미할 수 있다. 하지만 '저녁이 되고 아침이 되니'라는 구절은 일반적인 하루를 강력하게 시사한다. 이걸 어떻게 설명할까?",
                "text_en": "Philologically, the word 'Yom' (Day) is flexible. However, the recurring formula 'and there was evening and there was morning' (v.5) typically denotes a singular solar cycle in narrative prose.",
                "text_ko": "언어학적으로 '욤(날)'이라는 단어는 유연합니다. 하지만 5절의 '저녁이 되고 아침이 되니'라는 반복적인 문구는 서사 산문에서 통상적으로 태양의 주기인 하루를 의미합니다."
            },
            {
                "speaker": "Trad_Theologian",
                "thought_ko": "[생각] 코헨 박사의 말이 맞아. 텍스트가 '하루'라고 말하면 우리는 '하루'로 받아들여야 해. 하나님의 전능하심을 타협할 수 없어.",
                "text_en": "Precisely. The text is historical narrative, not poetry. Taking 'Yom' as an indefinite age undermines the perspicuity of Scripture. God created in six literal days.",
                "text_ko": "정확합니다. 이 본문은 시가 아니라 역사적 서술입니다. '욤'을 막연한 시대로 해석하는 것은 성경의 명료성을 훼손하는 것입니다. 하나님은 문자 그대로 6일 동안 창조하셨습니다."
            },
            {
                "speaker": "Scientist",
                "thought_ko": "[생각] 문자적 6일은 138억 년이라는 우주 나이와 도저히 맞지 않아. 별빛이 도달하는 시간만 해도 수억 년인데... '겉보기 나이' 이론은 하나님을 속이는 분으로 만다는 거야.",
                "text_en": "But Reverend, general revelation—nature itself—shows the universe is 13.8 billion years old. Starlight alone disproves a literal 144-hour creation. We must read Genesis phenomenologically.",
                "text_ko": "하지만 목사님, 일반 계시인 자연 그 자체가 우주의 나이가 138억 년임을 보여줍니다. 별빛만 봐도 문자적인 144시간 창조는 불가능합니다. 우리는 창세기를 현상학적으로 읽어야 합니다."
            },
            {
                "speaker": "Mod_Theologian",
                "thought_ko": "[생각] 다들 연대에만 너무 집착해. 모세가 이 글을 쓸 때 과학 교과서를 쓰려던 게 아니잖아? 바벨론 신화랑 비교해보면 이건 '질서'에 대한 이야기야.",
                "text_en": "You are both missing the point. The structure is a 'Framework'. Days 1-3 form Kingdoms, Days 4-6 fill them with Kings. It is a polemic against chaos, not a timeline.",
                "text_ko": "두 분 다 요점을 놓치고 있습니다. 이 구조는 '틀(Framework)'입니다. 첫 3일은 왕국을, 나중 3일은 왕들을 채우는 것이죠. 이것은 혼돈에 대항하는 논증이지, 타임라인이 아닙니다."
            }
        ]
    },
    {
        "round_id": 2,
        "theme_ko": "해와 달이 없는 첫 3일의 빛은 무엇인가?",
        "theme_en": "The Light before the Sun (Days 1-3)",
        "dialogues": [
            {
                "speaker": "Scientist",
                "thought_ko": "[생각] 광원(태양)이 4일째에 나오는데 1일째에 빛이 있고 '저녁과 아침'이 있다고? 이건 물리적으로 불가능해. 인과관계가 뒤집힌 서술이야.",
                "text_en": "If the Sun was created on Day 4, how can there represent a 'Solar Day' on Days 1 through 3? Photosynthesis would be impossible. The order is strictly thematic.",
                "text_ko": "태양이 4일째에 창조되었다면, 어떻게 1일에서 3일까지 '태양일(Solar Day)'이 존재할 수 있습니까? 광합성도 불가능했을 겁니다. 이 순서는 철저히 주제별 배치입니다."
            },
            {
                "speaker": "Trad_Theologian",
                "thought_ko": "[생각] 하나님은 태양 없이도 빛을 내실 수 있는 분이야. 요한계시록에도 주 하나님이 빛이 되신다고 했어. 과학적 잣대로 기적을 난도질하면 안 돼.",
                "text_en": "God is not bound by secondary causes. He provided a supernatural light source before formatting the celestial bodies. We must trust the miraculous order.",
                "text_ko": "하나님은 제2원인에 얽매이지 않으십니다. 천체를 만드시기 전에 초자연적인 광원을 제공하셨습니다. 우리는 그 기적적인 질서를 믿어야 합니다."
            }
        ]
    },
    {
        "round_id": 3,
        "theme_ko": "결론: 우리는 창세기 1장을 어떻게 설교해야 하는가?",
        "theme_en": "Synthesis: How should we preach Genesis 1?",
        "dialogues": [
            {
                "speaker": "Linguist",
                "thought_ko": "[생각] 히브리어 본문은 '무(To)'에서 유(Yesh)'로의 창조(Bara)를 선언하는 데 집중하고 있어. '어떻게'보다는 '누가'에 방점이 있지.",
                "text_en": "The verb 'Bara' implies a divine activity with no analogue. The text asserts *Sovereignty* over chaos (Tohu wa-bohu).",
                "text_ko": "'바라(창조하다)'라는 동사는 인간이 흉내 낼 수 없는 신적 활동을 의미합니다. 본문은 혼돈(토후 와 보후)에 대한 하나님의 '주권'을 선언합니다."
            },
            {
                "speaker": "Mod_Theologian",
                "thought_ko": "[생각] 그래, 창조주가 누구인지가 중요해. 과학과 싸우느라 복음을 놓치면 안 돼.",
                "text_en": "Amen. Let science investigate the 'Age of Rocks', while we preach the 'Rock of Ages'. The Message is that God brings order out of chaos.",
                "text_ko": "아멘입니다. 과학이 '바위의 나이(Age of Rocks)'를 연구하게 두고, 우리는 '만세 반석(Rock of Ages)'을 설교합시다. 메시지는 하나님이 혼돈에서 질서를 이끌어내신다는 것입니다."
            }
        ]
    }
]

# --- Simulator Engine ---
def run_simulation():
    print("--------------------------------------------------")
    print("🧠 [SYSTEM] Initializing Bible Research Agents (Python Engine)...")
    print("--------------------------------------------------")
    
    final_output = {
        "metadata": {
            "topic": "Genesis 1: Creation Debate",
            "date": "2026-02-02",
            "participants": [v["name"] for k, v in AGENTS.items()]
        },
        "rounds": []
    }

    for round_data in ROUNDS:
        print(f"\n🔔 Round {round_data['round_id']}: {round_data['theme_ko']}")
        print(f"   (Theme: {round_data['theme_en']})")
        time.sleep(1)

        round_output = {
            "round_id": round_data["round_id"],
            "theme_ko": round_data["theme_ko"],
            "theme_en": round_data["theme_en"],
            "turns": []
        }

        for turn in round_data["dialogues"]:
            agent_key = turn["speaker"]
            agent_info = AGENTS[agent_key]
            
            # 1. Show Internal Thought (Console Only) - "The Thinking Process"
            print(f"\n   🤔 [{agent_info['name']}] Thinking...")
            print(f"      >> {turn['thought_ko']}")
            time.sleep(0.5)

            # 2. Show External Speech (Console)
            print(f"   🗣️  [{agent_info['name']}] says:")
            print(f"      \"{turn['text_ko']}\"")
            
            # 3. Add to Data Structure
            round_output["turns"].append({
                "speaker_name": agent_info["name"],
                "speaker_stance": agent_info["stance"],
                "speaker_style": agent_info["style"],
                "thought_ko": turn["thought_ko"],
                "text_ko": turn["text_ko"],
                "text_en": turn["text_en"]
            })
        
        final_output["rounds"].append(round_output)

    # Save to JSON
    with open("research_data.json", "w", encoding="utf-8") as f:
        json.dump(final_output, f, ensure_ascii=False, indent=2)
    
    print("\n--------------------------------------------------")
    print("✅ Simulation Complete. Data saved to 'research_data.json'")
    print("--------------------------------------------------")

if __name__ == "__main__":
    run_simulation()
