package vrdv.obj3D.plots

import util.{Log, ScaleCenterProperties}

import scala.scalajs.js
import scala.scalajs.js.typedarray.Float32Array

/**
  * Created by Dorian Thiessen on 2018-07-29.
  */
object PointOperations {

  // ---- Scaling

  def confineToRegion3D(points: Points, minimums: (Double, Double, Double), maximums: (Double, Double, Double)): ScaleCenterProperties = {

    // The amount to scale the points so they fit within a 1x1x1 cube.
    val xScale = scala.math.abs(maximums._1 - minimums._1)
    val yScale = scala.math.abs(maximums._2 - minimums._2)
    val zScale = scala.math.abs(maximums._3 - minimums._3)
    points.scale.set(1.0/xScale, 1.0/yScale, 1.0/zScale)

    // Find center of points, position them so this is at center of the parent region.
    val centerX: Double = (maximums._1 + minimums._1) / (2.0 * xScale)
    val centerY: Double = (maximums._2 + minimums._2) / (2.0 * yScale)
    val centerZ: Double = (maximums._3 + minimums._3) / (2.0 * zScale)
    points.position.set(-centerX, -centerY, -centerZ)

    // Return the updates centers and scales
    ScaleCenterProperties(xScale, yScale, zScale, centerX, centerY, centerZ)
  }

  def confineToRegion2D(points: Points, minimums: (Double, Double), maximums: (Double, Double)): ScaleCenterProperties = {

    // The amount to scale the points so they fit within a 1x1x1 cube.
    val xScale = scala.math.abs(maximums._1 - minimums._1)
    val yScale = scala.math.abs(maximums._2 - minimums._2)
    points.scale.set(1.0/xScale, 1.0/yScale, 1.0)

    // Find center of points, position them so this is at center of the parent region.
    val centerX: Double = (maximums._1 + minimums._1) / (2.0 * xScale)
    val centerY: Double = (maximums._2 + minimums._2) / (2.0 * yScale)
    points.position.set(-centerX, -centerY, 0)

    // Return the updates centers and scales
    ScaleCenterProperties(xScale, yScale, 0, centerX, centerY, 0)
  }

  // ---- Highlighting
  
  /**
    * Highlights the set of points at the provided indices.
    * @param index Index of point to highlight
    */
  def highlight(plot: Plot, index: Int): Unit = {
    plot.highlightedPointIndex = Some(index)
    updateHighlightedDetails(plot, index)

    if(SelectionProperties.changesColor)
      updateColors(plot, Seq(index))

    if(SelectionProperties.changesSize)
      updateSizes(plot, Plot3D.PARTICLE_SIZE.toFloat * SelectionProperties.scale, Seq(index))
  }

  /**
    * UnHighlight the currently highlighted point.
    * The point is restored to it's original color and size.
    */
  def unHighlight(plot: Plot, index: Int): Unit = {
    if(plot.highlightedPointIndex.nonEmpty) {
      if (index != plot.highlightedPointIndex.get) Log("[Plot.unHighlight] - Point at provided index is not highlighted!")
      if (SelectionProperties.changesColor) resetColor(plot, plot.highlightedPointIndex.get)
      if (SelectionProperties.changesSize) updateSizes(plot, Plot3D.PARTICLE_SIZE.toFloat, Seq(plot.highlightedPointIndex.get))
      plot.highlightedPointIndex = None
    }
  }

  // -- Highlighted point details

  def updateHighlightedDetails(plot: Plot, index: Int): Unit = plot match {
    case sp: Plot2D =>
      plot.highlightedDetails.asInstanceOf[js.Dynamic].updateDynamic("xVar")(sp.column(XAxis)(index).toFloat)
      plot.highlightedDetails.asInstanceOf[js.Dynamic].updateDynamic("yVar")(sp.column(YAxis)(index).toFloat)
    case sm: Plot3D =>
      plot.highlightedDetails.asInstanceOf[js.Dynamic].updateDynamic("xVar")(sm.column(XAxis)(index).toFloat)
      plot.highlightedDetails.asInstanceOf[js.Dynamic].updateDynamic("yVar")(sm.column(YAxis)(index).toFloat)
      plot.highlightedDetails.asInstanceOf[js.Dynamic].updateDynamic("zVar")(sm.column(ZAxis)(index).toFloat)
  }

  def updateHighlightedDetailsForAxis(plot: Plot, axis: Int, index: Int): Unit = axis match {
    case XAxis => plot.highlightedDetails.asInstanceOf[js.Dynamic].updateDynamic("xVar")(plot.column(axis)(index).toFloat)
    case YAxis => plot.highlightedDetails.asInstanceOf[js.Dynamic].updateDynamic("yVar")(plot.column(axis)(index).toFloat)
    case ZAxis => plot.highlightedDetails.asInstanceOf[js.Dynamic].updateDynamic("zVar")(plot.column(axis)(index).toFloat)
  }

  // ---- Selecting

  /**
    * Causes the currently highlighted point to be selected. If no point is highlighted
    * or the highlighted point has already been selected, does nothing.
    * See inverse: `deselectHighlighted`
    */
  def selectHighlighted(plot: Plot): Unit = {
    if(plot.highlightedPointIndex.nonEmpty) {
      val index = plot.highlightedPointIndex.get
      plot.selectedPointIndices = plot.selectedPointIndices + index
      updateSelectedSummary(plot)
    }
  }

