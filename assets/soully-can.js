// Soully can: shape traced from the product renders, label unwrapped into one 360-degree texture.
// Usage: const can = createCan(THREE, renderer, { label: "assets/soully-label.webp", onLoad, onError });
import * as THREE from "three";

// Profile [radius, row] in render pixels, bottom -> top.
const BODY = [[0,1742],[150,1741],[220.1,1736],[269.2,1730],[281.3,1724],[286.4,1718],[290.0,1712],[293.1,1706],[296.3,1700],[300.3,1694],[306.0,1688],[313.2,1682],[321.2,1676],[329.4,1670],[337.7,1664],[345.7,1658],[353.3,1652],[360.1,1646],[365.1,1640],[368.9,1634],[371.4,1628],[372.9,1622],[374.4,1616],[375.3,1610],[375.7,1604],[376.0,1600],[375.8,1560],[375.8,1520],[375.5,1480],[375.5,1440],[375.5,1400],[375.2,1360],[375.2,1320],[375.1,1280],[375.0,1240],[375.0,1200],[375.0,1160],[375.0,1120],[375.0,1080],[375.0,1040],[374.8,1000],[374.8,960],[374.8,920],[374.8,880],[374.7,840],[374.7,800],[374.5,760],[375.0,720],[375.0,680],[375.0,640],[375.0,620],[374.9,612],[374.9,604],[375.2,596],[375.1,588],[374.9,580],[374.3,572],[373.6,564],[372.5,556],[370.8,548],[368.5,540],[365.5,532],[362.0,524],[358.3,516],[353.9,508],[349.5,500],[345.0,492],[340.7,484],[336.1,476],[331.6,468],[327.4,460],[322.8,452],[318.4,444],[314.2,436],[310.0,428],[306.1,420],[302.8,412],[300.0,404],[298.1,396],[298.0,388],[303.0,380],[304.2,377]];
const TOP = 346, BOTTOM = 1746, LABEL_TOP = 377, LABEL_H = 1369;
const S = 2.05 / (BOTTOM - TOP);                     // render px -> scene units (can is 2.05 tall)
const yOf = (row) => ((BOTTOM + TOP) / 2 - row) * S;  // centred on the can's middle

export function createCan(renderer, { label = "assets/soully-label.webp", onLoad, onError } = {}) {
  const can = new THREE.Group();

  // printed body: label wraps 360deg, seam on the right side (u=0), front faces the camera
  const body = new THREE.LatheGeometry(BODY.map(([r, row]) => new THREE.Vector2(r * S, yOf(row))), 160, Math.PI / 2);
  const uv = body.attributes.uv, n = BODY.length;
  for (let i = 0; i < uv.count; i++) uv.setY(i, 1 - (BODY[i % n][1] - LABEL_TOP) / LABEL_H);
  const labelMat = new THREE.MeshPhysicalMaterial({ color: 0xc7dcab, roughness: 0.42, metalness: 0.12, clearcoat: 0.55, clearcoatRoughness: 0.3, envMapIntensity: 0.55 });
  can.add(new THREE.Mesh(body, labelMat));

  // aluminium rim, lid and pull tab
  const alu = new THREE.MeshStandardMaterial({ color: 0xdfe3e6, metalness: 1, roughness: 0.27, envMapIntensity: 1.1 });
  const RIM = [[304, 377], [306.5, 370], [306.5, 356], [303, 348], [296, 346], [289, 350], [284, 356]];
  can.add(new THREE.Mesh(new THREE.LatheGeometry(RIM.map(([r, row]) => new THREE.Vector2(r * S, yOf(row))), 160), alu));
  const lid = new THREE.Mesh(new THREE.CircleGeometry(284 * S, 96), new THREE.MeshStandardMaterial({ color: 0xc9ced2, metalness: 1, roughness: 0.35 }));
  lid.rotation.x = -Math.PI / 2; lid.position.y = yOf(357); can.add(lid);
  const tab = new THREE.Mesh(new THREE.CapsuleGeometry(34 * S, 70 * S, 6, 16), alu);
  tab.rotation.x = -Math.PI / 2; tab.scale.set(1, 1, 0.12); tab.position.set(0, yOf(355), 62 * S); can.add(tab);

  new THREE.TextureLoader().load(label, (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    tex.wrapS = THREE.RepeatWrapping;
    labelMat.color.set(0xffffff); labelMat.map = tex; labelMat.needsUpdate = true;
    onLoad && onLoad();
  }, undefined, () => onError && onError());

  return can;
}
