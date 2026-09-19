// Romans 8 NIV English Learning App - Mobile & Desktop Fully Compatible

let currentIndex = 0;
let currentStep = 1; // 1, 2, 3, 4
let showKorean = true;
let completedVerses = new Set(JSON.parse(localStorage.getItem('romans8_completed') || '[]'));

// Audio & Recording State
let mediaRecorder = null;
let audioChunks = [];
let recordedAudioUrls = {}; // verseIndex -> blobUrl
let isRecording = false;
let recordedAudio = null;
let recordTimerInterval = null;
let recordSeconds = 0;

// Mic Meter State
let meterAudioCtx = null;
let meterAnalyser = null;
let meterAnimFrame = null;

// Global Utterance reference to prevent Mobile JS Garbage Collection
window.currentUtterance = null;
let silentAudioCtx = null;

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

const micMeterContainer = document.getElementById('micMeterContainer');
const micMeterFill = document.getElementById('micMeterFill');
const micVolText = document.getElementById('micVolText');

const playTtsBtn = document.getElementById('playTtsBtn');
const recordBtn = document.getElementById('recordBtn');
const playRecordBtn = document.getElementById('playRecordBtn');
const completeStepBtn = document.getElementById('completeStepBtn');
const audioStatus = document.getElementById('audioStatus');
const speedSelect = document.getElementById('speedSelect');

const prevVerseBtn = document.getElementById('prevVerseBtn');
const nextVerseBtn = document.getElementById('nextVerseBtn');

// App Initialization
function init() {
  populateVerseSelect();
  renderVerse(0);
  updateProgress();
  setupEventListeners();
  preloadSpeechVoices();
  setupMobileAudioUnlock();
}

// Unlock Mobile Audio Session (iOS Safari & Android Chrome)
function setupMobileAudioUnlock() {
  const unlock = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.resume();
    }
    try {
      if (!silentAudioCtx) {
        silentAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (silentAudioCtx.state === 'suspended') {
        silentAudioCtx.resume();
      }
      const buffer = silentAudioCtx.createBuffer(1, 1, 22050);
      const source = silentAudioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(silentAudioCtx.destination);
      source.start(0);
    } catch (e) {
      console.warn("Audio unlock note:", e);
    }
  };

  document.addEventListener('touchstart', unlock, { once: false });
  document.addEventListener('click', unlock, { once: false });
}

function preloadSpeechVoices() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.getVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }
}

function unlockMobileAudio() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.resume();
  }
  if (silentAudioCtx && silentAudioCtx.state === 'suspended') {
    silentAudioCtx.resume();
  }
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

