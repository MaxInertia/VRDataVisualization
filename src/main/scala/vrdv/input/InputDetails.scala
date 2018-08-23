package vrdv.input

import facade.IFThree.RaycasterParametersExt
import org.scalajs.threejs._
import vrdv.input.oculus.OculusController
import vrdv.obj3D.plots.{AxisID, NOAxis}

/**
  * Wrapper for controller input details.
  * Created by Dorian Thiessen on 2018-07-19.
  */
class InputDetails(val controller: OculusController) {
  var rayCaster: Raycaster = _
  var arrow: Line = _ // effectively the rayCaster mesh
  private[input] var clicking: Boolean = false
  private[input] var grabbing: Boolean = false
  def isActive: Boolean = arrow.visible

  var loadedAxis: AxisID = NOAxis
  def unloadAxis(): AxisID = {
    val temp = loadedAxis
    loadedAxis = NOAxis
    controller.setControllerColor()
    temp
  }
  def loadAxis(axisID: AxisID, color: String): AxisID = {
    controller.setControllerColor(color)
    loadedAxis = axisID
    loadedAxis
  }

  protected var yOffset: Vector3 = new Vector3(0, 1.6, 0)

  def updateRaycaster(vrc: Object3D): InputDetails = {
    // Adjust raycaster origin to account for fakeOrigin (The controllers parent)
    val correctedPosition = new Vector3(
      vrc.position.x,
      vrc.position.y,
      vrc.position.z
    )
    // If the controllers appear to be above the user
    // by ~1.5 meters, comment out the next line.
    correctedPosition.add(yOffset)

    val matrix = new Matrix4()
    matrix.extractRotation(vrc.matrix)
    var direction = new Vector3(0, 0, 1)
    direction = direction.applyMatrix4(matrix).negate()

    rayCaster.set(correctedPosition, direction)
    this
  }

  def construct(position: Vector3, direction: Vector3, hexColor: Int, isRight: Boolean): Unit = {
    rayCaster = new Raycaster()
    rayCaster.set(position, direction)
    rayCaster.params.asInstanceOf[RaycasterParametersExt].Points.threshold = 0.02

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

    if(isRight) InputDetails.right = rayCaster
    else InputDetails.left = rayCaster
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

// A hacky way to allow modifying threshold from DatGUI
object InputDetails {
  var left: Raycaster = _
  var right: Raycaster = _

  def updateThresholds(leftValue: Float, rightValue: Float): Unit = {
    if(left != null) left.params.asInstanceOf[RaycasterParametersExt].Points.threshold = leftValue
    if(right != null) right.params.asInstanceOf[RaycasterParametersExt].Points.threshold = rightValue
  }
}