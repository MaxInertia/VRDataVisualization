package js.three

import org.scalajs.{threejs => THREE}

import scala.scalajs.js
import scala.scalajs.js.annotation.JSGlobal

/**
  * Created by Dorian Thiessen on 2018-01-11.
  */
@js.native
@JSGlobal("THREE.FirstPersonVRControls")
class FirstPersonVRControls extends js.Object {
  def this(camera: THREE.Camera, scene: THREE.Scene) = this()
  def update(timestamp: Double): Unit = js.native
}
