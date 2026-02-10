
# Theo-Stream: Dialectic Engine (Symmetric Contrast)
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   🔄 THEO-STREAM: DIALECTIC ENGINE (Stage 3)"
Write-Host "   Context: Suffering & Injustice"
Write-Host "==================================================" -ForegroundColor Cyan

# 1. Structured Data Input (Based on Stage 2 Summarization)
$Data = @(
    @{
        scholar   = "N.T. Wright"
        school    = "New Perspective / New Creation"
        thesis    = "고난은 악의 신비이며, 하나님은 비탄(Lament)을 통해 이 고통에 동참하신다."
        novelty   = "고난을 행위의 결과(인과응보)로 보지 않고, 잃어버린 '비탄의 예전'을 회복할 것을 주장."
        citations = @("Romans 8:22", "Psalms of Lament")
    },
    @{
        scholar   = "John Piper"
        school    = "Reformed / Sovereign Grace"
        thesis    = "고난은 하나님의 주권적 영광을 위한 도구이며, 모든 고통에는 세심한 목적이 있다."
        novelty   = "전통적 섭리론을 강화. 모든 고통을 그리스도의 가치를 발견하는 '기독교적 희락주의'로 연결."
        citations = @("Romans 5:3", "Job 1:21")
    }
)

# 2. Conflict Detection Logic
Write-Host "`n🔍 Detecting Theological Conflicts..." -ForegroundColor Yellow
$Conflicts = @(
    @{ aspect = "고난의 원인"; a = "악의 수수께끼/혼돈"; b = "하나님의 주권적 작정" }
    @{ aspect = "대응 방식"; a = "비탄(Lamenting)"; b = "신뢰와 찬양(Trusting)" }
    @{ aspect = "성경적 중심"; a = "공동체의 탄식 (성령)"; b = "개인의 연단 (영광)" }
)

# 3. Generate Comparative Table
Write-Host "`n[Comparative Dialectic Map]" -ForegroundColor Green
Write-Host ("{0,-15} | {1,-25} | {2,-25}" -f "Aspect", $Data[1].scholar, $Data[0].scholar)
Write-Host ("-" * 70)

foreach ($c in $Conflicts) {
    Write-Host ("{0,-15} | {1,-25} | {2,-25}" -f $c.aspect, $c.b, $c.a)
}

# 4. Synthesize Application Insight
Write-Host "`n[Synthesis Insight]" -ForegroundColor Magenta
Write-Host ">> 두 견해의 접점: 고난은 결코 '무의미'하지 않다. 다만 라이트는 '과정(신음)'에, 파이퍼는 '목적(영광)'에 더 무게를 둔다."

# Export to JSON for Theo-Stream dashboard
$Output = @{
    timestamp    = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    topic        = "Suffering"
    mapping      = $Conflicts
    scholar_data = $Data
}
$Output | ConvertTo-Json -Depth 5 | Set-Content "theological_dialectic_map.json" -Encoding UTF8
Write-Host "`n✅ Saved Dialectic Map to 'theological_dialectic_map.json'"
