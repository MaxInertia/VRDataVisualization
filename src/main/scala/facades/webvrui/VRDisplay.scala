package facades.webvrui

import org.scalajs.threejs

import scala.scalajs.js

/**
  * Created by Dorian Thiessen on 2018-02-13.
  */
@js.native
trait VRDisplay extends js.Any {
  def render(scene: threejs.Scene, camera: threejs.Camera): Unit = js.native
}
