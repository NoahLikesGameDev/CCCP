// --- IMPROVED AUDIO ENGINE ---
let audioCtx;
let musicStarted = false;
let masterGain;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        masterGain = audioCtx.createGain();
        masterGain.gain.value = 0.25;
        masterGain.connect(audioCtx.destination);
    }
    
    if (audioCtx.state === 'suspended') {
        audioCtx.resume().then(() => {
            document.getElementById('audio-indicator').innerText = "AUDIO: ACTIVE";
        });
    }

    if (!musicStarted) {
        startMusicLoop();
        musicStarted = true;
    }
}

function playSound(type) {
    if (!audioCtx || audioCtx.state !== 'running') return;
    const now = audioCtx.currentTime;
    
    if(type === 'shoot') {
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.12);
        g.gain.setValueAtTime(0.2, now);
        g.gain.linearRampToValueAtTime(0, now + 0.15);
        osc.connect(g); g.connect(masterGain);
        osc.start(); osc.stop(now + 0.15);

        const noise = audioCtx.createBufferSource();
        const bufferSize = audioCtx.sampleRate * 0.1;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        noise.buffer = buffer;
        const ng = audioCtx.createGain();
        ng.gain.setValueAtTime(0.15, now);
        ng.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        noise.connect(ng); ng.connect(masterGain);
        noise.start();
    } 
    else if(type === 'hit') {
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(80, now);
        osc.frequency.linearRampToValueAtTime(20, now + 0.3);
        g.gain.setValueAtTime(0.3, now);
        g.gain.linearRampToValueAtTime(0, now + 0.3);
        osc.connect(g); g.connect(masterGain);
        osc.start(); osc.stop(now + 0.3);
    }
    else if(type === 'step') {
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(70, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);
        g.gain.setValueAtTime(0.15, now);
        g.gain.linearRampToValueAtTime(0, now + 0.1);
        osc.connect(g); g.connect(masterGain);
        osc.start(); osc.stop(now + 0.12);
    }
    else if(type === 'reload_out') {
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.15);
        g.gain.setValueAtTime(0.1, now);
        g.gain.linearRampToValueAtTime(0, now + 0.15);
        osc.connect(g); g.connect(masterGain);
        osc.start(); osc.stop(now + 0.18);
    }
    else if(type === 'reload_in') {
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.08);
        g.gain.setValueAtTime(0.15, now);
        g.gain.linearRampToValueAtTime(0, now + 0.1);
        osc.connect(g); g.connect(masterGain);
        osc.start(); osc.stop(now + 0.12);
        
        const click = audioCtx.createOscillator();
        const cg = audioCtx.createGain();
        click.type = 'triangle';
        click.frequency.setValueAtTime(1200, now + 0.08);
        cg.gain.setValueAtTime(0.1, now + 0.08);
        cg.gain.linearRampToValueAtTime(0, now + 0.12);
        click.connect(cg); cg.connect(masterGain);
        click.start(now + 0.08); click.stop(now + 0.15);
    }
}

function startMusicLoop() {
    const bassSequence = [55, 55, 48, 52];
    let bassIdx = 0;
    const playBass = () => {
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(bassSequence[bassIdx], now);
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(0.15, now + 0.1);
        g.gain.linearRampToValueAtTime(0, now + 0.8);
        osc.connect(g); g.connect(masterGain);
        osc.start(now); osc.stop(now + 0.8);
        bassIdx = (bassIdx + 1) % bassSequence.length;
        setTimeout(playBass, 1000);
    };

    const melodySequence = [440, 466, 523, 440, 349, 330];
    let melIdx = 0;
    const playMelody = () => {
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(melodySequence[melIdx], now);
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(0.08, now + 1);
        g.gain.linearRampToValueAtTime(0, now + 4);
        osc.connect(g); g.connect(masterGain);
        osc.start(now); osc.stop(now + 4);
        melIdx = (melIdx + 1) % melodySequence.length;
        setTimeout(playMelody, 4000);
    };
    playBass();
    setTimeout(playMelody, 2000);
}

