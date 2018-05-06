package plots

import org.scalajs.{threejs => THREE}
import scala.scalajs.js
import js.typedarray.Float32Array

/**
  * An abstract wrapper for THREE.Points that includes various
  * operations one may want to perform on the points.
  *
  * Created by Dorian Thiessen on 2018-02-08.
  */
trait Plot {
  var hue: Double = _
  val numPoints: Int = getSizesAttribute.array.asInstanceOf[Float32Array].length // hmm..

  var savedSelections: Set[Int] = Set[Int]()
  var selections: Array[Int] = Array(-1) //TODO: Change this to Option[Int], no need to be able to hold more than one
  def getPoints: Points

  /** Buffer Attributes for point colors as RGB values */
  @inline def getColorsAttribute: js.Dynamic = getGeometry.getAttribute("customColor")

  /** Buffer Attributes for point sizes */
  @inline def getSizesAttribute: js.Dynamic = getGeometry.getAttribute("size")

  /**
    * Select the set of points at the provided indices.
    * @param pIndices Point indices
    */
  def select(pIndices: Int*): Unit = {
    if(Selection.changesColor) updateColors(Selection.red, Selection.green, Selection.blue, pIndices)
    if(Selection.changesSize)  updateSizes(Plot.PARTICLE_SIZE.toFloat*Selection.scale, pIndices)
  }

  /**
    * Deselect the set of points at the provided indices.
    * Deselected points are restored to their original color and size.
    * @param pIndices Point indices
    */
  def deselect(pIndices: Int*): Unit = {
    if(Selection.changesColor) for(i <- pIndices) resetColor(i)
    if(Selection.changesSize) updateSizes(Plot.PARTICLE_SIZE.toFloat, pIndices)
  }

  private def updateColors(r: Float, g: Float, b: Float, pIndices: Seq[Int]): Unit = {
    val colorsAttr = getColorsAttribute
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
    val color: THREE.Color = new THREE.Color()
    val newHue: Double = hue + 0.1 * ( pIndex * 1.0 / numPoints )
    color.setHSL( newHue, 1.0, 0.5 )
    // Assign color to point
    val colorsAttr = getColorsAttribute
    val cArr = colorsAttr.array.asInstanceOf[Float32Array]
    cArr(3*pIndex) = color.r.toFloat
    cArr(3*pIndex + 1) = color.g.toFloat
    cArr(3*pIndex + 2) = color.b.toFloat
    colorsAttr.needsUpdate = true
  }

  private def updateSizes(newSize: Float, pIndices: Seq[Int]): Unit = {
    val sizesAttr = getSizesAttribute
    val sArr = sizesAttr.array.asInstanceOf[Float32Array]
    for(i <- pIndices) sArr(i) = newSize
    sizesAttr.needsUpdate = true
  }

  private[plots] def getGeometry: THREE.BufferGeometry

  /**
    * Properties of selected points.
    */
  private object Selection {
    var changesColor: Boolean = true
    var red: Float = 1.toFloat   //
    var green: Float = 1.toFloat // Selected points are white
    var blue: Float = 1.toFloat  //
    var changesSize: Boolean = true
    var scale: Float = 1.5.toFloat // Selected points are 1.5x larger
  }
}

/**
  * The companion object for the Plot class.
  * Encapsulates general Plot initialization methods.
  */
object Plot {
  val PARTICLE_SIZE: Double = 0.1

  def zip3[A, B, C](fA: =>Array[A], fB: =>Array[B], fC: =>Array[C]): Array[(A, B, C)] =
    (fA zip fB zip fC) map { case ((a, b), c) => (a, b, c)}
}
