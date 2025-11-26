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
            updateMonsterCharacter('anger.png'); // 怪兽生气
            return;
        }

        const fullUrl = apis[currentApi] + url;
        videoPlayer.src = fullUrl;
        videoPlayer.classList.add('active');
        standbyScreen.style.display = 'none';

        addToHistory(url);
        showToast('正在吞噬视频... 嗝~');
        updateMonsterCharacter('eat-video.png'); // 怪兽吃视频
        feedMonster();
    });

    // Cinema Mode
    cinemaToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const knob = cinemaToggle.querySelector('.switch-knob');
        if (document.body.classList.contains('dark-mode')) {
            knob.textContent = '🌙';
            showToast('嘘... 关灯睡觉觉...');
            updateMonsterCharacter('sleep.png'); // 怪兽睡觉
        } else {
            knob.textContent = '💡';
            showToast('天亮了！起床找吃的！');
            updateMonsterCharacter('happy.png'); // 怪兽醒来
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

    // --- Hunger & Mood Logic ---
    let hunger = 80; // 0-100
    let lastFed = Date.now();
    const hungerBar = document.getElementById('hunger-bar');
    const moodDisplay = document.getElementById('mood-display');
    const lastFedDisplay = document.getElementById('last-fed-time');

    function updateStatus() {
        // Decrease hunger over time
        const now = Date.now();
        const diff = (now - lastFed) / 1000 / 60; // minutes

        // Update UI
        hungerBar.style.width = `${hunger}%`;

        // 检查是否处于深色模式（睡觉状态）
        if (document.body.classList.contains('dark-mode')) {
            // 深色模式下不改变怪兽状态，保持睡觉
            const secondsAgo = Math.floor((now - lastFed) / 1000);
            if (secondsAgo < 60) {
                lastFedDisplay.textContent = '刚刚';
            } else if (secondsAgo < 3600) {
                lastFedDisplay.textContent = `${Math.floor(secondsAgo / 60)}分钟前`;
            } else {
                lastFedDisplay.textContent = '很久以前';
            }
            return;
        }

        let monsterImage = 'happy.png'; // default image

        if (hunger > 80) {
            hungerBar.style.background = 'linear-gradient(90deg, #4ECDC4, #2ecc71)';
            moodDisplay.textContent = '😋 超满足';
            monsterImage = 'happy.png';
        } else if (hunger > 50) {
            hungerBar.style.background = 'linear-gradient(90deg, #FF6B6B, #FFC300)';
            moodDisplay.textContent = '😐 还可以';
            monsterImage = 'doubt.png';
        } else if (hunger > 20) {
            hungerBar.style.background = 'linear-gradient(90deg, #e67e22, #d35400)';
            moodDisplay.textContent = '🤤 馋了';
            monsterImage = 'eat-video.png';
        } else if (hunger > 10) {
            hungerBar.style.background = 'linear-gradient(90deg, #c0392b, #e74c3c)';
            moodDisplay.textContent = '😫 饿扁了';
            monsterImage = 'anger.png';
        } else {
            // 饥饿值极低，怪兽生病
            hungerBar.style.background = 'linear-gradient(90deg, #95a5a6, #7f8c8d)';
            moodDisplay.textContent = '🤢 生病了';
            monsterImage = 'ill.png';
        }

        // Update monster character image
        updateMonsterCharacter(monsterImage);

        // Update time text
        const secondsAgo = Math.floor((now - lastFed) / 1000);
        if (secondsAgo < 60) {
            lastFedDisplay.textContent = '刚刚';
        } else if (secondsAgo < 3600) {
            lastFedDisplay.textContent = `${Math.floor(secondsAgo / 60)}分钟前`;
        } else {
            lastFedDisplay.textContent = '很久以前';
        }
    }

    // Update monster character image
    function updateMonsterCharacter(imageName) {
        const monsterCharacter = document.getElementById('monster-character');
        if (monsterCharacter) {
            monsterCharacter.src = `picture/${imageName}`;
        }
    }

    // Loop to decrease hunger
    setInterval(() => {
        if (hunger > 0) {
            hunger--;
            updateStatus();
        }
    }, 5000); // Decrease every 5 seconds for demo

    function feedMonster() {
        hunger = Math.min(100, hunger + 30);
        lastFed = Date.now();
        updateStatus();

        // Happy animation
        monsterMouth.classList.add('eating');
        setTimeout(() => monsterMouth.classList.remove('eating'), 1000);
    }

    // --- Rock Paper Scissors Game ---
    const rpsButtons = document.querySelectorAll('.rps-btn');
    const rpsResult = document.getElementById('rps-result');

    if (rpsButtons.length > 0) {
        const choices = ['rock', 'paper', 'scissors'];
        const emojis = { rock: '✊', paper: '✋', scissors: '✌️' };

        let wins = 0;
        let losses = 0;
        let ties = 0;

        function getWinner(player, monster) {
            if (player === monster) return 'tie';
            if (
                (player === 'rock' && monster === 'scissors') ||
                (player === 'paper' && monster === 'rock') ||
                (player === 'scissors' && monster === 'paper')
            ) {
                return 'win';
            }
            return 'lose';
        }

        rpsButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const playerChoice = btn.getAttribute('data-choice');
                const monsterChoice = choices[Math.floor(Math.random() * choices.length)];
                const result = getWinner(playerChoice, monsterChoice);

                // Animate button
                btn.style.transform = 'scale(1.2)';
                setTimeout(() => btn.style.transform = 'scale(1)', 200);

                // Display result
                let message = '';
                if (result === 'win') {
                    wins++;
                    hunger = Math.min(100, hunger + 10);
                    message = `🎉 你${emojis[playerChoice]} VS 怪兽${emojis[monsterChoice]} - 你赢了！`;
                    showToast('哇！你赢了！怪兽请你吃零食！(+10)');
                    updateMonsterCharacter('happy.png'); // 怪兽开心
                } else if (result === 'lose') {
                    losses++;
                    hunger = Math.max(0, hunger - 5);
                    message = `😢 你${emojis[playerChoice]} VS 怪兽${emojis[monsterChoice]} - 你输了！`;
                    showToast('呜呜...输了...怪兽要吃你的零食...(-5)');
                    updateMonsterCharacter('doubt.png'); // 怪兽疑惑
                } else {
                    ties++;
                    message = `🤝 你${emojis[playerChoice]} VS 怪兽${emojis[monsterChoice]} - 平局！`;
                    showToast('平局！再战！');
                }

                rpsResult.textContent = message;
                updateStatus();

                if ((wins + losses + ties) % 5 === 0 && wins + losses + ties > 0) {
                    setTimeout(() => {
                        showToast(`战绩: ${wins}胜 ${losses}败 ${ties}平`);
                    }, 1500);
                }
            });
        });
    }

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