// --- ASSET GENERATORS ---
function createBuildingTexture(isHighRise) {
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#5c5e5c'; ctx.fillRect(0, 0, 256, 256);
    for(let i=0; i<2000; i++) {
        ctx.fillStyle = `rgba(0,0,0,${Math.random()*0.15})`;
        ctx.fillRect(Math.random()*256, Math.random()*256, 2, 2);
    }
    const cols = isHighRise ? 4 : 3;
    const rows = isHighRise ? 8 : 4;
    for(let r=0; r<rows; r++) {
        for(let c=0; c<cols; c++) {
            const x = 15 + c * 60; const y = 15 + r * 30;
            ctx.fillStyle = '#111'; ctx.fillRect(x-2, y-2, 44, 29);
            ctx.fillStyle = Math.random() > 0.8 ? '#ffffaa' : '#111';
            ctx.fillRect(x, y, 40, 25);
        }
    }
    if(Math.random() > 0.6) {
        ctx.fillStyle = 'rgba(204, 0, 0, 0.4)';
        ctx.font = 'bold 30px Russo One';
        ctx.fillText('CCCP', 20, 240);
    }
    return new THREE.CanvasTexture(canvas);
}

function createGroundTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#2c2e2c'; ctx.fillRect(0, 0, 512, 512);
    for(let i=0; i<30; i++) {
        ctx.fillStyle = 'rgba(200,200,220,0.1)';
        ctx.beginPath(); ctx.arc(Math.random()*512, Math.random()*512, Math.random()*50, 0, Math.PI*2); ctx.fill();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(20, 20);
    return tex;
}

function createBloodDecal() {
    const canvas = document.createElement('canvas');
    canvas.width = 128; canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,128,128);
    const r = 30 + Math.random() * 20;
    const x = 64, y = 64;
    ctx.fillStyle = `rgba(${100 + Math.random()*100}, 0, 0, 0.8)`;
    ctx.beginPath();
    for(let i=0; i<12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const dist = r * (0.5 + Math.random() * 0.5);
        ctx.lineTo(x + Math.cos(angle) * dist, y + Math.sin(angle) * dist);
    }
    ctx.closePath(); ctx.fill();
    for(let i=0; i<8; i++) {
        ctx.beginPath();
        ctx.arc(Math.random()*128, Math.random()*128, Math.random()*5, 0, Math.PI*2);
        ctx.fill();
    }
    return new THREE.CanvasTexture(canvas);
}

// --- GAME ENGINE ---
let scene, camera, renderer, clock, flashlight, muzzleFlash;
let player = { height: 1.8, speed: 6.5, jumpStrength: 0.17, yVelocity: 0, isGrounded: true, hp: 100, ammo: 30, magSize: 30, reserve: 120, isReloading: false, isMoving: false, moveTime: 0, stepTimer: 0, reloadAnimTime: 0 };
let controls = { forward: false, backward: false, left: false, right: false, jump: false };
let yaw = 0, pitch = 0;
let zombies = [], bullets = [], buildings = [], bloodParticles = [], decals = [], impactSparks = [];
let wave = 1, survivalTime = 0, gameRunning = false;
let weaponGroup, weaponRecoil = 0;

// --- NEW FEATURES VARIABLES ---
let isAiming = false;
let aimLerp = 0;
let bestSurvivalTime = parseFloat(localStorage.getItem('ussr_best_time')) || 0;

function formatTime(secs) {
    const m = Math.floor(secs/60), s = Math.floor(secs%60);
    return `${m}:${s.toString().padStart(2,'0')}`;
}

// --- NEW CLUE VARIABLES ---
let clues = [];
let clueTimeout;
const clueTexts = [
    "LOG 042: The perimeter has fallen. If anyone finds this, do not trust the evac teams. They are leaving us here.",
    "PROJECT 'RED-WINTER' BLUEPRINT: ...barrel modifications require a standard 7.62mm casing, but kinetic payload is enhanced by [REDACTED].",
    "Mikhail, I hid the rest of the rations in the northern sector. The 'infected' don't seem to notice them. - Anya",
    "DIRECTIVE 7A: All unauthorized personnel in Sector 4 are to be eliminated on sight. Infection containment is absolute.",
    "Found a dead operative today. Took his ammo. His mask was torn off... they don't just bite, they rip.",
    "WEAPON SCHEMATIC: Experimental PPSh-41 variant. Overheating issues resolved by venting gas through the lower receiver.",
    "To whoever reads this: Aim for the legs to slow them down, then finish them. God save us.",
    "STATUS REPORT: Subject 89 broke containment. It showed rudimentary tool use before termination."
];

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x3a3f44);
    scene.fog = new THREE.FogExp2(0x3a3f44, 0.035);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0x555566, 1.2));
    
    flashlight = new THREE.SpotLight(0xfff0cc, 2.5, 40, Math.PI/7, 0.6, 1);
    scene.add(flashlight); scene.add(flashlight.target);
    muzzleFlash = new THREE.PointLight(0xff8800, 0, 10); scene.add(muzzleFlash);

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000), new THREE.MeshStandardMaterial({ map: createGroundTexture() }));
    ground.rotation.x = -Math.PI/2; ground.receiveShadow = true;
    scene.add(ground);

    generateCity();
    generateClues();
    createWeapon();
    clock = new THREE.Clock();
    setupEvents();
}