  /**
    * Causes the currently highlighted point to be deselected. If no point is highlighted
    * or the highlighted point has not been selected, does nothing.
    * Inverse to selectHighlighted when dependent variable `highlighted` is held constant.
    */
  def deselectHighlighted(plot: Plot): Unit = if(plot.highlightedPointIndex.nonEmpty) {
    plot.selectedPointIndices = plot.selectedPointIndices - plot.highlightedPointIndex.get
    updateSelectedSummary(plot)
  }

  /**
    * Deselect the set of points at the provided indices.
    * Deselected points are restored to their original color and size.
    * @param pIndices Point indices
    */
  def deselect(plot: Plot, pIndices: Int*): Unit = {
    if(SelectionProperties.changesColor) for(i <- pIndices) {
      resetColor(plot, i)
      plot.selectedPointIndices -= i
    }
    if(SelectionProperties.changesSize) updateSizes(plot, Plot3D.PARTICLE_SIZE.toFloat, pIndices)
    updateSelectedSummary(plot)
  }

  // -- Selected points summary

  def updateSelectedSummary(plot: Plot): Unit = {
    var sumX: Double = 0
    var sumY: Double = 0
    var sumZ: Double = 0
    var c = 0
    var is2D: Boolean = false

    plot match {
      case _: ScatterPlot2D ⇒
        for(i <- plot.selectedPointIndices) sumX += plot.column(XAxis)(i)
        for(i <- plot.selectedPointIndices) {
          sumY += plot.column(YAxis)(i)
          c += 1
        }
        is2D = true

      case _: ScatterPlot =>
        for(i <- plot.selectedPointIndices) sumX += plot.column(XAxis)(i)
        for(i <- plot.selectedPointIndices) sumY += plot.column(YAxis)(i)
        for(i <- plot.selectedPointIndices) {
          sumZ += plot.column(ZAxis)(i)
          c += 1
        }

      case sm: ShadowManifold =>
        val xCol = sm.column(XAxis)
        val tau = sm.tau
        for(i <- plot.selectedPointIndices) sumX += xCol(i + 2*tau)
        for(i <- plot.selectedPointIndices) sumY += xCol(i + tau)
        for(i <- plot.selectedPointIndices) {
          sumZ += xCol(i)
          c += 1
        }
    }

    val meanX = sumX/c
    val meanY = sumY/c
    plot.selectedSummary.asInstanceOf[js.Dynamic].updateDynamic("xVar")(meanX)
    plot.selectedSummary.asInstanceOf[js.Dynamic].updateDynamic("yVar")(meanY)

    if(!is2D) {
      val meanZ = sumZ / c
      plot.selectedSummary.asInstanceOf[js.Dynamic].updateDynamic("zVar")(meanZ)
    }
  }

  // Does not need to check plotType because this is only used in ScatterPlot mode
  def updateSelectedSummaryForAxis(plot: Plot, axis: Int): Unit = {
    var sum: Double = 0
    var c = 0
    for (i <- plot.selectedPointIndices) {
      sum += plot.column(axis)(i)
      c += 1
    }
    val mean = sum / c

    axis match {
      case XAxis => plot.selectedSummary.asInstanceOf[js.Dynamic].updateDynamic("xVar")(mean)
      case YAxis => plot.selectedSummary.asInstanceOf[js.Dynamic].updateDynamic("yVar")(mean)
      case ZAxis => plot.selectedSummary.asInstanceOf[js.Dynamic].updateDynamic("zVar")(mean)
    }
  }
  
  // -- Other PointOperations_Appearance?

  private def updateColors(plot: Plot, pIndices: Seq[Int]): Unit = {
    val colorsAttr = plot.getColors
    val cArr = colorsAttr.array.asInstanceOf[Float32Array]
    for(i <- pIndices) {
      cArr(3*i) = SelectionProperties.red
      cArr(3*i + 1) = SelectionProperties.green
      cArr(3*i + 2) = SelectionProperties.blue
    }
    colorsAttr.needsUpdate = true
  }

  private def resetColor(plot: Plot, pIndex: Int): Unit = {

    // Recompute this points original color
    val color: Color = new Color()
    val newHue: Double = plot.hue + Plot3D.HUE_GRADIENT_FACTOR * ( pIndex * 1.0 / plot.numPoints )
    color.setHSL( newHue, 1.0, 0.5 )

    // Assign color to point
    val colorsAttr = plot.getColors
    val cArr = colorsAttr.array.asInstanceOf[Float32Array]
    cArr(3*pIndex) = color.r.toFloat
    cArr(3*pIndex + 1) = color.g.toFloat
    cArr(3*pIndex + 2) = color.b.toFloat
    colorsAttr.needsUpdate = true
  }

  private def updateSizes(plot: Plot, newSize: Float, pIndices: Seq[Int]): Unit = {
    val sizesAttr = plot.getSizes
    val sArr = sizesAttr.array.asInstanceOf[Float32Array]
    for(i <- pIndices) sArr(i) = newSize
    sizesAttr.needsUpdate = true
  }

  /**
    * Properties of selected points.
    */
  protected object SelectionProperties {
    var changesColor: Boolean = true
    var red: Float = 1.toFloat   //
    var green: Float = 1.toFloat // Selected points are white
    var blue: Float = 1.toFloat  //
    var changesSize: Boolean = true
    var scale: Float = 1.5.toFloat // Selected points are 1.5x larger
  }
}
