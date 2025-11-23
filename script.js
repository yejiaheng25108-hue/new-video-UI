document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const videoUrlInput = document.getElementById('video-url');
    const monsterMouth = document.querySelector('.monster-mouth');
    const playBtn = document.getElementById('play-btn');
    const videoPlayer = document.getElementById('video-player');
    const standbyScreen = document.querySelector('.standby-screen');
    const sourceToggle = document.getElementById('source-toggle');
    const sourceIcon = sourceToggle.querySelector('.icon');
    const labelLeft = sourceToggle.querySelector('.label-left');
    const labelRight = sourceToggle.querySelector('.label-right');
    const cinemaToggle = document.getElementById('cinema-toggle');
    const pasteBtn = document.getElementById('paste-btn');
    const clearBtn = document.getElementById('clear-btn');
    const historyList = document.getElementById('history-list');
    const toast = document.getElementById('monster-toast');
    const toastMessage = toast.querySelector('.toast-message');

    // State
    let currentApi = 'xm'; // 'xm' or 'xy'
    const apis = {
        xm: 'https://jx.xmflv.com/?url=',
        xy: 'https://jx.xymp4.cc/?url='
    };

    // --- Helper Functions ---
    function showToast(msg) {
        toastMessage.textContent = msg;
        toast.classList.remove('hidden');
        // Reset animation
        toast.style.animation = 'none';
        toast.offsetHeight; /* trigger reflow */
        toast.style.animation = null;

        // Clear previous timeout if exists
        if (toast.timeoutId) clearTimeout(toast.timeoutId);

        toast.timeoutId = setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    }

    // --- Interaction Logic ---

    // Input Handling
    videoUrlInput.addEventListener('input', () => {
        monsterMouth.classList.add('eating');
        setTimeout(() => monsterMouth.classList.remove('eating'), 500);
    });

    videoUrlInput.addEventListener('focus', () => {
        monsterMouth.classList.add('focused');
    });

    videoUrlInput.addEventListener('blur', () => {
        monsterMouth.classList.remove('focused');
    });

    // Source Toggle Logic
    sourceToggle.addEventListener('click', () => {
        sourceToggle.classList.toggle('toggled');
        if (sourceToggle.classList.contains('toggled')) {
            currentApi = 'xy';
            sourceIcon.textContent = '🐟';
            labelLeft.classList.remove('active');
            labelRight.classList.add('active');
            showToast('已切换到咸鱼口味！咸咸的...');
        } else {
            currentApi = 'xm';
            sourceIcon.textContent = '🦐';
            labelLeft.classList.add('active');
            labelRight.classList.remove('active');
            showToast('已切换到虾米口味！鲜鲜的...');
        }
    });

    // Play Logic
    playBtn.addEventListener('click', () => {
        const url = videoUrlInput.value.trim();
        if (!url) {
            // Shake effect
            monsterMouth.style.transform = 'translateX(10px)';
            setTimeout(() => monsterMouth.style.transform = 'translateX(-10px)', 50);
            setTimeout(() => monsterMouth.style.transform = 'translateX(0)', 100);
            showToast('喂！嘴巴是空的！给我视频！');
            return;
        }

        const fullUrl = apis[currentApi] + url;
        videoPlayer.src = fullUrl;
        videoPlayer.classList.add('active');
        standbyScreen.style.display = 'none';

        addToHistory(url);
        showToast('正在吞噬视频... 嗝~');
    });

    // Cinema Mode
    cinemaToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const knob = cinemaToggle.querySelector('.switch-knob');
        if (document.body.classList.contains('dark-mode')) {
            knob.textContent = '🌙';
            showToast('嘘... 关灯睡觉觉...');
        } else {
            knob.textContent = '💡';
            showToast('天亮了！起床找吃的！');
        }
    });

    // Paste & Clear
    pasteBtn.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) {
                videoUrlInput.value = text;
                monsterMouth.classList.add('eating');
                setTimeout(() => monsterMouth.classList.remove('eating'), 500);
                showToast('啊呜！吃掉剪贴板的内容了！');
            } else {
                showToast('剪贴板是空的... 没东西吃...');
            }
        } catch (err) {
            console.error('Failed to read clipboard', err);
            showToast('我看不到你的剪贴板... 你自己喂我吧！');
            videoUrlInput.focus();
        }
    });

    clearBtn.addEventListener('click', () => {
        videoUrlInput.value = '';
        showToast('呸！吐干净了！再来点新的！');
    });

    // --- History Logic ---
    function loadHistory() {
        const history = JSON.parse(localStorage.getItem('videoHistory') || '[]');
        historyList.innerHTML = '';
        history.forEach(item => {
            const li = document.createElement('li');
            li.className = 'history-item';
            li.innerHTML = `
                <span class="history-url">${item.url.substring(0, 30)}...</span>
                <span class="history-time">${new Date(item.timestamp).toLocaleTimeString()}</span>
            `;
            li.addEventListener('click', () => {
                videoUrlInput.value = item.url;
                playBtn.click();
            });
            historyList.appendChild(li);
        });
    }

    function addToHistory(url) {
        const history = JSON.parse(localStorage.getItem('videoHistory') || '[]');
        // Remove duplicate if exists
        const newHistory = history.filter(item => item.url !== url);
        newHistory.unshift({ url, timestamp: Date.now() });
        // Keep last 10
        if (newHistory.length > 10) newHistory.pop();
        localStorage.setItem('videoHistory', JSON.stringify(newHistory));
        loadHistory();
    }

    loadHistory();

    // --- Parallax Effect ---
    document.addEventListener('mousemove', (e) => {
        const x = (window.innerWidth - e.pageX * 2) / 100;
        const y = (window.innerHeight - e.pageY * 2) / 100;

        document.querySelectorAll('.parallax-layer').forEach(layer => {
            const depth = layer.getAttribute('data-depth');
            const moveX = x * depth * 20;
            const moveY = y * depth * 20;
            layer.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });

        // Eye tracking
        const eyes = document.querySelectorAll('.pupil');
        eyes.forEach(pupil => {
            const eye = pupil.parentElement;
            const rect = eye.getBoundingClientRect();
            const eyeX = rect.left + rect.width / 2;
            const eyeY = rect.top + rect.height / 2;
            const angle = Math.atan2(e.pageY - eyeY, e.pageX - eyeX);
            const dist = Math.min(5, Math.hypot(e.pageX - eyeX, e.pageY - eyeY) / 20);
            pupil.style.transform = `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px) translate(-50%, -50%)`;
        });
    });
});
