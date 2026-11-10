// Procedural 3D Character Models (Three.js Groups with 6-12 parts)
import * as THREE from 'three';

export interface CharacterGroup extends THREE.Group {
  userData: {
    characterId: string;
    walkCycle?: number;
    leftLeg?: THREE.Mesh;
    rightLeg?: THREE.Mesh;
    leftArm?: THREE.Mesh;
    rightArm?: THREE.Mesh;
    headGroup?: THREE.Group;
    coatFlap?: THREE.Mesh;
    smokeEmitter?: THREE.Points;
  };
}

export function createDetectiveModel(): CharacterGroup {
  const group = new THREE.Group() as CharacterGroup;
  group.userData.characterId = 'detective';

  // Materials with varying roughness/metalness
  const coatMat = new THREE.MeshStandardMaterial({
    color: 0x8a7051, // Classic noir trenchcoat tan
    roughness: 0.85,
    metalness: 0.05
  });

  const pantsMat = new THREE.MeshStandardMaterial({
    color: 0x221f1d,
    roughness: 0.9,
    metalness: 0.02
  });

  const shoesMat = new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.35,
    metalness: 0.2
  });

  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xe5c298,
    roughness: 0.7,
    metalness: 0.0
  });

  const hatMat = new THREE.MeshStandardMaterial({
    color: 0x423526,
    roughness: 0.75,
    metalness: 0.1
  });

  const ribbonMat = new THREE.MeshStandardMaterial({
    color: 0x181412,
    roughness: 0.4,
    metalness: 0.3
  });

  const tieMat = new THREE.MeshStandardMaterial({
    color: 0x8b0000, // Crimson red tie
    roughness: 0.5,
    metalness: 0.2
  });

  // 1. Shoes & Legs
  const legGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.65, 8);
  const shoeGeo = new THREE.BoxGeometry(0.14, 0.1, 0.24);

  const leftLegGroup = new THREE.Group();
  leftLegGroup.position.set(-0.16, 0.65, 0);
  const leftLegMesh = new THREE.Mesh(legGeo, pantsMat);
  leftLegMesh.position.y = -0.32;
  leftLegMesh.castShadow = true;
  leftLegGroup.add(leftLegMesh);

  const leftShoe = new THREE.Mesh(shoeGeo, shoesMat);
  leftShoe.position.set(0, -0.6, 0.04);
  leftShoe.castShadow = true;
  leftLegGroup.add(leftShoe);
  group.add(leftLegGroup);

  const rightLegGroup = new THREE.Group();
  rightLegGroup.position.set(0.16, 0.65, 0);
  const rightLegMesh = new THREE.Mesh(legGeo, pantsMat);
  rightLegMesh.position.y = -0.32;
  rightLegMesh.castShadow = true;
  rightLegGroup.add(rightLegMesh);

  const rightShoe = new THREE.Mesh(shoeGeo, shoesMat);
  rightShoe.position.set(0, -0.6, 0.04);
  rightShoe.castShadow = true;
  rightLegGroup.add(rightShoe);
  group.add(rightLegGroup);

  // 2. Trenchcoat Torso & Flared Coat Skirt
  const coatGeo = new THREE.CylinderGeometry(0.24, 0.34, 0.65, 8);
  const coatMesh = new THREE.Mesh(coatGeo, coatMat);
  coatMesh.position.y = 0.95;
  coatMesh.castShadow = true;
  group.add(coatMesh);

  // Lapel & Tie
  const lapelGeo = new THREE.BoxGeometry(0.12, 0.32, 0.04);
  const tieGeo = new THREE.BoxGeometry(0.07, 0.28, 0.03);
  const tieMesh = new THREE.Mesh(tieGeo, tieMat);
  tieMesh.position.set(0, 1.05, 0.23);
  group.add(tieMesh);

  // 3. Arms
  const armGeo = new THREE.CylinderGeometry(0.07, 0.065, 0.6, 8);
  const handGeo = new THREE.SphereGeometry(0.06, 6, 6);

  const leftArmGroup = new THREE.Group();
  leftArmGroup.position.set(-0.32, 1.2, 0);
  const leftArmMesh = new THREE.Mesh(armGeo, coatMat);
  leftArmMesh.position.y = -0.3;
  leftArmMesh.castShadow = true;
  leftArmGroup.add(leftArmMesh);
  const leftHand = new THREE.Mesh(handGeo, skinMat);
  leftHand.position.y = -0.6;
  leftArmGroup.add(leftHand);
  group.add(leftArmGroup);

  const rightArmGroup = new THREE.Group();
  rightArmGroup.position.set(0.32, 1.2, 0);
  const rightArmMesh = new THREE.Mesh(armGeo, coatMat);
  rightArmMesh.position.y = -0.3;
  rightArmMesh.castShadow = true;
  rightArmGroup.add(rightArmMesh);
  const rightHand = new THREE.Mesh(handGeo, skinMat);
  rightHand.position.y = -0.6;
  rightArmGroup.add(rightHand);
  group.add(rightArmGroup);

  // 4. Head & Fedora Hat
  const headGroup = new THREE.Group();
  headGroup.position.y = 1.38;

  const headGeo = new THREE.SphereGeometry(0.18, 12, 10);
  const headMesh = new THREE.Mesh(headGeo, skinMat);
  headMesh.castShadow = true;
  headGroup.add(headMesh);

  // Fedora Brim
  const brimGeo = new THREE.CylinderGeometry(0.36, 0.38, 0.04, 16);
  const brimMesh = new THREE.Mesh(brimGeo, hatMat);
  brimMesh.position.set(0, 0.12, 0);
  brimMesh.rotation.x = 0.08; // tilted slightly forward noir style
  headGroup.add(brimMesh);

  // Fedora Crown
  const crownGeo = new THREE.CylinderGeometry(0.2, 0.24, 0.22, 14);
  const crownMesh = new THREE.Mesh(crownGeo, hatMat);
  crownMesh.position.set(0, 0.23, -0.01);
  headGroup.add(crownMesh);

  // Fedora Ribbon
  const ribbonGeo = new THREE.CylinderGeometry(0.242, 0.242, 0.05, 14);
  const ribbonMesh = new THREE.Mesh(ribbonGeo, ribbonMat);
  ribbonMesh.position.set(0, 0.16, -0.01);
  headGroup.add(ribbonMesh);

  group.add(headGroup);

  // Store references for walking animation
  group.userData.leftLeg = leftLegGroup as unknown as THREE.Mesh;
  group.userData.rightLeg = rightLegGroup as unknown as THREE.Mesh;
  group.userData.leftArm = leftArmGroup as unknown as THREE.Mesh;
  group.userData.rightArm = rightArmGroup as unknown as THREE.Mesh;
  group.userData.headGroup = headGroup;

  return group;
}

