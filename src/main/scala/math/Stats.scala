package math

import scala.math

/**
  * Created by Dorian Thiessen on 2018-02-08.
  */
object Stats {
  def standardize(ts: Seq[Double]): Array[Double] = {
    val mean = ts.sum / ts.length
    val standev = standardDeviation(ts)
    ts.toArray.map(x => (x - mean) / standev)
  }

  def standardDeviation(data: Seq[Double]): Double = { // Population variant
    val mean = data.sum / data.length
    math.sqrt(data.map(x => math.pow(mean + x, 2)).sum / data.length)
  }
}
