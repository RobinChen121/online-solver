(function () {
  "use strict";

  // ---- Configuration ----
  const NUM_COLS = 10;
  const NUM_ROWS = 20;
  const CELL_SIZE = 25; // canvas sized 250x500 accordingly
  const TICK_MS_BASE = 900; // base fall speed at level 1
  const LEVEL_DROP_FACTOR = 0.85; // each level speeds up

  // 闪烁动画配置
  const FLASH_DURATION = 800; // 闪烁持续时间（毫秒）
  const FLASH_INTERVAL = 150; // 闪烁间隔（毫秒）

  // Audio configuration
  const BACKGROUND_MUSIC_URL = "https://cdn.pixabay.com/download/audio/2025/05/31/audio_97f05d40b9.mp3?filename=playground-352381.mp3";
  const ROTATE_SOUND_URL = "https://cdn.freesound.org/sounds/344/344305-770684cb-d372-4320-a7bb-1268d80e29a0?filename=344305__musiclegends__jump14.wav";
  const LOCK_SOUND_URL = "https://cdn.pixabay.com/download/audio/2024/09/13/audio_3c601ae16d.mp3?filename=orchestra-hit-240475.mp3";
  const LINE_CLEAR_SOUND_URL = "https://cdn.pixabay.com/download/audio/2025/02/25/audio_6db808ed2b.mp3?filename=glass-break-305771.mp3";

  // Ghost display configuration
  let isGhostEnabled = false; // 默认关闭 ghost 显示

  const SCORE_SINGLE = 100;
  const SCORE_DOUBLE = 300;
  const SCORE_TRIPLE = 500;
  const SCORE_TETRIS = 800;

  /** Available colors for tetrominoes */
  const AVAILABLE_COLORS = [
    "#00CCCC",    // 青色暗20% (CYAN)
    "#CCAC00",    // 金黄色暗20% (YELLOW)
    "#9444A9",    // 紫色暗20% (PURPLE)
    "#63CA00",    // 草绿色暗20% (GREEN)
    "#CC4F39",    // 番茄红暗20% (RED)
    "#6CA4BC",    // 天蓝色暗20% (BLUE)
    "#666666",    // 灰色暗20% (GRAY)
    "#CCCCCC",    // 白色暗20% (WHITE)
  ];

  /** Colors for tetromino types - now randomly assigned */
  const COLOR_MAP = {};

  /** Tetromino rotation states (4x4 matrices) */
  const SHAPES = {
    I: [
      [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      [
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0],
      ],
      [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
      ],
      [
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
      ],
    ],
    O: [
      [
        [0, 1, 1, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      // O rotations are all the same
      [
        [0, 1, 1, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      [
        [0, 1, 1, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      [
        [0, 1, 1, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
    ],
    T: [
      [
        [0, 1, 0, 0],
        [1, 1, 1, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      [
        [0, 1, 0, 0],
        [0, 1, 1, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 0],
      ],
      [
        [0, 0, 0, 0],
        [1, 1, 1, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 0],
      ],
      [
        [0, 1, 0, 0],
        [1, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 0],
      ],
    ],
    S: [
      [
        [0, 1, 1, 0],
        [1, 1, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      [
        [0, 1, 0, 0],
        [0, 1, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 0],
      ],
      [
        [0, 0, 0, 0],
        [0, 1, 1, 0],
        [1, 1, 0, 0],
        [0, 0, 0, 0],
      ],
      [
        [1, 0, 0, 0],
        [1, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 0],
      ],
    ],
    Z: [
      [
        [1, 1, 0, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      [
        [0, 0, 1, 0],
        [0, 1, 1, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 0],
      ],
      [
        [0, 0, 0, 0],
        [1, 1, 0, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0],
      ],
      [
        [0, 1, 0, 0],
        [1, 1, 0, 0],
        [1, 0, 0, 0],
        [0, 0, 0, 0],
      ],
    ],
    J: [
      [
        [1, 0, 0, 0],
        [1, 1, 1, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      [
        [0, 1, 1, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 0],
      ],
      [
        [0, 0, 0, 0],
        [1, 1, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 0],
      ],
      [
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [1, 1, 0, 0],
        [0, 0, 0, 0],
      ],
    ],
    L: [
      [
        [0, 0, 1, 0],
        [1, 1, 1, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      [
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0],
      ],
      [
        [0, 0, 0, 0],
        [1, 1, 1, 0],
        [1, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      [
        [1, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 0],
      ],
    ],
  };

  const PIECE_TYPES = Object.keys(SHAPES);

  // ---- Helpers ----
  function assignRandomColors() {
    // 为每种方块类型随机分配颜色
    PIECE_TYPES.forEach(type => {
      const randomIndex = Math.floor(Math.random() * AVAILABLE_COLORS.length);
      COLOR_MAP[type] = AVAILABLE_COLORS[randomIndex];
    });
    // 为幽灵方块分配颜色
    COLOR_MAP.GHOST = "#CCCCCC";
  }

  function createEmptyBoard() {
    return Array.from({ length: NUM_ROWS }, () => Array(NUM_COLS).fill(null));
  }

  function getRandomPieceType(bag) {
    if (bag.length === 0) {
      bag.push(...PIECE_TYPES);
      // Fisher-Yates shuffle
      for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [bag[i], bag[j]] = [bag[j], bag[i]];
      }
    }
    return bag.pop();
  }

  function cloneMatrix(matrix) {
    return matrix.map((row) => row.slice());
  }

  function canPlace(board, matrix, posX, posY) {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (!matrix[r][c]) continue;
        const x = posX + c;
        const y = posY + r;

        // 检查左右边界
        if (x < 0 || x >= NUM_COLS) return false;

        // 检查底部边界
        if (y >= NUM_ROWS) return false;

        // 检查是否与已固定的方块重叠（只检查在游戏区域内的位置）
        // 在闪烁期间，忽略闪烁行的碰撞检测
        if (y >= 0 && board[y][x] && (!isFlashing || !flashingRows.includes(y))) return false;
      }
    }
    return true;
  }

  function mergePiece(board, matrix, posX, posY, type) {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (!matrix[r][c]) continue;
        const x = posX + c;
        const y = posY + r;
        // 在闪烁期间，不将方块合并到闪烁的行中
        if (y >= 0 && (!isFlashing || !flashingRows.includes(y))) {
          board[y][x] = type;
        }
      }
    }
  }

  function clearLines(board) {
    let cleared = 0;
    let rowsToClear = [];

    // 找出需要清除的行
    for (let r = NUM_ROWS - 1; r >= 0; r--) {
      if (board[r].every((cell) => cell)) {
        rowsToClear.push(r);
        cleared++;
      }
    }

    // 如果有行需要清除，开始闪烁动画
    if (cleared > 0) {
      startFlashAnimation(rowsToClear);
    }

    return cleared;
  }

  function rotationKick(board, piece, dir) {
    const rotatedIndex = (piece.rot + dir + 4) % 4;
    const rotated = SHAPES[piece.type][rotatedIndex];
    const kicks = [
      { x: 0, y: 0 },
      { x: -1, y: 0 },
      { x: 1, y: 0 },
      { x: -2, y: 0 },
      { x: 2, y: 0 },
      { x: 0, y: -1 },
    ];
    for (const k of kicks) {
      if (canPlace(board, rotated, piece.x + k.x, piece.y + k.y)) {
        piece.rot = rotatedIndex;
        piece.matrix = rotated;
        piece.x += k.x;
        piece.y += k.y;
        return true;
      }
    }
    return false;
  }

  function getGhostY(board, piece) {
    if (!piece || !piece.matrix) return piece.y;

    let y = piece.y;
    // 简单的垂直下落，找到最底部的可行位置
    while (y < NUM_ROWS - 1) {
      if (!canPlace(board, piece.matrix, piece.x, y + 1)) {
        break;
      }
      y++;
    }

    // 更新 ghost 的坐标
    piece.ghostX = piece.x;
    piece.ghostY = y;

    return y;
  }







  // 更新 ghost 位置的函数
  function updateGhostPosition() {
    if (current && isGhostEnabled) {
      getGhostY(board, current);
    }
  }















  // ---- High Score Functions ----
  // 加载最高分
  function loadHighScore() {
    // 首先尝试从localStorage加载（作为主要存储）
    try {
      const savedHighScore = localStorage.getItem('tetrisHighScore');
      if (savedHighScore !== null) {
        highScore = parseInt(savedHighScore);
        updateHighScoreDisplay();
        console.log('High score loaded from localStorage:', highScore);
        return; // 如果localStorage有数据，直接返回
      }
    } catch (error) {
      console.error('Failed to load high score from localStorage:', error);
    }

    // 如果localStorage没有数据，尝试从服务器JSON文件加载
    fetch('/assets/highscore.json')
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Failed to load high score file');
      })
      .then(data => {
        if (data && typeof data.highScore === 'number') {
          highScore = data.highScore;
          updateHighScoreDisplay();
          // 同时保存到localStorage作为备份
          try {
            localStorage.setItem('tetrisHighScore', highScore.toString());
          } catch (error) {
            console.error('Failed to save high score to localStorage:', error);
          }
          console.log('High score loaded from server:', highScore);
        }
      })
      .catch(error => {
        console.log('No existing high score file found, starting with 0');
        // 如果文件不存在或加载失败，使用默认值0
        highScore = 0;
        updateHighScoreDisplay();
      });
  }

  // 保存最高分
  function saveHighScore() {
    // 优先保存到localStorage（作为主要存储）
    try {
      localStorage.setItem('tetrisHighScore', highScore.toString());
      console.log('High score saved to localStorage:', highScore);
    } catch (error) {
      console.error('Failed to save high score to localStorage:', error);
    }

    // 准备服务器端保存的数据（为将来的服务器端实现做准备）
    const scoreData = {
      highScore: highScore,
      lastUpdated: new Date().toISOString()
    };

    // 注意：由于浏览器安全限制，无法直接写入服务器文件
    // 这里我们使用fetch发送POST请求到服务器端点
    // 您需要在服务器端实现相应的API端点来处理分数保存

    console.log('High score data prepared for server:', scoreData);
  }

  // 更新最高分显示
  function updateHighScoreDisplay() {
    const highScoreElement = document.getElementById("high-score");
    if (highScoreElement) {
      highScoreElement.textContent = String(highScore);
    }
  }

  // 检查并更新最高分
  function checkAndUpdateHighScore() {
    if (score > highScore) {
      highScore = score;
      updateHighScoreDisplay();
      saveHighScore();

      // 显示新纪录提示
      showNewRecordNotification();
    }
  }

  // 显示新纪录提示
  function showNewRecordNotification() {
    // 创建新纪录提示元素
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(135deg, #4CAF50, #45a049);
      color: white;
      padding: 20px 30px;
      border-radius: 10px;
      font-size: 18px;
      font-weight: bold;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      z-index: 1000;
      animation: fadeInOut 2s ease-in-out;
    `;
    notification.textContent = '🎉 新纪录！🎉';

    // 添加动画样式
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeInOut {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        20% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
        80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // 2秒后自动移除
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 2000);
  }



  // 显示通知消息
  function showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? 'linear-gradient(135deg, #4CAF50, #45a049)' :
        type === 'error' ? 'linear-gradient(135deg, #f44336, #d32f2f)' :
          'linear-gradient(135deg, #2196F3, #1976D2)'};
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: bold;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      z-index: 1000;
      animation: slideInRight 0.3s ease-out;
      max-width: 300px;
      word-wrap: break-word;
    `;
    notification.textContent = message;

    // 添加动画样式
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // 3秒后自动移除
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  }

  // ---- Audio Functions ----
  function initAudio() {
    try {
      // 初始化背景音乐
      backgroundMusic = new Audio(BACKGROUND_MUSIC_URL);
      backgroundMusic.loop = true;
      backgroundMusic.volume = musicVolume;
      backgroundMusic.preload = "auto";

      // 初始化旋转音效
      rotateSound = new Audio(ROTATE_SOUND_URL);
      rotateSound.volume = soundVolume;
      rotateSound.preload = "auto";

      // 初始化砖砌音效
      lockSound = new Audio(LOCK_SOUND_URL);
      lockSound.volume = soundVolume;
      lockSound.preload = "auto";

      // 初始化线条清除音效
      lineClearSound = new Audio(LINE_CLEAR_SOUND_URL);
      lineClearSound.volume = soundVolume;
      lineClearSound.preload = "auto";

      // 移除自动播放音乐的监听器 - 音乐只在游戏开始时播放
      // document.addEventListener('click', function startMusic() {
      //   if (backgroundMusic && isMusicEnabled) {
      //     backgroundMusic.play().catch(e => console.log('Music autoplay failed:', e));
      //   }
      //   document.removeEventListener('click', startMusic);
      // }, { once: true });

      console.log('Audio initialized successfully');
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  }

  function toggleMusic() {
    if (!backgroundMusic) return;

    isMusicEnabled = !isMusicEnabled;
    if (isMusicEnabled) {
      backgroundMusic.play().catch(e => console.log('Music play failed:', e));
    } else {
      backgroundMusic.pause();
    }

    // 更新按钮文本
    const musicBtn = document.getElementById("btn-music");
    if (musicBtn) {
      musicBtn.textContent = isMusicEnabled ? "🔊 Music ON" : "🔇 Music OFF";
    }
  }

  function setMusicVolume(volume) {
    musicVolume = Math.max(0, Math.min(1, volume));
    if (backgroundMusic) {
      backgroundMusic.volume = musicVolume;
    }
  }

  function playRotateSound() {
    if (!rotateSound) return;

    try {
      // 重置音效到开始位置，以便连续播放
      rotateSound.currentTime = 0;
      rotateSound.play().catch(e => console.log('Rotate sound play failed:', e));
    } catch (error) {
      console.error('Failed to play rotate sound:', error);
    }
  }

  function playLockSound() {
    if (!lockSound) return;

    try {
      // 重置音效到开始位置，以便连续播放
      lockSound.currentTime = 0;
      lockSound.play().catch(e => console.log('Lock sound play failed:', e));
    } catch (error) {
      console.error('Failed to play lock sound:', error);
    }
  }

  function playLineClearSound() {
    if (!lineClearSound) return;

    try {
      // 重置音效到开始位置，以便连续播放
      lineClearSound.currentTime = 0;
      lineClearSound.play().catch(e => console.log('Line clear sound play failed:', e));
    } catch (error) {
      console.error('Failed to play line clear sound:', error);
    }
  }

  function toggleGhost() {
    isGhostEnabled = !isGhostEnabled;

    // 更新按钮文本
    const ghostBtn = document.getElementById("btn-ghost");
    if (ghostBtn) {
      ghostBtn.textContent = isGhostEnabled ? "🎯 Land Hint ON" : "🎯 Land Hint OFF";
    }

    // 如果开启ghost，立即更新位置
    if (isGhostEnabled && current) {
      updateGhostPosition();
    }

    // 重新绘制游戏画面以立即显示/隐藏 ghost
    if (isStarted && !isPaused) {
      draw();
    }
  }

  function startFlashAnimation(rows) {
    flashingRows = rows;
    flashStartTime = performance.now();
    isFlashing = true;

    // 开始闪烁动画循环
    flashAnimation();
  }

  function flashAnimation() {
    if (!isFlashing) return;

    const currentTime = performance.now();
    const elapsed = currentTime - flashStartTime;

    if (elapsed >= FLASH_DURATION) {
      // 闪烁结束，实际删除行
      finishLineClear();
      return;
    }

    // 继续闪烁动画
    requestAnimationFrame(flashAnimation);
  }

  function finishLineClear() {
    // 实际删除闪烁的行
    for (let i = flashingRows.length - 1; i >= 0; i--) {
      const rowIndex = flashingRows[i];
      board.splice(rowIndex, 1);
      board.unshift(Array(NUM_COLS).fill(null));
    }

    // 重置闪烁状态
    flashingRows = [];
    isFlashing = false;

    // 生成新方块
    current = spawnPiece();
    renderSidePanels();

    // 更新ghost位置
    if (isGhostEnabled) {
      updateGhostPosition();
    }

    // 重新绘制游戏画面
    draw();
  }



  // ---- Rendering ----
  const canvas = document.getElementById("tetris");
  const nextCanvas = document.getElementById("next");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const nextCtx = nextCanvas.getContext("2d");

  function drawCell(context, x, y, color, size, isLocked = false) {
    if (isLocked) {
      // 结冰效果：使用冰蓝色调
      const iceColor = makeColorLighter(color, 0.4); // 让颜色更亮，像冰一样
      context.fillStyle = iceColor;
      context.fillRect(x, y, size, size);

      // 添加冰晶边框效果
      context.strokeStyle = "#87CEEB"; // 天蓝色边框
      context.lineWidth = 2;
      context.strokeRect(x + 0.5, y + 0.5, size - 1, size - 1);

      // 添加冰晶高光效果
      context.strokeStyle = "#E0FFFF"; // 更亮的冰蓝色高光
      context.lineWidth = 1;
      context.strokeRect(x + 1, y + 1, size - 2, size - 2);

      // 添加冰晶纹理效果
      context.strokeStyle = "#B0E0E6"; // 中等亮度的冰蓝色
      context.lineWidth = 1;
      
      // 绘制冰晶纹理线条
      const textureSpacing = size / 4;
      for (let i = 1; i < 4; i++) {
        const pos = i * textureSpacing;
        // 水平冰晶线
        context.beginPath();
        context.moveTo(x + 1, y + pos);
        context.lineTo(x + size - 1, y + pos);
        context.stroke();
        
        // 垂直冰晶线
        context.beginPath();
        context.moveTo(x + pos, y + 1);
        context.lineTo(x + pos, y + size - 1);
        context.stroke();
      }

      // 添加冰晶反光点
      context.fillStyle = "#FFFFFF";
      context.globalAlpha = 0.6;
      const dotSize = size / 8;
      context.fillRect(x + size * 0.2, y + size * 0.2, dotSize, dotSize);
      context.fillRect(x + size * 0.7, y + size * 0.7, dotSize, dotSize);
      context.globalAlpha = 1.0;
    } else {
      // 普通方块效果
      context.fillStyle = color;
      context.fillRect(x, y, size, size);
      context.strokeStyle = "#000000";
      context.lineWidth = 1;
      context.strokeRect(x + 0.5, y + 0.5, size - 1, size - 1);
    }
  }

  // 将颜色转换为更浅的版本
  function makeColorLighter(color, factor = 0.5) {
    // 解析 RGB 值
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // 计算更浅的颜色（向白色靠近）
    const newR = Math.min(255, r + (255 - r) * factor);
    const newG = Math.min(255, g + (255 - g) * factor);
    const newB = Math.min(255, b + (255 - b) * factor);

    // 转换回十六进制
    return `#${Math.round(newR).toString(16).padStart(2, '0')}${Math.round(newG).toString(16).padStart(2, '0')}${Math.round(newB).toString(16).padStart(2, '0')}`;
  }


  // 绘制只显示边框的方块（用于幽灵方块）
  function renderPieceOutline(matrix, x, y, color) {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (!matrix[r][c]) continue;
        const px = (x + c) * CELL_SIZE;
        const py = (y + r) * CELL_SIZE;
        if (py < 0) continue; // skip above top

        // 只绘制边框，不填充
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.strokeRect(px + 1, py + 1, CELL_SIZE - 2, CELL_SIZE - 2);
      }
    }
  }

  function renderBoard(board) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let r = 0; r < NUM_ROWS; r++) {
      for (let c = 0; c < NUM_COLS; c++) {
        const cell = board[r][c];
        if (cell) {
          // 检查是否在闪烁
          if (isFlashing && flashingRows.includes(r)) {
            // 闪烁效果：根据时间计算透明度
            const currentTime = performance.now();
            const elapsed = currentTime - flashStartTime;
            const flashPhase = Math.floor(elapsed / FLASH_INTERVAL) % 2;
            const alpha = flashPhase === 0 ? 0.3 : 1.0;

            ctx.save();
            ctx.globalAlpha = alpha;
            drawCell(ctx, c * CELL_SIZE, r * CELL_SIZE, COLOR_MAP[cell], CELL_SIZE, true);
            ctx.restore();
          } else {
            // 正常的方块显示
            drawCell(ctx, c * CELL_SIZE, r * CELL_SIZE, COLOR_MAP[cell], CELL_SIZE, true);
          }
        } else {
          // grid background - softer colors to match website theme
          ctx.fillStyle = "#2a3a2a"; // 深绿色背景，与网站主题呼应
          ctx.fillRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
          ctx.strokeStyle = "#3a4a3a"; // 稍亮的绿色网格线
          ctx.strokeRect(
            c * CELL_SIZE + 0.5,
            r * CELL_SIZE + 0.5,
            CELL_SIZE - 1,
            CELL_SIZE - 1
          );
        }
      }
    }
  }

  function renderPiece(matrix, x, y, type, alpha = 1) {
    ctx.save();
    ctx.globalAlpha = alpha;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (!matrix[r][c]) continue;
        const px = (x + c) * CELL_SIZE;
        const py = (y + r) * CELL_SIZE;
        if (py < 0) continue; // skip above top
        drawCell(ctx, px, py, COLOR_MAP[type], CELL_SIZE);
      }
    }
    ctx.restore();
  }

  function renderMini(context, type) {
    // Clear with the same background color as main game
    context.fillStyle = "#2a3a2a";
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);

    if (!type) return;
    const matrix = SHAPES[type][0];
    const size = 24;

    // Calculate the actual bounds of the piece
    let minRow = 4, maxRow = -1, minCol = 4, maxCol = -1;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (matrix[r][c]) {
          minRow = Math.min(minRow, r);
          maxRow = Math.max(maxRow, r);
          minCol = Math.min(minCol, c);
          maxCol = Math.max(maxCol, c);
        }
      }
    }

    // Calculate center position
    const pieceWidth = (maxCol - minCol + 1) * size;
    const pieceHeight = (maxRow - minRow + 1) * size;
    const offsetX = (context.canvas.width - pieceWidth) / 2;
    const offsetY = (context.canvas.height - pieceHeight) / 2;

    // Draw the piece centered
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (!matrix[r][c]) continue;
        const x = offsetX + (c - minCol) * size;
        const y = offsetY + (r - minRow) * size;
        drawCell(context, x, y, COLOR_MAP[type], size);
      }
    }
  }

  // ---- Game State ----
  let board = createEmptyBoard();
  let bag = [];
  let current = null;
  let nextType = null;
  let score = 0;
  let highScore = 0; // 最高分
  let lines = 0;
  let level = 1;
  let isPaused = false;
  let isStarted = false;
  let animationHandle = null;
  let lastTickAt = 0;
  let dropInterval = TICK_MS_BASE;

  // Audio state
  let backgroundMusic = null;
  let rotateSound = null;
  let lockSound = null;
  let lineClearSound = null;
  let isMusicEnabled = true;
  let musicVolume = 0.3; // 30% volume
  let soundVolume = 0.4; // 40% volume for sound effects

  // 闪烁动画状态
  let flashingRows = []; // 正在闪烁的行
  let flashStartTime = 0; // 闪烁开始时间
  let isFlashing = false; // 是否正在闪烁

  function updateDropInterval() {
    dropInterval = Math.max(80, Math.floor(TICK_MS_BASE * Math.pow(LEVEL_DROP_FACTOR, level - 1)));
  }

  function spawnPiece() {
    const type = nextType || getRandomPieceType(bag);
    nextType = getRandomPieceType(bag);
    const piece = {
      type,
      x: 3,
      y: -1, // start slightly above
      rot: 0,
      matrix: cloneMatrix(SHAPES[type][0]),
      ghostX: 3, // 初始化 ghost 的 x 坐标
      ghostY: -1, // 初始化 ghost 的 y 坐标
    };
    if (!canPlace(board, piece.matrix, piece.x, piece.y)) {
      // game over
      isPaused = true;
      cancelAnimationFrame(animationHandle);

      // 游戏结束时检查最高分
      checkAndUpdateHighScore();

      alert("游戏结束！\n当前分数：" + score + "\n最高分数：" + highScore);
      return null;
    }

    // 初始化ghost位置
    if (isGhostEnabled) {
      updateGhostPosition();
    }

    return piece;
  }

  function setScore(add) {
    score += add;
    document.getElementById("score").textContent = String(score);

    // 检查是否更新了最高分
    checkAndUpdateHighScore();
  }

  function setLines(add) {
    lines += add;
    document.getElementById("lines").textContent = String(lines);
  }

  function setLevel(newLevel) {
    level = newLevel;
    document.getElementById("level").textContent = String(level);
    updateDropInterval();
  }

  function handleLineClear(num) {
    if (num === 0) return;

    // 播放线条清除音效
    playLineClearSound();

    setLines(num);
    switch (num) {
      case 1:
        setScore(SCORE_SINGLE);
        break;
      case 2:
        setScore(SCORE_DOUBLE);
        break;
      case 3:
        setScore(SCORE_TRIPLE);
        break;
      default:
        setScore(SCORE_TETRIS);
    }
    const newLevel = 1 + Math.floor(lines / 10);
    if (newLevel !== level) setLevel(newLevel);
  }

  function hardDrop() {
    const ghostY = getGhostY(board, current);
    const dropDistance = ghostY - current.y;
    current.y = ghostY;
    // 移除硬下落得分，仅在消除方块时得分
    lockPiece();
  }

  function softDropOne() {
    if (canPlace(board, current.matrix, current.x, current.y + 1)) {
      current.y += 1;
      // 移除软下落得分，仅在消除方块时得分
    } else {
      lockPiece();
    }
  }

  function lockPiece() {
    mergePiece(board, current.matrix, current.x, current.y, current.type);
    const cleared = clearLines(board);

    if (cleared > 0) {
      // 如果清除了线条，只播放线条清除音效
      handleLineClear(cleared);
      // 闪烁期间仍然生成新方块，让游戏继续
    } else {
      // 如果没有清除线条，播放方块固定音效
      playLockSound();
    }

    // 无论是否清除线条，都生成新方块
    current = spawnPiece();
    renderSidePanels();
  }

  function renderSidePanels() {
    renderMini(nextCtx, nextType);
  }

  function togglePause() {
    if (!isStarted) {
      startGame();
      return;
    }
    isPaused = !isPaused;
    if (!isPaused) {
      lastTickAt = performance.now();
      loop(lastTickAt);
      // 恢复音乐播放
      if (backgroundMusic && isMusicEnabled) {
        backgroundMusic.play().catch(e => console.log('Music resume failed:', e));
      }
    } else {
      // 暂停音乐播放
      if (backgroundMusic) {
        backgroundMusic.pause();
      }
    }

    // 更新按钮状态
    updateButtonStates();
  }

  function startGame() {
    if (!isStarted) {
      isStarted = true;
      isPaused = false;
      lastTickAt = performance.now();
      loop(lastTickAt);
      // Update button text
      const pauseBtn = document.getElementById("btn-pause");
      if (pauseBtn) pauseBtn.textContent = "Pause/Resume";

      // 开始播放背景音乐
      if (backgroundMusic && isMusicEnabled) {
        backgroundMusic.play().catch(e => console.log('Music start failed:', e));
      }

      // 更新按钮状态
      updateButtonStates();
    }
  }



  function move(dx) {
    const nx = current.x + dx;
    if (canPlace(board, current.matrix, nx, current.y)) {
      current.x = nx;
      // 移动后立即重新计算 ghost 位置
      if (isGhostEnabled) {
        updateGhostPosition();
      }
    }
  }

  function rotate(dir) {
    const success = rotationKick(board, current, dir);
    if (success) {
      playRotateSound(); // 旋转成功时播放音效
      // 旋转后立即重新计算 ghost 位置
      if (isGhostEnabled) {
        updateGhostPosition();
      }
    }
  }

  function draw() {
    renderBoard(board);

    // 绘制 ghost 提示（预测下落位置）
    if (current && isGhostEnabled) {
      // 使用已计算的 ghost 位置，确保跟随方块移动
      const gy = current.ghostY !== undefined ? current.ghostY : current.y;
      const ghostX = current.ghostX !== undefined ? current.ghostX : current.x;

      // 只有当 ghost 位置与当前位置不同时才绘制
      if (gy !== current.y || ghostX !== current.x) {
        ctx.save();
        // 使用更浅的颜色绘制幽灵方块，只显示边框，不填充
        ctx.globalAlpha = 0.8;
        // 获取当前方块的颜色并转换为更浅的版本
        const originalColor = COLOR_MAP[current.type];
        const lighterColor = makeColorLighter(originalColor, 0.7); // 70% 更浅

        renderPieceOutline(current.matrix, ghostX, gy, lighterColor);
        ctx.restore();
      }
    }

    // 绘制当前方块
    if (current) {
      renderPiece(current.matrix, current.x, current.y, current.type);
    }
  }

  function loop(ts) {
    if (isPaused || !isStarted) return;
    const delta = ts - lastTickAt;
    if (delta >= dropInterval) {
      if (canPlace(board, current.matrix, current.x, current.y + 1)) {
        current.y += 1;
        // 方块下落后更新ghost位置
        if (isGhostEnabled) {
          updateGhostPosition();
        }
      } else {
        lockPiece();
        if (!current) return; // game over
      }
      lastTickAt = ts;
    }
    draw();
    animationHandle = requestAnimationFrame(loop);
  }

  function restart() {
    board = createEmptyBoard();
    bag = [];
    score = 0;
    lines = 0;
    setLevel(1);
    document.getElementById("score").textContent = "0";
    document.getElementById("lines").textContent = "0";

    // 注意：不重置最高分，保持历史记录

    // 重新分配随机颜色
    assignRandomColors();

    // 重新生成下一个方块类型
    nextType = getRandomPieceType(bag);

    // 重新生成当前方块，确保从顶部开始
    current = spawnPiece();

    // 重新渲染侧边栏
    renderSidePanels();

    // 更新ghost位置
    if (isGhostEnabled) {
      updateGhostPosition();
    }

    // 重置游戏状态并自动开始
    isPaused = false;
    isStarted = true;
    lastTickAt = performance.now();

    // 取消动画循环
    cancelAnimationFrame(animationHandle);

    // 重新绘制游戏画面
    draw();

    // 自动开始游戏循环
    loop(lastTickAt);

    // Update button text
    const pauseBtn = document.getElementById("btn-pause");
    if (pauseBtn) pauseBtn.textContent = "Pause/Resume";

    // 重置 ghost 按钮状态
    const ghostBtn = document.getElementById("btn-ghost");
    if (ghostBtn) ghostBtn.textContent = "🎯 Land Hint OFF";
    isGhostEnabled = false;

    // 开始播放背景音乐
    if (backgroundMusic && isMusicEnabled) {
      backgroundMusic.play().catch(e => console.log('Music start failed:', e));
    }

    // 更新按钮状态
    updateButtonStates();
  }

  // ---- Inputs ----
  window.addEventListener("keydown", (e) => {
    if (!current) return;

    // 只有 P 键在游戏未开始时可以使用
    if (e.key === "p" || e.key === "P") {
      e.preventDefault();
      togglePause();
      return;
    }

    // 其他控制键只有在游戏开始且未暂停时才能使用
    if (!isStarted || isPaused) return;

    switch (e.key) {
      case "ArrowLeft":
        e.preventDefault();
        move(-1);
        break;
      case "ArrowRight":
        e.preventDefault();
        move(1);
        break;
      case "ArrowDown":
        e.preventDefault();
        softDropOne();
        break;
      case "ArrowUp":
      case "x":
      case "X":
        e.preventDefault();
        rotate(1);
        break;
      case "z":
      case "Z":
        e.preventDefault();
        rotate(-1);
        break;
      case " ": // Space
        e.preventDefault();
        hardDrop();
        break;

      default:
        break;
    }
    draw();
  });

  // 更新按钮状态的函数
  function updateButtonStates() {
    const isActive = isStarted && !isPaused;

    // 移动控制按钮
    const leftBtn = document.getElementById("btn-left");
    const rightBtn = document.getElementById("btn-right");
    const rotateBtn = document.getElementById("btn-rotate");
    const dropBtn = document.getElementById("btn-drop");

    if (leftBtn) leftBtn.disabled = !isActive;
    if (rightBtn) rightBtn.disabled = !isActive;
    if (rotateBtn) rotateBtn.disabled = !isActive;
    if (dropBtn) dropBtn.disabled = !isActive;
  }

  function bindButton(id, handler) {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener("click", handler);
  }

  // 移动控制按钮 - 只有在游戏开始后才能使用
  bindButton("btn-left", () => {
    if (isStarted && !isPaused) {
      move(-1);
      draw();
    }
  });
  bindButton("btn-right", () => {
    if (isStarted && !isPaused) {
      move(1);
      draw();
    }
  });
  bindButton("btn-rotate", () => {
    if (isStarted && !isPaused) {
      rotate(1);
      draw();
    }
  });
  bindButton("btn-drop", () => {
    if (isStarted && !isPaused) {
      hardDrop();
      draw();
    }
  });

  // 游戏控制按钮
  bindButton("btn-pause", () => togglePause());
  bindButton("btn-restart", () => restart());
  bindButton("btn-music", () => toggleMusic());
  bindButton("btn-ghost", () => toggleGhost());



  // ---- Boot ----
  assignRandomColors(); // 随机分配颜色
  initAudio(); // 初始化音频
  loadHighScore(); // 加载最高分

  // 初始化游戏状态（不自动开始）
  board = createEmptyBoard();
  bag = [];
  score = 0;
  lines = 0;
  setLevel(1);
  document.getElementById("score").textContent = "0";
  document.getElementById("lines").textContent = "0";

  // 生成第一个方块（但不开始下落）
  nextType = getRandomPieceType(bag);
  current = spawnPiece();

  // 渲染侧边栏
  renderSidePanels();

  // 初始化ghost位置（如果启用）
  if (isGhostEnabled && current) {
    updateGhostPosition();
  }

  // 设置初始状态：游戏未开始
  isPaused = false;
  isStarted = false;
  lastTickAt = performance.now();

  // 绘制初始画面
  draw();

  // Set initial button text
  const pauseBtn = document.getElementById("btn-pause");
  if (pauseBtn) pauseBtn.textContent = "Start Game";

  // 初始化 ghost 按钮状态
  const ghostBtn = document.getElementById("btn-ghost");
  if (ghostBtn) ghostBtn.textContent = "🎯 Land Hint OFF";

  // 初始化按钮状态
  updateButtonStates();
})();



