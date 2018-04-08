package facades.three

import org.scalajs.{threejs => THREE}

import scala.scalajs.js
import scala.scalajs.js.annotation.JSGlobal

/**
  * Created by Dorian Thiessen on 2018-02-10.
  */
@js.native
@JSGlobal("THREE.Scene")
class SceneExt extends THREE.Scene {
  var background: THREE.Color = js.native
}
