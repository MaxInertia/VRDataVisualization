package viewable.plots

import math.ScaleCenterProperties
import util.Log

/**
  * Created by Dorian Thiessen on 2018-07-06.
  */
object PlotManipulator {

  def confineToRegion(points: Points, minimums: (Double, Double, Double), maximums: (Double, Double, Double)): ScaleCenterProperties = {
    //Log.show("Points original scale:")
    //Log.show(s"x: ${points.scale.x}, y: ${points.scale.y}, z: ${points.scale.z}")

    // The amount to scale the points so they fit within a 1x1x1 cube.
    val xScale = scala.math.abs(maximums._1 - minimums._1)
    val yScale = scala.math.abs(maximums._2 - minimums._2)
    val zScale = scala.math.abs(maximums._3 - minimums._3)
    //println()
    points.scale.set(1.0/xScale, 1.0/yScale, 1.0/zScale)

    // Find center of points, position them so this is at center of the parent region.
    val centerX: Double = (maximums._1 + minimums._1) / (2.0 * xScale)
    val centerY: Double = (maximums._2 + minimums._2) / (2.0 * yScale)
    val centerZ: Double = (maximums._3 + minimums._3) / (2.0 * zScale)
    points.position.set(-centerX, -centerY, -centerZ)

    //Log.show(s"xCenter: $centerX\nxScale: 1/$xScale = ${1.0/xScale}")
    //Log.show(s"yCenter: $centerY\nyScale: 1/$yScale = ${1.0/yScale}")
    //Log.show(s"zCenter: $centerZ\nzScale: 1/$zScale = ${1.0/zScale}")
    ScaleCenterProperties(xScale, yScale, zScale, centerX, centerY, centerZ)
  }

}
