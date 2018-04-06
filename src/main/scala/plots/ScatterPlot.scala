package plots

import org.scalajs.{threejs => THREE}
import plots.ScatterPlot.CoordinateAxisIDs

/**
  * Container of a simple scatter-plot.
  *
  * Created by Dorian Thiessen on 2018-04-05.
  */
class ScatterPlot(tag: String, points: THREE.Points) extends Plot(tag, points) {
  private var xid: CoordinateAxisIDs = _
  private var yid: CoordinateAxisIDs = _
  private var zid: CoordinateAxisIDs = _
}

// Tried some unconventional spacing on this one. I have mixed feelings about it.
object ScatterPlot {
  type CoordinateAxisIDs = String

  def apply(title: String,          hue: Double = 0.0,
            xs: Array[Double],      ys: Array[Double],      zs: Array[Double],
            xid: CoordinateAxisIDs, yid: CoordinateAxisIDs, zid: CoordinateAxisIDs): ScatterPlot = {
    val coordinates: Array[Coordinate] = Plot.zip3(xs, ys, zs)
    val scatterPlot = new ScatterPlot(title, Plot.makePoints(coordinates, Some(hue), 0))
    setAxisIDs(scatterPlot, xid, yid, zid)
    scatterPlot
  }

  private def setAxisIDs(sp: ScatterPlot,      x: CoordinateAxisIDs,
                         y: CoordinateAxisIDs, z: CoordinateAxisIDs): Unit = {
    sp.xid = x
    sp.yid = y
    sp.zid = z
  }
}