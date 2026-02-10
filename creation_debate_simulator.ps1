
# Genesis 1 Creation Debate Simulator (PowerShell Edition)

# Ensure UTF-8 Output
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "--------------------------------------------------" -ForegroundColor Cyan
Write-Host "🧠 [SYSTEM] Initializing Bible Research Agents..."
Write-Host "--------------------------------------------------" -ForegroundColor Cyan

# --- Config ---
$Agents = @{
    "Linguist"        = @{ name = "Dr. Cohen (Hebrew Linguist)"; stance = "Textual/Semitic"; style = "Analytical"; color = "Cyan" }
    "Trad_Theologian" = @{ name = "Rev. Calvin (Traditionalist)"; stance = "Young Earth"; style = "Dogmatic"; color = "Yellow" }
    "Mod_Theologian"  = @{ name = "Dr. Barth (Modernist)"; stance = "Framework View"; style = "Abstract"; color = "Magenta" }
    "Scientist"       = @{ name = "Dr. Sagan (Scientist)"; stance = "Theistic Evolution"; style = "Empirical"; color = "Green" }
}

# --- Debate Script Data ---
$Rounds = @(
    @{
        id        = 1
        theme_ko  = "창세기 1장의 '날(Yom)'과 '태초(Reshit)'의 의미"
        theme_en  = "The meaning of 'Yom' (Day) and 'Reshit' (Beginning)"
        dialogues = @(
            @{ spk = "Linguist"; th_ko = "[생각] '욤'은 문맥이 결정해. '저녁과 아침'이 반복되면 보통 24시간이지."; txt_en = "Philologically, 'Yom' is flexible. But 'evening and morning' suggests a solar cycle."; txt_ko = "언어학적으로 '욤'은 유연합니다. 하지만 '저녁과 아침'의 반복은 통상적인 하루를 의미합니다." }
            @{ spk = "Trad_Theologian"; th_ko = "[생각] 성경이 하루라면 하루야. 타협은 없어."; txt_en = "Text is historical narrative. God created in six literal days."; txt_ko = "이것은 역사적 서술입니다. 하나님은 문자 그대로 6일 동안 창조하셨습니다." }
            @{ spk = "Scientist"; th_ko = "[생각] 138억 년의 우주 나이와 문자적 6일은 충돌해."; txt_en = "Nature shows the universe is 13.8 billion years old. Starlight disproves literal days."; txt_ko = "자연 계시(과학)는 우주가 138억 년 되었음을 보여줍니다. 별빛만 봐도 문자적 날짜는 불가능합니다." }
            @{ spk = "Mod_Theologian"; th_ko = "[생각] 이건 과학이 아니라 신학적 구조(액자)야."; txt_en = "It is a 'Framework'. Days 1-3 are Kingdoms, Days 4-6 are Kings."; txt_ko = "이것은 '틀(Framework)'입니다. 첫 3일은 왕국(공간)을, 나중 3일은 왕(채움)을 의미합니다." }
        )
    },
    @{
        id        = 2
        theme_ko  = "해와 달이 없는 첫 3일의 빛은 무엇인가?"
        theme_en  = "The Light before the Sun (Days 1-3)"
        dialogues = @(
            @{ spk = "Scientist"; th_ko = "[생각] 광원이 4일째 나오는데 그 전에 빛이 있다니 인과 모순이야."; txt_en = "If Sun is Day 4, how can Days 1-3 be solar days? Photosynthesis impossible."; txt_ko = "태양이 4일째에 나왔다면, 1-3일이 어떻게 '태양일'이 됩니까? 광합성도 불가능합니다." }
            @{ spk = "Trad_Theologian"; th_ko = "[생각] 하나님은 자연 법칙 위에 계셔."; txt_en = "God is not bound by secondary causes. He was the supernatural light source."; txt_ko = "하나님은 제2원인에 얽매이지 않으십니다. 그분이 직접 초자연적인 빛이 되셨습니다." }
        )
    },
    @{
        id        = 3
        theme_ko  = "결론: 우리는 창세기 1장을 어떻게 설교해야 하는가?"
        theme_en  = "Synthesis: How should we preach Genesis 1?"
        dialogues = @(
            @{ spk = "Linguist"; th_ko = "[생각] 본문의 핵심 동사 '바라(Bara)'에 집중해야 해."; txt_en = "The verb 'Bara' implies divine sovereignty over 'Tohu wa-bohu' (Chaos)."; txt_ko = "'바라(창조하다)'는 혼돈(토후 와 보후)에 대한 하나님의 절대 주권을 선언합니다." }
            @{ spk = "Mod_Theologian"; th_ko = "[생각] 과학과 싸우지 말고 창조주를 선포하자."; txt_en = "Preach the 'Rock of Ages', not just the 'Age of Rocks'. God brings Order."; txt_ko = "'바위의 나이'가 아니라 '만세 반석'을 설교합시다. 하나님이 질서를 만드셨다는 것이 핵심입니다." }
        )
    }
)

# --- Execution ---
$ExportData = @{
    metadata = @{ topic = "Genesis 1: Creation Debate"; date = (Get-Date).ToString("yyyy-MM-dd"); participants = ($Agents.Values | ForEach-Object { $_.name }) }
    rounds   = @()
}

foreach ($Round in $Rounds) {
    Write-Host "`n🔔 Round $($Round.id): $($Round.theme_ko)" -ForegroundColor White
    Start-Sleep -Milliseconds 500
    
    $RoundExport = @{
        round_id = $Round.id
        theme_ko = $Round.theme_ko
        theme_en = $Round.theme_en
        turns    = @()
    }

    foreach ($Turn in $Round.dialogues) {
        $Key = $Turn.spk
        $Info = $Agents[$Key]
        
        # 1. Internal Thought
        Write-Host "   🤔 [$($Info.name)] Thinking..." -ForegroundColor Gray
        Write-Host "      >> $($Turn.th_ko)" -ForegroundColor Gray
        Start-Sleep -Milliseconds 300
        
        # 2. External Speech
        Write-Host "   🗣️  [$($Info.name)] says:" -ForegroundColor $Info.color
        Write-Host "      `"$($Turn.txt_ko)`"" -ForegroundColor White
        Start-Sleep -Milliseconds 300
        
        # 3. Data Collection
        $TurnData = @{
            speaker_name   = $Info.name
            speaker_stance = $Info.stance
            speaker_style  = $Info.style
            thought_ko     = $Turn.th_ko
            text_ko        = $Turn.txt_ko
            text_en        = $Turn.txt_en
        }
        $RoundExport.turns += $TurnData
    }
    $ExportData.rounds += $RoundExport
}

# Save JSON
$JsonContent = $ExportData | ConvertTo-Json -Depth 5 -Compress
Set-Content -Path "research_data.json" -Value $JsonContent -Encoding UTF8

Write-Host "`n--------------------------------------------------" -ForegroundColor Cyan
Write-Host "✅ Simulation Complete. Data saved to 'research_data.json'"
Write-Host "--------------------------------------------------" -ForegroundColor Cyan
