package plots

import env.Environment.Column
import plots.ScatterPlot.CoordinateAxisIDs

/**
  * Container of a simple scatter-plot.
  *
  * Created by Dorian Thiessen on 2018-04-05.
  */
class ScatterPlot(points: Points, columns: (Column, Column, Column)) extends Plot {
  override val ops: SelectionOps = new SelectionOps{}
  def xid: CoordinateAxisIDs = columns._1._1 // 1st column, 1st field
  def yid: CoordinateAxisIDs = columns._2._1 // 2nd column, 1st field
  def zid: CoordinateAxisIDs = columns._3._1 // 3rd column, 1st field

  override def xVar: String = columns._1._1
  override def yVar: String = columns._2._1
  override def zVar: String = columns._3._1
  override def getName: String = "Scatterplot!" // Why do these need a name?
  override def getPoints: Points = points

  def getGeometry: BufferGeometry = points.geometry.asInstanceOf[BufferGeometry]
}
object ScatterPlot {
  type CoordinateAxisIDs = String

  def apply(xColumn: Column, yColumn: Column, zColumn: Column, texture: Int, hue: Double = 0.0): ScatterPlot = {
    val points = PointsBuilder()
      .withXS(xColumn._2)
      .withYS(yColumn._2)
      .withZS(zColumn._2)
      .usingHue(Some(hue))
      .usingTexture(texture)
      .build3D()
    val scatterPlot = new ScatterPlot(points, (xColumn, yColumn, zColumn))
    scatterPlot.hue = hue
    scatterPlot
  }
}