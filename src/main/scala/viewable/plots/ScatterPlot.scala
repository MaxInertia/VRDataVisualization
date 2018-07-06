package viewable.plots

import math.{ScaleCenterProperties, Stats}
import resources.Data
import util.Log
import viewable.Environment.Column
import viewable.plots.ScatterPlot.CoordinateAxisIDs

import scala.scalajs.js

/**
  * Container of a simple scatter-plot.
  *
  * Created by Dorian Thiessen on 2018-04-05.
  */
class ScatterPlot(points: Points, data: Array[Data], viewing: Array[Int], props: ScaleCenterProperties) extends Plot {
  override val ops: SelectionOps = new SelectionOps{}
  def stats(i: Int): Stats = data(i).stats.get

  override def xVar: String = data(viewing(0)).id // 1st column ID
  override def yVar: String = data(viewing(1)).id // 2nd column ID
  override def zVar: String = data(viewing(2)).id // 3rd column ID
  override def column(c: Int): Array[Double] = data(viewing(c)).measurements

  def switchAxis(axisID: Int): Unit = {
    Log.show(s"Switching axis #$axisID from ${viewing(axisID)} to ${(viewing(axisID) + 1) % data.length})")
    viewing(axisID) = (viewing(axisID) + 1) % data.length

    val newMax = stats(viewing(axisID)).normalizedMax
    val newMin = stats(viewing(axisID)).normalizedMin
    props.update(points, newMin, newMax, axisID)

    updateAxis(axisID, column(viewing(axisID)))
    updateSelectedSummary()

    //if(ops.hasHighlighted) updateHighlightedDetails(ops.getHighlighted)
    //points.matrixWorldNeedsUpdate = true
  }

  override def restoredValue(modified: Double, col: Int): Double = {
    // TODO: Create 2D & 3D variants, then remove ` % stats.length` from here
    Stats.restore(modified, stats(col % data.length).sd, stats(col % data.length).mean)
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

  def apply(data: Array[Data], texture: Int, hue: Double): ScatterPlot = {
    val viewing = Array(0, 0, 0)
    if(data.length > 1) { // make a 2D plot?
      Log("Columns > 1")
      viewing(1) = 1
    }
    if(data.length > 2) {
      Log("Columns > 2")
      viewing(2) = 2
    }

    Log.show("Columns length on init: "+ data.length)

    val (points, props): (Points, ScaleCenterProperties) = PointsBuilder()
      .withXS(data(viewing(0)).measurements)
      .withYS(data(viewing(1)).measurements)
      .withZS(data(viewing(2)).measurements)
      .usingHue(Some(hue))
      .usingTexture(texture)
      .build3D()
    val scatterPlot = new ScatterPlot(points, data, viewing, props)
    scatterPlot.hue = hue
    scatterPlot
  }
}