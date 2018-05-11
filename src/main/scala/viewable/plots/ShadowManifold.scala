package viewable.plots

import viewable.Environment.Column

import scala.scalajs.js // TODO: Unwanted dependency

/**
  * A reconstruction of an attractor manifold generated from data on a single variable.
  * Each point can be thought of as the history of the variable over some interval of time,
  * whereas the time series values represent measurements at discrete moments in time.
  *
  * Created by Dorian Thiessen on 2018-01-13.
  */
class ShadowManifold(val tag: String, var points: Points) extends Plot {
  override val ops: SelectionOps = new SelectionOps{}
  override def getPoints: Points = points
  def getGeometry: BufferGeometry = points.geometry.asInstanceOf[BufferGeometry]
  def getName: String = tag

  override def column(c: Int): Array[Double] = ???

  override def restoredValue(modified: Double, col: Int): Double = ???
}


/**
  * The companion object for the ShadowManifold class.
  * Encapsulates SM initialization helper methods.
 */
object ShadowManifold {

  /**
    * Creates a single Shadow Manifold.
    * @param id The identifier of the variable in 'csv_Values'
    * @param hue Some number, influences the color of the points generated
    * @return A Shadow Manifold of the input time series values
    */
  def apply(id: String, points: Points, hue: Double): ShadowManifold = {
    val sm = new ShadowManifold(id, points)
    sm.hue = hue
    sm
  }

  def apply(id: String, points: Points): ShadowManifold = {
    val sm = new ShadowManifold(id, points)
    sm
  }

  def many(columns: Array[Column], hue: Double, texture: Int): Array[Plot] = {
    var plots: Array[ShadowManifold] = Array()
    var i = 0
    for ((id, data) <- columns) {
      val points = PointsBuilder()
        .withXS(data.drop(2))
        .withYS(data.tail)
        .withZS(data)
        .usingHue(Some(hue))
        .usingTexture(texture)
        .build3D()
      plots = plots :+ ShadowManifold(id, points, hue)
      i += 1
    }

    plots.asInstanceOf[Array[Plot]]
  }

  def lagZip3(ts: Array[Double]): Array[Coordinate] = Plot.zip3(ts.drop(2), ts.tail, ts) // TODO: Generalize Tau

}
