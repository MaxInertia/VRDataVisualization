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
  def columnCount: Int = data.length

  def switchAxis(axisID: AxisID, shift: Int = 1): Unit = {
    rawAxisShift(axisID, shift)
    fixScale()

    getPositions.needsUpdate = true
    requestGeometryUpdate()
  }

  def shiftEachAxis(xShift: Int, yShift: Int, zShift: Int): Unit = {
    rawAxisShift(XAxis, xShift, updatePointDetails = false)
    rawAxisShift(YAxis, yShift, updatePointDetails = false)
    rawAxisShift(ZAxis, zShift)
    fixScale()

    getPositions.needsUpdate = true
    requestGeometryUpdate()
  }

  private def rawAxisShift(axisID: AxisID, shift: Int, updatePointDetails: Boolean = true): Unit = {
    Log.show(s"Switching axis #$axisID from ${viewing(axisID)} to ${(viewing(axisID) + shift) % data.length})")
    viewing(axisID) = (viewing(axisID) + shift) % data.length
    updateAxis(axisID, column(axisID), updatePointDetails)
  }

  private[plots] def fixScale(x: AxisID = XAxis, y: AxisID = YAxis, z: AxisID = ZAxis): Unit = {
    props = PlotManipulator.confineToRegion(points,
      (stats(viewing(x)).min, stats(viewing(y)).min, stats(viewing(z)).min),
      (stats(viewing(x)).max, stats(viewing(y)).max, stats(viewing(z)).max)
    )
  }

  /*override def restoredValue(modified: Double, col: Int): Double = {
    // TODO: Create 2D & 3D variants, then remove ` % stats.length` from here
    Stats.restore(modified, stats(col % data.length).sd, stats(col % data.length).mean)
  }*/

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