function createWeapon() {
    weaponGroup = new THREE.Group();
    const gunMat = new THREE.MeshStandardMaterial({color:0x151515, metalness: 0.9});
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.09, 0.5), gunMat);
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.3), gunMat);
    barrel.rotation.x = Math.PI/2; barrel.position.set(0, 0.02, -0.4);
    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.08, 0.06), gunMat);
    grip.position.set(0, -0.06, 0.1);
    weaponGroup.add(body, barrel, grip);
    
    scene.add(weaponGroup);
}

function generateCity() {
    for (let i = 0; i < 70; i++) {
        const h = Math.random() > 0.7 ? 35 : 15;
        const w = 15, d = 15;
        const x = (Math.random()-0.5)*300, z = (Math.random()-0.5)*300;
        if(Math.abs(x) < 20 && Math.abs(z) < 20) continue;
        const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({map: createBuildingTexture(h>20)}));
        b.position.set(x, h/2, z);
    scene.add(b); buildings.push(b);
    }
}

function generateClues() {
    const paperMat = new THREE.MeshLambertMaterial({color: 0xddddcc, side: THREE.DoubleSide});
    const paperGeo = new THREE.PlaneGeometry(0.4, 0.6);
    for(let i=0; i<20; i++) {
        const x = (Math.random()-0.5)*280;
        const z = (Math.random()-0.5)*280;
        if(Math.abs(x) < 20 && Math.abs(z) < 20) continue; 
        const mesh = new THREE.Mesh(paperGeo, paperMat);
        mesh.position.set(x, 0.5, z);
        scene.add(mesh);
        clues.push({
            mesh: mesh,
            text: clueTexts[Math.floor(Math.random() * clueTexts.length)]
        });
    }
}

function showClue(text) {
    const popup = document.getElementById('clue-popup');
    document.getElementById('clue-text').innerText = text;
    popup.style.display = 'block';
    clearTimeout(clueTimeout);
    clueTimeout = setTimeout(() => { popup.style.display = 'none'; }, 6000);
}

function setupEvents() {
    document.getElementById('best-timer').innerText = formatTime(bestSurvivalTime);

    window.onkeydown = (e) => handleKey(e.code, true);
    window.onkeyup = (e) => handleKey(e.code, false);
    window.oncontextmenu = (e) => e.preventDefault();
    window.onmousedown = (e) => {
        initAudio();
        if(gameRunning) {
            if(document.pointerLockElement) {
                if(e.button === 0) shoot();
                if(e.button === 2) isAiming = true;
            }
            else document.body.requestPointerLock();
        }
    };
    window.onmouseup = (e) => {
        if(e.button === 2) isAiming = false;
    };
    window.onmousemove = (e) => {
        if(document.pointerLockElement) {
            yaw -= e.movementX * 0.002; pitch -= e.movementY * 0.002;
            pitch = Math.max(-1.5, Math.min(1.5, pitch));
        }
    };
    
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    document.getElementById('start-btn').onclick = (e) => {
        e.stopPropagation();
        document.getElementById('start-screen').style.display = 'none';
        document.body.requestPointerLock();
        initAudio();
        gameRunning = true; startWave();
    };
}

function handleKey(code, active) {
    if (code === 'KeyW') controls.forward = active;
    if (code === 'KeyS') controls.backward = active;
    if (code === 'KeyA') controls.left = active;
    if (code === 'KeyD') controls.right = active;
    if (code === 'Space') controls.jump = active;
    if (code === 'KeyR' && active) reload();
}

