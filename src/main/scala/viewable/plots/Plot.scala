package viewable.plots

import scala.scalajs.js
import js.typedarray.Float32Array
import util.Log

/**
  * An abstract wrapper for THREE.Points that includes various
  * operations one may want to perform on the points.
  *
  * Created by Dorian Thiessen on 2018-02-08.
  */
trait Plot {
  val ops: SelectionOps = new SelectionOps{}
  val numPoints: Int = getSizes.array.asInstanceOf[Float32Array].length

  var hue: Double = 0 // Default to be overwritten if points are to have color

  var plotType: PlotType = ScatterPlot_Type

  var savedSelections: Set[Int] = Set[Int]()
  val selectedSummary: js.Object = js.Dynamic.literal(
    "xVar" -> 0.001,
    "yVar" -> 0.001,
    "zVar" -> 0.001)

  var highlighted: Option[Int] = None
  val highlightedDetails: js.Object = js.Dynamic.literal(
    "xVar" -> 0.001,
    "yVar" -> 0.001,
    "zVar" -> 0.001)

  val rawTau: js.Object = js.Dynamic.literal(
    "TauOnes" -> 1,
    "TauTens" -> 0,
    "TauHundreds" -> 0)

  def getTau: Int =
    rawTau.asInstanceOf[js.Dynamic].selectDynamic("TauOnes").asInstanceOf[Int] +
    rawTau.asInstanceOf[js.Dynamic].selectDynamic("TauTens").asInstanceOf[Int] +
    rawTau.asInstanceOf[js.Dynamic].selectDynamic("TauHundreds").asInstanceOf[Int]

  //

  def updateHighlightedDetails(index: Int): Unit = plotType match {
    case ScatterPlot_Type =>
      highlightedDetails.asInstanceOf[js.Dynamic].updateDynamic("xVar")(column(XAxis)(index).toFloat)
      highlightedDetails.asInstanceOf[js.Dynamic].updateDynamic("yVar")(column(YAxis)(index).toFloat)
      highlightedDetails.asInstanceOf[js.Dynamic].updateDynamic("zVar")(column(ZAxis)(index).toFloat)
    case ShadowManifold_Type =>
      val tau = getTau
      val colX = column(XAxis)
      highlightedDetails.asInstanceOf[js.Dynamic].updateDynamic("xVar")(colX(index + 2*tau).toFloat)
      highlightedDetails.asInstanceOf[js.Dynamic].updateDynamic("yVar")(colX(index + tau).toFloat)
      highlightedDetails.asInstanceOf[js.Dynamic].updateDynamic("zVar")(colX(index).toFloat)
  }

  // Does not need to check plotType because this is only used in ScatterPlot mode
  def updateHighlightedDetailsForAxis(index: Int, axis: Int): Unit = axis match {
    case XAxis => highlightedDetails.asInstanceOf[js.Dynamic].updateDynamic("xVar")(column(axis)(index).toFloat)
    case YAxis => highlightedDetails.asInstanceOf[js.Dynamic].updateDynamic("yVar")(column(axis)(index).toFloat)
    case ZAxis => highlightedDetails.asInstanceOf[js.Dynamic].updateDynamic("zVar")(column(axis)(index).toFloat)
  }

  def requestGeometryUpdate(): Unit = {
    val geo = getGeometry
    geo.verticesNeedUpdate = true
    geo.normalsNeedUpdate = true
    geo.computeFaceNormals()
    geo.computeVertexNormals()
    //geo.computeBoundingBox()
    geo.computeBoundingSphere()
  }

  /*def coordinatesOfHighlighted(): Option[(Double, Double, Double)] = {
    if(highlighted.nonEmpty) {
      val x = column(XAxis)(highlighted.get)
      val y = column(YAxis)(highlighted.get)
      val z = column(ZAxis)(highlighted.get)
      Some(x, y, z)
    } else None
  }*/

