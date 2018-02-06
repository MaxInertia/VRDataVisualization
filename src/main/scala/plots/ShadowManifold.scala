package plots

import org.scalajs.{threejs => THREE}

/**
  * Created by Dorian Thiessen on 2018-01-13.
  */
class ShadowManifold(geometry: THREE.Geometry, material: THREE.PointsMaterial)
  extends THREE.Points(geometry, material) {}

object ShadowManifold {
  def create(title: String, data: Array[Double]): ShadowManifold =
    null // TODO: Implement ShadowManifold.create(...)

}