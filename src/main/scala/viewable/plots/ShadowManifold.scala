package viewable.plots

import util.Log

import scala.scalajs.js
import scala.scalajs.js.typedarray.Float32Array

/**
  * A reconstruction of an attractor manifold generated from data on a single variable.
  * Each point can be thought of as the history of the variable over some interval of time.
  *
  * Created by Dorian Thiessen on 2018-01-13.
  */
object ShadowManifold {

  def transform(plot: ScatterPlot): (String, String, String) = {
    val tau: Int = plot.getTau
    val embeddingVar = plot.xVar
    val embeddingValues = plot.column(XAxis) // Use variable on the X-Axis for creating shadow manifold

    val positionsAttr = plot.getPositions
    val positionsArr = positionsAttr.array.asInstanceOf[Float32Array]

    val firstIndex = 2 * tau // (E - 1) * Tau
    for(pointIndex <- firstIndex until embeddingValues.length) {
      for(dimension <- 0 to 2) positionsArr((pointIndex - firstIndex)*3 + dimension) = embeddingValues(pointIndex - tau*dimension).toFloat
    }

    Log.show(s"Shadow Manifold made with variable[${plot.xVar}] with Tau $tau has ${embeddingValues.length - firstIndex} points.")

    plot.fixScale(XAxis, XAxis, XAxis) // Use x-axis values for scaling in all dimensions
    val geo = plot.getGeometry
    geo.asInstanceOf[js.Dynamic].setDrawRange(0, embeddingValues.length - firstIndex)
    positionsAttr.needsUpdate = true
    plot.requestGeometryUpdate()

    // Return the names to apply to each Axis!
    (s"$embeddingVar", s"$embeddingVar - ${tau}Tau", s"$embeddingVar - ${2*tau}Tau")
  }
}
