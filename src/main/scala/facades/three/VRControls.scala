package js.three

import org.scalajs.{threejs => THREE}

import scala.scalajs.js
import scala.scalajs.js.annotation.JSGlobal

/**
  * Created by Dorian Thiessen on 2018-01-11.
  */
@js.native
@JSGlobal("THREE.VRControls")
class VRControls extends js.Object {
  def this(camera: THREE.Camera) = this()

  var scale: Double = js.native
  var standing: Boolean = js.native
  var userHeight: Double = js.native

  def update(): Unit = js.native
  def getStandingMatrix(): THREE.Matrix4 = js.native
  def dispose(): Unit = js.native
}