export function createNPCModel(npcType: 'conserje' | 'vivienne' | 'thorne' | 'vincent' | 'armstrong_body'): CharacterGroup {
  const group = new THREE.Group() as CharacterGroup;
  group.userData.characterId = npcType;

  if (npcType === 'conserje') {
    // Don Teodoro: Bellhop / concierge uniform, navy & brass
    const coatMat = new THREE.MeshStandardMaterial({ color: 0x1b2838, roughness: 0.8, metalness: 0.1 });
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.3, metalness: 0.8 });
    const capMat = new THREE.MeshStandardMaterial({ color: 0x15202b, roughness: 0.6, metalness: 0.2 });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xd9b38c, roughness: 0.8, metalness: 0 });

    // Body
    const bodyGeo = new THREE.CylinderGeometry(0.22, 0.26, 0.9, 8);
    const body = new THREE.Mesh(bodyGeo, coatMat);
    body.position.y = 0.75;
    body.castShadow = true;
    group.add(body);

    // Brass buttons down jacket
    for (let i = 0; i < 4; i++) {
      const btn = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), brassMat);
      btn.position.set(0, 0.9 - i * 0.12, 0.23);
      group.add(btn);
    }

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 8), skinMat);
    head.position.y = 1.32;
    head.castShadow = true;
    group.add(head);

    // Concierge Cap
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.19, 0.1, 12), capMat);
    cap.position.set(0, 1.48, 0.02);
    group.add(cap);
    const capTrim = new THREE.Mesh(new THREE.TorusGeometry(0.185, 0.015, 6, 16), brassMat);
    capTrim.position.set(0, 1.44, 0.02);
    capTrim.rotation.x = Math.PI / 2;
    group.add(capTrim);

  } else if (npcType === 'vivienne') {
    // Madame Vivienne: Silk burgundy dress, fur stole, feathered fascinator
    const dressMat = new THREE.MeshStandardMaterial({ color: 0x8b0000, roughness: 0.45, metalness: 0.2 });
    const furMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.95, metalness: 0.0 });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xf5d0b5, roughness: 0.6, metalness: 0 });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x1f140e, roughness: 0.6, metalness: 0.1 });

    // Slim hourglass dress
    const dressGeo = new THREE.CylinderGeometry(0.16, 0.32, 1.1, 10);
    const dress = new THREE.Mesh(dressGeo, dressMat);
    dress.position.y = 0.65;
    dress.castShadow = true;
    group.add(dress);

    // Black fur stole
    const stoleGeo = new THREE.TorusGeometry(0.24, 0.08, 8, 14);
    const stole = new THREE.Mesh(stoleGeo, furMat);
    stole.position.set(0, 1.15, 0);
    stole.rotation.x = Math.PI / 2.3;
    group.add(stole);

    // Head & Hair
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), skinMat);
    head.position.y = 1.32;
    head.castShadow = true;
    group.add(head);

    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), hairMat);
    hair.position.set(0, 1.36, -0.03);
    group.add(hair);

    // Feather fascinator
    const featherGeo = new THREE.ConeGeometry(0.06, 0.28, 6);
    const feather = new THREE.Mesh(featherGeo, dressMat);
    feather.position.set(0.12, 1.54, 0.04);
    feather.rotation.z = -0.3;
    group.add(feather);

  } else if (npcType === 'thorne') {
    // Dr. Thorne: Tweed waistcoat, spectacles, clinical demeanor
    const tweedMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.85, metalness: 0.05 });
    const shirtMat = new THREE.MeshStandardMaterial({ color: 0xdedbd2, roughness: 0.7, metalness: 0.0 });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xe5c298, roughness: 0.7, metalness: 0 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0xcfd8dc, roughness: 0.1, metalness: 0.9 });

    // Body
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.95, 8), tweedMat);
    body.position.y = 0.75;
    body.castShadow = true;
    group.add(body);

    const tie = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.24, 0.04), new THREE.MeshStandardMaterial({ color: 0x1e3a5f }));
    tie.position.set(0, 1.05, 0.21);
    group.add(tie);

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 8), skinMat);
    head.position.y = 1.33;
    head.castShadow = true;
    group.add(head);

    // Spectacles (golden rims)
    [-0.07, 0.07].forEach(offset => {
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.008, 6, 10), glassMat);
      rim.position.set(offset, 1.34, 0.15);
      group.add(rim);
    });

  } else if (npcType === 'vincent') {
    // Vincent Navarro: Dark trench, flat newsboy cap, ominous stance
    const leatherMat = new THREE.MeshStandardMaterial({ color: 0x191d24, roughness: 0.45, metalness: 0.25 });
    const capMat = new THREE.MeshStandardMaterial({ color: 0x2b2d42, roughness: 0.8, metalness: 0.1 });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xd9b28c, roughness: 0.8, metalness: 0 });

    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.28, 0.98, 8), leatherMat);
    body.position.y = 0.75;
    body.castShadow = true;
    group.add(body);

    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.18, 8), leatherMat);
    collar.position.set(0, 1.15, 0);
    group.add(collar);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 8), skinMat);
    head.position.y = 1.34;
    head.castShadow = true;
    group.add(head);

    // Newsboy flat cap pulled low
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.08, 12), capMat);
    cap.position.set(0, 1.46, 0.03);
    cap.rotation.x = 0.15;
    group.add(cap);

  } else if (npcType === 'armstrong_body') {
    // Lord Armstrong: Slumped at desk (crime scene)
    const robeMat = new THREE.MeshStandardMaterial({ color: 0x4a1525, roughness: 0.6, metalness: 0.2 });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xd3c5be, roughness: 0.9, metalness: 0 }); // pale

    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.35, 0.28), robeMat);
    torso.position.set(0, 0.6, 0);
    torso.rotation.x = 0.45; // slumped forward onto desk
    torso.castShadow = true;
    group.add(torso);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), skinMat);
    head.position.set(0, 0.72, 0.2);
    head.rotation.x = 0.6;
    head.castShadow = true;
    group.add(head);
  }

  return group;
}
