
# Generate Web Page (PowerShell Edition)
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$JsonFile = "debate_source.json"
if (-not (Test-Path $JsonFile)) { Write-Error "JSON file not found"; exit }

$Data = Get-Content $JsonFile -Raw -Encoding UTF8 | ConvertFrom-Json
$Topic = $Data.metadata.topic
$Date = $Data.metadata.date

# Start HTML
$Html = @"
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>$Topic</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;700&family=Merriweather:ital,wght@0,300;0,700;1,300&display=swap');
        
        :root {
            --primary-color: #2c3e50;
            --accent-color: #e74c3c;
            --bg-color: #f4f6f7;
            --card-bg: #ffffff;
        }
        
        body {
            font-family: 'Noto Sans KR', sans-serif;
            background-color: var(--bg-color);
            color: #333;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
        }

        .container {
            max-width: 1000px;
            margin: 0 auto;
        }

        header {
            text-align: center;
            padding: 40px 0;
            border-bottom: 3px solid var(--primary-color);
            margin-bottom: 40px;
        }

        h1 {
            font-family: 'Merriweather', serif;
            font-size: 2.5rem;
            color: var(--primary-color);
            margin-bottom: 10px;
        }

        .metadata {
            color: #7f8c8d;
            font-size: 0.9rem;
        }

        .round-card {
            background: var(--card-bg);
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            margin-bottom: 40px;
            overflow: hidden;
            border-top: 5px solid var(--accent-color);
        }

        .round-header {
            background: #ecf0f1;
            padding: 20px 30px;
            border-bottom: 1px solid #bdc3c7;
        }

        .round-title {
            font-size: 1.5rem;
            font-weight: bold;
            color: var(--primary-color);
        }
        
        .round-subtitle {
            display: block;
            color: #7f8c8d;
            font-size: 1rem;
            margin-top: 5px;
            font-style: italic;
        }

        .dialogue-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .dialogue-item {
            padding: 25px 30px;
            border-bottom: 1px solid #eee;
            display: flex;
            gap: 20px;
            transition: background 0.2s;
        }

        .dialogue-item:hover {
            background: #fdfefe;
        }

        .speaker-avatar {
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
        }

        .metadata-box {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            margin-bottom: 30px;
        }

        .tag-badge {
            background: #e1ecf4;
            color: #39739d;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.85rem;
            margin: 0 4px;
            display: inline-block;
        }
        
        .citation {
            font-weight: bold;
            color: #2c3e50;
            display: block;
            margin-bottom: 10px;
            font-size: 1.1rem;
        }

        /* Dialogue Types */
        .dialogue-item.rebuttal {
            border-left: 5px solid #e74c3c !important;
            background: #fff5f5;
        }
        
        .dialogue-item.defense {
            border-left: 5px solid #3498db !important;
            background: #f0f8ff;
        }

        /* ... existing agent colors ... */
        .Linguist .speaker-avatar { background: #1abc9c; }
        .Trad .speaker-avatar { background: #f1c40f; color: #333; }
        .Mod .speaker-avatar { background: #9b59b6; }
        .Scientist .speaker-avatar { background: #2ecc71; }

        /* ... existing styles ... */
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>📜 $Topic</h1>
            
            <div class="metadata-box">
                <span class="citation">📖 $($Data.metadata.bible_ref)</span>
                <div>
                    $($Data.metadata.theological_tags | ForEach-Object { "<span class='tag-badge'>$_</span>" })
                </div>
                <div style="font-size: 0.8rem; color: #aaa; margin-top: 8px;">
                     Process: $($Data.metadata.source_type) | Date: $Date
                </div>
            </div>
        </header>
"@

# Data processing
foreach ($Round in $Data.rounds) {
    $Html += @"
        <div class="round-card">
            <div class="round-header">
                <span class="round-title">Round $($Round.id): $($Round.theme_ko)</span>
                <span class="round-subtitle">$($Round.theme_en)</span>
            </div>
            <ul class="dialogue-list">
"@
    
    foreach ($Turn in $Round.dialogues) {
        $CssClass = "Linguist"
        if ($Turn.spk -match "Trad_Theologian") { $CssClass = "Trad" }
        elseif ($Turn.spk -match "Mod_Theologian") { $CssClass = "Mod" }
        elseif ($Turn.spk -match "Scientist") { $CssClass = "Scientist" }
        
        # Add Type Class
        if ($Turn.type) { $CssClass += " $($Turn.type)" }

        $AgentInfo = $Data.agents.$($Turn.spk)
        if ($null -eq $AgentInfo) {
            # Fallback for User or unknown speakers
            $AgentInfo = @{ name = $Turn.spk; stance = "Participant"; style = "N/A" }
            if ($Turn.spk -eq "User") { 
                $AgentInfo.name = "Research User"
                $AgentInfo.stance = "Critical Inquirer"
            }
        }
        
        $AgentName = $AgentInfo.name
        $AgentStance = $AgentInfo.stance
        $Initial = $AgentName[0]

        $Html += @"
                <li class="dialogue-item $CssClass">
                    <div class="speaker-avatar" title="$AgentName">$Initial</div>
                    <div class="content">
                        <span class="speaker-name">
                            $AgentName
                            <span class="speaker-stance">$AgentStance</span>
                        </span>
                        
                        <div class="thought-bubble">
                            <span class="thought-icon">🤔</span>
                            <span>$($Turn.th_ko)</span>
                        </div>

                        <div class="speech-text">
                            $($Turn.txt_ko)
                        </div>
                        <div class="speech-translation">
                            "$($Turn.txt_en)"
                        </div>
                    </div>
                </li>
"@
    }

    $Html += "            </ul></div>"
}

$Html += @"
        <footer>
            <p style="text-align: center; color: #aaa; margin-top: 50px;">
                Generated by Bible Research Intelligence Agent
            </p>
        </footer>
    </div>
</body>
</html>
"@

Set-Content "research_genesis_1.html" -Value $Html -Encoding UTF8
Write-Host "✅ Created research_genesis_1.html" -ForegroundColor Green
