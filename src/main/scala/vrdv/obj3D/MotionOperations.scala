package vrdv.obj3D

import org.scalajs.threejs.{Matrix4, Object3D, Vector3}

/**
  * Created by Dorian Thiessen on 2018-07-30.
  */
object MotionOperations {

  /**
    * Rotate an object around an arbitrary axis in world space
    * https://stackoverflow.com/questions/11119753/how-to-rotate-a-object-on-axis-world-three-js
    * @param object3D The object being rotated
    * @param axis The world axis on which the rotation will occur
    * @param radians The angle of rotation
    */
  def rotateAroundWorldAxis(object3D: Object3D, axis: Vector3, radians: Double): Unit = {
    var rotWorldMatrix = new Matrix4()
    rotWorldMatrix.makeRotationAxis(axis.normalize(), radians)
    object3D.matrix  = rotWorldMatrix.multiply(object3D.matrix)
    object3D.rotation.setFromRotationMatrix(object3D.matrix)
  }
}
