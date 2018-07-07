package viewable.plots

import math.ScaleCenterProperties
import util.Log

/**
  * Created by Dorian Thiessen on 2018-07-06.
  */
object PlotManipulator {

  def confineToRegion(points: Points, minimums: (Double, Double, Double), maximums: (Double, Double, Double)): ScaleCenterProperties = {
    Log.show("Points original scale:")
    Log.show(s"x: ${points.scale.x}, y: ${points.scale.y}, z: ${points.scale.z}")

    // The amount to scale the points so they fit within a 1x1x1 cube.
    val xScale = scala.math.abs(maximums._1 - minimums._1)
    val yScale = scala.math.abs(maximums._2 - minimums._2)
    val zScale = scala.math.abs(maximums._3 - minimums._3)
    points.scale.set(1.0/xScale, 1.0/yScale, 1.0/zScale)

    Log.show("Points original scale:")
    Log.show(s"x: ${points.scale.x}, y: ${points.scale.y}, z: ${points.scale.z}")

    // Find center of points, position them so this is at center of the parent region.
    val centerX: Double = (maximums._1 + minimums._1) / (2.0 * xScale)
    val centerY: Double = (maximums._2 + minimums._2) / (2.0 * yScale)
    val centerZ: Double = (maximums._3 + minimums._3) / (2.0 * zScale)
    points.position.set(-centerX, -centerY, -centerZ)

    Log.show(s"xCenter: $centerX\nxScale: $xScale")
    ScaleCenterProperties(xScale, yScale, zScale, centerX, centerY, centerZ)
  }

  /*def revertShiftScale(points: Points, plotProps: ScaleCenterProperties, dimension: Int): Unit =
    dimension match {
      case XAxis =>
        points.translateX(plotProps.xCenter)
        points.scale.set(1.0, points.scale.y, points.scale.z)
      case YAxis =>
        points.translateY(plotProps.yCenter)
        points.scale.set(points.scale.x, 1.0, points.scale.z)
      case ZAxis =>
        points.translateZ(plotProps.zCenter)
        points.scale.set(points.scale.x, points.scale.y, 1.0)
    }

  def applyShiftScale(points: Points, plotProps: ScaleCenterProperties, dataStats: Stats, dimension: Int): Unit =
    dimension match {
      case XAxis =>
        plotProps.xScale = scala.math.abs(dataStats.max - dataStats.min)
        if(plotProps.xScale == 0) plotProps.xScale = 1.0
        plotProps.xCenter = (dataStats.max + dataStats.min) / (2.0 * plotProps.xScale)
        points.translateX(-plotProps.xCenter)
        points.scale.setX(1.0 / plotProps.xScale)
      case YAxis =>
        plotProps.yScale = scala.math.abs(dataStats.max - dataStats.min)
        if(plotProps.yScale == 0) plotProps.yScale = 1.0
        plotProps.yCenter = (dataStats.max + dataStats.min) / (2.0 * plotProps.yScale)
        points.translateY(-plotProps.yCenter)
        points.scale.setY(1.0 / plotProps.yScale)
      case ZAxis =>
        plotProps.zScale = scala.math.abs(dataStats.max - dataStats.min)
        if(plotProps.zScale == 0) plotProps.zScale = 1.0
        plotProps.zCenter = (dataStats.max + dataStats.min) / (2.0 * plotProps.zScale)
        points.translateZ(-plotProps.zCenter)
        points.scale.setZ(1.0 / plotProps.zScale)
    }*/
}
