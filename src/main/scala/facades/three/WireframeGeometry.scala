package facades.three

import org.scalajs.{threejs => THREE}

import scala.scalajs.js
import scala.scalajs.js.annotation.JSGlobal

/**
  * Created by Dorian Thiessen on 2018-04-07.
  */
@js.native
@JSGlobal("THREE.WireframeGeometry")
class WireframeGeometry(geometry: THREE.Geometry) extends THREE.Geometry {
  var index: Int = js.native
}

@js.native
@JSGlobal("THREE.LineSegments")
class LineSegments(wireframe: WireframeGeometry) extends THREE.Line {
  val isLineSegments: Boolean = js.native
}