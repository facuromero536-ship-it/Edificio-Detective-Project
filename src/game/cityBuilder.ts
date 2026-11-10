// 3D Mini City (4 Blocks) Generator for Armstrong Manor Noir
import * as THREE from 'three';
import { createStreetTexture, createBrickTexture } from './proceduralAssets';
import { CITY_LOCATIONS, CITY_PEDESTRIANS, LocationType } from './casesData';
import { WorldInteractable } from './buildingBuilder';
import { CharacterGroup } from './characterBuilder';

export interface CitySceneData {
  cityGroup: THREE.Group;
  interactables: WorldInteractable[];
  pedestrianGroups: CharacterGroup[];
  lights: THREE.Light[];
}

export function buildMiniCity(): CitySceneData {
  const cityGroup = new THREE.Group();
  const interactables: WorldInteractable[] = [];
  const pedestrianGroups: CharacterGroup[] = [];
  const lights: THREE.Light[] = [];

  const streetMat = new THREE.MeshStandardMaterial({
    map: createStreetTexture(),
    roughness: 0.35,
    metalness: 0.3
  });

  const brickMat = new THREE.MeshStandardMaterial({
    map: createBrickTexture(),
    roughness: 0.85,
    metalness: 0.1
  });

  const sidewalkMat = new THREE.MeshStandardMaterial({
    color: 0x22252e,
    roughness: 0.7,
    metalness: 0.1
  });

  const ironMat = new THREE.MeshStandardMaterial({
    color: 0x111317,
    roughness: 0.5,
    metalness: 0.8
  });

  // =========================================================================
  // 1. GROUND ASPHALT & INTERSECTIONS (City Streets)
  // =========================================================================
  const groundMesh = new THREE.Mesh(new THREE.PlaneGeometry(44, 44), streetMat);
  groundMesh.rotation.x = -Math.PI / 2;
  groundMesh.position.y = -0.05;
  groundMesh.receiveShadow = true;
  cityGroup.add(groundMesh);

  // Crosswalk Stripes at Central Intersection (X: 0, Z: 0)
  const stripeMat = new THREE.MeshBasicMaterial({ color: 0x9ca3af });
  [-1.2, 1.2].forEach(offset => {
    // North-South crosswalk lines
    const stripeZ = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 4.0), stripeMat);
    stripeZ.rotation.x = -Math.PI / 2;
    stripeZ.position.set(offset, 0.01, -3.2);
    cityGroup.add(stripeZ);

    const stripeZ2 = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 4.0), stripeMat);
    stripeZ2.rotation.x = -Math.PI / 2;
    stripeZ2.position.set(offset, 0.01, 3.2);
    cityGroup.add(stripeZ2);

    // East-West crosswalk lines
    const stripeX = new THREE.Mesh(new THREE.PlaneGeometry(4.0, 0.5), stripeMat);
    stripeX.rotation.x = -Math.PI / 2;
    stripeX.position.set(-3.2, 0.01, offset);
    cityGroup.add(stripeX);

    const stripeX2 = new THREE.Mesh(new THREE.PlaneGeometry(4.0, 0.5), stripeMat);
    stripeX2.rotation.x = -Math.PI / 2;
    stripeX2.position.set(3.2, 0.01, offset);
    cityGroup.add(stripeX2);
  });

  // =========================================================================
  // 2. THE 4 CITY BLOCKS (Sidewalks & Building Facades)
  // =========================================================================
  const blockConfigs = [
    {
      id: 'armstrong' as LocationType,
      name: 'Edificio Armstrong',
      posX: -11,
      posZ: -11,
      color: 0x422927,
      signText: 'ARMSTRONG · HOTEL & SUITES',
      signColor: '#f59e0b',
      doorColor: 0x221711
    },
    {
      id: 'bookstore' as LocationType,
      name: 'Librería "El Cuervo"',
      posX: 11,
      posZ: -11,
      color: 0x1e293b,
      signText: 'LIBRERÍA EL CUERVO · RAROS & INCUNABLES',
      signColor: '#10b981',
      doorColor: 0x14201a
    },
    {
      id: 'hospital' as LocationType,
      name: 'Hospital Santa Elena',
      posX: -11,
      posZ: 11,
      color: 0x334155,
      signText: 'HOSPITAL SANTA ELENA · CLÍNICA & MORGUE',
      signColor: '#38bdf8',
      doorColor: 0x0f2736
    },
    {
      id: 'school' as LocationType,
      name: 'Academia San Judas',
      posX: 11,
      posZ: 11,
      color: 0x312e81,
      signText: 'ACADEMIA SAN JUDAS · ARCHIVOS & BIBLIOTECA',
      signColor: '#c084fc',
      doorColor: 0x1a162b
    }
  ];

  blockConfigs.forEach(block => {
    const blockGroup = new THREE.Group();
    blockGroup.position.set(block.posX, 0, block.posZ);

    // Sidewalk Platform
    const sidewalk = new THREE.Mesh(
      new THREE.BoxGeometry(16, 0.2, 16),
      sidewalkMat
    );
    sidewalk.position.y = 0.1;
    sidewalk.receiveShadow = true;
    blockGroup.add(sidewalk);

    // Main Building Outer Block
    const bldgMat = new THREE.MeshStandardMaterial({
      color: block.color,
      map: createBrickTexture(),
      roughness: 0.85
    });
    const bldgMesh = new THREE.Mesh(
      new THREE.BoxGeometry(13, 12, 13),
      bldgMat
    );
    bldgMesh.position.y = 6.0;
    bldgMesh.castShadow = true;
    bldgMesh.receiveShadow = true;
    blockGroup.add(bldgMesh);

    // Entrance Doorway (facing street)
    const doorX = block.posX < 0 ? 5.2 : -5.2;
    const doorZ = block.posZ < 0 ? 5.2 : -5.2;

    const doorMat = new THREE.MeshStandardMaterial({ color: block.doorColor, roughness: 0.4 });
    const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(2.4, 3.2, 0.4), ironMat);
    doorFrame.position.set(doorX, 1.6, doorZ);
    const door = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.8, 0.1), doorMat);
    door.position.set(doorX, 1.4, doorZ);
    blockGroup.add(doorFrame, door);

    // Illuminated Entrance Porch Lamp
    const lamp = new THREE.PointLight(0xffcc66, 1.5, 7);
    lamp.position.set(doorX, 3.6, doorZ);
    blockGroup.add(lamp);
    lights.push(lamp);

    // Glowing Building Signboard
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 512;
    signCanvas.height = 128;
    const sCtx = signCanvas.getContext('2d')!;
    sCtx.fillStyle = '#0a0d14';
    sCtx.fillRect(0, 0, 512, 128);
    sCtx.strokeStyle = block.signColor;
    sCtx.lineWidth = 4;
    sCtx.strokeRect(6, 6, 500, 116);
    sCtx.fillStyle = block.signColor;
    sCtx.font = 'bold 24px monospace';
    sCtx.textAlign = 'center';
    sCtx.fillText(block.signText, 256, 70);

    const signTex = new THREE.CanvasTexture(signCanvas);
    signTex.colorSpace = THREE.SRGBColorSpace;
    const signboard = new THREE.Mesh(
      new THREE.PlaneGeometry(4.8, 1.2),
      new THREE.MeshBasicMaterial({ map: signTex })
    );
    signboard.position.set(doorX, 4.4, doorZ);
    signboard.rotation.y = block.posX < 0 ? (block.posZ < 0 ? 0 : Math.PI) : (block.posZ < 0 ? 0 : Math.PI);
    blockGroup.add(signboard);

    cityGroup.add(blockGroup);

    // Add entrance interactable to enter the building
    const worldDoorPos = new THREE.Vector3(
      block.posX + doorX,
      0,
      block.posZ + doorZ
    );

    interactables.push({
      id: `enter_${block.id}`,
      label: `Entrar a: ${block.name}`,
      type: 'prop',
      targetId: block.id,
      position: worldDoorPos,
      radius: 2.5
    });
  });

  // =========================================================================
  // 3. STREETFURNITURE: STREETLAMPS, PARKED VINTAGE CARS, FIRE HYDRANTS
  // =========================================================================
  // Streetlamps at 4 corners of central intersection
  const lampPositions = [
    { x: -3.6, z: -3.6 },
    { x: 3.6, z: -3.6 },
    { x: -3.6, z: 3.6 },
    { x: 3.6, z: 3.6 }
  ];

  lampPositions.forEach(pos => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 4.2, 8), ironMat);
    post.position.set(pos.x, 2.1, pos.z);
    const lantern = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 0.6, 0.45),
      new THREE.MeshBasicMaterial({ color: 0xffe082 })
    );
    lantern.position.set(pos.x, 4.2, pos.z);
    cityGroup.add(post, lantern);

    const lampLight = new THREE.PointLight(0xffaa22, 1.8, 9);
    lampLight.position.set(pos.x, 4.1, pos.z);
    cityGroup.add(lampLight);
    lights.push(lampLight);
  });

  // Parked Vintage 1947 Noir Sedans (Stylized Low-Poly Vehicles)
  const carColors = [0x1e293b, 0xd97706]; // Dark police sedan, yellow taxi cab
  [
    { x: -5.5, z: -0.8, rotY: 0, color: carColors[0] },
    { x: 5.5, z: 1.2, rotY: Math.PI, color: carColors[1] }
  ].forEach(carData => {
    const carGroup = new THREE.Group();
    carGroup.position.set(carData.x, 0, carData.z);
    carGroup.rotation.y = carData.rotY;

    // Body
    const bodyMat = new THREE.MeshStandardMaterial({ color: carData.color, roughness: 0.35, metalness: 0.6 });
    const carBody = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.7, 3.8), bodyMat);
    carBody.position.y = 0.55;
    carBody.castShadow = true;
    carGroup.add(carBody);

    // Cabin / Roof
    const carRoof = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.65, 2.0), bodyMat);
    carRoof.position.set(0, 1.15, -0.2);
    carGroup.add(carRoof);

    // Yellow Headlights
    const hLightMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    [-0.6, 0.6].forEach(hx => {
      const headlight = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.1, 8), hLightMat);
      headlight.rotation.x = Math.PI / 2;
      headlight.position.set(hx, 0.55, 1.95);
      carGroup.add(headlight);
    });

    // Wheels
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });
    [-0.95, 0.95].forEach(wx => {
      [-1.1, 1.1].forEach(wz => {
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.22, 10), wheelMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(wx, 0.32, wz);
        carGroup.add(wheel);
      });
    });

    cityGroup.add(carGroup);
  });

  // Newspaper Kiosk on Sidewalk
  const kiosk = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.4, 1.2), new THREE.MeshStandardMaterial({ color: 0x163428, roughness: 0.7 }));
  kiosk.position.set(-2.5, 1.2, -2.5);
  cityGroup.add(kiosk);

  // =========================================================================
  // 4. PEDESTRIANS & WITNESSES IN THE CITY
  // =========================================================================
  CITY_PEDESTRIANS.forEach(ped => {
    const pedGroup = new THREE.Group() as CharacterGroup;
    pedGroup.position.set(ped.position.x, 0, ped.position.z);

    // Stylized silhouette NPC
    const coatMat = new THREE.MeshStandardMaterial({ color: ped.color, roughness: 0.75 });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xdfba92, roughness: 0.7 });

    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.95, 8), coatMat);
    body.position.y = 0.75;
    body.castShadow = true;
    pedGroup.add(body);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.17, 8, 8), skinMat);
    head.position.y = 1.35;
    pedGroup.add(head);

    // Hat / Cap
    const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.08, 8), new THREE.MeshStandardMaterial({ color: 0x111115 }));
    hat.position.set(0, 1.48, 0);
    pedGroup.add(hat);

    // If Clara, add Umbrella
    if (ped.id === 'ped_dama') {
      const umbMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 });
      const umbrella = new THREE.Mesh(new THREE.ConeGeometry(0.65, 0.35, 10), umbMat);
      umbrella.position.set(0.3, 1.85, 0);
      pedGroup.add(umbrella);
    }

    cityGroup.add(pedGroup);
    pedestrianGroups.push(pedGroup);

    // Add interactable for this pedestrian
    interactables.push({
      id: `ped_interact_${ped.id}`,
      label: `Preguntar a ${ped.name} si vio algo sospechoso`,
      type: 'npc',
      targetId: ped.id,
      position: new THREE.Vector3(ped.position.x, 0, ped.position.z),
      radius: 2.2
    });
  });

  return {
    cityGroup,
    interactables,
    pedestrianGroups,
    lights
  };
}
