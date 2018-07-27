package viewable.plots

import math.{ScaleCenterProperties, Stats}
import resources.Data
import util.Log

import scala.scalajs.js

/**
  * Container of a simple scatter-plot.
  *
  * Created by Dorian Thiessen on 2018-04-05.
  */
class ScatterPlot(points: Points, data: Array[Data], val viewing: Array[Int], var props: ScaleCenterProperties) extends Plot {
  override val ops: SelectionOps = new SelectionOps {}
  var visiblePoints: Int = numPoints

  Log.show(s"Scatterplot created with ")
  for(i <- data.indices) Log.show(s"stats($i).max:${stats(i).max}, min:${stats(i).min}")

  def stats(i: Int): Stats = data(i).getStats

  override def xVar: String = data(viewing(XAxis)).id // 1st column ID
  override def yVar: String = data(viewing(YAxis)).id // 2nd column ID
  override def zVar: String = data(viewing(ZAxis)).id // 3rd column ID
  override def column(axisID: Int): Array[Double] = data(viewing(axisID)).measurements
  def getColumnByIndex(columnIndex: Int): Array[Double] = data(columnIndex).measurements

  def columnCount: Int = data.length

  def getColumnNames: Array[String] = data.map(_.id)

  def switchAxis(axisID: AxisID, shift: Int = 1, shiftIsColumnIndex: Boolean = false): Unit = {
    rawAxisShift(axisID, shift,
      updatePointDetails = true,
      shiftIsColumn = shiftIsColumnIndex)
    fixScale()

    getPositions.needsUpdate = true
    requestGeometryUpdate()
  }

  def shiftEachAxis(xShift: Int, yShift: Int, zShift: Int): Unit = {
    rawAxisShift(XAxis, xShift, updatePointDetails = false)
    rawAxisShift(YAxis, yShift, updatePointDetails = false)
    rawAxisShift(ZAxis, zShift, updatePointDetails = true)
    fixScale()

    getPositions.needsUpdate = true
    requestGeometryUpdate()
  }

  def setVisiblePointRange(first: Int, last: Int): Unit = {
    visiblePoints = last - first
    getGeometry.asInstanceOf[js.Dynamic].setDrawRange(first, last)
  }

  private def rawAxisShift(axisID: AxisID, shift: Int, updatePointDetails: Boolean, shiftIsColumn: Boolean = false): Unit = {
    if (shiftIsColumn) {
      assert(shift >= 0 && shift < data.length, s"[rawAxisShift] - Attempted switching axis #$axisID to invalid column #$shift")
      Log(s"Switching axis #$axisID from ${viewing(axisID)} to $shift)")
      viewing(axisID) = shift

    } else {
      Log(s"Switching axis #$axisID from ${viewing(axisID)} to ${(viewing(axisID) + shift) % data.length})")
      viewing(axisID) = (viewing(axisID) + shift) % data.length
    }

    updateAxis(axisID, column(axisID), updatePointDetails)
  }

  /*private[plots] */def fixScale(x: AxisID = XAxis, y: AxisID = YAxis, z: AxisID = ZAxis): Unit = {
    props = PlotManipulator.confineToRegion(points,
      (stats(viewing(x)).min, stats(viewing(y)).min, stats(viewing(z)).min),
      (stats(viewing(x)).max, stats(viewing(y)).max, stats(viewing(z)).max))
  }

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

    val (points, props, vStats): (Points, ScaleCenterProperties, Array[Stats]) = PointsBuilder()
      .withXS(data(viewing(XAxis)).measurements)
      .withYS(data(viewing(YAxis)).measurements)
      .withZS(data(viewing(ZAxis)).measurements)
      .usingHue(Some(hue))
      .usingTexture(texture)
      .build3D()

    for(i <- vStats.indices) { // This is happening on a certain CSV for column 1...
      if(vStats(i).min != data(i).getStats.min) {
        Log.show(s"\n\nWHOOPS... vStats($i).min:${vStats(i).min} != stats($i).min${data(i).getStats.min}\n")
        // vStats is more reliable (Why?)
        data(i).updateStats(Stats.cloneWith(data(i).getStats)(min = vStats(i).min, max = vStats(i).max)) // <- Terrible temporary fix
      }
      if(vStats(i).max != data(i).getStats.max) {
        Log.show(s"\n\nWHOOPS... vStats($i).max:${vStats(i).min} != stats($i).max${data(i).getStats.min}\n")
        data(i).updateStats(Stats.cloneWith(data(i).getStats)(min = vStats(i).min, max = vStats(i).max)) // <- Terrible temporary fix
      }
    }

    val scatterPlot = new ScatterPlot(points, data, viewing, props)
    Log.show(s"Scatterplot constructor shows: max:${data(0).getStats.max}, min:${data(0).getStats.min}")
    scatterPlot.hue = hue
    scatterPlot
  }
}