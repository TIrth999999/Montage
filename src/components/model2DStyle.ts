import {
  Color,
  EdgesGeometry,
  LineBasicMaterial,
  LineDashedMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  type Material,
  type BufferGeometry,
} from 'three'

const NODE_FILL = new Color('#1adef8')
const NODE_OUTLINE = new Color('#12d8ee')
const DOOR_FILL = new Color('#000000')
const WALL_FILL = new Color('#ffffff')
const WALL_OUTLINE = new Color('#111111')

const OUTLINE_TAG = '__plan2d_outline__'

type StoredMeshMaterial = {
  mesh: Mesh
  material: Material | Material[]
}

type StoredVisibility = {
  object: Object3D
  visible: boolean
}

export function applyPlan2DStyle(root: Object3D) {
  const materialState: StoredMeshMaterial[] = []
  const visibilityState: StoredVisibility[] = []
  const disposableMaterials: Material[] = []
  const disposableGeometries: BufferGeometry[] = []

  root.traverse((object) => {
    const name = object.name ?? ''

    if (isRoofHierarchy(name)) {
      visibilityState.push({ object, visible: object.visible })
      object.visible = false
    }

    if (!(object instanceof Mesh)) return

    materialState.push({ mesh: object, material: object.material })

    if (isNode(name)) {
      const fill = new MeshBasicMaterial({ color: NODE_FILL, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 })
      object.material = fill
      disposableMaterials.push(fill)
      addOutline(object, NODE_OUTLINE, true, disposableMaterials, disposableGeometries)
      return
    }

    if (isDoor(name)) {
      const fill = new MeshBasicMaterial({ color: DOOR_FILL })
      object.material = fill
      disposableMaterials.push(fill)
      return
    }

    const fill = new MeshBasicMaterial({ color: WALL_FILL, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 })
    object.material = fill
    disposableMaterials.push(fill)
    addOutline(object, WALL_OUTLINE, false, disposableMaterials, disposableGeometries)
  })

  return () => {
    for (const { mesh, material } of materialState) {
      mesh.material = material
      const outlines = mesh.children.filter((child) => child.name === OUTLINE_TAG)
      for (const outline of outlines) {
        mesh.remove(outline)
      }
    }

    for (const { object, visible } of visibilityState) {
      object.visible = visible
    }

    for (const material of disposableMaterials) {
      material.dispose()
    }
    for (const geometry of disposableGeometries) {
      geometry.dispose()
    }
  }
}

function addOutline(
  mesh: Mesh,
  color: Color,
  dashed: boolean,
  disposableMaterials: Material[],
  disposableGeometries: BufferGeometry[],
) {
  const edgesGeometry = new EdgesGeometry(mesh.geometry)
  const lineMaterial = dashed
    ? new LineDashedMaterial({ color, dashSize: 0.2, gapSize: 0.11 })
    : new LineBasicMaterial({ color })

  const outline = new LineSegments(edgesGeometry, lineMaterial)
  outline.name = OUTLINE_TAG
  outline.renderOrder = 10

  if (outline.material instanceof LineDashedMaterial) {
    outline.computeLineDistances()
  }

  mesh.add(outline)
  disposableMaterials.push(lineMaterial)
  disposableGeometries.push(edgesGeometry)
}

function isNode(name: string) {
  return /^node\d*$/i.test(name)
}

function isDoor(name: string) {
  return /door/i.test(name)
}

function isRoofHierarchy(name: string) {
  return /(roof|ceiling)/i.test(name)
}
