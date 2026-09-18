// Romans 8 English Learning App - Simple & Rock Solid Logic

let currentIndex = 0;
let currentStep = 1; // 1, 2, 3, 4
let showKorean = true;
let completedVerses = new Set(JSON.parse(localStorage.getItem('romans8_completed') || '[]'));

// Recording State
let mediaRecorder = null;
let audioChunks = [];
let recordedAudioUrls = {}; // currentIndex -> blobUrl
let isRecording = false;
let recordedAudio = null;
let recordTimerInterval = null;
let recordSeconds = 0;

// DOM Elements
const verseSelect = document.getElementById('verseSelect');
const toggleKorBtn = document.getElementById('toggleKorBtn');
const korStatusText = document.getElementById('korStatusText');
const progressPercent = document.getElementById('progressPercent');
const progressBarFill = document.getElementById('progressBarFill');

const stepBtns = [
  document.getElementById('step1Btn'),
  document.getElementById('step2Btn'),
  document.getElementById('step3Btn'),
  document.getElementById('step4Btn')
];

const verseTitle = document.getElementById('verseTitle');
const stepInstruction = document.getElementById('stepInstruction');
const englishText = document.getElementById('englishText');
const koreanText = document.getElementById('koreanText');

const playTtsBtn = document.getElementById('playTtsBtn');
const recordBtn = document.getElementById('recordBtn');
const playRecordBtn = document.getElementById('playRecordBtn');
const completeStepBtn = document.getElementById('completeStepBtn');
const audioStatus = document.getElementById('audioStatus');
const speedSelect = document.getElementById('speedSelect');

const prevVerseBtn = document.getElementById('prevVerseBtn');
const nextVerseBtn = document.getElementById('nextVerseBtn');

// Initialize Application
function init() {
  populateVerseSelect();
  renderVerse(0);
  updateProgress();
  setupEventListeners();
}

// Populate Verse Selector
function populateVerseSelect() {
  verseSelect.innerHTML = '';
  romans8Verses.forEach((item, idx) => {
    const opt = document.createElement('option');
    opt.value = idx;
    const isDone = completedVerses.has(item.verse) ? ' ✓' : '';
    opt.textContent = `Verse ${item.verse}${isDone}`;
    verseSelect.appendChild(opt);
  });
}

// Render Current Verse
function renderVerse(index) {
  currentIndex = index;
  const data = romans8Verses[currentIndex];

  verseSelect.value = currentIndex;
  verseTitle.textContent = `Romans 8:${data.verse}`;
  englishText.textContent = data.text;
  koreanText.textContent = data.kor;

  prevVerseBtn.disabled = currentIndex === 0;
  nextVerseBtn.disabled = currentIndex === romans8Verses.length - 1;

  setStep(1);
}

// Set Learning Step (1 ~ 4)
function setStep(stepNum) {
  currentStep = stepNum;

  // Stepper Visual Sync
  stepBtns.forEach((btn, i) => {
    btn.classList.toggle('active', i + 1 === currentStep);
  });

  englishText.classList.remove('reading-mode');

  // Button Visibilities
  playTtsBtn.style.display = 'none';
  recordBtn.style.display = 'none';
  playRecordBtn.style.display = 'none';
  completeStepBtn.style.display = 'none';

  switch (currentStep) {
    case 1:
      stepInstruction.textContent = "Step 1: 원어민 음성 듣기 버튼을 눌러 정확한 발음을 들어보세요.";
      playTtsBtn.style.display = 'inline-flex';
      playTtsBtn.innerHTML = '🔊 원어민 음성 듣기';
      setAudioStatus('준비됨');
      break;

    case 2:
      stepInstruction.textContent = "Step 2: 큼직해진 화면 텍스트를 보며 [녹음 시작]을 누르고 낭독하세요.";
      englishText.classList.add('reading-mode'); // Big text mode for comfortable reading
      recordBtn.style.display = 'inline-flex';
      if (isRecording) {
        recordBtn.innerHTML = '⏹️ 녹음 중지 & 저장';
        recordBtn.classList.add('recording');
      } else {
        recordBtn.innerHTML = '🎙️ 낭독 녹음 시작';
        recordBtn.classList.remove('recording');
      }
      setAudioStatus(isRecording ? `🔴 녹음 진행 중... [${formatTime(recordSeconds)}]` : '녹음 준비 완료');
      break;

    case 3:
      stepInstruction.textContent = "Step 3: 내가 녹음한 목소리를 재생하여 발음과 억양을 들어보세요.";
      playRecordBtn.style.display = 'inline-flex';
      playTtsBtn.style.display = 'inline-flex';
      playTtsBtn.innerHTML = '🔊 원어민 소리 다시 듣기';

      const hasRecord = !!recordedAudioUrls[currentIndex];
      playRecordBtn.disabled = !hasRecord;
      setAudioStatus(hasRecord ? '내 녹음 오디오 준비됨' : '녹음된 오디오가 없습니다. Step 2에서 녹음해 주세요.');
      break;

    case 4:
      stepInstruction.textContent = "Step 4: 원어민 발음과 비교해보고 [다음 절로 이동]을 클릭하세요.";
      playTtsBtn.style.display = 'inline-flex';
      playRecordBtn.style.display = 'inline-flex';
      completeStepBtn.style.display = 'inline-flex';
      playRecordBtn.disabled = !recordedAudioUrls[currentIndex];
      setAudioStatus('절 학습 완료 단계');
      break;
  }
}

function setAudioStatus(msg) {
  audioStatus.textContent = msg;
}

function formatTime(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  return `${m}:${s}`;
}