function updatePlayer(dt) {
    const oldPos = camera.position.clone();
    const dir = new THREE.Vector3();
    if (controls.forward) dir.z -= 1; if (controls.backward) dir.z += 1;
    if (controls.left) dir.x -= 1; if (controls.right) dir.x += 1;
    
    const wasMoving = player.isMoving;
    player.isMoving = dir.length() > 0 && !player.isReloading;
    
    if(player.isMoving) {
        player.moveTime += dt * 10;
        player.stepTimer -= dt;
        if(player.stepTimer <= 0) {
            playSound('step');
            player.stepTimer = 0.35;
        }
    } else {
        player.moveTime = 0;
        player.stepTimer = 0;
    }
    
    aimLerp = THREE.MathUtils.lerp(aimLerp, isAiming ? 1 : 0, dt * 15);
    camera.fov = THREE.MathUtils.lerp(75, 55, aimLerp);
    camera.updateProjectionMatrix();
    const curSpeed = isAiming ? player.speed * 0.5 : player.speed;

    if(dir.length() > 0) {
        dir.normalize().applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
        camera.position.x += dir.x * curSpeed * dt;
        camera.position.z += dir.z * curSpeed * dt;
    }
    for(let b of buildings) {
        const dx = Math.abs(camera.position.x - b.position.x), dz = Math.abs(camera.position.z - b.position.z);
        if(dx < 8.2 && dz < 8.2) { camera.position.x = oldPos.x; camera.position.z = oldPos.z; break; }
    }
    if(controls.jump && player.isGrounded) { player.yVelocity = player.jumpStrength; player.isGrounded = false; }
    if(!player.isGrounded) {
        player.yVelocity -= 0.01; camera.position.y += player.yVelocity;
        if(camera.position.y <= player.height) { camera.position.y = player.height; player.isGrounded = true; }
    } else { camera.position.y = player.height; }

    camera.rotation.set(pitch, yaw, 0, 'YXZ');
    flashlight.position.copy(camera.position);
    flashlight.target.position.copy(camera.position).add(new THREE.Vector3(0,0,-1).applyQuaternion(camera.quaternion));
    weaponRecoil = THREE.MathUtils.lerp(weaponRecoil, 0, dt * 10);
    
    let reloadOffset = 0;
    let reloadTilt = 0;
    if(player.isReloading) {
        player.reloadAnimTime += dt;
        const rt = player.reloadAnimTime / 1.2;
        if(rt < 0.33) {
            reloadOffset = THREE.MathUtils.lerp(0, 0.15, rt / 0.33);
            reloadTilt = THREE.MathUtils.lerp(0, -0.8, rt / 0.33);
        } else if(rt < 0.67) {
            reloadOffset = 0.15;
            reloadTilt = -0.8;
        } else {
            const up = (rt - 0.67) / 0.33;
            reloadOffset = THREE.MathUtils.lerp(0.15, 0, up);
            reloadTilt = THREE.MathUtils.lerp(-0.8, 0, up);
        }
    }
    
    let bobY = 0, bobX = 0;
    if(player.isMoving && !player.isReloading) {
        const aimFactor = isAiming ? 0.3 : 1;
        bobY = Math.sin(player.moveTime) * 0.02 * aimFactor;
        bobX = Math.cos(player.moveTime * 0.5) * 0.01 * aimFactor;
    }
    
    weaponGroup.position.copy(camera.position);
    weaponGroup.rotation.copy(camera.rotation);
    
    const tx = THREE.MathUtils.lerp(0.2, 0.0, aimLerp);
    const ty = THREE.MathUtils.lerp(-0.2, -0.12, aimLerp);
    const tz = THREE.MathUtils.lerp(-0.4, -0.3, aimLerp);
    weaponGroup.translateZ(tz + weaponRecoil + bobY); 
    weaponGroup.translateX(tx + bobX); 
    weaponGroup.translateY(ty - reloadOffset);
    weaponGroup.rotateX(reloadTilt);
    
    if(muzzleFlash.intensity > 0) muzzleFlash.intensity -= dt * 40;
    survivalTime += dt;
    document.getElementById('timer').innerText = formatTime(survivalTime);

    const ch = document.getElementById('crosshair');
    const scale = player.isMoving ? 1.2 : 1.0;
    ch.style.transform = `translate(-50%, -50%) scale(${scale})`;
    ch.style.opacity = isAiming ? '0.2' : '1';
}

