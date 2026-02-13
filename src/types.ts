export type Vec3 = [number, number, number]

export type ModelNode = {
  name: string
  position: Vec3
  direction: Vec3
}

export type CanvasModel = {
  id: string;
  modelId: string;
  name: string;
  glbUrl: string
  position: Vec3
  rotation: Vec3
}

export type Model = {
  id: string
  name: string
  glbUrl: string
}
