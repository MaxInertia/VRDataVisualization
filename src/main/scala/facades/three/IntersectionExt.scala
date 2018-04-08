package facades.three

import scalajs.js
import org.scalajs.{threejs => THREE}

import scala.scalajs.js.annotation.JSGlobal

/**
  * Created by Dorian Thiessen on 2018-02-12.
  */
@js.native
@JSGlobal("THREE.Intersection")
class IntersectionExt extends THREE.Intersection {
  var index: Int = js.native
}