function shoot() {
    if(player.isReloading || player.ammo <= 0) return;
    player.ammo--; playSound('shoot'); updateHUD();
    weaponRecoil = 0.15; muzzleFlash.intensity = 8;
    
    const dir = new THREE.Vector3(0,0,-1).applyQuaternion(camera.quaternion);
    const startPos = camera.position.clone().add(dir.clone().multiplyScalar(0.5));
    
    const bulletGroup = new THREE.Group();
    const bulletCore = new THREE.Mesh(
        new THREE.SphereGeometry(0.04),
        new THREE.MeshBasicMaterial({color: 0xff3300})
    );
    
    const trailGeo = new THREE.ConeGeometry(0.015, 0.5, 6);
    const trailMat = new THREE.MeshBasicMaterial({color: 0xff2200, transparent: true, opacity: 0.8});
    const trail = new THREE.Mesh(trailGeo, trailMat);
    trail.rotation.x = Math.PI / 2;
    trail.position.z = 0.3;
    
    const bulletLight = new THREE.PointLight(0xff4400, 0.6, 3);
    
    bulletGroup.add(bulletCore);
    bulletGroup.add(trail);
    bulletGroup.add(bulletLight);
    bulletGroup.position.copy(startPos);
    bulletGroup.lookAt(startPos.clone().add(dir));
    
    scene.add(bulletGroup);
    
    bullets.push({ 
        mesh: bulletGroup, 
        vel: dir.clone().multiplyScalar(4), 
        life: 60,
        trail: trail,
        light: bulletLight
    });
    
    const ch = document.getElementById('crosshair');
    ch.style.transition = 'none';
    ch.style.transform = 'translate(-50%, -50%) scale(1.5)';
    setTimeout(() => { ch.style.transition = 'transform 0.1s ease-out'; }, 10);
}

function createImpactSparks(pos) {
    const colors = [0xff2200, 0xff4400, 0xff6600, 0xffaa00];
    for(let i = 0; i < 8; i++) {
        const size = 0.015 + Math.random() * 0.02;
        const spark = new THREE.Mesh(
            new THREE.BoxGeometry(size, size, size),
            new THREE.MeshBasicMaterial({color: colors[Math.floor(Math.random() * colors.length)], transparent: true})
        );
        spark.position.copy(pos);
        
        const vel = new THREE.Vector3(
            (Math.random() - 0.5) * 3,
            Math.random() * 2,
            (Math.random() - 0.5) * 3
        );
        
        spark.userData = { vel: vel, life: 1.0 };
        impactSparks.push(spark);
        scene.add(spark);
    }
}

function reload() {
    if(player.isReloading || player.ammo === player.magSize || player.reserve <= 0) return;
    player.isReloading = true;
    player.reloadAnimTime = 0;
    document.getElementById('reload-indicator').style.opacity = '1';
    setTimeout(() => { playSound('reload_out'); }, 400);
    setTimeout(() => { playSound('reload_in'); }, 800);
    setTimeout(() => {
        const give = Math.min(player.magSize - player.ammo, player.reserve);
        player.ammo += give; player.reserve -= give;
        player.isReloading = false;
        player.reloadAnimTime = 0;
        document.getElementById('reload-indicator').style.opacity = '0';
        updateHUD();
    }, 1200);
}

