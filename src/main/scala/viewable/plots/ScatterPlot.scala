package viewable.plots

import math.{ScaleCenterProperties, Stats}
import resources.Data
import util.Log

/**
  * Container of a simple scatter-plot.
  *
  * Created by Dorian Thiessen on 2018-04-05.
  */
class ScatterPlot(points: Points, data: Array[Data], viewing: Array[Int], var props: ScaleCenterProperties) extends Plot {
  override val ops: SelectionOps = new SelectionOps{}
  def stats(i: Int): Stats = data(i).stats.get

  override def xVar: String = data(viewing(XAxis)).id // 1st column ID
  override def yVar: String = data(viewing(YAxis)).id // 2nd column ID
  override def zVar: String = data(viewing(ZAxis)).id // 3rd column ID
  override def column(axisID: Int): Array[Double] = data(viewing(axisID)).measurements

  def switchAxis(axisID: Int): Unit = {
    Log.show(s"Switching axis #$axisID from ${viewing(axisID)} to ${(viewing(axisID) + 1) % data.length})")
    viewing(axisID) = (viewing(axisID) + 1) % data.length

    updateAxis(axisID, column(axisID))

    props = PlotManipulator.confineToRegion(
      points,
      (stats(viewing(XAxis)).min, stats(viewing(YAxis)).min, stats(viewing(ZAxis)).min),
      (stats(viewing(XAxis)).max, stats(viewing(YAxis)).max, stats(viewing(ZAxis)).max)
    )

    //points.matrixWorldNeedsUpdate = true
    getPositions.needsUpdate = true
    val geo = getGeometry
    geo.verticesNeedUpdate = true
    geo.normalsNeedUpdate = true
    geo.computeFaceNormals()
    geo.computeVertexNormals()
    geo.computeBoundingSphere()

    updateSelectedSummary()
    if(ops.hasHighlighted) updateHighlightedDetails(ops.getHighlighted)
  }

  override def restoredValue(modified: Double, col: Int): Double = {
    // TODO: Create 2D & 3D variants, then remove ` % stats.length` from here
    Stats.restore(modified, stats(col % data.length).sd, stats(col % data.length).mean)
  }

  def coordOfHighlighted(): (Double, Double, Double) = {
    if(highlighted.nonEmpty) {
      val x = column(XAxis)(highlighted.get)
      val y = column(YAxis)(highlighted.get)
      val z = column(ZAxis)(highlighted.get)
      (x, y, z)
    } else (0, 0, 0)
  }

  override def getName: String = "Scatterplot!" // Why do these need a name?
  override def getPoints: Points = points

  def getGeometry: BufferGeometry = points.geometry.asInstanceOf[BufferGeometry]
}

object ScatterPlot {
  type CoordinateAxisIDs = String

  def apply(data: Array[Data], texture: Int, hue: Double): ScatterPlot = {
    val viewing = Array(0, 0, 0)
    if(data.length > 1) { // make a 2D plot?
      Log("Columns > 1")
      viewing(YAxis) = 1
    }
    if(data.length > 2) {
      Log("Columns > 2")
      viewing(ZAxis) = 2
    }

    Log.show("Columns length on init: "+ data.length)

    val (points, props): (Points, ScaleCenterProperties) = PointsBuilder()
      .withXS(data(viewing(XAxis)).measurements)
      .withYS(data(viewing(YAxis)).measurements)
      .withZS(data(viewing(ZAxis)).measurements)
      .usingHue(Some(hue))
      .usingTexture(texture)
      .build3D()
    val scatterPlot = new ScatterPlot(points, data, viewing, props)
    scatterPlot.hue = hue
    scatterPlot
  }
}