  def updateSelectedSummary(): Unit = {
    var sumX: Double = 0
    var sumY: Double = 0
    var sumZ: Double = 0
    var c = 0

    plotType match {
      case ScatterPlot_Type =>
        for(i <- savedSelections) sumX += column(XAxis)(i)
        for(i <- savedSelections) sumY += column(YAxis)(i)
        for(i <- savedSelections) {
          sumZ += column(ZAxis)(i)
          c += 1
        }

      case ShadowManifold_Type =>
        val xCol = column(XAxis)
        val tau = getTau
        for(i <- savedSelections) sumX += xCol(i + 2*tau)
        for(i <- savedSelections) sumY += xCol(i + tau)
        for(i <- savedSelections) {
          sumZ += xCol(i)
          c += 1
        }
    }

    val meanX = sumX/c
    val meanY = sumY/c
    val meanZ = sumZ/c

    selectedSummary.asInstanceOf[js.Dynamic].updateDynamic("xVar")(meanX)
    selectedSummary.asInstanceOf[js.Dynamic].updateDynamic("yVar")(meanY)
    selectedSummary.asInstanceOf[js.Dynamic].updateDynamic("zVar")(meanZ)
  }

  // Does not need to check plotType because this is only used in ScatterPlot mode
  def updateSelectedSummaryForAxis(axis: Int): Unit = {
    var sum: Double = 0
    var c = 0
    for (i <- savedSelections) {
      sum += column(axis)(i)
      c += 1
    }
    val mean = sum / c

    axis match {
      case XAxis => selectedSummary.asInstanceOf[js.Dynamic].updateDynamic("xVar")(mean)
      case YAxis => selectedSummary.asInstanceOf[js.Dynamic].updateDynamic("yVar")(mean)
      case ZAxis => selectedSummary.asInstanceOf[js.Dynamic].updateDynamic("zVar")(mean)
    }
  }

  def getPoints: Points

  // Assuming it's 3D...
  def xVar: String
  def yVar: String
  def zVar: String

  def column(c: Int): Array[Double]

  def updateAxis(axisNumber: Int, values: Array[Double], updatePointDetails: Boolean = true): Unit = {
    val positionsAttr = getPositions
    val array = positionsAttr.array.asInstanceOf[Float32Array]
    for(pointIndex <- values.indices) array(pointIndex*3 + axisNumber) = values(pointIndex).toFloat
    if(updatePointDetails) {
      if (highlighted.nonEmpty) updateHighlightedDetailsForAxis(highlighted.get, axisNumber)
      updateSelectedSummaryForAxis(axisNumber)
    }
  }

  /** Buffer Attribute for point colors as RGB values */
  @inline def getPositions: js.Dynamic = getGeometry.getAttribute("position")

  /** Buffer Attribute for point colors as RGB values */
  @inline def getColors: js.Dynamic = getGeometry.getAttribute("customColor")

  /** Buffer Attribute for point sizes */
  @inline def getSizes: js.Dynamic = getGeometry.getAttribute("size")

  /** Buffer Attribute for point alpha values */
  @inline def getAlphas: js.Dynamic = getGeometry.getAttribute("alpha")

  private[plots] def getGeometry: BufferGeometry

  /**
    * Contains all methods related to highlighting and selecting of points.
    */
  trait SelectionOps {

    // -- Public Ops

    // ---- Highlighting

    /**
      * Highlights the set of points at the provided indices.
      * @param index Index of point to highlight
      */
    def highlight(index: Int): Unit = {
      highlighted = Some(index)
      updateHighlightedDetails(index)

      if(SelectionProperties.changesColor)
        updateColors(
          SelectionProperties.red,
          SelectionProperties.green,
          SelectionProperties.blue,
          Seq(index)
        )

      if(SelectionProperties.changesSize)
        updateSizes(
          Plot.PARTICLE_SIZE.toFloat * SelectionProperties.scale,
          Seq(index)
        )
    }