function spawnZombie() {
    const z = new THREE.Group();
    const suitMat = new THREE.MeshLambertMaterial({color: 0x2e2e25});
    const rubberMat = new THREE.MeshLambertMaterial({color: 0x0a0a0a});
    const eyeMat = new THREE.MeshStandardMaterial({color: 0x00ff00, emissive: 0x004400, metalness: 0.8});
    const filterMat = new THREE.MeshLambertMaterial({color: 0x333333});
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1, 0.4), suitMat);
    torso.position.y = 1.2;
    z.add(torso);
    const head = new THREE.Group();
    const maskBase = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), rubberMat);
    const filter = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.15), filterMat);
    filter.rotation.x = Math.PI/2; filter.position.z = -0.22;
    const eyeL = new THREE.Mesh(new THREE.CircleGeometry(0.08, 16), eyeMat);
    eyeL.position.set(-0.1, 0.05, -0.21); eyeL.rotation.y = Math.PI;
    const eyeR = new THREE.Mesh(new THREE.CircleGeometry(0.08, 16), eyeMat);
    eyeR.position.set(0.1, 0.05, -0.21); eyeR.rotation.y = Math.PI;
    head.add(maskBase, filter, eyeL, eyeR);
    head.position.y = 1.9;
    z.add(head);
    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.7, 0.15), suitMat);
    armL.position.set(-0.4, 1.2, 0); z.add(armL);
    const armR = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.7, 0.15), suitMat);
    armR.position.set(0.4, 1.2, 0); z.add(armR);
    const legL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.8, 0.2), rubberMat);
    legL.position.set(-0.2, 0.4, 0); z.add(legL);
    const legR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.8, 0.2), rubberMat);
    legR.position.set(0.2, 0.4, 0); z.add(legR);
    const ang = Math.random()*Math.PI*2;
    z.position.set(camera.position.x + Math.cos(ang)*50, 0, camera.position.z + Math.sin(ang)*50);
    zombies.push({ 
        mesh: z, hp: 4, speed: 1.6 + wave*0.2, cooldown: 0,
        animTime: Math.random() * 10,
        limbs: { armL, armR, legL, legR },
        isDying: false, deathTime: 0, riseVel: 1.5, materials: [suitMat, rubberMat, eyeMat, filterMat]
    });
    scene.add(z);
}

function createBloodSplat(pos) {
    const decal = new THREE.Mesh(
        new THREE.PlaneGeometry(1.5 + Math.random(), 1.5 + Math.random()),
        new THREE.MeshBasicMaterial({ map: createBloodDecal(), transparent: true, depthWrite: false })
    );
    decal.rotation.x = -Math.PI/2;
    decal.position.set(pos.x + (Math.random()-0.5), 0.01, pos.z + (Math.random()-0.5));
    decal.rotation.z = Math.random() * Math.PI * 2;
    scene.add(decal);
    decals.push(decal);
    if(decals.length > 100) { scene.remove(decals.shift()); }

    for(let i=0; i<15; i++) {
        const p = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), new THREE.MeshBasicMaterial({color: 0x880000}));
        p.position.copy(pos);
        p.userData = {
            vel: new THREE.Vector3((Math.random()-0.5)*0.4, Math.random()*0.5, (Math.random()-0.5)*0.4),
            life: 1.0
        };
        scene.add(p);
        bloodParticles.push(p);
    }
}