// 1. Play Native English Voice (TTS)
function playTts() {
  if (!('speechSynthesis' in window)) {
    alert('이 브라우저는 음성 합성을 지원하지 않습니다.');
    return;
  }

  window.speechSynthesis.cancel(); // Stop active speech

  const data = romans8Verses[currentIndex];
  const utterance = new SpeechSynthesisUtterance(data.text);
  utterance.lang = 'en-US';
  utterance.rate = parseFloat(speedSelect.value);

  // Pick suitable English voice
  const voices = window.speechSynthesis.getVoices();
  const enVoice = voices.find(v => v.lang === 'en-US' || v.lang === 'en-GB' || v.lang.startsWith('en'));
  if (enVoice) utterance.voice = enVoice;

  utterance.onstart = () => {
    setAudioStatus('🔊 원어민 음성 읽는 중...');
    playTtsBtn.disabled = true;
  };

  utterance.onend = () => {
    setAudioStatus('원어민 재생 완료');
    playTtsBtn.disabled = false;
    if (currentStep === 1) {
      setTimeout(() => setStep(2), 400);
    }
  };

  utterance.onerror = (e) => {
    console.error("TTS Error:", e);
    setAudioStatus('음성 재생 실패');
    playTtsBtn.disabled = false;
  };

  window.speechSynthesis.speak(utterance);
}

// 2. Microphone Recording
async function toggleRecording() {
  if (!isRecording) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunks = [];

      mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        clearInterval(recordTimerInterval);

        const audioBlob = new Blob(audioChunks, { type: mediaRecorder.mimeType || 'audio/webm' });

        if (audioBlob.size === 0) {
          alert('녹음된 오디오가 없습니다. 마이크가 제대로 작동하는지 확인해 주세요.');
          setAudioStatus('녹음 실패');
          return;
        }

        if (recordedAudioUrls[currentIndex]) {
          URL.revokeObjectURL(recordedAudioUrls[currentIndex]);
        }
        recordedAudioUrls[currentIndex] = URL.createObjectURL(audioBlob);

        stream.getTracks().forEach(track => track.stop());

        setAudioStatus(`녹음 저장 완료 (${Math.round(audioBlob.size / 1024)} KB)`);
        setTimeout(() => setStep(3), 500);
      };

      mediaRecorder.start(200);
      isRecording = true;
      recordSeconds = 0;

      recordTimerInterval = setInterval(() => {
        recordSeconds++;
        setAudioStatus(`🔴 녹음 진행 중... [${formatTime(recordSeconds)}]`);
      }, 1000);

      setStep(2);

    } catch (err) {
      alert('마이크 접근에 실패했습니다. 브라우저 마이크 허용 권한을 확인해주세요.');
      console.error(err);
      setAudioStatus('마이크 연결 실패');
    }
  } else {
    // Stop recording
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    isRecording = false;
    setStep(2);
  }
}

// 3. Play User Recording
function playUserRecording() {
  const url = recordedAudioUrls[currentIndex];
  if (!url) {
    alert('녹음된 음성이 없습니다. Step 2에서 먼저 녹음해 주세요.');
    return;
  }

  if (recordedAudio) {
    recordedAudio.pause();
  }

  recordedAudio = new Audio(url);

  recordedAudio.onplay = () => {
    setAudioStatus('🎧 내 녹음 음성 재생 중...');
    playRecordBtn.disabled = true;
  };

  recordedAudio.onended = () => {
    setAudioStatus('내 녹음 재생 완료');
    playRecordBtn.disabled = false;
  };

  recordedAudio.onerror = (e) => {
    console.error("User Audio Error:", e);
    alert('녹음 음성 재생 실패');
    setAudioStatus('재생 오류');
    playRecordBtn.disabled = false;
  };

  recordedAudio.play().catch(err => {
    console.error(err);
    playRecordBtn.disabled = false;
  });
}

// Complete Verse & Move to Next Verse
function completeCurrentVerse() {
  const verseNum = romans8Verses[currentIndex].verse;
  completedVerses.add(verseNum);
  localStorage.setItem('romans8_completed', JSON.stringify([...completedVerses]));

  populateVerseSelect();
  updateProgress();

  if (currentIndex < romans8Verses.length - 1) {
    renderVerse(currentIndex + 1);
  } else {
    alert('🎉 축하합니다! 로마서 8장 전체 구절 학습을 완료했습니다!');
  }
}

// Update Progress Bar
function updateProgress() {
  const count = completedVerses.size;
  const percent = Math.round((count / romans8Verses.length) * 100);
  progressPercent.textContent = `${percent}% (${count} / ${romans8Verses.length}절 완료)`;
  progressBarFill.style.width = `${percent}%`;
}

// Event Listeners
function setupEventListeners() {
  verseSelect.addEventListener('change', (e) => {
    renderVerse(parseInt(e.target.value));
  });

  toggleKorBtn.addEventListener('click', () => {
    showKorean = !showKorean;
    korStatusText.textContent = showKorean ? 'ON' : 'OFF';
    toggleKorBtn.classList.toggle('active', showKorean);
    koreanText.classList.toggle('hidden', !showKorean);
  });

  stepBtns.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      setStep(idx + 1);
    });
  });

  playTtsBtn.addEventListener('click', playTts);
  recordBtn.addEventListener('click', toggleRecording);
  playRecordBtn.addEventListener('click', playUserRecording);
  completeStepBtn.addEventListener('click', completeCurrentVerse);

  prevVerseBtn.addEventListener('click', () => {
    if (currentIndex > 0) renderVerse(currentIndex - 1);
  });

  nextVerseBtn.addEventListener('click', () => {
    if (currentIndex < romans8Verses.length - 1) renderVerse(currentIndex + 1);
  });

  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }
}

// Launch App
document.addEventListener('DOMContentLoaded', init);
