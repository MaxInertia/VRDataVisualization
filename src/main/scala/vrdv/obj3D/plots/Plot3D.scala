package vrdv.obj3D.plots

import util.{ScaleCenterProperties, Stats}

import scala.scalajs.js
import js.typedarray.Float32Array

/**
  * A wrapper for THREE.Points
  *
  * Created by Dorian Thiessen on 2018-02-08.
  */
trait Plot3D extends Plot {
  val dimensions: Int = 3

  val selectedSummary: js.Object = js.Dynamic.literal(
    "xVar" -> 0.001,
    "yVar" -> 0.001,
    "zVar" -> 0.001)

  val highlightedDetails: js.Object = js.Dynamic.literal(
    "xVar" -> 0.001,
    "yVar" -> 0.001,
    "zVar" -> 0.001)

  def zVar: String

  def column(c: Int): Array[Double]
  def stats(i: Int): Stats
  def getProps: ScaleCenterProperties
  def updateProps(props: ScaleCenterProperties): Unit

  def updateAxis(axisNumber: Int, values: Array[Double], updatePointDetails: Boolean = true): Unit = {
    val positionsAttr = getPositions
    val array = positionsAttr.array.asInstanceOf[Float32Array]
    for(pointIndex <- values.indices) array(pointIndex*3 + axisNumber) = values(pointIndex).toFloat
    if(updatePointDetails) {
      if(highlightedPointIndex.nonEmpty) PointOperations.updateHighlightedDetailsForAxis(this, axisNumber, highlightedPointIndex.get)
      if(selectedPointIndices.nonEmpty) PointOperations.updateSelectedSummaryForAxis(this, axisNumber)
    }
  }

  def fixScale(x: AxisID = XAxis, y: AxisID = YAxis, z: AxisID = ZAxis): Unit =
    updateProps(PointOperations.confineToRegion3D(getPoints,
      (stats(x).min, stats(y).min, stats(z).min),
      (stats(x).max, stats(y).max, stats(z).max)))
}

/**
  * The companion object for the Plot class.
  * Encapsulates general Plot initialization methods.
  */
object Plot3D {
  val PARTICLE_SIZE: Float = 0.1f
  val HUE_GRADIENT_FACTOR: Double = 0.2

  def zip3[A, B, C](fA: =>Array[A], fB: =>Array[B], fC: =>Array[C]): Array[(A, B, C)] =
    (fA zip fB zip fC) map { case ((a, b), c) => (a, b, c)}
}