function updateCombat(dt) {
    for(let i=bloodParticles.length-1; i>=0; i--) {
        const p = bloodParticles[i];
        p.position.add(p.userData.vel);
        p.userData.vel.y -= 0.02;
        p.userData.life -= dt * 2;
        if(p.position.y < 0) p.position.y = 0;
        if(p.userData.life <= 0) { scene.remove(p); bloodParticles.splice(i,1); }
    }
    
    for(let i=impactSparks.length-1; i>=0; i--) {
        const p = impactSparks[i];
        p.position.add(p.userData.vel.clone().multiplyScalar(dt));
        p.userData.vel.y -= 0.1;
        p.userData.life -= dt * 7;
        p.material.opacity = p.userData.life;
        if(p.position.y < 0) p.position.y = 0;
        if(p.userData.life <= 0) { scene.remove(p); impactSparks.splice(i,1); }
    }

    for(let zi=zombies.length-1; zi>=0; zi--) {
        const z = zombies[zi];
        if(z.isDying) {
            z.deathTime += dt;
            
            z.mesh.position.y += z.riseVel * dt;
            z.riseVel *= 0.99;
            
            const fadeDuration = 2.5;
            const opacity = Math.max(0, 1 - (z.deathTime / fadeDuration));
            z.materials.forEach(mat => {
                mat.transparent = true;
                mat.opacity = opacity;
            });
            
            if(z.deathTime > fadeDuration) {
                scene.remove(z.mesh);
                zombies.splice(zi, 1);
            }
        }
    }

    for(let i=bullets.length-1; i>=0; i--) {
        const b = bullets[i];
        b.mesh.position.add(b.vel.clone().multiplyScalar(dt * 60));
        b.life--;
        
        const lifeRatio = b.life / 60;
        b.trail.material.opacity = lifeRatio * 0.8;
        b.light.intensity = lifeRatio * 0.6;
        
        for(let zi=zombies.length-1; zi>=0; zi--) {
            const z = zombies[zi];
            if(b.mesh.position.distanceTo(z.mesh.position.clone().add(new THREE.Vector3(0, 1.2, 0))) < 1.0) {
                z.hp--; b.life = 0; playSound('hit');
                createBloodSplat(b.mesh.position.clone());
                createImpactSparks(b.mesh.position.clone());
                if(z.hp <= 0) { 
                    z.isDying = true;
                    z.deathTime = 0;
                    z.riseVel = 1.5 + Math.random() * 0.5;
                    player.reserve += 10; 
                    updateHUD(); 
                }
                break;
            }
        }
        if(b.life <= 0) { scene.remove(b.mesh); bullets.splice(i,1); }
    }
    zombies.forEach(z => {
        if(z.isDying) return;
        z.animTime += dt * 5;
        const dir = new THREE.Vector3().subVectors(camera.position, z.mesh.position);
        dir.y = 0;
        z.limbs.legL.rotation.x = Math.sin(z.animTime) * 0.4;
        z.limbs.legR.rotation.x = Math.sin(z.animTime + Math.PI) * 0.4;
        z.limbs.armL.rotation.x = Math.sin(z.animTime + Math.PI) * 0.3;
        z.limbs.armR.rotation.x = Math.sin(z.animTime) * 0.3;
        if(dir.length() > 1.2) z.mesh.position.add(dir.normalize().multiplyScalar(z.speed * dt));
        else if(z.cooldown <= 0) {
            player.hp -= 15; z.cooldown = 1.5; playSound('hit');
            document.getElementById('damage-vignette').style.boxShadow = 'inset 0 0 100px rgba(150,0,0,0.9)';
            setTimeout(() => document.getElementById('damage-vignette').style.boxShadow = 'none', 100);
            updateHUD(); if(player.hp <= 0) die();
        }
        z.cooldown -= dt; z.mesh.lookAt(camera.position.x, 0, camera.position.z);
    });
    if(zombies.length === 0 && gameRunning) { wave++; startWave(); }
}

function updateClues(dt) {
    for(let i=clues.length-1; i>=0; i--) {
        const c = clues[i];
        c.mesh.rotation.y += dt * 1.5;
        c.mesh.position.y = 0.5 + Math.sin(survivalTime * 3 + c.mesh.position.x) * 0.1;
        
        if(camera.position.distanceTo(c.mesh.position) < 2.0) {
            showClue(c.text);
            scene.remove(c.mesh);
            clues.splice(i, 1);
        }
    }
}

function startWave() {
    document.getElementById('wave-count').innerText = wave;
    for(let i=0; i<6 + wave*3; i++) setTimeout(spawnZombie, i * 500);
}

function updateHUD() {
    document.getElementById('health-fill').style.width = Math.max(0, player.hp) + '%';
    document.getElementById('hp-text').innerText = Math.max(0, Math.round(player.hp));
    document.getElementById('ammo-count').innerText = player.ammo;
    document.getElementById('reserve-count').innerText = player.reserve;
}

function die() {
    gameRunning = false; document.exitPointerLock();
    
    let timeMsg = `SURVIVED: ${formatTime(survivalTime)}`;
    if (survivalTime > bestSurvivalTime) {
        bestSurvivalTime = survivalTime;
        localStorage.setItem('ussr_best_time', bestSurvivalTime);
        timeMsg = `NEW RECORD: ${formatTime(survivalTime)}`;
        document.getElementById('best-timer').innerText = formatTime(bestSurvivalTime);
    }
    document.getElementById('final-time-display').innerText = timeMsg;
    
    document.getElementById('game-over').style.display = 'block';
}

function animate() {
    requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.1);
    if(gameRunning && document.pointerLockElement) {
        updatePlayer(dt); updateCombat(dt); updateClues(dt);
    }
    renderer.render(scene, camera);
}

init(); animate();
