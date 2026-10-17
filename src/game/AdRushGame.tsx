import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { sounds } from "./soundEffects.ts";
import { BannerSizeConfig } from "../types/banner.ts";

interface AdRushGameProps {
  onCloseGame: () => void;
  bannerImageUrl?: string;
  brandName?: string;
}

type GameState = "TITLE" | "PLAYING" | "PAUSED" | "GAMEOVER" | "VICTORY";

export const AdRushGame: React.FC<AdRushGameProps> = ({
  onCloseGame,
  bannerImageUrl,
  brandName = "AuraWave",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [gameState, setGameState] = useState<GameState>("TITLE");
  const [score, setScore] = useState(0);
  const [shields, setShields] = useState(3);
  const [billboardsActive, setBillboardsActive] = useState(0);
  const [boostEnergy, setBoostEnergy] = useState(100);
  const [isMuted, setIsMuted] = useState(sounds.isMuted());

  // Mutable refs for high-frequency game loop state
  const loopStateRef = useRef({
    state: "TITLE" as GameState,
    score: 0,
    shields: 3,
    billboardsActive: 0,
    boost: 100,
    speed: 35,
    cameraShake: 0,
    hitstop: 0,
    targetX: 0,
    shipX: 0,
    shipTilt: 0,
    shipSquashY: 1,
    keys: {
      left: false,
      right: false,
      up: false,
      down: false,
      boost: false,
    },
    distance: 0,
  });

  // Keep state ref synced
  useEffect(() => {
    loopStateRef.current.state = gameState;
  }, [gameState]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050914, 0.015);
    scene.background = new THREE.Color(0x050914);

    const camera = new THREE.PerspectiveCamera(
      65,
      window.innerWidth / window.innerHeight,
      0.1,
      600
    );
    camera.position.set(0, 4.5, 9);
    camera.lookAt(0, 1.5, -15);

    const renderer = new THREE.WebGLRenderer({
      powerPreference: "high-performance",
      antialias: true,
      alpha: false,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // 2. Lighting Rig
    const dirLight = new THREE.DirectionalLight(0xffeedd, 1.8);
    dirLight.position.set(15, 25, 10);
    scene.add(dirLight);

    const hemiLight = new THREE.HemisphereLight(0x3b82f6, 0x0f172a, 1.2);
    scene.add(hemiLight);

    // 3. Cyber Neon Road Grid
    const roadWidth = 14;
    const roadLength = 300;
    const roadGeo = new THREE.PlaneGeometry(roadWidth, roadLength, 20, 40);
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x070b19,
      roughness: 0.3,
      metalness: 0.8,
    });
    const roadMesh = new THREE.Mesh(roadGeo, roadMat);
    roadMesh.rotation.x = -Math.PI / 2;
    roadMesh.position.set(0, 0, -100);
    scene.add(roadMesh);

    // Grid lines on road
    const gridHelper = new THREE.GridHelper(roadLength, 60, 0x3b82f6, 0x1e293b);
    gridHelper.position.set(0, 0.02, -100);
    scene.add(gridHelper);

    // Glowing Neon Side Rails
    const railMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
    const leftRail = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.4, roadLength), railMat);
    leftRail.position.set(-roadWidth / 2, 0.2, -100);
    scene.add(leftRail);

    const rightRail = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.4, roadLength), railMat);
    rightRail.position.set(roadWidth / 2, 0.2, -100);
    scene.add(rightRail);

    // 4. Hero Cyber Jet Model (Composite 6-part THREE.Group)
    const shipGroup = new THREE.Group();

    // Hull (Fuselage)
    const hullMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.9,
      roughness: 0.2,
    });
    const hullGeo = new THREE.ConeGeometry(0.9, 3.2, 5);
    const hull = new THREE.Mesh(hullGeo, hullMat);
    hull.rotation.x = Math.PI / 2;
    shipGroup.add(hull);

    // Cockpit Canopy (Translucent Cyan)
    const canopyMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transmission: 0.85,
      roughness: 0.1,
      metalness: 0.2,
      thickness: 0.5,
      transparent: true,
      opacity: 0.9,
    });
    const canopy = new THREE.Mesh(new THREE.SphereGeometry(0.45, 16, 16), canopyMat);
    canopy.position.set(0, 0.35, 0.2);
    canopy.scale.set(0.8, 0.6, 1.8);
    shipGroup.add(canopy);

    // Wings
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      metalness: 0.85,
      roughness: 0.25,
    });
    const wingGeo = new THREE.BoxGeometry(3.6, 0.08, 1.4);
    const wings = new THREE.Mesh(wingGeo, wingMat);
    wings.position.set(0, 0.05, 0.4);
    shipGroup.add(wings);

    // Wingtips with neon laser emitters
    const emitterMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const tipL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.25, 0.6), emitterMat);
    tipL.position.set(-1.8, 0.1, 0.4);
    shipGroup.add(tipL);

    const tipR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.25, 0.6), emitterMat);
    tipR.position.set(1.8, 0.1, 0.4);
    shipGroup.add(tipR);

    // Thruster engine glow
    const thrusterMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const thruster = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.35, 0.5, 12), thrusterMat);
    thruster.rotation.x = Math.PI / 2;
    thruster.position.set(0, 0.05, 1.6);
    shipGroup.add(thruster);

    shipGroup.position.set(0, 0.9, 0);
    scene.add(shipGroup);

    // Contact shadow beneath ship
    const shadowGeo = new THREE.PlaneGeometry(2.4, 2.4);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.5,
    });
    const shipShadow = new THREE.Mesh(shadowGeo, shadowMat);
    shipShadow.rotation.x = -Math.PI / 2;
    shipShadow.position.y = 0.04;
    scene.add(shipShadow);

    // 5. Procedural Dynamic Billboards & Ad Screens
    const billboardCount = 6;
    const billboards: {
      group: THREE.Group;
      screenMesh: THREE.Mesh;
      zPos: number;
      lane: number;
    }[] = [];

    // Create a dynamic canvas texture for billboards showing the brand & generated banner
    const billboardCanvas = document.createElement("canvas");
    billboardCanvas.width = 512;
    billboardCanvas.height = 256;
    const bCtx = billboardCanvas.getContext("2d")!;

    function redrawBillboardTexture(activeCount: number) {
      bCtx.fillStyle = "#0F172A";
      bCtx.fillRect(0, 0, 512, 256);

      // Gradient header
      const grad = bCtx.createLinearGradient(0, 0, 512, 0);
      grad.addColorStop(0, "#2563EB");
      grad.addColorStop(1, "#F59E0B");
      bCtx.fillStyle = grad;
      bCtx.fillRect(0, 0, 512, 48);

      bCtx.fillStyle = "#FFFFFF";
      bCtx.font = "bold 24px sans-serif";
      bCtx.fillText(`${brandName.toUpperCase()} • LIVE AD DISPLAY`, 20, 32);

      bCtx.fillStyle = "#FBBF24";
      bCtx.font = "bold 34px sans-serif";
      bCtx.fillText("40% OFF THIS WEEK ONLY", 20, 110);

      bCtx.fillStyle = "#E2E8F0";
      bCtx.font = "20px sans-serif";
      bCtx.fillText("Engineered for Extraordinary Performance", 20, 155);

      // Button
      bCtx.fillStyle = "#3B82F6";
      bCtx.fillRect(20, 185, 200, 48);
      bCtx.fillStyle = "#FFFFFF";
      bCtx.font = "bold 20px sans-serif";
      bCtx.fillText("SHOP NOW →", 50, 216);

      bCtx.fillStyle = "#10B981";
      bCtx.font = "bold 18px monospace";
      bCtx.fillText(`ACTIVE CAMPAIGNS: ${activeCount}`, 260, 216);
    }
    redrawBillboardTexture(0);

    const billboardTexture = new THREE.CanvasTexture(billboardCanvas);
    billboardTexture.colorSpace = THREE.SRGBColorSpace;

    for (let i = 0; i < billboardCount; i++) {
      const bGroup = new THREE.Group();
      const isLeft = i % 2 === 0;
      const x = isLeft ? -roadWidth / 2 - 3.8 : roadWidth / 2 + 3.8;
      const z = -40 - i * 45;

      // Pole
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.35, 7, 8),
        new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 })
      );
      pole.position.set(0, 3.5, 0);
      bGroup.add(pole);

      // Screen frame
      const frame = new THREE.Mesh(
        new THREE.BoxGeometry(6.6, 3.6, 0.4),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.2 })
      );
      frame.position.set(0, 7, 0);
      bGroup.add(frame);

      // Screen surface
      const screenMat = new THREE.MeshBasicMaterial({
        map: billboardTexture,
      });
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(6.2, 3.2), screenMat);
      screen.position.set(0, 7, 0.22);
      // Face inward slightly toward road
      screen.rotation.y = isLeft ? 0.25 : -0.25;
      bGroup.add(screen);

      bGroup.position.set(x, 0, z);
      scene.add(bGroup);
      billboards.push({ group: bGroup, screenMesh: screen, zPos: z, lane: isLeft ? -1 : 1 });
    }

    // 6. Collectible Ad Sparks (Orbs)
    const orbCount = 7;
    const orbs: { mesh: THREE.Mesh; zPos: number; xPos: number; active: boolean }[] = [];
    const orbMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

    for (let i = 0; i < orbCount; i++) {
      const orbMesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.5, 1), orbMat);
      const x = (Math.random() - 0.5) * (roadWidth - 3);
      const z = -25 - i * 35;
      orbMesh.position.set(x, 1.2, z);
      scene.add(orbMesh);
      orbs.push({ mesh: orbMesh, zPos: z, xPos: x, active: true });
    }

    // 7. Hazards: Ad Blocker Laser Barriers
    const hazardCount = 4;
    const hazards: { group: THREE.Group; zPos: number; xPos: number }[] = [];

    for (let i = 0; i < hazardCount; i++) {
      const hGroup = new THREE.Group();
      const x = (Math.random() - 0.5) * (roadWidth - 4);
      const z = -55 - i * 65;

      const beamMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 4.2, 8), beamMat);
      bar.rotation.z = Math.PI / 2;
      bar.position.y = 1.2;
      hGroup.add(bar);

      // Warning beacon pillars
      const pMat = new THREE.MeshStandardMaterial({ color: 0x7f1d1d, metalness: 0.8 });
      const pL = new THREE.Mesh(new THREE.BoxGeometry(0.4, 2.4, 0.4), pMat);
      pL.position.set(-2.1, 1.2, 0);
      hGroup.add(pL);

      const pR = new THREE.Mesh(new THREE.BoxGeometry(0.4, 2.4, 0.4), pMat);
      pR.position.set(2.1, 1.2, 0);
      hGroup.add(pR);

      hGroup.position.set(x, 0, z);
      scene.add(hGroup);
      hazards.push({ group: hGroup, zPos: z, xPos: x });
    }

    // 8. Input Handling (held vs edge-triggered)
    const onKeyDown = (e: KeyboardEvent) => {
      const { state, keys } = loopStateRef.current;
      if (e.code === "ArrowLeft" || e.code === "KeyA") keys.left = true;
      if (e.code === "ArrowRight" || e.code === "KeyD") keys.right = true;
      if (e.code === "ArrowUp" || e.code === "KeyW") keys.up = true;
      if (e.code === "ArrowDown" || e.code === "KeyS") keys.down = true;

      if (e.code === "Space") {
        keys.boost = true;
        if (state === "TITLE") {
          startGame();
        } else if (state === "GAMEOVER" || state === "VICTORY") {
          startGame();
        }
      }

      if (e.code === "Enter") {
        if (state === "TITLE" || state === "GAMEOVER" || state === "VICTORY") {
          startGame();
        }
      }

      if (e.code === "Escape") {
        if (state === "PLAYING") {
          setGameState("PAUSED");
        } else if (state === "PAUSED") {
          setGameState("PLAYING");
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const { keys } = loopStateRef.current;
      if (e.code === "ArrowLeft" || e.code === "KeyA") keys.left = false;
      if (e.code === "ArrowRight" || e.code === "KeyD") keys.right = false;
      if (e.code === "ArrowUp" || e.code === "KeyW") keys.up = false;
      if (e.code === "ArrowDown" || e.code === "KeyS") keys.down = false;
      if (e.code === "Space") keys.boost = false;
    };

    const onWindowBlur = () => {
      loopStateRef.current.keys = {
        left: false,
        right: false,
        up: false,
        down: false,
        boost: false,
      };
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onWindowBlur);

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    const startGame = () => {
      loopStateRef.current = {
        ...loopStateRef.current,
        score: 0,
        shields: 3,
        billboardsActive: 0,
        boost: 100,
        speed: 35,
        cameraShake: 0,
        hitstop: 0,
        targetX: 0,
        shipX: 0,
        shipTilt: 0,
        shipSquashY: 1,
        distance: 0,
      };
      setScore(0);
      setShields(3);
      setBillboardsActive(0);
      setBoostEnergy(100);
      redrawBillboardTexture(0);
      billboardTexture.needsUpdate = true;
      setGameState("PLAYING");
      sounds.playBoost();
    };

    // 9. 60 FPS Game Loop with Clock and Delta Clamping
    const clock = new THREE.Clock();
    let animationFrameId: number;

    const tick = () => {
      animationFrameId = requestAnimationFrame(tick);

      const rawDt = clock.getDelta();
      const dt = Math.min(rawDt, 0.05); // Clamp dt to prevent tunneling
      const s = loopStateRef.current;

      // Handle hitstop pause on impact
      if (s.hitstop > 0) {
        s.hitstop -= dt;
        renderer.render(scene, camera);
        return;
      }

      // 1. Title Screen Idle Camera Pan & Ship Float
      if (s.state === "TITLE") {
        const time = clock.getElapsedTime();
        camera.position.x = Math.sin(time * 0.4) * 2;
        camera.position.y = 4.2 + Math.cos(time * 0.6) * 0.4;
        camera.lookAt(0, 1.2, -10);

        shipGroup.position.y = 1.0 + Math.sin(time * 2) * 0.15;
        shipGroup.rotation.z = Math.sin(time * 1.5) * 0.08;
        shipShadow.scale.setScalar(1 + Math.sin(time * 2) * 0.05);

        // Slow road scroll
        roadMesh.position.z = -100 + ((time * 15) % 10);
        renderer.render(scene, camera);
        return;
      }

      if (s.state === "PLAYING") {
        // Boost calculation
        let currentSpeed = s.speed;
        if (s.keys.boost && s.boost > 0) {
          currentSpeed *= 1.7;
          s.boost = Math.max(0, s.boost - dt * 25);
          thruster.scale.set(1.4, 1.4, 2.5);
          if (Math.random() < 0.1) sounds.playBoost();
        } else {
          thruster.scale.set(1, 1, 1);
          s.boost = Math.min(100, s.boost + dt * 10);
        }
        setBoostEnergy(Math.round(s.boost));

        // Lateral steering with exponential damping
        const steerSpeed = 16;
        if (s.keys.left) s.targetX -= steerSpeed * dt;
        if (s.keys.right) s.targetX += steerSpeed * dt;
        s.targetX = THREE.MathUtils.clamp(s.targetX, -roadWidth / 2 + 1.6, roadWidth / 2 - 1.6);

        s.shipX = THREE.MathUtils.damp(s.shipX, s.targetX, 14, dt);
        s.shipTilt = THREE.MathUtils.damp(
          s.shipTilt,
          (s.targetX - s.shipX) * 0.6,
          10,
          dt
        );

        shipGroup.position.x = s.shipX;
        shipGroup.rotation.z = -s.shipTilt;
        shipShadow.position.x = s.shipX;

        // Squash & stretch recovery
        s.shipSquashY = THREE.MathUtils.damp(s.shipSquashY, 1, 8, dt);
        shipGroup.scale.set(2 - s.shipSquashY, s.shipSquashY, 1);

        // Advance distance & score
        s.distance += currentSpeed * dt;
        s.score += Math.round(currentSpeed * dt * 2);
        setScore(s.score);

        // Move road grid
        roadMesh.position.z = -100 + ((s.distance * 1.2) % 20);

        // Move Billboards toward player
        for (const b of billboards) {
          b.zPos += currentSpeed * dt;
          if (b.zPos > 20) {
            b.zPos = -220 - Math.random() * 40;
          }
          b.group.position.z = b.zPos;
        }

        // Move Collectible Sparks
        for (const orb of orbs) {
          orb.zPos += currentSpeed * dt;
          orb.mesh.rotation.y += dt * 3;
          orb.mesh.rotation.x += dt * 2;

          // Collision detection with player
          if (orb.active && Math.abs(orb.zPos) < 1.6 && Math.abs(orb.xPos - s.shipX) < 1.8) {
            orb.active = false;
            orb.mesh.visible = false;
            s.score += 500;
            s.billboardsActive++;
            setScore(s.score);
            setBillboardsActive(s.billboardsActive);
            redrawBillboardTexture(s.billboardsActive);
            billboardTexture.needsUpdate = true;
            sounds.playPickup();

            // Squash on collection
            s.shipSquashY = 1.3;
          }

          if (orb.zPos > 15) {
            orb.zPos = -200 - Math.random() * 50;
            orb.xPos = (Math.random() - 0.5) * (roadWidth - 3);
            orb.mesh.position.x = orb.xPos;
            orb.active = true;
            orb.mesh.visible = true;
          }
          orb.mesh.position.z = orb.zPos;
        }

        // Move Hazards (Ad Blocker lasers)
        for (const h of hazards) {
          h.zPos += currentSpeed * dt;

          // Collision with hazard
          if (Math.abs(h.zPos) < 1.2 && Math.abs(h.xPos - s.shipX) < 2.2) {
            // Impact!
            s.shields--;
            setShields(s.shields);
            s.cameraShake = 0.8;
            s.hitstop = 0.08; // 80ms hitstop impact feel
            s.shipSquashY = 0.6; // squash down
            sounds.playImpact();

            // Move hazard far back
            h.zPos = -250 - Math.random() * 50;

            if (s.shields <= 0) {
              setGameState("GAMEOVER");
            }
          }

          if (h.zPos > 15) {
            h.zPos = -240 - Math.random() * 60;
            h.xPos = (Math.random() - 0.5) * (roadWidth - 4);
            h.group.position.x = h.xPos;
          }
          h.group.position.z = h.zPos;
        }

        // Camera follow with slight lag and decaying shake
        camera.position.x = THREE.MathUtils.damp(camera.position.x, s.shipX * 0.45, 8, dt);
        camera.position.y = 4.5;
        camera.position.z = 9;

        if (s.cameraShake > 0) {
          camera.position.x += (Math.random() - 0.5) * s.cameraShake;
          camera.position.y += (Math.random() - 0.5) * s.cameraShake;
          s.cameraShake = Math.max(0, s.cameraShake - dt * 2.5);
        }
        camera.lookAt(s.shipX * 0.3, 1.4, -18);

        // Win condition at 10,000 pts
        if (s.score >= 10000) {
          setGameState("VICTORY");
        }
      }

      renderer.render(scene, camera);
    };

    tick();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onWindowBlur);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const toggleSound = () => {
    const next = sounds.toggleMute();
    setIsMuted(next);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col select-none overflow-hidden font-sans">
      {/* 3D WebGL Canvas Viewport */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />

      {/* World-Matched Low-Occlusion Perimeter HUD (pointer-events: none) */}
      <div className="absolute inset-0 pointer-events-none p-4 sm:p-6 flex flex-col justify-between z-20">
        {/* Top Status Bar (Perimeter) */}
        <div className="flex items-center justify-between">
          {/* Top Left: Score & Billboards Active */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-950/80 border border-cyan-500/40 rounded-xl px-4 py-2 text-cyan-400 font-mono shadow-lg shadow-cyan-500/10">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                CAMPAIGN IMPRESSIONS
              </span>
              <span className="text-xl sm:text-2xl font-black tabular-nums text-white">
                {score.toLocaleString()}
              </span>
            </div>

            <div className="bg-slate-950/80 border border-amber-500/40 rounded-xl px-3.5 py-2 text-amber-400 font-mono shadow-lg">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                3D BILLBOARDS
              </span>
              <span className="text-lg sm:text-xl font-black tabular-nums text-amber-300">
                {billboardsActive}
              </span>
            </div>
          </div>

          {/* Top Right: Shields, Boost & Sound Toggle */}
          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Shields Cluster */}
            <div className="flex items-center gap-1 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2">
              <span className="text-[10px] text-slate-400 uppercase font-bold mr-1">
                SHIELDS
              </span>
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={`w-3.5 h-3.5 rounded-sm transition-colors ${
                    i < shields
                      ? "bg-cyan-400 shadow-sm shadow-cyan-400"
                      : "bg-slate-800 border border-slate-700"
                  }`}
                />
              ))}
            </div>

            {/* Mute Button */}
            <button
              type="button"
              onClick={toggleSound}
              className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
              title={isMuted ? "Unmute Audio" : "Mute Audio"}
            >
              {isMuted ? "🔇" : "🔊"}
            </button>

            {/* Exit Game Button */}
            <button
              type="button"
              onClick={onCloseGame}
              className="px-3.5 py-2 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-700/60 text-red-200 text-xs font-bold transition-colors"
            >
              Exit Game
            </button>
          </div>
        </div>

        {/* Bottom Perimeter: Boost Gauge & Flat Control Hint */}
        <div className="flex items-end justify-between">
          <div className="w-56 bg-slate-950/80 border border-slate-800 rounded-xl p-2.5">
            <div className="flex justify-between text-[10px] font-mono font-bold text-slate-400 mb-1">
              <span>NITRO BOOST</span>
              <span className="text-cyan-400 tabular-nums">{boostEnergy}%</span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-500 to-amber-500 h-full rounded-full transition-all duration-75"
                style={{ width: `${boostEnergy}%` }}
              />
            </div>
          </div>

          <div className="hidden sm:block text-slate-400 text-xs font-mono tracking-wider bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
            WASD / Arrows Move · Space Boost · Esc Pause
          </div>
        </div>
      </div>

      {/* Title Screen Overlay */}
      {gameState === "TITLE" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 z-30 p-6 pointer-events-auto">
          {/* Inline SVG Title Lockup with 30-40% Negative Space */}
          <div className="text-center max-w-xl mx-auto space-y-6 animate-fadeIn">
            <div className="flex justify-center mb-2">
              <svg width="280" height="70" viewBox="0 0 280 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 55L35 15H55L80 55H60L55 45H35L30 55H10ZM38 37H52L45 23L38 37Z" fill="#38BDF8"/>
                <path d="M90 15H115C130 15 140 23 140 35C140 47 130 55 115 55H90V15ZM108 47H114C122 47 125 42 125 35C125 28 122 23 114 23H108V47Z" fill="#38BDF8"/>
                <path d="M145 15H170C182 15 190 21 190 30C190 36 186 41 180 43L193 55H173L162 44H160V55H145V15ZM160 36H168C172 36 175 34 175 30C175 26 172 23 168 23H160V36Z" fill="#F59E0B"/>
                <path d="M198 15V40C198 49 204 55 214 55C224 55 230 49 230 40V15H215V40C215 42 214 45 214 45C214 45 213 42 213 40V15H198Z" fill="#F59E0B"/>
                <path d="M235 55V15H250V55H235Z" fill="#F59E0B"/>
              </svg>
            </div>

            <div className="inline-block px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold tracking-widest uppercase border border-cyan-500/30">
              3D Cyber Billboard Runner
            </div>

            <p className="text-slate-300 text-sm max-w-md mx-auto leading-relaxed">
              Pilot through the neon cyber canyons, collect creative sparks, and activate massive 3D billboards displaying your ad campaign!
            </p>

            <div className="pt-4 space-y-3">
              <button
                type="button"
                onClick={() => {
                  loopStateRef.current.state = "PLAYING";
                  setGameState("PLAYING");
                  sounds.playBoost();
                }}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-amber-500 hover:from-cyan-400 hover:to-amber-400 text-white font-extrabold text-base tracking-wider uppercase shadow-xl shadow-cyan-500/25 transition-all transform hover:scale-105 cursor-pointer"
              >
                Launch Race (Space / Enter)
              </button>

              <div className="text-slate-400 text-xs font-mono">
                WASD Move · Space Boost · Esc Pause
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === "GAMEOVER" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-30 p-6 pointer-events-auto">
          <div className="text-center max-w-md mx-auto space-y-5 bg-slate-900/90 border border-red-500/40 p-8 rounded-3xl shadow-2xl">
            <div className="text-red-500 text-3xl font-black uppercase tracking-widest">
              SYSTEM OVERLOAD
            </div>
            <p className="text-slate-300 text-sm">
              Shields depleted by ad blockers. Your campaign reached:
            </p>
            <div className="text-4xl font-extrabold text-white font-mono tabular-nums">
              {score.toLocaleString()} <span className="text-xs text-slate-400 block font-sans">Total Impressions</span>
            </div>
            <div className="text-amber-400 text-sm font-semibold">
              Activated {billboardsActive} 3D Brand Billboards
            </div>

            <div className="pt-2 flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => {
                  loopStateRef.current.state = "PLAYING";
                  setGameState("PLAYING");
                  setScore(0);
                  setShields(3);
                }}
                className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm transition-all"
              >
                Restart (Space)
              </button>
              <button
                type="button"
                onClick={onCloseGame}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm transition-all"
              >
                Back to Studio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Victory Screen */}
      {gameState === "VICTORY" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-30 p-6 pointer-events-auto">
          <div className="text-center max-w-md mx-auto space-y-5 bg-slate-900/90 border border-emerald-500/40 p-8 rounded-3xl shadow-2xl">
            <div className="text-emerald-400 text-3xl font-black uppercase tracking-widest">
              CAMPAIGN VIRAL!
            </div>
            <p className="text-slate-300 text-sm">
              Outstanding execution! Your campaign billboards dominated the cyber skyline:
            </p>
            <div className="text-4xl font-extrabold text-white font-mono tabular-nums">
              {score.toLocaleString()} <span className="text-xs text-emerald-400 block font-sans">10,000+ Viral Impressions</span>
            </div>

            <div className="pt-2 flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => {
                  loopStateRef.current.state = "PLAYING";
                  setGameState("PLAYING");
                  setScore(0);
                  setShields(3);
                }}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all"
              >
                Play Again
              </button>
              <button
                type="button"
                onClick={onCloseGame}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm transition-all"
              >
                Export Banners
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pause Modal */}
      {gameState === "PAUSED" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-30 p-6 pointer-events-auto">
          <div className="text-center max-w-sm mx-auto space-y-4 bg-slate-900/90 border border-slate-700 p-6 rounded-2xl shadow-xl">
            <div className="text-white text-xl font-bold uppercase tracking-wider">
              Simulation Paused
            </div>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setGameState("PLAYING")}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all"
              >
                Resume (Esc)
              </button>
              <button
                type="button"
                onClick={onCloseGame}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm transition-all"
              >
                Exit to Studio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
