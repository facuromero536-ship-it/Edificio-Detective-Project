// Procedural 3D Horror Dollhouse Cutaway Building Generator for Armstrong Manor
import * as THREE from 'three';
import {
  createParquetFloorTexture,
  createCarpetTexture,
  createWallpaperTexture,
  createBrickTexture,
  createElevatorGrilleTexture,
  createFloorPlacardTexture,
  createDarkShroudTexture,
  createNeonSignTexture,
  createStreetTexture
} from './proceduralAssets';
import { createNPCModel, CharacterGroup } from './characterBuilder';

export const FLOOR_HEIGHT = 4.2;
export const BUILDING_WIDTH = 16.0;
export const BUILDING_DEPTH = 10.0;
export const TOTAL_FLOORS = 5;

export interface WorldInteractable {
  id: string;
  label: string;
  type: 'npc' | 'clue' | 'elevator' | 'stairs_up' | 'stairs_down' | 'prop';
  position: THREE.Vector3;
  targetId?: string;
  targetFloor?: number;
  radius: number;
}

export interface FloorUnit {
  floorNumber: number;
  baseY: number;
  group: THREE.Group;
  shroudMesh: THREE.Mesh;
  lights: THREE.PointLight[];
  interactables: WorldInteractable[];
  npcGroups: CharacterGroup[];
}

export interface CompleteBuildingData {
  buildingGroup: THREE.Group;
  floors: Map<number, FloorUnit>;
  elevatorCab: THREE.Group;
  neonLight: THREE.PointLight;
  updateDollhouseVisibility: (activeFloor: number, dt: number) => void;
  updateElevatorPosition: (targetFloor: number, dt: number) => void;
}

