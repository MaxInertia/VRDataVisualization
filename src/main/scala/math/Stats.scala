package math

import util.Log
import viewable.Points

import scala.math

/**
  * Created by Dorian Thiessen on 2018-02-08.
  */
object Stats {
  def apply(measurements: Array[Double]): Stats = {
    val mean = measurements.sum / measurements.length
    val standev = standardDeviation(measurements)
    var min = Double.MaxValue
    var max = Double.MinValue
    var values: Array[Double] = Array()
    for(v <- measurements) {
      if(v < min) min = v
      if(v > max) max = v
    }
    Stats(standev, mean, min, max)
  }

  def standardize(ts: Seq[Double]): (Array[Double], Stats) = {
    val mean = ts.sum / ts.length
    val standev = standardDeviation(ts)
    var min = Double.MaxValue
    var max = Double.MinValue
    var values: Array[Double] = Array()
    for(v <- ts) {
      values = values :+ (v - mean)/standev
      if(v < min) min = v
      if(v > max) max = v
    }
    (values, Stats(standev, mean, min, max))
  }

  def standardDeviation(data: Seq[Double]): Double = { // Population variant
    val mean = data.sum / data.length
    math.sqrt(data.map(x => math.pow(mean + x, 2)).sum / data.length)
  }

  def restore(value: Double, sd: Double, mean: Double): Double = value*sd + mean
}

case class Stats(sd: Double, mean: Double, min: Double, max: Double) {
  val normalizedMax: Double = (max - mean)/sd
  val normalizedMin: Double = (min - mean)/sd
}

case class ScaleCenterProperties(var xScale: Double, var yScale: Double, var zScale: Double,
                                 var xCenter: Double, var yCenter: Double, var zCenter: Double) {

  def update(points: Points, newMin: Double, newMax: Double, i: Int): Unit = {
    // The amount to scale the points so they fit within a 1x1x1 cube.
    val newScale = if(newMax == newMin) 1.0 else scala.math.abs(newMax - newMin)
    // Find center of points.
    val newCenter = (newMax + newMin) / (2 * newScale)

    //Log.show(s"newMin: $newMin\nnewMax: $newMax\nnewCenter: $newCenter\n newScale: $newScale")
    if(i == 0) {
      xCenter = newCenter
      xScale = newScale
    } else if(i == 1) {
      yCenter = newCenter
      yScale = newScale
    } else if(i == 2) {
      zCenter = newCenter
      zScale = newScale
    }

    points.scale.set(xScale, yScale, zScale)
    points.position.set(-xCenter, -yCenter, -zCenter)
  }
}