package util

import scala.math

/**
  * Created by Dorian Thiessen on 2018-02-08.
  */
object Stats {
  def create(measurements: Array[Double]): Stats = {
    val mean = measurements.sum / measurements.length
    val standev = standardDeviation(measurements)
    var min = Double.MaxValue
    var max = Double.MinValue
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

  def cloneWith(stats: Stats)(
    sd: Double = stats.sd,
    mean: Double = stats.mean,
    min: Double = stats.min,
    max: Double = stats.max
  ): Stats = Stats(sd, mean, min, max)
}

case class Stats(sd: Double, mean: Double, min: Double, max: Double) {
  val normalizedMax: Double = (max - mean)/sd
  val normalizedMin: Double = (min - mean)/sd
}

case class ScaleCenterProperties(var xScale: Double, var yScale: Double, var zScale: Double,
                                 var xCenter: Double, var yCenter: Double, var zCenter: Double) {
}
