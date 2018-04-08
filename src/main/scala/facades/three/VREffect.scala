package js.three

import org.scalajs.{threejs => THREE}

import scala.scalajs.js
import scala.scalajs.js.annotation.JSGlobal

/**
  * Created by Dorian Thiessen on 2018-01-11.
  */
@js.native
@JSGlobal("THREE.VREffect")
class VREffect extends js.Object {
  def this(renderer: THREE.Renderer) = this()

  def setSize(width: Double, Height: Double): Unit = js.native
  def render(scene: THREE.Scene, camera: THREE.Camera): Unit = js.native
}