    /**
      * UnHighlight the currently highlighted point.
      * The point is restored to it's original color and size.
      */
    def unHighlight(index: Int): Unit = {
      if(hasHighlighted) {
        if (index != getHighlighted) Log("[Plot.unHighlight] - Point at provided index is not highlighted!")
        if (SelectionProperties.changesColor) resetColor(getHighlighted)
        if (SelectionProperties.changesSize) updateSizes(Plot.PARTICLE_SIZE.toFloat, Seq(getHighlighted))
        highlighted = None
      }
    }

    // ---- Selecting

    /**
      * Causes the currently highlighted point to be selected. If no point is highlighted
      * or the highlighted point has already been selected, does nothing.
      * See inverse: `deselectHighlighted`
      */
    def selectHighlighted(): Unit = {
      if(hasHighlighted) {
        val index = highlighted.get
        savedSelections = savedSelections + index
        updateSelectedSummary()
      }
    }

    /**
      * Causes the currently highlighted point to be deselected. If no point is highlighted
      * or the highlighted point has not been selected, does nothing.
      * Inverse to selectHighlighted when dependent variable `highlighted` is held constant.
      */
    def deselectHighlighted(): Unit = if(hasHighlighted) {
      savedSelections = savedSelections - highlighted.get
      updateSelectedSummary()
    }

    /**
      * Deselect the set of points at the provided indices.
      * Deselected points are restored to their original color and size.
      * @param pIndices Point indices
      */
    def deselect(pIndices: Int*): Unit = {
      if(SelectionProperties.changesColor) for(i <- pIndices) {
        resetColor(i)
        savedSelections -= i
      }
      if(SelectionProperties.changesSize) updateSizes(Plot.PARTICLE_SIZE.toFloat, pIndices)
      updateSelectedSummary()
    }

    // -- Other

    private def updateColors(r: Float, g: Float, b: Float, pIndices: Seq[Int]): Unit = {
      val colorsAttr = getColors
      val cArr = colorsAttr.array.asInstanceOf[Float32Array]
      for(i <- pIndices) {
        cArr(3*i) = r
        cArr(3*i + 1) = g
        cArr(3*i + 2) = b
      }
      colorsAttr.needsUpdate = true
    }

    private def resetColor(pIndex: Int): Unit = {
      // Recompute this points original color
      val color: Color = new Color()
      val newHue: Double = hue + Plot.HUE_GRADIENT_FACTOR * ( pIndex * 1.0 / numPoints )
      color.setHSL( newHue, 1.0, 0.5 )
      // Assign color to point
      val colorsAttr = getColors
      val cArr = colorsAttr.array.asInstanceOf[Float32Array]
      cArr(3*pIndex) = color.r.toFloat
      cArr(3*pIndex + 1) = color.g.toFloat
      cArr(3*pIndex + 2) = color.b.toFloat
      colorsAttr.needsUpdate = true
    }

    private def updateSizes(newSize: Float, pIndices: Seq[Int]): Unit = {
      val sizesAttr = getSizes
      val sArr = sizesAttr.array.asInstanceOf[Float32Array]
      for(i <- pIndices) sArr(i) = newSize
      sizesAttr.needsUpdate = true
    }

    // --  Getters and Setters

    /** @return original point hue */
    def getHue: Double = hue

    /** @return True if some point is highlighted */
    def hasHighlighted: Boolean = highlighted.nonEmpty

    /**
      * Convenience getter.
      * Precondition: hasHighlighted == true
      * @return Index of highlighted point
      */
    def getHighlighted: Int = {
      require(highlighted.nonEmpty)
      highlighted.get
    }

    /**
      * Set highlighted point index
      * @param hpi highlighted point index
      */
    protected def setHighlighted(hpi: Option[Int]): Unit = highlighted = hpi

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
}


/**
  * The companion object for the Plot class.
  * Encapsulates general Plot initialization methods.
  */
object Plot {
  val PARTICLE_SIZE: Double = 0.1
  val HUE_GRADIENT_FACTOR: Double = 0.2

  def zip3[A, B, C](fA: =>Array[A], fB: =>Array[B], fC: =>Array[C]): Array[(A, B, C)] =
    (fA zip fB zip fC) map { case ((a, b), c) => (a, b, c)}
}