export function buildCompleteBuilding(): CompleteBuildingData {
  const buildingGroup = new THREE.Group();
  const floors = new Map<number, FloorUnit>();

  const totalHeight = TOTAL_FLOORS * FLOOR_HEIGHT;

  // Shared Materials
  const brickMat = new THREE.MeshStandardMaterial({
    map: createBrickTexture(),
    roughness: 0.85,
    metalness: 0.1
  });

  const darkShroudMat = new THREE.MeshStandardMaterial({
    map: createDarkShroudTexture(),
    roughness: 0.95,
    metalness: 0.05,
    transparent: true,
    opacity: 0.98
  });

  const stoneCorniceMat = new THREE.MeshStandardMaterial({
    color: 0x1f2229,
    roughness: 0.7,
    metalness: 0.2
  });

  const ironMat = new THREE.MeshStandardMaterial({
    color: 0x121418,
    roughness: 0.5,
    metalness: 0.8
  });

  // =========================================================================
  // 1. STREET & EXTERIOR FOUNDATION (Ground Level Y = 0)
  // =========================================================================
  const streetMat = new THREE.MeshStandardMaterial({
    map: createStreetTexture(),
    roughness: 0.35,
    metalness: 0.4
  });
  const streetMesh = new THREE.Mesh(new THREE.PlaneGeometry(36, 26), streetMat);
  streetMesh.rotation.x = -Math.PI / 2;
  streetMesh.position.set(0, -0.05, 4.0);
  streetMesh.receiveShadow = true;
  buildingGroup.add(streetMesh);

  // Exterior Victorian Streetlamp posts casting amber noir glow on the pavement
  [-9.5, 9.5].forEach(lampX => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 3.8, 8), ironMat);
    post.position.set(lampX, 1.9, 7.5);
    const lantern = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.55, 0.4), new THREE.MeshStandardMaterial({
      color: 0xffe6a3,
      emissive: 0xffaa00,
      emissiveIntensity: 0.8
    }));
    lantern.position.set(lampX, 3.8, 7.5);
    const lampLight = new THREE.PointLight(0xffaa22, 1.8, 9);
    lampLight.position.set(lampX, 3.8, 7.5);
    buildingGroup.add(post, lantern, lampLight);
  });

  // =========================================================================
  // 2. EXTERIOR WALLS (Left, Right, Back & Cornices)
  // =========================================================================
  // Back Wall (North)
  const backWall = new THREE.Mesh(
    new THREE.BoxGeometry(BUILDING_WIDTH + 1.2, totalHeight, 0.6),
    brickMat
  );
  backWall.position.set(0, totalHeight / 2, -BUILDING_DEPTH / 2 - 0.3);
  backWall.receiveShadow = true;
  buildingGroup.add(backWall);

  // Left Exterior Wall (West)
  const leftWall = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, totalHeight, BUILDING_DEPTH + 0.6),
    brickMat
  );
  leftWall.position.set(-BUILDING_WIDTH / 2 - 0.4, totalHeight / 2, 0);
  leftWall.receiveShadow = true;
  buildingGroup.add(leftWall);

  // Right Exterior Wall (East)
  const rightWall = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, totalHeight, BUILDING_DEPTH + 0.6),
    brickMat
  );
  rightWall.position.set(BUILDING_WIDTH / 2 + 0.4, totalHeight / 2, 0);
  rightWall.receiveShadow = true;
  buildingGroup.add(rightWall);

  // Front Cornices & Architectural Cutaway Pillars
  for (let f = 0; f <= TOTAL_FLOORS; f++) {
    const corniceY = f * FLOOR_HEIGHT;
    // Horizontal stone frieze separating the floors on the facade
    const cornice = new THREE.Mesh(
      new THREE.BoxGeometry(BUILDING_WIDTH + 2.0, 0.4, 0.8),
      stoneCorniceMat
    );
    cornice.position.set(0, corniceY, BUILDING_DEPTH / 2 + 0.3);
    buildingGroup.add(cornice);
  }

  // Left and Right Cutaway Frame Pillars (framing the dollhouse view)
  [-BUILDING_WIDTH / 2 - 0.1, BUILDING_WIDTH / 2 + 0.1].forEach(colX => {
    const pillar = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, totalHeight, 0.8),
      stoneCorniceMat
    );
    pillar.position.set(colX, totalHeight / 2, BUILDING_DEPTH / 2 + 0.3);
    buildingGroup.add(pillar);
  });

  // =========================================================================
  // 3. EXTERIOR FIRE ESCAPE (On Right Side of Building)
  // =========================================================================
  for (let f = 1; f <= TOTAL_FLOORS; f++) {
    const y = (f - 1) * FLOOR_HEIGHT;
    // Landing platform
    const platform = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.15, 3.2), ironMat);
    platform.position.set(BUILDING_WIDTH / 2 + 1.2, y + 0.1, 0);
    // Railing
    const rail = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.9, 0.05), ironMat);
    rail.position.set(BUILDING_WIDTH / 2 + 1.2, y + 0.55, 1.6);
    buildingGroup.add(platform, rail);

    // Diagonal ladder to next floor
    if (f < TOTAL_FLOORS) {
      const ladder = new THREE.Mesh(new THREE.BoxGeometry(0.35, FLOOR_HEIGHT * 1.05, 0.08), ironMat);
      ladder.position.set(BUILDING_WIDTH / 2 + 1.2, y + FLOOR_HEIGHT / 2, 0);
      ladder.rotation.z = 0.22;
      buildingGroup.add(ladder);
    }
  }

  // =========================================================================
  // 4. EXTERIOR ELEVATOR SHAFT & ANIMATED CAB (On Left Side of Building)
  // =========================================================================
  const cageMat = new THREE.MeshStandardMaterial({
    map: createElevatorGrilleTexture(),
    transparent: true,
    roughness: 0.4,
    metalness: 0.8,
    side: THREE.DoubleSide
  });

  // Vertical shaft frame
  const shaftPillars = new THREE.Mesh(
    new THREE.BoxGeometry(2.8, totalHeight, 2.6),
    cageMat
  );
  shaftPillars.position.set(-5.5, totalHeight / 2, -3.5);
  buildingGroup.add(shaftPillars);

  // Moving Elevator Cab
  const elevatorCab = new THREE.Group();
  elevatorCab.position.set(-5.5, 0, -3.5);

  const cabBase = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.2, 2.4), ironMat);
  cabBase.position.y = 0.1;
  const cabRoof = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.2, 2.4), ironMat);
  cabRoof.position.y = 3.2;
  const cabWalls = new THREE.Mesh(new THREE.BoxGeometry(2.45, 3.0, 2.35), cageMat);
  cabWalls.position.y = 1.6;

  // Brass inner cab warm light
  const cabLight = new THREE.PointLight(0xffd580, 1.2, 5);
  cabLight.position.set(0, 2.6, 0);

  elevatorCab.add(cabBase, cabRoof, cabWalls, cabLight);
  buildingGroup.add(elevatorCab);

  // =========================================================================
  // 5. ROOFTOP (Y = totalHeight): Mansard Roof, Water Tower, Chimneys & Neon Sign
  // =========================================================================
  const roofY = totalHeight;

  // Sloped Mansard Roof
  const roofGeo = new THREE.ConeGeometry(BUILDING_WIDTH * 0.75, 4.0, 4);
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x14171d, roughness: 0.9 });
  const roofMesh = new THREE.Mesh(roofGeo, roofMat);
  roofMesh.position.set(0, roofY + 2.0, 0);
  roofMesh.rotation.y = Math.PI / 4;
  buildingGroup.add(roofMesh);

  // Water Tower on wooden stilts
  const towerStilts = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.4, 2.8, 6), ironMat);
  towerStilts.position.set(4.5, roofY + 1.4, -2.5);
  const towerTank = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 2.2, 12), new THREE.MeshStandardMaterial({ color: 0x3d271d, roughness: 0.9 }));
  towerTank.position.set(4.5, roofY + 3.6, -2.5);
  buildingGroup.add(towerStilts, towerTank);

  // Weathered Chimneys
  [-3.5, 3.5].forEach(chimX => {
    const chim = new THREE.Mesh(new THREE.BoxGeometry(0.8, 2.2, 0.8), brickMat);
    chim.position.set(chimX, roofY + 1.1, -3.8);
    buildingGroup.add(chim);
  });

  // Glowing Retro Neon Sign on Roof: "ARMSTRONG"
  const neonTexture = createNeonSignTexture();
  const neonMat = new THREE.MeshBasicMaterial({ map: neonTexture, transparent: true });
  const neonSign = new THREE.Mesh(new THREE.PlaneGeometry(7.0, 1.8), neonMat);
  neonSign.position.set(0, roofY + 2.4, BUILDING_DEPTH / 2 + 0.1);
  buildingGroup.add(neonSign);

  const neonLight = new THREE.PointLight(0xf59e0b, 2.0, 14);
  neonLight.position.set(0, roofY + 2.5, BUILDING_DEPTH / 2 + 0.8);
  buildingGroup.add(neonLight);

  // =========================================================================
  // 6. BUILD EACH OF THE 5 INDIVIDUAL FLOORS (Interior & Shroud)
  // =========================================================================
  for (let floorNum = 1; floorNum <= TOTAL_FLOORS; floorNum++) {
    const baseY = (floorNum - 1) * FLOOR_HEIGHT;
    const floorGroup = new THREE.Group();
    floorGroup.position.set(0, baseY, 0);

    const floorInteractables: WorldInteractable[] = [];
    const floorLights: THREE.PointLight[] = [];
    const floorNpcs: CharacterGroup[] = [];

    // --- A. Floor Base Surface ---
    const parquetTexture = createParquetFloorTexture();
    const floorSurface = new THREE.Mesh(
      new THREE.PlaneGeometry(BUILDING_WIDTH, BUILDING_DEPTH),
      new THREE.MeshStandardMaterial({ map: parquetTexture, roughness: 0.5, metalness: 0.1 })
    );
    floorSurface.rotation.x = -Math.PI / 2;
    floorSurface.receiveShadow = true;
    floorGroup.add(floorSurface);

    // Carpet Runner
    if (floorNum !== 5) {
      const carpetMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(3.5, BUILDING_DEPTH - 2),
        new THREE.MeshStandardMaterial({ map: createCarpetTexture(), roughness: 0.85 })
      );
      carpetMesh.rotation.x = -Math.PI / 2;
      carpetMesh.position.set(0, 0.01, 0);
      floorGroup.add(carpetMesh);
    }

    // --- B. Interior Back and Side Wall Decor ---
    const wallType = floorNum === 1 ? 'lobby' : (floorNum === 3 ? 'doctor' : (floorNum === 5 ? 'attic' : 'suite'));
    const interiorWallMat = new THREE.MeshStandardMaterial({
      map: createWallpaperTexture(wallType),
      roughness: 0.8
    });

    const interiorBack = new THREE.Mesh(
      new THREE.BoxGeometry(BUILDING_WIDTH, FLOOR_HEIGHT, 0.1),
      floorNum === 5 ? brickMat : interiorWallMat
    );
    interiorBack.position.set(0, FLOOR_HEIGHT / 2, -BUILDING_DEPTH / 2 + 0.05);
    floorGroup.add(interiorBack);

    // Ceiling Beams
    for (let bx = -BUILDING_WIDTH / 2 + 2; bx < BUILDING_WIDTH / 2; bx += 3.5) {
      const beam = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.25, BUILDING_DEPTH),
        new THREE.MeshStandardMaterial({ color: 0x1a120b, roughness: 0.9 })
      );
      beam.position.set(bx, FLOOR_HEIGHT - 0.12, 0);
      floorGroup.add(beam);
    }

    // Floor Brass Number Dial at Elevator Entrance
    const dialTex = createFloorPlacardTexture(floorNum, getFloorName(floorNum));
    const dialMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.0, 0.5),
      new THREE.MeshBasicMaterial({ map: dialTex })
    );
    dialMesh.position.set(-5.5, FLOOR_HEIGHT - 0.7, -2.15);
    floorGroup.add(dialMesh);

    // Elevator Doorway / Call Button Interactable
    floorInteractables.push({
      id: `elevator_floor_${floorNum}`,
      label: 'Usar Ascensor (Pisos 1-5)',
      type: 'elevator',
      position: new THREE.Vector3(-5.5, baseY, -2.0),
      radius: 2.2
    });

    // Stairs interactables
    if (floorNum < TOTAL_FLOORS) {
      floorInteractables.push({
        id: `stairs_up_${floorNum}`,
        label: `Subir al Piso ${floorNum + 1}`,
        type: 'stairs_up',
        targetFloor: floorNum + 1,
        position: new THREE.Vector3(5.8, baseY, -2.0),
        radius: 2.0
      });
    }
    if (floorNum > 1) {
      floorInteractables.push({
        id: `stairs_down_${floorNum}`,
        label: `Bajar al Piso ${floorNum - 1}`,
        type: 'stairs_down',
        targetFloor: floorNum - 1,
        position: new THREE.Vector3(5.8, baseY, 0.5),
        radius: 2.0
      });
    }

    // --- C. Floor-Specific Props & Characters ---
    if (floorNum === 1) {
      // PISO 1: LOBBY & CONSERJE
      const deskMat = new THREE.MeshStandardMaterial({ color: 0x3d2516, roughness: 0.6 });
      const desk = new THREE.Mesh(new THREE.BoxGeometry(4.0, 1.15, 1.2), deskMat);
      desk.position.set(0, 0.58, -2.5);
      floorGroup.add(desk);

      // Book
      const book = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.08, 0.35), new THREE.MeshStandardMaterial({ color: 0x1f2937 }));
      book.position.set(-0.8, 1.2, -2.5);
      floorGroup.add(book);

      floorInteractables.push({
        id: 'interact_registro_conserje',
        label: 'Examinar Libro de Visitas',
        type: 'clue',
        targetId: 'registro_conserje',
        position: new THREE.Vector3(-0.8, baseY, -1.2),
        radius: 1.8
      });

      // Don Teodoro NPC
      const teodoro = createNPCModel('conserje');
      teodoro.position.set(0.6, 0, -3.2);
      teodoro.rotation.y = Math.PI;
      floorGroup.add(teodoro);
      floorNpcs.push(teodoro);

      floorInteractables.push({
        id: 'talk_conserje',
        label: 'Interrogar a Don Teodoro',
        type: 'npc',
        targetId: 'conserje',
        position: new THREE.Vector3(0.6, baseY, -1.5),
        radius: 2.2
      });

      // Calderas
      const boiler = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 2.2, 12), new THREE.MeshStandardMaterial({ color: 0x27272a }));
      boiler.position.set(-6.5, 1.1, 2.5);
      floorGroup.add(boiler);

      floorInteractables.push({
        id: 'interact_llave_maestra',
        label: 'Buscar en Calderas (Llave Maestra)',
        type: 'clue',
        targetId: 'llave_maestra',
        position: new THREE.Vector3(-6.2, baseY, 1.5),
        radius: 1.8
      });

      // Door to exit back to the City Streets
      floorInteractables.push({
        id: 'exit_armstrong_to_city',
        label: 'Salir a las Calles de la Ciudad (4 Cuadras)',
        type: 'prop',
        targetId: 'city',
        position: new THREE.Vector3(0, baseY, BUILDING_DEPTH / 2 - 1.2),
        radius: 2.2
      });

    } else if (floorNum === 2) {
      // PISO 2: CABARET VIVIENNE
      const divan = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.55, 1.1), new THREE.MeshStandardMaterial({ color: 0x581c87 }));
      divan.position.set(-2.5, 0.28, 1.0);
      floorGroup.add(divan);

      const vanity = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.0, 0.8), new THREE.MeshStandardMaterial({ color: 0x2a1810 }));
      vanity.position.set(-5.0, 0.5, -2.0);
      floorGroup.add(vanity);

      const wardrobe = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.5, 0.9), new THREE.MeshStandardMaterial({ color: 0x3d2012 }));
      wardrobe.position.set(-5.5, 1.25, 1.0);
      floorGroup.add(wardrobe);

      floorInteractables.push({
        id: 'interact_vestidor',
        label: 'Revisar Vestidor Forzado',
        type: 'prop',
        position: new THREE.Vector3(-4.5, baseY, 1.0),
        radius: 1.8
      });

      const vivienne = createNPCModel('vivienne');
      vivienne.position.set(-1.8, 0, -1.0);
      vivienne.rotation.y = Math.PI * 0.75;
      floorGroup.add(vivienne);
      floorNpcs.push(vivienne);

      floorInteractables.push({
        id: 'talk_vivienne',
        label: 'Interrogar a Madame Vivienne',
        type: 'npc',
        targetId: 'vivienne',
        position: new THREE.Vector3(-1.8, baseY, -0.2),
        radius: 2.2
      });

    } else if (floorNum === 3) {
      // PISO 3: CONSULTORIO THORNE
      const desk = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.0, 1.2), new THREE.MeshStandardMaterial({ color: 0x1f2937 }));
      desk.position.set(-1.8, 0.5, -2.0);
      floorGroup.add(desk);

      const trash = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.2, 0.45, 8), new THREE.MeshStandardMaterial({ color: 0x52525b }));
      trash.position.set(-3.8, 0.23, -2.0);
      floorGroup.add(trash);

      floorInteractables.push({
        id: 'interact_frasco_estricnina',
        label: 'Examinar Papelera (Frasco de Alquimista)',
        type: 'clue',
        targetId: 'frasco_estricnina',
        position: new THREE.Vector3(-3.5, baseY, -1.2),
        radius: 1.8
      });

      const thorne = createNPCModel('thorne');
      thorne.position.set(-1.8, 0, -2.8);
      thorne.rotation.y = Math.PI;
      floorGroup.add(thorne);
      floorNpcs.push(thorne);

      floorInteractables.push({
        id: 'talk_thorne',
        label: 'Interrogar al Dr. Thorne',
        type: 'npc',
        targetId: 'thorne',
        position: new THREE.Vector3(-1.8, baseY, -1.2),
        radius: 2.2
      });

    } else if (floorNum === 4) {
      // PISO 4: SUITE ARMSTRONG (CRIMEN)
      const bigDesk = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.1, 1.8), new THREE.MeshStandardMaterial({ color: 0x2b1509 }));
      bigDesk.position.set(0, 0.55, -1.5);
      floorGroup.add(bigDesk);

      const body = createNPCModel('armstrong_body');
      body.position.set(0, 0.8, -1.5);
      floorGroup.add(body);

      floorInteractables.push({
        id: 'interact_cadaver',
        label: 'Examinar Cadáver de Lord Armstrong',
        type: 'clue',
        targetId: 'copa_veneno',
        position: new THREE.Vector3(0, baseY, -0.2),
        radius: 2.0
      });

      const watch = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.03, 10), new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9 }));
      watch.position.set(1.4, 0.02, -0.6);
      floorGroup.add(watch);

      floorInteractables.push({
        id: 'interact_reloj_roto',
        label: 'Inspeccionar Reloj de Oro Parado',
        type: 'clue',
        targetId: 'reloj_roto',
        position: new THREE.Vector3(1.4, baseY, -0.6),
        radius: 1.8
      });

      const safe = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.4, 0.5), new THREE.MeshStandardMaterial({ color: 0x18181b }));
      safe.position.set(-5.0, 1.6, -1.5);
      floorGroup.add(safe);

      floorInteractables.push({
        id: 'interact_nota_chantaje',
        label: 'Examinar Caja Fuerte y Cajón',
        type: 'clue',
        targetId: 'nota_chantaje',
        position: new THREE.Vector3(-4.2, baseY, -1.5),
        radius: 1.8
      });

      const silk = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.2, 0.05), new THREE.MeshStandardMaterial({ color: 0xb91c1c }));
      silk.position.set(2.5, 1.3, -BUILDING_DEPTH / 2 + 0.2);
      floorGroup.add(silk);

      floorInteractables.push({
        id: 'interact_seda_escarlata',
        label: 'Examinar Ventana (Retal de Seda)',
        type: 'clue',
        targetId: 'seda_escarlata',
        position: new THREE.Vector3(2.5, baseY, -BUILDING_DEPTH / 2 + 1.2),
        radius: 1.8
      });

    } else if (floorNum === 5) {
      // PISO 5: ÁTICO Y AZOTEA (VINCENT)
      for (let i = 0; i < 4; i++) {
        const crate = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.9), new THREE.MeshStandardMaterial({ color: 0x4a3728 }));
        crate.position.set(-4.0 + (i % 2) * 1.0, 0.45, 1.0 + Math.floor(i / 2) * 1.0);
        floorGroup.add(crate);
      }

      const suitcase = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.25, 0.5), new THREE.MeshStandardMaterial({ color: 0x261912 }));
      suitcase.position.set(-3.2, 0.95, 1.2);
      floorGroup.add(suitcase);

      floorInteractables.push({
        id: 'interact_pasaporte_falso',
        label: 'Registrar Maletín Secreto',
        type: 'clue',
        targetId: 'pasaporte_falso',
        position: new THREE.Vector3(-3.2, baseY, 0.5),
        radius: 1.8
      });

      const vincent = createNPCModel('vincent');
      vincent.position.set(1.5, 0, 0.5);
      vincent.rotation.y = -Math.PI * 0.3;
      floorGroup.add(vincent);
      floorNpcs.push(vincent);

      floorInteractables.push({
        id: 'talk_vincent',
        label: 'Confrontar a Vincent Navarro',
        type: 'npc',
        targetId: 'vincent',
        position: new THREE.Vector3(1.5, baseY, -0.2),
        radius: 2.2
      });
    }

    // --- D. Interior Atmospheric Lights ---
    // PointLights provide warm noir illumination without expensive shadow map passes
    const warmLight = new THREE.PointLight(0xffb86c, 2.0, 10);
    warmLight.position.set(0, 2.8, 0);
    warmLight.castShadow = false;
    floorGroup.add(warmLight);
    floorLights.push(warmLight);

    const windowGlow = new THREE.PointLight(0x38bdf8, 0.9, 7);
    windowGlow.position.set(2.0, 2.2, -BUILDING_DEPTH / 2 + 1.2);
    windowGlow.castShadow = false;
    floorGroup.add(windowGlow);
    floorLights.push(windowGlow);

    // --- E. DOLLHOUSE SHROUD COVER (Fog of War for Unexplored Floors) ---
    // A front silhouette facade plane that covers the cutaway when the floor is not being explored!
    const shroudMaterial = darkShroudMat.clone();
    const shroudMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(BUILDING_WIDTH, FLOOR_HEIGHT - 0.1),
      shroudMaterial
    );
    shroudMesh.position.set(0, FLOOR_HEIGHT / 2, BUILDING_DEPTH / 2 + 0.05);
    floorGroup.add(shroudMesh);

    buildingGroup.add(floorGroup);

    floors.set(floorNum, {
      floorNumber: floorNum,
      baseY,
      group: floorGroup,
      shroudMesh,
      lights: floorLights,
      interactables: floorInteractables,
      npcGroups: floorNpcs
    });
  }

  // =========================================================================
  // 7. REALTIME VISIBILITY & ELEVATOR SMOOTH INTERPOLATION
  // =========================================================================
  const updateDollhouseVisibility = (activeFloor: number, dt: number) => {
    floors.forEach((fl, num) => {
      const isActive = num === activeFloor;
      const mat = fl.shroudMesh.material as THREE.MeshStandardMaterial;

      // Target shroud opacity: 0 when active (cutaway open!), 0.98 when inactive (covered in noir shadow)
      const targetOpacity = isActive ? 0.0 : 0.98;
      mat.opacity = THREE.MathUtils.damp(mat.opacity, targetOpacity, 8, dt);
      mat.visible = mat.opacity > 0.02;

      // Target interior light intensity: full when active, eerie dark gloom when inactive
      const targetLightIntensity = isActive ? 2.2 : 0.05;
      fl.lights.forEach(light => {
        light.intensity = THREE.MathUtils.damp(light.intensity, targetLightIntensity, 8, dt);
      });
    });
  };

  const updateElevatorPosition = (targetFloor: number, dt: number) => {
    const targetY = (targetFloor - 1) * FLOOR_HEIGHT;
    elevatorCab.position.y = THREE.MathUtils.damp(elevatorCab.position.y, targetY, 4, dt);
  };

  return {
    buildingGroup,
    floors,
    elevatorCab,
    neonLight,
    updateDollhouseVisibility,
    updateElevatorPosition
  };
}

function getFloorName(num: number): string {
  switch (num) {
    case 1: return 'Lobby & Conserjería';
    case 2: return 'Cabaret Suite Vivienne';
    case 3: return 'Consultorio Dr. Thorne';
    case 4: return 'Suite Armstrong';
    case 5: return 'Ático & Azotea';
    default: return `Piso ${num}`;
  }
}
