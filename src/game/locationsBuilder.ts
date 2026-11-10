// 3D Interior Environments for Bookstore, Hospital, and School Cases
import * as THREE from 'three';
import { createParquetFloorTexture, createWallpaperTexture, createBrickTexture } from './proceduralAssets';
import { WorldInteractable } from './buildingBuilder';
import { CharacterGroup } from './characterBuilder';
import { LocationType } from './casesData';

export interface LocationInteriorData {
  locationId: LocationType;
  group: THREE.Group;
  interactables: WorldInteractable[];
  npcGroups: CharacterGroup[];
  lights: THREE.Light[];
  spawnPoint: THREE.Vector3;
}

export function buildLocationInterior(locType: LocationType): LocationInteriorData {
  const group = new THREE.Group();
  const interactables: WorldInteractable[] = [];
  const npcGroups: CharacterGroup[] = [];
  const lights: THREE.Light[] = [];

  const width = 16;
  const depth = 12;
  const wallHeight = 3.6;

  // Shared Exit Door to return to the City
  const exitDoorMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.5 });
  const exitDoor = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.8, 0.2), exitDoorMat);
  exitDoor.position.set(0, 1.4, depth / 2 - 0.1);
  group.add(exitDoor);

  interactables.push({
    id: `exit_to_city_${locType}`,
    label: 'Salir a la Ciudad (Las 4 Cuadras)',
    type: 'prop',
    targetId: 'city',
    position: new THREE.Vector3(0, 0, depth / 2 - 1.2),
    radius: 2.0
  });

  if (locType === 'bookstore') {
    // =========================================================================
    // LIBRERÍA "EL CUERVO Y LA LLAVE" (CASO 2: EL CÓDICE ENVENENADO)
    // =========================================================================
    // Dark Parquet Floor
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(width, depth),
      new THREE.MeshStandardMaterial({ map: createParquetFloorTexture(), roughness: 0.5 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    group.add(floor);

    // Walls
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(width, wallHeight, 0.2),
      new THREE.MeshStandardMaterial({ map: createWallpaperTexture('suite'), roughness: 0.8 })
    );
    wall.position.set(0, wallHeight / 2, -depth / 2);
    group.add(wall);

    // Tall Wooden Bookshelves on back and side walls
    for (let x = -5.5; x <= 5.5; x += 3.6) {
      const shelf = new THREE.Mesh(new THREE.BoxGeometry(3.0, 3.2, 0.8), new THREE.MeshStandardMaterial({ color: 0x271912, roughness: 0.7 }));
      shelf.position.set(x, 1.6, -depth / 2 + 0.5);
      // Colorful books rows
      for (let r = 0; r < 3; r++) {
        const books = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.5, 0.5), new THREE.MeshStandardMaterial({ color: (r === 0 ? 0x881337 : (r === 1 ? 0x14532d : 0x1e3a8a)) }));
        books.position.set(x, 0.8 + r * 0.9, -depth / 2 + 0.6);
        group.add(books);
      }
      group.add(shelf);
    }

    // Antiquarian Reading Desk with Banker's Green Lamp
    const desk = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.0, 1.4), new THREE.MeshStandardMaterial({ color: 0x3d2516 }));
    desk.position.set(0, 0.5, -1.5);
    group.add(desk);

    const greenLamp = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 0.25, 8), new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.2 }));
    greenLamp.position.set(-1.0, 1.15, -1.5);
    const lampLight = new THREE.PointLight(0x4ade80, 1.5, 6);
    lampLight.position.set(-1.0, 1.3, -1.5);
    group.add(greenLamp, lampLight);
    lights.push(lampLight);

    // Clue 1: Atril con el Códice Envenenado
    const podium = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.2, 0.8), new THREE.MeshStandardMaterial({ color: 0x221711 }));
    podium.position.set(3.5, 0.6, -1.5);
    const codex = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.12, 0.4), new THREE.MeshStandardMaterial({ color: 0x18181b }));
    codex.position.set(3.5, 1.26, -1.5);
    group.add(podium, codex);

    interactables.push({
      id: 'interact_codice_antiguo',
      label: 'Inspeccionar Códice Envenenado (Páginas arrancadas)',
      type: 'clue',
      targetId: 'codice_antiguo',
      position: new THREE.Vector3(3.5, 0, -1.5),
      radius: 1.8
    });

    // Clue 2: Caja registradora con Recibo de compra
    const register = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.5, 0.5), new THREE.MeshStandardMaterial({ color: 0xb8860b, metalness: 0.8 }));
    register.position.set(0.8, 1.25, -1.5);
    group.add(register);

    interactables.push({
      id: 'interact_recibo_compra',
      label: 'Revisar Caja Registradora (Factura Falsificada)',
      type: 'clue',
      targetId: 'recibo_compra',
      position: new THREE.Vector3(0.8, 0, -0.6),
      radius: 1.8
    });

    // Suspect: Gideon Crowley NPC
    const crowleyMat = new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.7 });
    const crowley = new THREE.Group() as CharacterGroup;
    crowley.position.set(0, 0, -2.6);
    const cBody = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.95, 8), crowleyMat);
    cBody.position.y = 0.75;
    const cHead = new THREE.Mesh(new THREE.SphereGeometry(0.17, 8, 8), new THREE.MeshStandardMaterial({ color: 0xdfba92 }));
    cHead.position.y = 1.35;
    crowley.add(cBody, cHead);
    group.add(crowley);
    npcGroups.push(crowley);

    interactables.push({
      id: 'talk_crowley',
      label: 'Interrogar a Gideon Crowley (Librero)',
      type: 'npc',
      targetId: 'crowley',
      position: new THREE.Vector3(0, 0, -1.5),
      radius: 2.2
    });

  } else if (locType === 'hospital') {
    // =========================================================================
    // HOSPITAL SANTA ELENA & MORGUE (CASO 3: LA DESAPARICIÓN DEL CIRUJANO)
    // =========================================================================
    // White/Cyan Clinical Tiles
    const tileCanvas = document.createElement('canvas');
    tileCanvas.width = 128;
    tileCanvas.height = 128;
    const tCtx = tileCanvas.getContext('2d')!;
    tCtx.fillStyle = '#e2e8f0';
    tCtx.fillRect(0, 0, 128, 128);
    tCtx.strokeStyle = '#94a3b8';
    tCtx.lineWidth = 2;
    tCtx.strokeRect(0, 0, 64, 64);
    tCtx.strokeRect(64, 0, 64, 64);
    tCtx.strokeRect(0, 64, 64, 64);
    tCtx.strokeRect(64, 64, 64, 64);
    const tileTex = new THREE.CanvasTexture(tileCanvas);
    tileTex.wrapS = THREE.RepeatWrapping;
    tileTex.wrapT = THREE.RepeatWrapping;
    tileTex.repeat.set(8, 6);

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), new THREE.MeshStandardMaterial({ map: tileTex, roughness: 0.2, metalness: 0.2 }));
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    group.add(floor);

    // Teal Clinical Walls
    const wall = new THREE.Mesh(new THREE.BoxGeometry(width, wallHeight, 0.2), new THREE.MeshStandardMaterial({ color: 0x134e4a, roughness: 0.6 }));
    wall.position.set(0, wallHeight / 2, -depth / 2);
    group.add(wall);

    // Surgical Table in center
    const table = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.8, 3.2), new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 }));
    table.position.set(0, 0.4, -1.0);
    group.add(table);

    // Overhead Surgical Lamp (Cool cyan/white beam)
    const surgLamp = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.8, 0.3, 12), new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9 }));
    surgLamp.position.set(0, 2.8, -1.0);
    const surgLight = new THREE.PointLight(0x38bdf8, 2.2, 9);
    surgLight.position.set(0, 2.5, -1.0);
    group.add(surgLamp, surgLight);
    lights.push(surgLight);

    // Clue 1: Expediente Quirúrgico en bandeja
    interactables.push({
      id: 'interact_informe_autopsia',
      label: 'Examinar Expediente Quirúrgico Confidencial',
      type: 'clue',
      targetId: 'informe_autopsia',
      position: new THREE.Vector3(0, 0, -1.0),
      radius: 1.8
    });

    // Clue 2: Bisturí manchado en mesa auxiliar
    const cart = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.9, 0.8), new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.7 }));
    cart.position.set(3.2, 0.45, -2.0);
    group.add(cart);

    interactables.push({
      id: 'interact_bisturi_manchado',
      label: 'Recoger Bisturí Quirúrgico con Resina',
      type: 'clue',
      targetId: 'bisturi_manchado',
      position: new THREE.Vector3(3.2, 0, -2.0),
      radius: 1.8
    });

    // Suspect: Enfermera Beatrice NPC
    const nurseMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.6 });
    const nurse = new THREE.Group() as CharacterGroup;
    nurse.position.set(-3.0, 0, -2.0);
    const nBody = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.26, 0.95, 8), nurseMat);
    nBody.position.y = 0.75;
    const nHead = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), new THREE.MeshStandardMaterial({ color: 0xdfba92 }));
    nHead.position.y = 1.35;
    const nCap = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.08, 0.15), new THREE.MeshStandardMaterial({ color: 0xffffff }));
    nCap.position.set(0, 1.48, 0);
    nurse.add(nBody, nHead, nCap);
    group.add(nurse);
    npcGroups.push(nurse);

    interactables.push({
      id: 'talk_beatrice',
      label: 'Interrogar a Enfermera Beatrice',
      type: 'npc',
      targetId: 'beatrice',
      position: new THREE.Vector3(-3.0, 0, -1.0),
      radius: 2.2
    });

  } else if (locType === 'school') {
    // =========================================================================
    // ACADEMIA SAN JUDAS (CASO 4: EL SECRETO DE LA BÓVEDA)
    // =========================================================================
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(width, depth),
      new THREE.MeshStandardMaterial({ map: createParquetFloorTexture(), roughness: 0.6 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    group.add(floor);

    // Gothic Brick & Wood Paneling
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(width, wallHeight, 0.2),
      new THREE.MeshStandardMaterial({ map: createBrickTexture(), roughness: 0.85 })
    );
    wall.position.set(0, wallHeight / 2, -depth / 2);
    group.add(wall);

    // Blackboard with Cryptic Map
    const board = new THREE.Mesh(new THREE.BoxGeometry(5.0, 2.2, 0.1), new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 }));
    board.position.set(0, 2.2, -depth / 2 + 0.15);
    group.add(board);

    // Warm Chandelier
    const chandLight = new THREE.PointLight(0xf59e0b, 1.8, 10);
    chandLight.position.set(0, 3.0, 0);
    group.add(chandLight);
    lights.push(chandLight);

    // Clue 1: Plano Secreto de Túneles en la Pizarra
    interactables.push({
      id: 'interact_plano_tuneles',
      label: 'Examinar Plano Secreto de Túneles en la Pizarra',
      type: 'clue',
      targetId: 'plano_tuneles',
      position: new THREE.Vector3(0, 0, -4.5),
      radius: 2.0
    });

    // Rector's Antique Vault Desk
    const vDesk = new THREE.Mesh(new THREE.BoxGeometry(3.0, 1.1, 1.4), new THREE.MeshStandardMaterial({ color: 0x2e1065, roughness: 0.7 }));
    vDesk.position.set(-2.5, 0.55, -1.0);
    group.add(vDesk);

    // Clue 2: Llave de Hierro Forjado de la Bóveda
    interactables.push({
      id: 'interact_llave_boveda_rector',
      label: 'Registrar Caja de Caoba (Llave de la Bóveda)',
      type: 'clue',
      targetId: 'llave_boveda_rector',
      position: new THREE.Vector3(-2.5, 0, 0.2),
      radius: 1.8
    });

    // Suspect: Profesor Julian Vane NPC
    const vaneMat = new THREE.MeshStandardMaterial({ color: 0x581c87, roughness: 0.7 });
    const vane = new THREE.Group() as CharacterGroup;
    vane.position.set(2.5, 0, -1.5);
    const vBody = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.95, 8), vaneMat);
    vBody.position.y = 0.75;
    const vHead = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), new THREE.MeshStandardMaterial({ color: 0xdfba92 }));
    vHead.position.y = 1.35;
    vane.add(vBody, vHead);
    group.add(vane);
    npcGroups.push(vane);

    interactables.push({
      id: 'talk_vane',
      label: 'Interrogar al Profesor Julian Vane',
      type: 'npc',
      targetId: 'vane',
      position: new THREE.Vector3(2.5, 0, -0.5),
      radius: 2.2
    });
  }

  return {
    locationId: locType,
    group,
    interactables,
    npcGroups,
    lights,
    spawnPoint: new THREE.Vector3(0, 0, depth / 2 - 2.5)
  };
}
