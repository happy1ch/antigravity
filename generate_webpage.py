import json
import os

def load_data(filename="research_data.json"):
    with open(filename, 'r', encoding='utf-8') as f:
        return json.load(f)

def generate_html(data):
    html_template = f"""
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{data['metadata']['topic']}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;700&family=Merriweather:ital,wght@0,300;0,700;1,300&display=swap');
        
        :root {{
            --primary-color: #2c3e50;
            --accent-color: #e74c3c;
            --bg-color: #f4f6f7;
            --card-bg: #ffffff;
        }}
        
        body {{
            font-family: 'Noto Sans KR', sans-serif;
            background-color: var(--bg-color);
            color: #333;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
        }}

        .container {{
            max-width: 1000px;
            margin: 0 auto;
        }}

        header {{
            text-align: center;
            padding: 40px 0;
            border-bottom: 3px solid var(--primary-color);
            margin-bottom: 40px;
        }}

        h1 {{
            font-family: 'Merriweather', serif;
            font-size: 2.5rem;
            color: var(--primary-color);
            margin-bottom: 10px;
        }}

        .metadata {{
            color: #7f8c8d;
            font-size: 0.9rem;
        }}

        .round-card {{
            background: var(--card-bg);
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            margin-bottom: 40px;
            overflow: hidden;
            border-top: 5px solid var(--accent-color);
        }}

        .round-header {{
            background: #ecf0f1;
            padding: 20px 30px;
            border-bottom: 1px solid #bdc3c7;
        }}

        .round-title {{
            font-size: 1.5rem;
            font-weight: bold;
            color: var(--primary-color);
        }}
        
        .round-subtitle {{
            display: block;
            color: #7f8c8d;
            font-size: 1rem;
            margin-top: 5px;
            font-style: italic;
        }}

        .dialogue-list {{
            list-style: none;
            padding: 0;
            margin: 0;
        }}

        .dialogue-item {{
            padding: 25px 30px;
            border-bottom: 1px solid #eee;
            display: flex;
            gap: 20px;
            transition: background 0.2s;
        }}

        .dialogue-item:hover {{
            background: #fdfefe;
        }}

        .speaker-avatar {{
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: #ccc;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: white;
            flex-shrink: 0;
            font-size: 1.2rem;
        }}

        /* Agent Specific Colors */
        .Linguist .speaker-avatar {{ background: #1abc9c; }}
        .Trad_Theologian .speaker-avatar {{ background: #f1c40f; color: #333; }}
        .Mod_Theologian .speaker-avatar {{ background: #9b59b6; }}
        .Scientist .speaker-avatar {{ background: #2ecc71; }}

        .content {{
            flex-grow: 1;
        }}

        .speaker-name {{
            font-weight: bold;
            display: block;
            margin-bottom: 5px;
            color: #2c3e50;
        }}
        
        .speaker-stance {{
            font-size: 0.8rem;
            color: #95a5a6;
            background: #ecf0f1;
            padding: 2px 8px;
            border-radius: 10px;
            margin-left: 10px;
            font-weight: normal;
        }}

        .thought-bubble {{
            background: #fff3cd;
            color: #856404;
            padding: 10px 15px;
            border-radius: 8px;
            margin-bottom: 12px;
            font-size: 0.9rem;
            border-left: 4px solid #ffeeba;
            display: flex;
            align-items: center;
            gap: 10px;
        }}
        
        .thought-icon {{ font-size: 1.2rem; }}

        .speech-text {{
            font-size: 1.1rem;
            line-height: 1.7;
            margin-bottom: 8px;
        }}

        .speech-translation {{
            color: #7f8c8d;
            font-size: 0.95rem;
            font-family: 'Merriweather', serif;
        }}

    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>📜 {data['metadata']['topic']}</h1>
            <div class="metadata">
                Date: {data['metadata']['date']} <br>
                Participants: {', '.join(data['metadata']['participants'])}
            </div>
        </header>

"""
    
    # Process Rounds
    for round_data in data['rounds']:
        html_template += f"""
        <div class="round-card">
            <div class="round-header">
                <span class="round-title">Round {round_data['round_id']}: {round_data['theme_ko']}</span>
                <span class="round-subtitle">{round_data['theme_en']}</span>
            </div>
            <ul class="dialogue-list">
        """

        for turn in round_data['turns']:
            # Determine CSS class based on speaker name/role (rough matching)
            css_class = "Linguist"
            if "Traditionalist" in turn['speaker_name']: css_class = "Trad_Theologian"
            elif "Modernist" in turn['speaker_name']: css_class = "Mod_Theologian"
            elif "Scientist" in turn['speaker_name']: css_class = "Scientist"

            initial = turn['speaker_name'][0]

            html_template += f"""
                <li class="dialogue-item {css_class}">
                    <div class="speaker-avatar" title="{turn['speaker_name']}">{initial}</div>
                    <div class="content">
                        <span class="speaker-name">
                            {turn['speaker_name']}
                            <span class="speaker-stance">{turn['speaker_stance']}</span>
                        </span>
                        
                        <div class="thought-bubble">
                            <span class="thought-icon">🤔</span>
                            <span>{turn['thought_ko']}</span>
                        </div>

                        <div class="speech-text">
                            {turn['text_ko']}
                        </div>
                        <div class="speech-translation">
                            "{turn['text_en']}"
                        </div>
                    </div>
                </li>
            """
        
        html_template += """
            </ul>
        </div>
        """

    html_template += """
        <footer>
            <p style="text-align: center; color: #aaa; margin-top: 50px;">
                Generated by Bible Research Intelligence Agent
            </p>
        </footer>
    </div>
</body>
</html>
    """
    
    return html_template

if __name__ == "__main__":
    if not os.path.exists("research_data.json"):
        print("Error: research_data.json not found.")
        exit()
        
    data = load_data()
    html_content = generate_html(data)
    
    with open("research_genesis_1.html", "w", encoding="utf-8") as f:
        f.write(html_content)
    
    print("Success: research_genesis_1.html created!")
