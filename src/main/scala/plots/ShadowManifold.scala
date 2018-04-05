package plots

import math.Stats
import org.scalajs.{threejs => THREE}

/**
  * A reconstruction of an attractor manifold generated from data on a single variable.
  * Each point can be thought of as the history of the variable over some interval of time,
  * whereas the time series values represent measurements at discrete moments in time.
  *
  * Created by Dorian Thiessen on 2018-01-13.
  */
class ShadowManifold(val tag: String, var points: THREE.Points) extends Plot(tag, points) {}

/**
  * The companion object for the ShadowManifold class.
  * Encapsulates SM initialization helper methods.
 */
object ShadowManifold {

  /**
    * Creates a single Shadow Manifold.
    * @param id The identifier of the variable in 'csv_Values'
    * @param measurements A sequence of measurements of some variable called 'id'
    * @param hue Some number, influences the color of the points generated
    * @return A Shadow Manifold of the input time series values
    */
  def apply(id: String, measurements: Array[Coordinate], hue: Double): ShadowManifold = {
    val vertices = Plot.makeVertices(measurements)
    val points = new THREE.Points(
      Plot.makeGeometry(vertices, hue),
      Plot.makeShaderMaterial())
    new ShadowManifold(id, points)
  }

  /**
    * Creates a set of Shadow Manifolds. One SM is generated for every element of the input array 'data'.
    * @param data An array of tuples (id, vs) where
    *             id: the id of the variable in 'vs'
    *             vs: A sequence of measurements of the variable 'id'
    * @param hue Some number, influences the color of the points generated
    * @return An Array of Shadow Manifolds
    */
  def createSet(data: Array[(String, Array[Double])], hue: Double): Array[ShadowManifold] =
    data.map{ case (id, vs) => (id, Stats.standardize(vs)) }   // Standardize the values
      .map{ case (id, vs) => (id, lagZip3(vs)) }               // Convert values to point coordinates
      .map{ case (id, vs) => ShadowManifold(id, vs, hue) }     // Create a shadow manifold

  def lagZip3(ts: Array[Double]): Array[Coordinate] = Plot.zip3(ts.drop(2), ts.tail, ts) // TODO: Generalize Tau

}
