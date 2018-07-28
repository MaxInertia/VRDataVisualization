package controls

import facades.IFThree.RaycasterParametersExt
import org.scalajs.threejs._

/**
  * A rayCaster wrapper with flags to determine whether
  * an interacted object should be grabbed or clicked.
  *
  * Created by Dorian Thiessen on 2018-07-19.
  */
class ActionLaser(val controller: OculusController) {
  var rayCaster: RayCaster = _
  var arrow: Line = _ // effectively the rayCaster mesh
  private[controls] var clicking: Boolean = false
  private[controls] var grabbing: Boolean = false

  def isActive: Boolean = arrow.visible
  def isClicking: Boolean = clicking
  def isGrabbing: Boolean = grabbing

  def construct(position: Vector3, direction: Vector3, hexColor: Int): Unit = {
    rayCaster = new RayCaster()
    rayCaster.set(position, direction)
    rayCaster.params.asInstanceOf[RaycasterParametersExt].Points.threshold = 0.015

    var material = new LineBasicMaterial()
    material.color.setHex(hexColor)
    var geometry = new Geometry()
    geometry.vertices.push(new Vector3(0, 0, -1))
    geometry.vertices.push(new Vector3(0, 0, 0))
    geometry.vertices.push(new Vector3(0, 0, 0))

    arrow = new Line(geometry, material)
    arrow.material.transparent = true
    arrow.material.opacity = 0.5
    arrow.visible = false
  }

  def updateLengthScale(scale: Double): Unit = {
    arrow.geometry.vertices(0).normalize().multiplyScalar(scale)
    arrow.visible = true
    arrow.geometry.computeBoundingSphere()
    arrow.geometry.computeBoundingBox()
    arrow.geometry.verticesNeedUpdate = true
  }

  def origin(): Vector3 = arrow.parent.position

  def destruct(): Unit = {
    rayCaster = null
    arrow.visible = false
    arrow.parent.remove(arrow)
    arrow = null
  }
}
