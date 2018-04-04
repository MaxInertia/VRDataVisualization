package plots

import org.scalajs.{threejs => THREE}

/**
  * Created by Dorian Thiessen on 2018-01-13.
  */
class TimeSeries(val tag: String, geometry: THREE.BufferGeometry, material: THREE.PointsMaterial)
  extends Plot(tag, geometry, material) {}

object TimeSeries {
  def apply(id: String, measurements: Array[Coordinate], hue: Double): Unit = {
    val vertices = Plot.makeVertices(measurements)
    val geometry = Plot.makeGeometry(vertices, hue)
    val color = new THREE.Color(hue)
    val material = Plot.makeMaterial(color)
    new TimeSeries(id, geometry, material)
  }

  def createSet(data: Array[(String, Array[Double])], hue: Double): Array[TimeSeries] =
    null  // TODO: Implement TimeSeries.create(...)
}
