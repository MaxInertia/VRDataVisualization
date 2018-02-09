package plots

import org.scalajs.{threejs => THREE}

/**
  * Created by Dorian Thiessen on 2018-01-13.
  */
class TimeSeries(geometry: THREE.Geometry, material: THREE.PointsMaterial)
  extends Plot(geometry, material) {}

object TimeSeries {
  def create(title: String, data: Array[Double]): TimeSeries =
    null  // TODO: Implement TimeSeries.create(...)
}