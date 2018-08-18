package vrdv.obj3D.plots

import util.{ScaleCenterProperties, Stats}

import scala.scalajs.js
import scala.scalajs.js.typedarray.Float32Array

/**
 * Created by Dorian Thiessen on 2018-08-01.
 */
trait Plot2D extends Plot {
  val dimensions: Column = 2

  var savedSelections: Set[Int] = Set[Int]()
  val selectedSummary: js.Object = js.Dynamic.literal(
    "xVar" -> 0.001,
    "yVar" -> 0.001)

  var highlighted: Option[Int] = None
  val highlightedDetails: js.Object = js.Dynamic.literal(
    "xVar" -> 0.001,
    "yVar" -> 0.001)

  def column(c: Int): Array[Double]
  def stats(i: Int): Stats
  def getProps: ScaleCenterProperties
  def updateProps(props: ScaleCenterProperties): Unit

  def updateAxis(axisNumber: Int, values: Array[Double], updatePointDetails: Boolean = true): Unit = {
    val positionsAttr = getPositions
    val array = positionsAttr.array.asInstanceOf[Float32Array]
    for(pointIndex <- values.indices) array(pointIndex*3 + axisNumber) = values(pointIndex).toFloat
    if(updatePointDetails) {
      if(highlighted.nonEmpty) PointOperations.updateHighlightedDetailsForAxis(this, axisNumber, highlighted.get)
      if(savedSelections.nonEmpty) PointOperations.updateSelectedSummaryForAxis(this, axisNumber)
    }
  }

  def fixScale(x: AxisID = XAxis, y: AxisID = YAxis, z: AxisID = ZAxis): Unit =
    updateProps(PointOperations.confineToRegion2D(getPoints,
      (stats(x).min, stats(y).min),
      (stats(x).max, stats(y).max)))
}