// Step Controller (Step 1 ~ 4)
function setStep(stepNum) {
  currentStep = stepNum;

  // Stepper Visual Accent
  stepBtns.forEach((btn, i) => {
    btn.classList.toggle('active', i + 1 === currentStep);
  });

  englishText.classList.remove('reading-mode');
  micMeterContainer.style.display = 'none';

  // Button Visibility Controls
  playTtsBtn.style.display = 'none';
  recordBtn.style.display = 'none';
  playRecordBtn.style.display = 'none';
  completeStepBtn.style.display = 'none';

  switch (currentStep) {
    case 1:
      stepInstruction.textContent = "Step 1: [🔊 원어민 음성 듣기] 버튼을 눌러 발음을 확인하세요.";
      playTtsBtn.style.display = 'inline-flex';
      playTtsBtn.innerHTML = '🔊 원어민 음성 듣기';
      setAudioStatus('원어민 재생 준비 완료');
      stopMicMeter();
      break;

    case 2:
      stepInstruction.textContent = "Step 2: 큼직해진 문장을 읽으며 [🎙️ 낭독 녹음 시작]을 누르세요.";
      englishText.classList.add('reading-mode');
      recordBtn.style.display = 'inline-flex';
      micMeterContainer.style.display = 'flex';
      
      if (isRecording) {
        recordBtn.innerHTML = '⏹️ 녹음 중지 & 저장';
        recordBtn.classList.add('recording');
      } else {
        recordBtn.innerHTML = '🎙️ 낭독 녹음 시작';
        recordBtn.classList.remove('recording');
      }
      setAudioStatus(isRecording ? `🔴 낭독 녹음 중... [${formatTime(recordSeconds)}]` : '마이크 녹음 준비 완료');
      break;

    case 3:
      stepInstruction.textContent = "Step 3: 내가 녹음한 목소리를 들어보고 발음을 점검하세요.";
      playRecordBtn.style.display = 'inline-flex';
      playTtsBtn.style.display = 'inline-flex';
      playTtsBtn.innerHTML = '🔊 원어민 소리 다시 듣기';
      stopMicMeter();

      const hasRecord = !!recordedAudioUrls[currentIndex];
      playRecordBtn.disabled = !hasRecord;
      setAudioStatus(hasRecord ? '내 녹음 음성 재생 가능' : '녹음된 음성이 없습니다. Step 2에서 녹음해주세요.');
      break;

    case 4:
      stepInstruction.textContent = "Step 4: 원어민 발음과 비교해보고 [✅ 완료 & 다음 절 이동]을 누르세요.";
      playTtsBtn.style.display = 'inline-flex';
      playRecordBtn.style.display = 'inline-flex';
      completeStepBtn.style.display = 'inline-flex';
      playRecordBtn.disabled = !recordedAudioUrls[currentIndex];
      stopMicMeter();
      setAudioStatus('절 학습 마무리 단계');
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

// 1. Mobile & Desktop Native TTS Speech Synthesis
function playTts() {
  unlockMobileAudio();

  if (!('speechSynthesis' in window)) {
    alert('이 브라우저는 원어민 음성 합성(TTS)을 지원하지 않습니다.');
    return;
  }

  const data = romans8Verses[currentIndex];
  setAudioStatus('🔊 원어민 음성 낭독 중...');
  playTtsBtn.disabled = true;

  try {
    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();

    // Store in window.currentUtterance to prevent Mobile JS Garbage Collection mid-speech
    window.currentUtterance = new SpeechSynthesisUtterance(data.text);
    window.currentUtterance.lang = 'en-US';
    window.currentUtterance.volume = 1.0;
    window.currentUtterance.pitch = 1.0;
    window.currentUtterance.rate = parseFloat(speedSelect.value) || 1.0;

    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const enVoice = voices.find(v => (v.lang === 'en-US' || v.lang === 'en-GB' || v.lang.startsWith('en')) && v.localService) ||
                      voices.find(v => v.lang === 'en-US' || v.lang === 'en-GB' || v.lang.startsWith('en'));
      if (enVoice) {
        window.currentUtterance.voice = enVoice;
      }
    }

    window.currentUtterance.onstart = () => {
      setAudioStatus('🔊 원어민 음성 낭독 중...');
    };

    window.currentUtterance.onend = () => {
      setAudioStatus('원어민 재생 완료');
      playTtsBtn.disabled = false;
      if (currentStep === 1) {
        setTimeout(() => setStep(2), 400);
      }
    };

    window.currentUtterance.onerror = (e) => {
      console.warn("TTS Error event:", e);
      setAudioStatus('원어민 재생 완료');
      playTtsBtn.disabled = false;
    };

    setTimeout(() => {
      window.speechSynthesis.resume();
      window.speechSynthesis.speak(window.currentUtterance);
    }, 100);

  } catch (err) {
    console.error("TTS Exception:", err);
    setAudioStatus('재생 처리 중');
    playTtsBtn.disabled = false;
  }
}

// Real-time Mic Meter (Mobile & Desktop)
async function startMicMeter(stream) {
  stopMicMeter();
  try {
    meterAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (meterAudioCtx.state === 'suspended') {
      await meterAudioCtx.resume();
    }
    const source = meterAudioCtx.createMediaStreamSource(stream);
    meterAnalyser = meterAudioCtx.createAnalyser();
    meterAnalyser.fftSize = 256;
    source.connect(meterAnalyser);

    const bufferLength = meterAnalyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function updateMeter() {
      if (!meterAnalyser) return;
      meterAnalyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const avg = sum / bufferLength;
      const volPercent = Math.min(100, Math.round((avg / 128) * 100));

      micMeterFill.style.width = `${volPercent}%`;
      micVolText.textContent = `${volPercent}%`;

      meterAnimFrame = requestAnimationFrame(updateMeter);
    }

    updateMeter();
  } catch (err) {
    console.warn("Mic meter error:", err);
  }
}

function stopMicMeter() {
  if (meterAnimFrame) cancelAnimationFrame(meterAnimFrame);
  if (meterAudioCtx && meterAudioCtx.state !== 'closed') {
    meterAudioCtx.close();
  }
  meterAudioCtx = null;
  meterAnalyser = null;
  micMeterFill.style.width = '0%';
  micVolText.textContent = '0%';
}

// 2. Microphone Recording
async function toggleRecording() {
  unlockMobileAudio();

  if (!isRecording) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunks = [];

      let mimeType = '';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) mimeType = 'audio/webm;codecs=opus';
      else if (MediaRecorder.isTypeSupported('audio/mp4')) mimeType = 'audio/mp4';
      else if (MediaRecorder.isTypeSupported('audio/aac')) mimeType = 'audio/aac';
      else if (MediaRecorder.isTypeSupported('audio/webm')) mimeType = 'audio/webm';

      const options = mimeType ? { mimeType } : {};
      mediaRecorder = new MediaRecorder(stream, options);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        clearInterval(recordTimerInterval);
        stopMicMeter();

        const blobType = mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunks, { type: blobType });

        if (audioBlob.size === 0) {
          alert('녹음된 음성이 없습니다. 마이크 허용 권한을 확인해주세요.');
          setAudioStatus('녹음 실패');
          return;
        }

        if (recordedAudioUrls[currentIndex]) {
          URL.revokeObjectURL(recordedAudioUrls[currentIndex]);
        }
        recordedAudioUrls[currentIndex] = URL.createObjectURL(audioBlob);

        stream.getTracks().forEach(track => track.stop());

        const sizeKb = Math.round(audioBlob.size / 1024);
        setAudioStatus(`녹음 완료 (${sizeKb} KB 저장됨)`);
        setTimeout(() => setStep(3), 500);
      };

      mediaRecorder.start(200);
      isRecording = true;
      recordSeconds = 0;

      startMicMeter(stream);

      recordTimerInterval = setInterval(() => {
        recordSeconds++;
        setAudioStatus(`🔴 낭독 녹음 중... [${formatTime(recordSeconds)}]`);
      }, 1000);

      setStep(2);

    } catch (err) {
      alert('마이크 접근에 실패했거나 권한이 차단되었습니다. 주소창 권한 설정을 확인하세요.');
      console.error(err);
      setAudioStatus('마이크 연결 실패');
    }
  } else {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    isRecording = false;
    setStep(2);
  }
}

// 3. Play User Recording
function playUserRecording() {
  unlockMobileAudio();

  const url = recordedAudioUrls[currentIndex];
  if (!url) {
    alert('녹음된 음성이 없습니다. Step 2에서 먼저 녹음해 주세요.');
    return;
  }

  if (recordedAudio) {
    recordedAudio.pause();
    recordedAudio = null;
  }

  recordedAudio = new Audio(url);
  recordedAudio.volume = 1.0;

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
    alert('녹음 음성 재생에 실패했습니다.');
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

// Setup Event Listeners
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
}

// Launch App
document.addEventListener('DOMContentLoaded', init);
