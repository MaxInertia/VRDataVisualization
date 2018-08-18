package vrdv.obj3D.plots

import resources.{Data, Res}
import util.{ScaleCenterProperties, Stats}
import vrdv.obj3D.CustomColors

/**
 * Created by Dorian Thiessen on 2018-08-02.
 */
class TimeSeriesPlot2D(points: Points, private var x: Data, private var y: Data, props: ScaleCenterProperties)
  extends ScatterPlot2D(points, x, y, props) {}

object TimeSeriesPlot2D {
  def times(n: Int): Array[Double] = (0 until n).toArray.map(_.toDouble)

  def apply(xs: Data): ScatterPlot2D = {
    lazy val timeData = new Data("Time", times(xs.measurements.length))
    val (points, props, vStats): (Points, ScaleCenterProperties, Array[Stats]) = PointsBuilder()
      .withXS(timeData.measurements)
      .withYS(xs.measurements)
      .usingHue(Some(CustomColors.RED_HUE_SHIFT))
      .usingTexture(Res.getLastLoadedTextureID)
      .build2D()
    val ts = new TimeSeriesPlot2D(points, timeData, xs, props)
    ts.setVisiblePointRange(0,  ts.numPoints - 1)
    ts
  }
}