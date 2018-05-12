package viewable.plots

import math.{ScaleCenterProperties, Stats}
import util.Log
import viewable.Environment.Column
import viewable.plots.ScatterPlot.CoordinateAxisIDs

import scala.scalajs.js

/**
  * Container of a simple scatter-plot.
  *
  * Created by Dorian Thiessen on 2018-04-05.
  */
class ScatterPlot(points: Points, columns: Array[Column], viewing: Array[Int], props: ScaleCenterProperties) extends Plot {
  override val ops: SelectionOps = new SelectionOps{}
  var stats: Array[Stats] = Array()

  def xid: CoordinateAxisIDs = columns(viewing(0))._1 // 1st column, 1st field
  def yid: CoordinateAxisIDs = columns(viewing(1))._1 // 2nd column, 1st field
  def zid: CoordinateAxisIDs = columns(viewing(2))._1 // 3rd column, 1st field

  override def xVar: String = columns(viewing(0))._1
  override def yVar: String = columns(viewing(1))._1
  override def zVar: String = columns(viewing(2))._1
  override def column(c: Int): Array[Double] = columns(viewing(c))._2

  def switchAxis(axisID: Int): Unit = {
    Log.show(s"Switching axis #$axisID from ${viewing(axisID)} to ${(viewing(axisID) + 1) % columns.length})")
    viewing(axisID) = (viewing(axisID) + 1) % columns.length

    val newMax = stats(viewing(axisID)).normalizedMax
    val newMin = stats(viewing(axisID)).normalizedMin
    props.update(points, newMin, newMax, axisID)

    updateAxis(axisID, columns(viewing(axisID))._2)
    updateSelectedSummary()

    //if(ops.hasHighlighted) updateHighlightedDetails(ops.getHighlighted)
    //points.matrixWorldNeedsUpdate = true
  }

  override def restoredValue(modified: Double, col: Int): Double = {
    // TODO: Create 2D & 3D variants, then remove ` % stats.length` from here
    Stats.restore(modified, stats(col % stats.length).sd, stats(col % stats.length).mean)
  }

  def coordOfHighlighted(): (Double, Double, Double) = {
    if(highlighted.nonEmpty) {
      val x = column(viewing(0))(highlighted.get)
      val y = column(viewing(1))(highlighted.get)
      val z = column(viewing(2))(highlighted.get)
      (x, y, z)
    } else (0, 0, 0)
  }

  override def getName: String = "Scatterplot!" // Why do these need a name?
  override def getPoints: Points = points

  def getGeometry: BufferGeometry = points.geometry.asInstanceOf[BufferGeometry]
}

object ScatterPlot {
  type CoordinateAxisIDs = String

  def apply(columns: Array[Column], stats: Array[Stats], texture: Int, hue: Double = 0.0): ScatterPlot = {
    val scatterPlot = ScatterPlot(columns, texture, hue)
    scatterPlot.stats = stats
    scatterPlot
  }

  def apply(columns: Array[Column], texture: Int, hue: Double): ScatterPlot = {

    val viewing = Array(0, 0, 0)
    if(columns.length > 1) { // make a 2D plot?
      Log("Columns > 1")
      viewing(1) = 1
    }
    if(columns.length > 2) {
      Log("Columns > 2")
      viewing(2) = 2
    }

    Log.show("Columns length on init: "+ columns.length)

    val (points, props): (Points, ScaleCenterProperties) = PointsBuilder()
      .withXS(columns(viewing(0))._2)
      .withYS(columns(viewing(1))._2)
      .withZS(columns(viewing(2))._2)
      .usingHue(Some(hue))
      .usingTexture(texture)
      .build3D()
    val scatterPlot = new ScatterPlot(points, columns, viewing, props)
    scatterPlot.hue = hue
    scatterPlot
  }
}