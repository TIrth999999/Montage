import { Mesh, Object3D, Quaternion, Vector3 } from 'three'
import type { ModelNode } from '../types'

export function extractModelNodes(root: Object3D): ModelNode[] {
  const nodeEntries: ModelNode[] = []
  const rootWorldQuaternion = new Quaternion()
  const rootWorldQuaternionInverse = new Quaternion()
  const nodeCenterWorld = new Vector3()
  const nodeCenterLocal = new Vector3()
  const nodeNormalWorld = new Vector3()
  const nodeNormalLocal = new Vector3()

  root.getWorldQuaternion(rootWorldQuaternion)
  rootWorldQuaternionInverse.copy(rootWorldQuaternion).invert()

  root.updateMatrixWorld(true)
  root.traverse((object) => {
    if (!(object instanceof Mesh)) return
    if (!/^node\d*$/i.test(object.name)) return

    if (object.geometry) {
      object.geometry.computeBoundingBox()
    }
    if (object.geometry?.boundingBox) {
      nodeCenterWorld.copy(object.geometry.boundingBox.getCenter(nodeCenterWorld)).applyMatrix4(object.matrixWorld)
    } else {
      object.getWorldPosition(nodeCenterWorld)
    }
    nodeCenterLocal.copy(nodeCenterWorld)
    root.worldToLocal(nodeCenterLocal)

    object.getWorldDirection(nodeNormalWorld)
    nodeNormalLocal.copy(nodeNormalWorld).applyQuaternion(rootWorldQuaternionInverse).normalize()

    nodeEntries.push({
      name: object.name,
      position: [nodeCenterLocal.x, nodeCenterLocal.y, nodeCenterLocal.z],
      normal: [nodeNormalLocal.x, nodeNormalLocal.y, nodeNormalLocal.z],
    })
  })

  return nodeEntries
}
