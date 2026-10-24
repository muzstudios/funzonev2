import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  Cpu,
  Atom,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Layers,
  Zap,
  Sparkles,
} from 'lucide-react';
import { AILevel } from '../types';
import { ALL_AI_LEVELS, PROCESSOR_THEMES } from './ProcessorThemeSystem';

interface ThreeProcessorVisualizerProps {
  activeLevel: AILevel;
  onSelectLevel: (level: AILevel) => void;
  isDarkMode: boolean;
}

export const ThreeProcessorVisualizer: React.FC<ThreeProcessorVisualizerProps> = ({
  activeLevel,
  onSelectLevel,
  isDarkMode,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);
  const [isExploded, setIsExploded] = useState(false);
  const [pulseIntensity, setPulseIntensity] = useState(1.0);

  // Refs synced into the animation loop
  const activeLevelRef = useRef<AILevel>(activeLevel);
  const isExplodedRef = useRef<boolean>(isExploded);
  const pulseIntensityRef = useRef<number>(pulseIntensity);

  useEffect(() => {
    activeLevelRef.current = activeLevel;
  }, [activeLevel]);

  useEffect(() => {
    isExplodedRef.current = isExploded;
  }, [isExploded]);

  useEffect(() => {
    pulseIntensityRef.current = pulseIntensity;
  }, [pulseIntensity]);

  const currentTheme = PROCESSOR_THEMES[activeLevel] || PROCESSOR_THEMES.A3_QUANTUM;
  const isQubitTech = currentTheme.techType === 'QUBIT';

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 440;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isDarkMode ? 0x060a14 : 0x0c1324);
    scene.fog = new THREE.FogExp2(isDarkMode ? 0x060a14 : 0x0c1324, 0.045);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(5.4, 3.8, 6.2);

    // 2. Renderer & Software WebGL Guard
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const gl = renderer.getContext();
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const rendererStr = debugInfo
      ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
      : '';
    const isSoftwareGl = /SwiftShader|llvmpipe|Software|Microsoft Basic Render/i.test(
      rendererStr
    );

    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. Environment Map (RoomEnvironment + PMREMGenerator for realistic metallic PBR)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    roomEnv.dispose();
    pmremGenerator.dispose();

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI * 0.62;
    controls.minDistance = 3.5;
    controls.maxDistance = 12;
    controls.target.set(0, 0.2, 0);

    // 5. Studio Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(6, 9, 6);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
    }
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0x22d3ee, 4.5, 16);
    rimLight.position.set(-5, 3, -4);
    scene.add(rimLight);

    const coreGlowLight = new THREE.PointLight(0xfbbf24, 5.0, 12);
    coreGlowLight.position.set(0, 0.6, 0);
    scene.add(coreGlowLight);

    // 6. Composite Multi-Part 3D Processor Hierarchy
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Shared Materials
    const darkSiliconMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.75,
      roughness: 0.28,
    });

    const goldMetalMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.94,
      roughness: 0.16,
    });

    const accentEmissiveMat = new THREE.MeshStandardMaterial({
      color: 0x22d3ee,
      emissive: 0x22d3ee,
      emissiveIntensity: 1.4,
      metalness: 0.4,
      roughness: 0.2,
    });

    const crystalCoreMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      emissive: 0x0ea5e9,
      emissiveIntensity: 0.85,
      metalness: 0.1,
      roughness: 0.08,
      transmission: 0.72,
      thickness: 1.2,
      ior: 1.6,
      clearcoat: 1.0,
    });

    // Part A: Base Substrate Pedestal & Circuit Ring (Always present)
    const baseGroup = new THREE.Group();
    rootGroup.add(baseGroup);

    const substratePlate = new THREE.Mesh(
      new THREE.BoxGeometry(3.8, 0.22, 3.8),
      darkSiliconMat
    );
    substratePlate.position.y = -1.25;
    substratePlate.receiveShadow = true;
    baseGroup.add(substratePlate);

    const goldTrimFrame = new THREE.Mesh(
      new THREE.BoxGeometry(3.92, 0.08, 3.92),
      goldMetalMat
    );
    goldTrimFrame.position.y = -1.28;
    baseGroup.add(goldTrimFrame);

    const circuitRing = new THREE.Mesh(
      new THREE.TorusGeometry(2.2, 0.03, 16, 64),
      accentEmissiveMat
    );
    circuitRing.rotation.x = Math.PI / 2;
    circuitRing.position.y = -1.12;
    baseGroup.add(circuitRing);

    // Part B: TENSOR ARCHITECTURE GROUP (Ortalama Seviye: A1, A1+, A2-)
    // 4x4 Grid of Neural Tensor Matrix Pillars + Bus Bridges + Heat Spreader Cap
    const tensorGroup = new THREE.Group();
    rootGroup.add(tensorGroup);

    const tensorPillars: THREE.Mesh[] = [];
    const pillarGeo = new THREE.BoxGeometry(0.46, 0.95, 0.46);
    const pillarCapGeo = new THREE.BoxGeometry(0.5, 0.08, 0.5);

    for (let gx = -1.5; gx <= 1.5; gx += 1.0) {
      for (let gz = -1.5; gz <= 1.5; gz += 1.0) {
        const pillarWrapper = new THREE.Group();
        pillarWrapper.position.set(gx * 0.78, -0.55, gz * 0.78);

        const body = new THREE.Mesh(pillarGeo, darkSiliconMat);
        body.castShadow = true;
        pillarWrapper.add(body);

        const topCap = new THREE.Mesh(pillarCapGeo, accentEmissiveMat);
        topCap.position.y = 0.51;
        pillarWrapper.add(topCap);

        tensorGroup.add(pillarWrapper);
        tensorPillars.push(body);
      }
    }

    // Tensor Crossbar Interconnects
    for (let i = -1; i <= 1; i++) {
      const busX = new THREE.Mesh(
        new THREE.BoxGeometry(2.8, 0.05, 0.08),
        goldMetalMat
      );
      busX.position.set(0, -0.02, i * 0.78);
      tensorGroup.add(busX);

      const busZ = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.05, 2.8),
        goldMetalMat
      );
      busZ.position.set(i * 0.78, 0.03, 0);
      tensorGroup.add(busZ);
    }

    // Tensor Top Heat-Spreader Frame
    const tensorTopShield = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 0.14, 2.6),
      darkSiliconMat
    );
    tensorTopShield.position.y = 0.55;
    tensorGroup.add(tensorTopShield);

    const tensorCenterBadge = new THREE.Mesh(
      new THREE.CylinderGeometry(0.65, 0.65, 0.18, 8),
      accentEmissiveMat
    );
    tensorCenterBadge.position.y = 0.58;
    tensorGroup.add(tensorCenterBadge);

    // Part C: QUBİT ARCHITECTURE GROUP (En İyi Seviye: A2, A2+, A3_QUANTUM, Q_PU_9000)
    // Cryogenic Quantum Chandelier Tiers + Superconducting Coils + Levitating Entangled QUBİT Core + Gyro Rings
    const qubitGroup = new THREE.Group();
    rootGroup.add(qubitGroup);

    // 3 Cryogenic Gold Dilution Discs
    const topCryoDisc = new THREE.Mesh(
      new THREE.CylinderGeometry(1.75, 1.75, 0.12, 48),
      goldMetalMat
    );
    topCryoDisc.position.y = 1.45;
    qubitGroup.add(topCryoDisc);

    const midCryoDisc = new THREE.Mesh(
      new THREE.CylinderGeometry(1.35, 1.35, 0.1, 48),
      goldMetalMat
    );
    midCryoDisc.position.y = 0.82;
    qubitGroup.add(midCryoDisc);

    const lowerCryoDisc = new THREE.Mesh(
      new THREE.CylinderGeometry(1.55, 1.55, 0.1, 48),
      goldMetalMat
    );
    lowerCryoDisc.position.y = -0.65;
    qubitGroup.add(lowerCryoDisc);

    // 6 Superconducting Coaxial Struts connecting the cryogenic discs
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const r = 1.18;
      const strut = new THREE.Mesh(
        new THREE.CylinderGeometry(0.045, 0.045, 2.1, 16),
        goldMetalMat
      );
      strut.position.set(Math.cos(angle) * r, 0.4, Math.sin(angle) * r);
      qubitGroup.add(strut);

      const nodeOrb = new THREE.Mesh(
        new THREE.SphereGeometry(0.11, 16, 16),
        accentEmissiveMat
      );
      nodeOrb.position.set(Math.cos(angle) * r, 0.1, Math.sin(angle) * r);
      qubitGroup.add(nodeOrb);
    }

    // Central Levitating QUBİT Polyhedral Crystal Core
    const qubitCoreMesh = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.62, 1),
      crystalCoreMat
    );
    qubitCoreMesh.position.y = 0.08;
    qubitGroup.add(qubitCoreMesh);

    const innerNucleusMesh = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.32, 0),
      accentEmissiveMat
    );
    innerNucleusMesh.position.y = 0.08;
    qubitGroup.add(innerNucleusMesh);

    // 3 Concentric Gyroscopic Superposition Rings
    const gyroRing1 = new THREE.Mesh(
      new THREE.TorusGeometry(0.92, 0.028, 16, 64),
      accentEmissiveMat
    );
    gyroRing1.position.y = 0.08;
    qubitGroup.add(gyroRing1);

    const gyroRing2 = new THREE.Mesh(
      new THREE.TorusGeometry(1.12, 0.024, 16, 64),
      goldMetalMat
    );
    gyroRing2.position.y = 0.08;
    qubitGroup.add(gyroRing2);

    const gyroRing3 = new THREE.Mesh(
      new THREE.TorusGeometry(1.32, 0.02, 16, 64),
      accentEmissiveMat
    );
    gyroRing3.position.y = 0.08;
    qubitGroup.add(gyroRing3);

    // 7. Resize Observer
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth || 800;
      const newH = container.clientHeight || 440;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    // 8. Animation Loop with Software WebGL Pacing Guard
    const clock = new THREE.Clock();
    let rafId = 0;
    let isCanceled = false;

    const animate = () => {
      if (isCanceled) return;
      const elapsed = clock.getElapsedTime();
      const lvl = activeLevelRef.current;
      const cfg = PROCESSOR_THEMES[lvl] || PROCESSOR_THEMES.A3_QUANTUM;
      const isQubit = cfg.techType === 'QUBIT';
      const exploded = isExplodedRef.current;
      const pulse = pulseIntensityRef.current;

      // Speed factor inversely proportional to writeSeconds (1s is fastest, 20s is calmest)
      const speedFactor =
        lvl === 'Q_PU_9000'
          ? 3.2
          : lvl === 'A3_QUANTUM'
          ? 2.1
          : lvl === 'A2+'
          ? 1.75
          : lvl === 'A2'
          ? 1.45
          : lvl === 'A2-'
          ? 1.15
          : lvl === 'A1+'
          ? 0.95
          : 0.75;

      // Smoothly update accent colors based on selected processor theme
      const primaryColor = new THREE.Color(cfg.swatchHex[0]);
      const secondaryColor = new THREE.Color(cfg.swatchHex[1]);
      accentEmissiveMat.color.lerp(primaryColor, 0.08);
      accentEmissiveMat.emissive.lerp(primaryColor, 0.08);
      accentEmissiveMat.emissiveIntensity =
        (1.1 + Math.sin(elapsed * speedFactor * 3) * 0.45) * pulse;

      crystalCoreMat.color.lerp(primaryColor, 0.08);
      crystalCoreMat.emissive.lerp(secondaryColor, 0.08);
      coreGlowLight.color.lerp(primaryColor, 0.08);
      rimLight.color.lerp(secondaryColor, 0.08);

      // Toggle visibility & smooth scale morph between Tensor (Ortalama) and QUBİT (En İyi)
      tensorGroup.visible = !isQubit;
      qubitGroup.visible = isQubit;

      rootGroup.rotation.y = elapsed * 0.28 * speedFactor;

      if (!isQubit) {
        // Animate Tensor Matrix Pillars (A1, A1+, A2-)
        tensorPillars.forEach((pillar, idx) => {
          const wave = Math.sin(elapsed * speedFactor * 2.5 + idx * 0.55);
          pillar.scale.y = 0.85 + wave * 0.22 * pulse;
        });
        tensorTopShield.position.y = exploded ? 1.25 : 0.55;
        tensorCenterBadge.position.y = exploded ? 1.32 : 0.58;
        tensorCenterBadge.rotation.y = -elapsed * speedFactor;
      } else {
        // Animate Cryogenic QUBİT Chandelier (A2, A2+, A3_QUANTUM, Q_PU_9000)
        topCryoDisc.position.y = exploded ? 2.05 : 1.45;
        midCryoDisc.position.y = exploded ? 1.15 : 0.82;
        lowerCryoDisc.position.y = exploded ? -1.05 : -0.65;

        qubitCoreMesh.rotation.x = elapsed * 0.9 * speedFactor;
        qubitCoreMesh.rotation.y = elapsed * 1.3 * speedFactor;
        const coreScale = 1 + Math.sin(elapsed * speedFactor * 3.2) * 0.08 * pulse;
        qubitCoreMesh.scale.setScalar(coreScale);

        innerNucleusMesh.rotation.z = -elapsed * 1.8 * speedFactor;
        innerNucleusMesh.rotation.x = elapsed * 1.4 * speedFactor;

        gyroRing1.rotation.x = elapsed * 1.4 * speedFactor;
        gyroRing1.rotation.y = elapsed * 0.8 * speedFactor;

        gyroRing2.rotation.y = -elapsed * 1.1 * speedFactor;
        gyroRing2.rotation.z = elapsed * 0.9 * speedFactor;

        gyroRing3.rotation.x = Math.PI / 3 + Math.sin(elapsed * speedFactor) * 0.5;
        gyroRing3.rotation.z = -elapsed * 1.5 * speedFactor;
      }

      controls.update();
      renderer.render(scene, camera);

      const afterDraw = () => {
        if (!isCanceled) {
          rafId = requestAnimationFrame(animate);
        }
      };

      if (isSoftwareGl) {
        setTimeout(afterDraw, 16);
      } else {
        afterDraw();
      }
    };

    animate();

    return () => {
      isCanceled = true;
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      envTarget.dispose();
      renderer.dispose();
    };
  }, [isDarkMode]);

  return (
    <div
      className={`relative w-full h-[460px] sm:h-[510px] rounded-3xl border overflow-hidden select-none shadow-xl ${
        isDarkMode ? 'border-slate-800/90 bg-[#060A14]' : 'border-slate-300 bg-[#0C1324]'
      }`}
    >
      {/* 3D WebGL Canvas Mount */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top-Left Compact Telemetry Badge Overlay */}
      <div className="pointer-events-none absolute top-4 left-4 right-4 flex flex-wrap items-start justify-between gap-2">
        <div className="pointer-events-auto px-3.5 py-2 rounded-2xl bg-slate-950/75 backdrop-blur-md border border-white/10 text-white space-y-1 max-w-md">
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono font-bold ${
                isQubitTech
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
              }`}
            >
              {isQubitTech ? <Atom size={11} /> : <Cpu size={11} />}
              <span>
                {isQubitTech
                  ? '3B QUBİT TEKNOLOJİSİ · EN İYİ SEVİYE'
                  : '3B TENSOR TEKNOLOJİSİ · ORTALAMA SEVİYE'}
              </span>
            </span>

            <span className="font-mono text-amber-300 font-bold">
              ⚡ {currentTheme.writeSeconds} Saniye Yazım
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: currentTheme.swatchHex[0] }}
            />
            <h3 className="font-display text-sm sm:text-base font-extrabold tracking-tight">
              {currentTheme.shortLabel} — {currentTheme.coreCountLabel} Çekirdek Mimarisi
            </h3>
          </div>
          <p className="text-[11px] text-slate-300">
            {isQubitTech
              ? 'Kriyojenik süperpozisyon halkaları ve kuantum dolanıklık kristali (En İyi Performans)'
              : '4x4 Paralel Nöral Tensor sütun matrisi ve silikon veri yolu (Ortalama Performans)'}
          </p>
        </div>

        {/* Top-Right Quick Actions */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsExploded((prev) => !prev)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border backdrop-blur-md flex items-center gap-1.5 transition-all cursor-pointer ${
              isExploded
                ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200'
                : 'bg-slate-950/75 border-white/15 text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Layers size={13} />
            <span>{isExploded ? 'Katmanları Birleştir' : 'Katmanları Aç (Exploded)'}</span>
          </button>
        </div>
      </div>

      {/* Collapsible Bottom Control Dock (< 12% viewport area) */}
      <div className="absolute bottom-3 left-3 right-3 flex flex-col items-center pointer-events-none">
        <div className="pointer-events-auto w-full max-w-4xl rounded-2xl bg-slate-950/80 backdrop-blur-md border border-white/15 px-3.5 py-2 text-white shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs">
              <Sparkles size={13} className="text-amber-400" />
              <span className="font-display font-bold">
                3B İşlemci & Teknoloji Seçici (Fare ile 360° Döndürün)
              </span>
            </div>

            <div className="flex items-center gap-3">
              {!isDockCollapsed && (
                <div className="hidden sm:flex items-center gap-2 text-[11px]">
                  <Zap size={12} className="text-cyan-400" />
                  <span className="text-slate-300">Rezonans:</span>
                  <input
                    type="range"
                    min={0.4}
                    max={2.0}
                    step={0.1}
                    value={pulseIntensity}
                    onChange={(e) => setPulseIntensity(parseFloat(e.target.value))}
                    className="w-20 accent-cyan-400 cursor-pointer"
                  />
                </div>
              )}

              <button
                type="button"
                onClick={() => setIsDockCollapsed((prev) => !prev)}
                className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-[11px] font-medium flex items-center gap-1 cursor-pointer"
              >
                <span>{isDockCollapsed ? 'Kontrolleri Göster' : 'Küçült'}</span>
                {isDockCollapsed ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
            </div>
          </div>

          {!isDockCollapsed && (
            <div className="mt-2 pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-1.5">
              {ALL_AI_LEVELS.map((lvl) => {
                const cfg = PROCESSOR_THEMES[lvl];
                const isSelected = activeLevel === lvl;
                const isQubit = cfg.techType === 'QUBIT';
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => onSelectLevel(lvl)}
                    className={`px-2.5 py-1.5 rounded-xl font-mono text-[11px] flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? isQubit
                          ? 'bg-emerald-500/25 border border-emerald-400 text-white font-bold'
                          : 'bg-blue-500/25 border border-blue-400 text-white font-bold'
                        : 'bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300'
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: cfg.swatchHex[0] }}
                    />
                    <span>
                      {lvl === 'A3_QUANTUM' ? 'A3 Quantum' : lvl === 'Q_PU_9000' ? 'Q-PU 9000' : lvl}
                    </span>
                    <span className="text-[10px] opacity-80">
                      ({cfg.writeSeconds}sn · {isQubit ? 'QUBİT' : 'Tensor'})
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
