package plots

import org.scalajs.{threejs => THREE}

/**
  * Created by Dorian Thiessen on 2018-04-05.
  */
class ScatterPlot(tag: String, points: THREE.Points) extends Plot(tag, points)

object ScatterPlot {
  def apply(title: String,     hue: Double = 0.0,
            xs: Array[Double], ys: Array[Double], zs: Array[Double],
            xid: String,       yid: String,       zid: String): ScatterPlot = {
    val coordinates: Array[Coordinate] = Plot.zip3(xs, ys, zs)
    new ScatterPlot(title, Plot.makePoints(coordinates, hue))
  }
}