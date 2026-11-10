/**
 * Armstrong Manor - Detective Noir 3D (Mini-City & Multi-Case Expansion)
 * Mini ciudad de 4 cuadras con peatones y testigos interrogables,
 * múltiples entornos (Edificio Armstrong, Librería El Cuervo, Hospital Santa Elena, Academia San Judas),
 * selector de 30/60 FPS, guardado manual y perspectiva 3D cinematográfica.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  INITIAL_CLUES,
  INITIAL_SUSPECTS,
  DIALOGUE_TREE,
  GAME_ENDINGS,
  ClueItem,
  Suspect,
  DialogueNode,
  EndingData,
  GameSettings,
  SaveState
} from './game/gameState';
import {
  buildCompleteBuilding,
  WorldInteractable,
  CompleteBuildingData,
  FLOOR_HEIGHT
} from './game/buildingBuilder';
import { buildMiniCity, CitySceneData } from './game/cityBuilder';
import { buildLocationInterior, LocationInteriorData } from './game/locationsBuilder';
import {
  LocationType,
  CITY_LOCATIONS,
  CITY_PEDESTRIANS,
  ADDITIONAL_CLUES,
  ADDITIONAL_SUSPECTS,
  PEDESTRIAN_DIALOGUES
} from './game/casesData';
import { createDetectiveModel, CharacterGroup } from './game/characterBuilder';
import { noirAudio } from './audio/noirAudio';
import { VirtualJoystick } from './components/VirtualJoystick';
import { DialogueModal } from './components/DialogueModal';
import { NotebookModal } from './components/NotebookModal';
import { InventoryModal } from './components/InventoryModal';
import { ElevatorModal } from './components/ElevatorModal';
import { EndingModal } from './components/EndingModal';
import { PauseModal } from './components/PauseModal';
import { CityMapModal } from './components/CityMapModal';
import {
  Volume2,
  VolumeX,
  BookOpen,
  Briefcase,
  Play,
  RotateCcw,
  Sparkles,
  Footprints,
  Compass,
  Layers,
  Pause,
  Save,
  Gauge,
  MapPin,
  Building,
  Activity,
  GraduationCap
} from 'lucide-react';

const AUTO_SAVE_KEY = 'armstrong_manor_city_v4';
const MANUAL_SAVE_KEY = 'armstrong_manor_manual_save_v2';
const SETTINGS_KEY = 'armstrong_manor_settings_v2';

const ALL_INITIAL_CLUES: ClueItem[] = [...INITIAL_CLUES, ...ADDITIONAL_CLUES];
const ALL_INITIAL_SUSPECTS: Suspect[] = [...INITIAL_SUSPECTS, ...ADDITIONAL_SUSPECTS];
const ALL_DIALOGUES: Record<string, DialogueNode> = { ...DIALOGUE_TREE, ...PEDESTRIAN_DIALOGUES };

export default function App() {
  // --- Game Flow State ---
  const [gameMode, setGameMode] = useState<'title' | 'playing' | 'paused' | 'ending'>('title');
  const [currentLocation, setCurrentLocation] = useState<LocationType>('city');
  const [currentFloor, setCurrentFloor] = useState<number>(1);
  const [clues, setClues] = useState<ClueItem[]>(ALL_INITIAL_CLUES);
  const [suspects, setSuspects] = useState<Suspect[]>(ALL_INITIAL_SUSPECTS);

  // Settings: 30 FPS default for instant lag-free mobile gameplay
  const [settings, setSettings] = useState<GameSettings>({
    targetFps: 30,
    quality: 'performance',
    shadowsEnabled: false,
    rainDensity: 'low'
  });

  const [lastSaveInfo, setLastSaveInfo] = useState<SaveState | null>(null);

  // Modals & Dialogue
  const [activeDialogue, setActiveDialogue] = useState<DialogueNode | null>(null);
  const [activeSuspect, setActiveSuspect] = useState<Suspect | null>(null);
  const [showNotebook, setShowNotebook] = useState<boolean>(false);
  const [showInventory, setShowInventory] = useState<boolean>(false);
  const [showElevator, setShowElevator] = useState<boolean>(false);
  const [showMap, setShowMap] = useState<boolean>(false);
  const [activeEnding, setActiveEnding] = useState<EndingData | null>(null);

  // Notification Banner
  const [notification, setNotification] = useState<string | null>(null);
  const [nearbyInteractable, setNearbyInteractable] = useState<WorldInteractable | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // --- Three.js & Engine References ---
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const moveVectorRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const keysDownRef = useRef<Set<string>>(new Set());

  // Mutable Game World References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const detectiveRef = useRef<CharacterGroup | null>(null);

  // Environments References
  const citySceneRef = useRef<CitySceneData | null>(null);
  const buildingDataRef = useRef<CompleteBuildingData | null>(null);
  const locationInteriorsRef = useRef<Map<LocationType, LocationInteriorData>>(new Map());

  const rainSystemRef = useRef<THREE.Points | null>(null);
  const stepTimerRef = useRef<number>(0);
  const lastRenderTimeRef = useRef<number>(0);

  // Sync state refs to allow instant access in requestAnimationFrame
  const currentLocationRef = useRef<LocationType>(currentLocation);
  currentLocationRef.current = currentLocation;

  const currentFloorRef = useRef<number>(currentFloor);
  currentFloorRef.current = currentFloor;

  const cluesRef = useRef<ClueItem[]>(clues);
  cluesRef.current = clues;

  const suspectsRef = useRef<Suspect[]>(suspects);
  suspectsRef.current = suspects;

  const settingsRef = useRef<GameSettings>(settings);
  settingsRef.current = settings;

  const isModalOpenRef = useRef<boolean>(false);
  isModalOpenRef.current = !!activeDialogue || showNotebook || showInventory || showElevator || showMap || !!activeEnding || gameMode !== 'playing';

  // --- Load Game & Settings from localStorage on Mount ---
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(SETTINGS_KEY);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      }

      const savedState = localStorage.getItem(MANUAL_SAVE_KEY);
      if (savedState) {
        setLastSaveInfo(JSON.parse(savedState));
      }

      const savedAuto = localStorage.getItem(AUTO_SAVE_KEY);
      if (savedAuto) {
        const parsed = JSON.parse(savedAuto);
        if (parsed.clues) setClues(parsed.clues);
        if (parsed.suspects) setSuspects(parsed.suspects);
        if (parsed.currentFloor) setCurrentFloor(parsed.currentFloor);
        if (parsed.currentLocation) setCurrentLocation(parsed.currentLocation);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleUpdateSettings = useCallback((newSettings: Partial<GameSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      settingsRef.current = updated;
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
      } catch {}

      if (rendererRef.current) {
        if (updated.quality === 'performance') {
          rendererRef.current.setPixelRatio(1.0);
          rendererRef.current.shadowMap.enabled = false;
        } else if (updated.quality === 'balanced') {
          rendererRef.current.setPixelRatio(1.0);
          rendererRef.current.shadowMap.enabled = updated.shadowsEnabled;
        } else {
          rendererRef.current.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
          rendererRef.current.shadowMap.enabled = updated.shadowsEnabled;
        }
      }

      if (dirLightRef.current) {
        dirLightRef.current.castShadow = updated.shadowsEnabled;
      }

      return updated;
    });
  }, []);

  const persistGame = useCallback((newClues?: ClueItem[], newSuspects?: Suspect[], floor?: number, loc?: LocationType) => {
    try {
      const data = {
        clues: newClues || cluesRef.current,
        suspects: newSuspects || suspectsRef.current,
        currentFloor: floor ?? currentFloorRef.current,
        currentLocation: loc ?? currentLocationRef.current,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(data));
    } catch {}
  }, []);

  const showBanner = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(prev => (prev === msg ? null : prev));
    }, 4500);
  };

  // --- Manual Save Function ---
  const handleManualSave = useCallback(() => {
    const saveObj: SaveState = {
      version: 2,
      timestamp: new Date().toISOString(),
      floor: currentFloorRef.current,
      clues: cluesRef.current,
      suspects: suspectsRef.current,
      notesCount: cluesRef.current.filter(c => c.discovered).length
    };
    try {
      localStorage.setItem(MANUAL_SAVE_KEY, JSON.stringify(saveObj));
      setLastSaveInfo(saveObj);
      showBanner(`¡Partida guardada en ${getLocationDisplayName(currentLocationRef.current)} con ${saveObj.notesCount} pistas!`);
      noirAudio.playClueFound();
    } catch {
      showBanner('Error al escribir en almacenamiento.');
    }
  }, []);

  // --- SWITCH ENVIRONMENT (City vs Armstrong vs Bookstore vs Hospital vs School) ---
  const switchLocation = useCallback((newLoc: LocationType) => {
    if (!detectiveRef.current || !sceneRef.current) return;

    // Toggle Visibility of Groups
    if (citySceneRef.current) {
      citySceneRef.current.cityGroup.visible = newLoc === 'city';
    }
    if (buildingDataRef.current) {
      buildingDataRef.current.buildingGroup.visible = newLoc === 'armstrong';
    }
    locationInteriorsRef.current.forEach((interior, key) => {
      interior.group.visible = key === newLoc;
    });

    setCurrentLocation(newLoc);
    currentLocationRef.current = newLoc;

    // Position Detective based on location
    if (newLoc === 'city') {
      // Spawn near the building just exited
      detectiveRef.current.position.set(0, 0, 0);
      showBanner('Has salido a las calles de la ciudad (4 cuadras). Pregunta a los peatones.');
    } else if (newLoc === 'armstrong') {
      const baseY = (currentFloorRef.current - 1) * FLOOR_HEIGHT;
      detectiveRef.current.position.set(0, baseY, 1.0);
      showBanner(`Entraste al Edificio Armstrong: Piso ${currentFloorRef.current}`);
    } else {
      const interior = locationInteriorsRef.current.get(newLoc);
      if (interior) {
        detectiveRef.current.position.copy(interior.spawnPoint);
      } else {
        detectiveRef.current.position.set(0, 0, 2.0);
      }
      showBanner(`Has entrado a: ${getLocationDisplayName(newLoc)}`);
    }

    persistGame(undefined, undefined, undefined, newLoc);
    noirAudio.playPageTurn();
  }, [persistGame]);

  // --- Change Floor within Armstrong Building ---
  const switchFloor = useCallback((newFloor: number, atStairs?: 'up' | 'down') => {
    if (!detectiveRef.current) return;

    setCurrentFloor(newFloor);
    currentFloorRef.current = newFloor;

    const targetBaseY = (newFloor - 1) * FLOOR_HEIGHT;

    if (atStairs === 'up') {
      detectiveRef.current.position.set(5.0, targetBaseY, 0.0);
    } else if (atStairs === 'down') {
      detectiveRef.current.position.set(5.0, targetBaseY, -1.8);
    } else {
      detectiveRef.current.position.set(-4.5, targetBaseY, -1.0);
    }

    persistGame(undefined, undefined, newFloor);
    showBanner(`Has llegado al Piso ${newFloor}: ${getFloorTitle(newFloor)}`);
  }, [persistGame]);

  // --- Manual Load Function ---
  const handleManualLoad = useCallback(() => {
    try {
      const saved = localStorage.getItem(MANUAL_SAVE_KEY);
      if (saved) {
        const parsed: SaveState = JSON.parse(saved);
        setClues(parsed.clues);
        cluesRef.current = parsed.clues;
        setSuspects(parsed.suspects);
        suspectsRef.current = parsed.suspects;
        switchFloor(parsed.floor);
        setGameMode('playing');
        showBanner(`¡Partida cargada exitosamente del Piso ${parsed.floor}!`);
        noirAudio.playPageTurn();
      }
    } catch {
      showBanner('No se encontró una partida guardada.');
    }
  }, [switchFloor]);

  // --- THREE.JS INITIALIZATION (Mount once) ---
  useEffect(() => {
    if (!canvasMountRef.current) return;

    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const initialSettings = settingsRef.current;
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl && initialSettings.quality !== 'performance',
      powerPreference: 'high-performance',
      alpha: false
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(initialSettings.quality === 'high' ? Math.min(window.devicePixelRatio, 1.5) : 1.0);
    renderer.shadowMap.enabled = initialSettings.shadowsEnabled && !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(window.innerWidth, window.innerHeight);

    canvasMountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x06070a);
    scene.fog = new THREE.FogExp2(0x06070a, 0.022);
    sceneRef.current = scene;

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 140);
    camera.position.set(0, 11.5, 13.0);
    cameraRef.current = camera;

    const hemiLight = new THREE.HemisphereLight(0x384152, 0x111620, 0.75);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffeedd, 1.1);
    dirLight.position.set(-12, 28, 14);
    dirLight.castShadow = initialSettings.shadowsEnabled && !isSoftwareGl;
    if (dirLight.castShadow) {
      dirLight.shadow.mapSize.width = 512;
      dirLight.shadow.mapSize.height = 512;
      dirLight.shadow.camera.near = 1.0;
      dirLight.shadow.camera.far = 50;
      dirLight.shadow.camera.left = -18;
      dirLight.shadow.camera.right = 18;
      dirLight.shadow.camera.top = 26;
      dirLight.shadow.camera.bottom = -4;
    }
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    // Detective Player Model
    const detective = createDetectiveModel();
    detective.position.set(0, 0, 0);
    scene.add(detective);
    detectiveRef.current = detective;

    // --- 1. BUILD THE 4-BLOCK 3D CITY ---
    const cityScene = buildMiniCity();
    scene.add(cityScene.cityGroup);
    citySceneRef.current = cityScene;

    // --- 2. BUILD THE 5-STORY ARMSTRONG DOLLHOUSE ---
    const buildingData = buildCompleteBuilding();
    buildingData.buildingGroup.visible = false; // hidden while in city
    scene.add(buildingData.buildingGroup);
    buildingDataRef.current = buildingData;

    buildingData.updateDollhouseVisibility(currentFloorRef.current, 10.0);
    buildingData.updateElevatorPosition(currentFloorRef.current, 10.0);

    // --- 3. BUILD THE SPECIAL INTERIORS (Bookstore, Hospital, School) ---
    (['bookstore', 'hospital', 'school'] as const).forEach(loc => {
      const interior = buildLocationInterior(loc);
      interior.group.visible = false;
      scene.add(interior.group);
      locationInteriorsRef.current.set(loc, interior);
    });

    // Rain Particle System
    const rainCount = initialSettings.rainDensity === 'low' ? 240 : (initialSettings.rainDensity === 'medium' ? 450 : 700);
    const rainGeo = new THREE.BufferGeometry();
    const rainPositions = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount * 3; i += 3) {
      rainPositions[i] = (Math.random() - 0.5) * 44;
      rainPositions[i + 1] = Math.random() * 28;
      rainPositions[i + 2] = -2 + (Math.random() - 0.5) * 44;
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
    const rainMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.1,
      transparent: true,
      opacity: 0.7
    });
    const rainSystem = new THREE.Points(rainGeo, rainMat);
    scene.add(rainSystem);
    rainSystemRef.current = rainSystem;

    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // --- FPS-Capped Simulation Loop ---
    let animationFrameId: number = 0;
    const clock = new THREE.Clock();

    const tick = () => {
      animationFrameId = requestAnimationFrame(tick);

      const now = performance.now();
      const targetFps = settingsRef.current.targetFps || 30;
      const targetInterval = 1000 / targetFps;
      const elapsedSinceLastRender = now - lastRenderTimeRef.current;

      if (elapsedSinceLastRender < targetInterval - 1.8) {
        return;
      }
      lastRenderTimeRef.current = now;

      const dt = Math.min(clock.getDelta(), 0.05);
      const elapsedTime = clock.getElapsedTime();

      // Rain animation
      if (rainSystemRef.current) {
        const positions = rainSystemRef.current.geometry.attributes.position.array as Float32Array;
        const count = positions.length / 3;
        for (let i = 1; i < count * 3; i += 3) {
          positions[i] -= dt * 18;
          if (positions[i] < 0) {
            positions[i] = 28;
          }
        }
        rainSystemRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // Neon sign & elevator updates if in Armstrong
      if (currentLocationRef.current === 'armstrong' && buildingDataRef.current) {
        buildingDataRef.current.neonLight.intensity = 1.8 + Math.sin(elapsedTime * 6) * 0.25;
        buildingDataRef.current.updateDollhouseVisibility(currentFloorRef.current, dt);
        buildingDataRef.current.updateElevatorPosition(currentFloorRef.current, dt);
      }

      // Player Movement Logic (Only if no modal is active)
      if (detectiveRef.current && !isModalOpenRef.current) {
        let inputX = moveVectorRef.current.x;
        let inputZ = moveVectorRef.current.y;

        if (keysDownRef.current.has('KeyA') || keysDownRef.current.has('ArrowLeft')) inputX -= 1;
        if (keysDownRef.current.has('KeyD') || keysDownRef.current.has('ArrowRight')) inputX += 1;
        if (keysDownRef.current.has('KeyW') || keysDownRef.current.has('ArrowUp')) inputZ -= 1;
        if (keysDownRef.current.has('KeyS') || keysDownRef.current.has('ArrowDown')) inputZ += 1;

        const len = Math.hypot(inputX, inputZ);
        if (len > 0.05) {
          const normX = (inputX / (len > 1 ? len : 1));
          const normZ = (inputZ / (len > 1 ? len : 1));

          const speed = 4.4;
          const nextX = detectiveRef.current.position.x + normX * speed * dt;
          const nextZ = detectiveRef.current.position.z + normZ * speed * dt;

          // Boundary Clamping depends on current environment
          const isCity = currentLocationRef.current === 'city';
          const maxBoundX = isCity ? 19.5 : 6.8;
          const maxBoundZ = isCity ? 19.5 : 4.5;

          const clampedX = Math.max(-maxBoundX, Math.min(maxBoundX, nextX));
          const clampedZ = Math.max(-maxBoundZ, Math.min(maxBoundZ, nextZ));

          detectiveRef.current.position.x = clampedX;
          detectiveRef.current.position.z = clampedZ;

          // Base Y depends on current floor if in Armstrong
          const floorBaseY = currentLocationRef.current === 'armstrong'
            ? (currentFloorRef.current - 1) * FLOOR_HEIGHT
            : 0;
          detectiveRef.current.position.y = floorBaseY;

          const targetAngle = Math.atan2(normX, normZ);
          detectiveRef.current.rotation.y = THREE.MathUtils.damp(
            detectiveRef.current.rotation.y,
            targetAngle,
            15,
            dt
          );

          const walkSpeed = 12;
          const walkCycle = elapsedTime * walkSpeed;
          const legSwing = Math.sin(walkCycle) * 0.45;

          const uData = detectiveRef.current.userData;
          if (uData.leftLeg) (uData.leftLeg as THREE.Object3D).rotation.x = legSwing;
          if (uData.rightLeg) (uData.rightLeg as THREE.Object3D).rotation.x = -legSwing;
          if (uData.leftArm) (uData.leftArm as THREE.Object3D).rotation.x = -legSwing * 0.6;
          if (uData.rightArm) (uData.rightArm as THREE.Object3D).rotation.x = legSwing * 0.6;

          stepTimerRef.current += dt;
          if (stepTimerRef.current > 0.32) {
            stepTimerRef.current = 0;
            noirAudio.playFootstep();
          }
        } else {
          const uData = detectiveRef.current.userData;
          if (uData.leftLeg) (uData.leftLeg as THREE.Object3D).rotation.x = 0;
          if (uData.rightLeg) (uData.rightLeg as THREE.Object3D).rotation.x = 0;
          if (uData.leftArm) (uData.leftArm as THREE.Object3D).rotation.x = 0;
          if (uData.rightArm) (uData.rightArm as THREE.Object3D).rotation.x = 0;
        }

        // Camera follow tailored to current environment
        if (cameraRef.current) {
          if (currentLocationRef.current === 'city') {
            // Isometric street perspective following detective smoothly
            const targetCamX = THREE.MathUtils.clamp(detectiveRef.current.position.x * 0.7, -10, 10);
            const targetCamY = 11.5;
            const targetCamZ = detectiveRef.current.position.z + 13.0;

            cameraRef.current.position.x = THREE.MathUtils.damp(cameraRef.current.position.x, targetCamX, 5, dt);
            cameraRef.current.position.y = THREE.MathUtils.damp(cameraRef.current.position.y, targetCamY, 5, dt);
            cameraRef.current.position.z = THREE.MathUtils.damp(cameraRef.current.position.z, targetCamZ, 5, dt);

            cameraRef.current.lookAt(detectiveRef.current.position.x, 1.2, detectiveRef.current.position.z);
          } else if (currentLocationRef.current === 'armstrong') {
            // Dollhouse Exterior Cutaway View
            const currentBaseY = (currentFloorRef.current - 1) * FLOOR_HEIGHT;
            const targetCamY = currentBaseY + 3.8;
            const targetCamZ = 21.5;
            const targetCamX = THREE.MathUtils.clamp(detectiveRef.current.position.x * 0.25, -2.5, 2.5);

            cameraRef.current.position.x = THREE.MathUtils.damp(cameraRef.current.position.x, targetCamX, 5, dt);
            cameraRef.current.position.y = THREE.MathUtils.damp(cameraRef.current.position.y, targetCamY, 5, dt);
            cameraRef.current.position.z = THREE.MathUtils.damp(cameraRef.current.position.z, targetCamZ, 5, dt);

            cameraRef.current.lookAt(targetCamX * 0.4, currentBaseY + 1.8, 0);
          } else {
            // Interior room camera
            const targetCamX = THREE.MathUtils.clamp(detectiveRef.current.position.x * 0.4, -2.0, 2.0);
            const targetCamY = 6.8;
            const targetCamZ = detectiveRef.current.position.z + 8.5;

            cameraRef.current.position.x = THREE.MathUtils.damp(cameraRef.current.position.x, targetCamX, 5, dt);
            cameraRef.current.position.y = THREE.MathUtils.damp(cameraRef.current.position.y, targetCamY, 5, dt);
            cameraRef.current.position.z = THREE.MathUtils.damp(cameraRef.current.position.z, targetCamZ, 5, dt);

            cameraRef.current.lookAt(0, 1.2, 0);
          }
        }

        // Proximity detection for interactables
        let activeInteractables: WorldInteractable[] = [];
        if (currentLocationRef.current === 'city' && citySceneRef.current) {
          activeInteractables = citySceneRef.current.interactables;
        } else if (currentLocationRef.current === 'armstrong' && buildingDataRef.current) {
          const floorUnit = buildingDataRef.current.floors.get(currentFloorRef.current);
          if (floorUnit) activeInteractables = floorUnit.interactables;
        } else {
          const interior = locationInteriorsRef.current.get(currentLocationRef.current);
          if (interior) activeInteractables = interior.interactables;
        }

        const playerPos = detectiveRef.current.position;
        let closest: WorldInteractable | null = null;
        let minDistance = Infinity;

        for (const item of activeInteractables) {
          const dist = playerPos.distanceTo(item.position);
          if (dist <= item.radius && dist < minDistance) {
            minDistance = dist;
            closest = item;
          }
        }
        setNearbyInteractable(closest);
      }

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // --- Keyboard Event Listeners ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysDownRef.current.add(e.code);

      if ((e.code === 'KeyE' || e.code === 'Space') && !isModalOpenRef.current) {
        e.preventDefault();
        triggerInteractAction();
      }

      if ((e.code === 'Tab' || e.code === 'KeyJ') && gameMode === 'playing') {
        e.preventDefault();
        setShowNotebook(prev => !prev);
        noirAudio.playPageTurn();
      }

      if (e.code === 'KeyM' && gameMode === 'playing') {
        e.preventDefault();
        setShowMap(prev => !prev);
      }

      if (e.code === 'KeyI' && gameMode === 'playing') {
        e.preventDefault();
        setShowInventory(prev => !prev);
      }

      if ((e.code === 'F5' || (e.ctrlKey && e.code === 'KeyS')) && gameMode === 'playing') {
        e.preventDefault();
        handleManualSave();
      }

      if (e.code === 'Escape') {
        if (activeDialogue) setActiveDialogue(null);
        else if (showNotebook) setShowNotebook(false);
        else if (showInventory) setShowInventory(false);
        else if (showElevator) setShowElevator(false);
        else if (showMap) setShowMap(false);
        else if (gameMode === 'playing') setGameMode('paused');
        else if (gameMode === 'paused') setGameMode('playing');
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysDownRef.current.delete(e.code);
    };

    const handleBlur = () => {
      keysDownRef.current.clear();
      moveVectorRef.current = { x: 0, y: 0 };
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [gameMode, activeDialogue, showNotebook, showInventory, showElevator, showMap, handleManualSave]);

  // --- Action Trigger Handler ---
  const triggerInteractAction = useCallback(() => {
    if (!nearbyInteractable) return;

    // 1. Enter or Exit Locations
    if (nearbyInteractable.targetId === 'city') {
      switchLocation('city');
      return;
    }
    if (nearbyInteractable.targetId === 'armstrong') {
      switchLocation('armstrong');
      return;
    }
    if (nearbyInteractable.targetId === 'bookstore') {
      switchLocation('bookstore');
      return;
    }
    if (nearbyInteractable.targetId === 'hospital') {
      switchLocation('hospital');
      return;
    }
    if (nearbyInteractable.targetId === 'school') {
      switchLocation('school');
      return;
    }

    // 2. Elevator & Stairs within Armstrong
    if (nearbyInteractable.type === 'elevator') {
      setShowElevator(true);
      return;
    }
    if (nearbyInteractable.type === 'stairs_up' && nearbyInteractable.targetFloor) {
      switchFloor(nearbyInteractable.targetFloor, 'up');
      return;
    }
    if (nearbyInteractable.type === 'stairs_down' && nearbyInteractable.targetFloor) {
      switchFloor(nearbyInteractable.targetFloor, 'down');
      return;
    }

    // 3. Clue Discovery
    if (nearbyInteractable.type === 'clue' && nearbyInteractable.targetId) {
      const clueId = nearbyInteractable.targetId;
      const clueIndex = clues.findIndex(c => c.id === clueId);
      if (clueIndex !== -1) {
        const clue = clues[clueIndex];
        if (!clue.discovered) {
          const updatedClues = [...clues];
          updatedClues[clueIndex] = {
            ...clue,
            discovered: true,
            discoveryDate: new Date().toLocaleTimeString()
          };
          setClues(updatedClues);
          persistGame(updatedClues, undefined, currentFloor, currentLocation);
          noirAudio.playClueFound();
          showBanner(`¡EVIDENCIA ENCONTRADA: ${clue.name}! (Guardada en Libreta)`);
        } else {
          showBanner(`Ya registraste esta evidencia: ${clue.name}.`);
        }
      }
      return;
    }

    // 4. Pedestrian & Suspect Interrogations
    if (nearbyInteractable.type === 'npc' && nearbyInteractable.targetId) {
      const charId = nearbyInteractable.targetId;

      // Check if it's a pedestrian
      const pedestrian = CITY_PEDESTRIANS.find(p => p.id === charId);
      if (pedestrian) {
        const rootNode = ALL_DIALOGUES[pedestrian.dialogueId];
        if (rootNode) {
          setActiveSuspect({
            id: pedestrian.id,
            name: pedestrian.name,
            role: pedestrian.role,
            floor: 0,
            room: 'Calles de la Ciudad',
            avatarColor: pedestrian.color,
            avatarIcon: 'user',
            bio: 'Peatón del distrito. Ha visto u oído movimientos en las cuatro cuadras durante la tormenta.',
            alibi: 'Testigo callejero en la lluvia.',
            motive: 'Ninguno aparente.',
            suspicionLevel: 0,
            interrogated: true,
            contradictionExposed: false,
            notes: ['Testigo ocular de movimientos en el vecindario.']
          });
          setActiveDialogue(rootNode);
        }
        return;
      }

      // Check regular suspects
      const suspect = suspects.find(s => s.id === charId);
      if (suspect) {
        setActiveSuspect(suspect);
        const rootDialogueKey = `${charId}_start`;
        const rootNode = ALL_DIALOGUES[rootDialogueKey] || ALL_DIALOGUES['teodoro_start'];
        setActiveDialogue(rootNode);

        if (!suspect.interrogated) {
          const updatedSuspects = suspects.map(s => s.id === charId ? { ...s, interrogated: true } : s);
          setSuspects(updatedSuspects);
          persistGame(undefined, updatedSuspects, currentFloor, currentLocation);
        }
      }
      return;
    }

    if (nearbyInteractable.type === 'prop') {
      showBanner('Cajones forzados y ropa revuelta. Alguien cortó un fragmento de tela con tijeras.');
    }
  }, [nearbyInteractable, clues, suspects, currentFloor, currentLocation, switchLocation, switchFloor, persistGame]);

  // --- Dialogue Choice Handler ---
  const handleSelectDialogueChoice = (
    nextId: string,
    requiredClueId?: string,
    increasesSuspicion?: number,
    triggerEvent?: string
  ) => {
    if (triggerEvent === 'ending_justicia') {
      setActiveDialogue(null);
      setActiveEnding(GAME_ENDINGS.justicia_verdadera);
      setGameMode('ending');
      noirAudio.playDramaticChord();
      return;
    }
    if (triggerEvent === 'ending_pacto') {
      setActiveDialogue(null);
      setActiveEnding(GAME_ENDINGS.pacto_oscuro);
      setGameMode('ending');
      noirAudio.playDramaticChord();
      return;
    }

    if (triggerEvent === 'unlock_registro') {
      const regIndex = clues.findIndex(c => c.id === 'registro_conserje');
      if (regIndex !== -1 && !clues[regIndex].discovered) {
        const updatedClues = [...clues];
        updatedClues[regIndex] = { ...clues[regIndex], discovered: true };
        setClues(updatedClues);
        persistGame(updatedClues, undefined, currentFloor, currentLocation);
        noirAudio.playClueFound();
        showBanner('¡Has obtenido las notas del Libro de Visitas del Conserje!');
      }
    }

    if (increasesSuspicion && activeSuspect) {
      const newSuspicion = Math.min(100, Math.max(0, activeSuspect.suspicionLevel + increasesSuspicion));
      const updatedSuspects = suspects.map(s => s.id === activeSuspect.id ? { ...s, suspicionLevel: newSuspicion } : s);
      setSuspects(updatedSuspects);
      setActiveSuspect({ ...activeSuspect, suspicionLevel: newSuspicion });
      persistGame(undefined, updatedSuspects, currentFloor, currentLocation);
    }

    if (nextId === 'exit' || !ALL_DIALOGUES[nextId]) {
      setActiveDialogue(null);
    } else {
      setActiveDialogue(ALL_DIALOGUES[nextId]);
    }
  };

  const handleInitiateAccusation = (suspectId: string) => {
    setShowNotebook(false);
    noirAudio.playDramaticChord();

    if (suspectId === 'vincent') {
      const hasPassport = clues.some(c => c.id === 'pasaporte_falso' && c.discovered);
      const hasFlask = clues.some(c => (c.id === 'frasco_estricnina' || c.id === 'codice_antiguo') && c.discovered);

      if (hasPassport || hasFlask) {
        setActiveEnding(GAME_ENDINGS.justicia_verdadera);
      } else {
        setActiveEnding(GAME_ENDINGS.fuga_culpable);
      }
    } else if (suspectId === 'vivienne') {
      setActiveEnding(GAME_ENDINGS.error_fatal);
    } else {
      setActiveEnding(GAME_ENDINGS.error_fatal);
    }
    setGameMode('ending');
  };

  const handleRestartGame = () => {
    localStorage.removeItem(AUTO_SAVE_KEY);
    setClues(ALL_INITIAL_CLUES);
    setSuspects(ALL_INITIAL_SUSPECTS);
    setCurrentFloor(1);
    currentFloorRef.current = 1;
    setCurrentLocation('city');
    currentLocationRef.current = 'city';
    setActiveEnding(null);
    setGameMode('playing');
    switchLocation('city');
    noirAudio.startMusic();
  };

  const handleToggleMute = () => {
    const muted = noirAudio.toggleMute();
    setIsMuted(muted);
  };

  const handleStartGame = () => {
    noirAudio.startMusic();
    setGameMode('playing');
  };

  const discoveredCount = clues.filter(c => c.discovered).length;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#06070a] font-sans select-none touch-none">
      {/* 3D WebGL Canvas Container */}
      <div ref={canvasMountRef} className="absolute inset-0 w-full h-full z-0 pointer-events-auto" />

      {/* Atmospheric Film Vignette Overlay */}
      <div className="absolute inset-0 pointer-events-none z-10 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(4,5,8,0.85)_100%)] shadow-inner" />

      {/* ========================================================= */}
      {/* 1. TITLE SCREEN OVERLAY                                  */}
      {/* ========================================================= */}
      {gameMode === 'title' && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-between p-6 sm:p-12 bg-neutral-950/85 pointer-events-auto text-neutral-100">
          <div className="w-full flex justify-between items-center max-w-5xl">
            <span className="text-xs font-mono tracking-widest text-amber-500/80 uppercase">
              1947 · NOCHE DE TORMENTA · CIUDAD NOIR (4 CUADRAS)
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-amber-400">
                {settings.targetFps} FPS
              </span>
              <button
                onClick={handleToggleMute}
                className="p-2 rounded-lg border border-neutral-700 bg-neutral-900/60 text-amber-400 hover:border-amber-500 transition-colors"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="text-center max-w-2xl space-y-4 my-auto">
            <div className="inline-block px-3 py-1 rounded border border-amber-600/40 bg-amber-950/30 text-amber-400 text-xs font-mono tracking-widest uppercase">
              Mundo Abierto · 4 Cuadras · Edificio, Librería, Hospital y Escuela
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl font-black tracking-tight text-neutral-100 leading-tight">
              SOMBRAS EN <br />
              <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 bg-clip-text text-transparent">
                ARMSTRONG CITY
              </span>
            </h1>

            <p className="text-sm sm:text-base text-neutral-300 font-serif leading-relaxed max-w-xl mx-auto">
              Explora una mini ciudad de cuatro cuadras bajo la lluvia. Interroga peatones y testigos en las calles,
              entra al Edificio Armstrong de 5 pisos o investiga nuevos casos en la Librería Antigua, el Hospital y la Academia.
            </p>

            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleStartGame}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-neutral-950 font-bold font-mono text-sm uppercase tracking-wider shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2.5"
              >
                <Play className="w-4 h-4 fill-current" />
                Explorar la Ciudad
              </button>

              {lastSaveInfo && (
                <button
                  onClick={handleManualLoad}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-neutral-700 hover:border-amber-500 bg-neutral-900/80 text-amber-200 font-bold font-mono text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4 text-amber-400" />
                  Cargar Partida Guardada
                </button>
              )}
            </div>

            <p className="text-xs text-neutral-500 font-mono tracking-wider pt-2">
              Stick Táctil para caminar · Botón Acción para interrogar testigos y entrar a edificios
            </p>
          </div>

          <div className="text-center text-[11px] font-mono text-neutral-500">
            Armstrong City 3D · 4 Casos Conectados · 30 FPS Fluido en Celular
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. PLAYING HUD                                           */}
      {/* ========================================================= */}
      {gameMode === 'playing' && (
        <>
          {/* Top Status Bar */}
          <div className="absolute top-3 left-3 right-3 sm:top-5 sm:left-6 sm:right-6 z-20 flex items-center justify-between pointer-events-none">
            {/* Location Badge */}
            <div className="flex items-center gap-2.5 pointer-events-auto bg-neutral-950/85 border border-amber-600/40 px-3 py-1.5 rounded-xl shadow-lg">
              <div className="w-7 h-7 rounded-lg bg-amber-600/20 border border-amber-500/50 flex items-center justify-center font-mono font-bold text-amber-400 text-sm">
                {currentLocation === 'armstrong' ? currentFloor : <MapPin className="w-3.5 h-3.5" />}
              </div>
              <div>
                <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest block flex items-center gap-1">
                  {currentLocation === 'armstrong' ? <Layers className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                  {currentLocation === 'city' ? 'Calles de la Ciudad (4 Cuadras)' : 'Interior del Edificio'}
                </span>
                <span className="text-xs sm:text-sm font-bold text-neutral-200 font-serif">
                  {currentLocation === 'armstrong' ? getFloorTitle(currentFloor) : getLocationDisplayName(currentLocation)}
                </span>
              </div>
            </div>

            {/* Quick Action Clusters */}
            <div className="flex items-center gap-2 pointer-events-auto">
              {/* City Map Button */}
              <button
                onClick={() => setShowMap(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/40 border border-amber-500/60 hover:border-amber-400 text-amber-300 text-xs font-mono font-bold shadow-lg active:scale-95 transition-all"
                title="Plano de la Ciudad y Casos"
              >
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                <span>Mapa</span>
              </button>

              <button
                onClick={handleManualSave}
                title="Guardar Partida Rápido"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-950/85 border border-neutral-700 hover:border-amber-500 text-neutral-200 text-xs font-mono transition-colors shadow-lg active:scale-95"
              >
                <Save className="w-3.5 h-3.5 text-amber-400" />
                <span>Guardar</span>
              </button>

              <button
                onClick={() => setShowInventory(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-950/85 border border-neutral-700 hover:border-amber-500 text-neutral-200 text-xs font-mono transition-colors shadow-lg"
              >
                <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Evidencias</span>
                <span className="font-bold text-amber-400 tabular-nums">({discoveredCount})</span>
              </button>

              <button
                onClick={() => {
                  setShowNotebook(true);
                  noirAudio.playPageTurn();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-950/85 border border-neutral-700 hover:border-amber-400 text-neutral-200 text-xs font-mono transition-colors shadow-lg font-bold"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Libreta</span>
              </button>

              {/* Pause Button */}
              <button
                onClick={() => setGameMode('paused')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-neutral-950 font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95"
                title="Pausar y Configurar"
              >
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span className="hidden sm:inline">Pausa</span>
              </button>
            </div>
          </div>

          {/* Proximity Interaction Prompt */}
          {nearbyInteractable && !isModalOpenRef.current && (
            <div className="absolute bottom-36 sm:bottom-28 left-1/2 -translate-x-1/2 z-20 pointer-events-auto animate-bounce">
              <button
                onClick={triggerInteractAction}
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 text-neutral-950 font-bold font-mono text-xs sm:text-sm uppercase tracking-wider border-2 border-amber-300 shadow-2xl flex items-center gap-2 active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>[E] {nearbyInteractable.label}</span>
              </button>
            </div>
          )}

          {/* Notification Banner */}
          {notification && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 pointer-events-none max-w-md w-[90%] transition-all">
              <div className="p-3 rounded-xl bg-neutral-950/90 border border-amber-500/60 text-amber-200 text-xs sm:text-sm font-mono shadow-2xl flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="flex-1">{notification}</span>
              </div>
            </div>
          )}

          {/* ON-SCREEN MOBILE CONTROLS */}
          <div className="absolute bottom-4 left-4 z-20 pointer-events-auto">
            <VirtualJoystick
              onMove={vec => {
                moveVectorRef.current = vec;
              }}
            />
          </div>

          {/* Bottom-Right Touch Action Buttons */}
          <div className="absolute bottom-4 right-4 z-20 pointer-events-auto flex flex-col items-end gap-2.5">
            {/* Quick Context Button: If in Armstrong, show Elevator; if elsewhere, show City Map */}
            {currentLocation === 'armstrong' ? (
              <button
                onClick={() => setShowElevator(true)}
                className="px-3.5 py-2 rounded-xl bg-neutral-950/85 border border-amber-600/50 text-amber-300 text-xs font-mono font-bold tracking-wider shadow-lg hover:bg-neutral-900 active:scale-95 flex items-center gap-1.5"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Ascensor (P1-5)</span>
              </button>
            ) : (
              <button
                onClick={() => setShowMap(true)}
                className="px-3.5 py-2 rounded-xl bg-neutral-950/85 border border-amber-600/50 text-amber-300 text-xs font-mono font-bold tracking-wider shadow-lg hover:bg-neutral-900 active:scale-95 flex items-center gap-1.5"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Cambiar Caso</span>
              </button>
            )}

            <button
              onClick={triggerInteractAction}
              className={`w-28 sm:w-32 h-14 sm:h-16 rounded-2xl border-2 font-mono font-bold text-xs sm:text-sm uppercase tracking-wider shadow-2xl flex flex-col items-center justify-center transition-all active:scale-95 ${
                nearbyInteractable
                  ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-neutral-950 border-amber-300 ring-4 ring-amber-500/30'
                  : 'bg-neutral-950/70 border-neutral-700 text-neutral-400'
              }`}
            >
              <Footprints className="w-4 h-4 mb-0.5" />
              <span>{nearbyInteractable ? 'ACCIONAR' : 'INVESTIGAR'}</span>
            </button>
          </div>
        </>
      )}

      {/* ========================================================= */}
      {/* 3. MODALS & SUB-SCREENS                                   */}
      {/* ========================================================= */}
      <DialogueModal
        dialogueNode={activeDialogue}
        suspect={activeSuspect}
        discoveredClues={clues}
        onSelectChoice={handleSelectDialogueChoice}
        onClose={() => setActiveDialogue(null)}
      />

      <NotebookModal
        isOpen={showNotebook}
        onClose={() => setShowNotebook(false)}
        suspects={suspects}
        clues={clues}
        currentFloor={currentLocation === 'armstrong' ? currentFloor : 1}
        onInitiateAccusation={handleInitiateAccusation}
      />

      <InventoryModal
        isOpen={showInventory}
        onClose={() => setShowInventory(false)}
        clues={clues}
      />

      <ElevatorModal
        isOpen={showElevator}
        currentFloor={currentFloor}
        onSelectFloor={targetFloor => switchFloor(targetFloor)}
        onClose={() => setShowElevator(false)}
      />

      <CityMapModal
        isOpen={showMap}
        currentLocation={currentLocation}
        onSelectLocation={targetLoc => switchLocation(targetLoc)}
        onClose={() => setShowMap(false)}
        discoveredCluesCount={discoveredCount}
      />

      <EndingModal
        ending={activeEnding}
        onRestart={handleRestartGame}
      />

      <PauseModal
        isOpen={gameMode === 'paused'}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        lastSaveInfo={lastSaveInfo}
        currentFloor={currentFloor}
        discoveredCluesCount={discoveredCount}
        totalCluesCount={clues.length}
        onResume={() => setGameMode('playing')}
        onSaveGame={handleManualSave}
        onLoadGame={handleManualLoad}
        onRestartGame={handleRestartGame}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />
    </div>
  );
}

function getLocationDisplayName(loc: LocationType): string {
  switch (loc) {
    case 'city': return 'Calles de la Ciudad (4 Cuadras)';
    case 'armstrong': return 'Edificio Armstrong (5 Pisos)';
    case 'bookstore': return 'Librería "El Cuervo y la Llave"';
    case 'hospital': return 'Hospital Santa Elena & Morgue';
    case 'school': return 'Academia San Judas';
    default: return loc;
  }
}

function getFloorTitle(num: number): string {
  switch (num) {
    case 1: return 'Piso 1 - Lobby & Conserjería';
    case 2: return 'Piso 2 - Cabaret Suite Vivienne';
    case 3: return 'Piso 3 - Consultorio Dr. Thorne';
    case 4: return 'Piso 4 - Suite Armstrong (Crimen)';
    case 5: return 'Piso 5 - Ático & Azotea';
    default: return `Piso ${num}`;
  }
}
