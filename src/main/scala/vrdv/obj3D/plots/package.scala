package vrdv.obj3D

import facade.IFThree
import org.scalajs.threejs

import scala.scalajs.js
import scala.scalajs.js.typedarray.Float32Array

/**
  * Created by Dorian Thiessen on 2018-02-08.
  */
package object plots {
  type Color = threejs.Color
  type Points = IFThree.PointsR93
  type BufferGeometry = threejs.BufferGeometry

  type Coordinate = (Double, Double, Double)

  // AxisIDs
  type AxisID = Int
  val XAxis: AxisID = 0
  val YAxis: AxisID = 1
  val ZAxis: AxisID = 2
  val NOAxis: AxisID = -77

  type Column = Int

  trait Plot {

    // -- Required fields & methods

    val highlightedDetails: js.Object
    val selectedSummary: js.Object
    val dimensions: Int

    def xVar: String
    def yVar: String
    def column(c: Int): Array[Double]
    def getPoints: Points
    private[plots] def getGeometry: BufferGeometry

    // -- Provided fields & methods

    var selectedPointIndices: Set[Int] = Set[Int]()
    var highlightedPointIndex: Option[Int] = None

    var hue: Double = 0 // Default to be overwritten if points are to have color
    val numPoints: Int = getSizes.array.asInstanceOf[Float32Array].length
    var visiblePoints: Int = numPoints

    /**
     * Sets the range of points to be rendered. [first, last)
     * @param first first point to be rendered
     * @param last last point index, previous point is the last to be rendered
     */
    def setVisiblePointRange(first: Int, last: Int): Unit = {
      visiblePoints = last - first
      getGeometry.asInstanceOf[js.Dynamic].setDrawRange(first, last)
    }

    /**
     * Buffer Attribute for point colors as RGB values
     */
    def getPositions: js.Dynamic = getGeometry.getAttribute("position")

    /**
     * Buffer Attribute for point colors as RGB values
     */
    def getColors: js.Dynamic = getGeometry.getAttribute("customColor")

    /**
     * Buffer Attribute for point sizes
     */
    def getSizes: js.Dynamic = getGeometry.getAttribute("size")

    /**
     * Buffer Attribute for point alpha values
     */
    def getAlphas: js.Dynamic = getGeometry.getAttribute("alpha")

    def requestFullGeometryUpdate(): Unit = {
      val geo = getGeometry
      geo.verticesNeedUpdate = true
      geo.normalsNeedUpdate = true
      geo.computeFaceNormals()
      geo.computeVertexNormals()
      geo.computeBoundingBox()
      geo.computeBoundingSphere()
    }
  }
}
