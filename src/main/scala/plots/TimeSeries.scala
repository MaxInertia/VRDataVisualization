package plots

import org.scalajs.{threejs => THREE}

/**
  * Created by Dorian Thiessen on 2018-01-13.
  */
class TimeSeries(val tag: String, points: THREE.Points) extends Plot(tag, points)

object TimeSeries {
  def apply(id: String, measurements: Array[Coordinate], hue: Double): TimeSeries = {
    val timeSeries = new TimeSeries(id, Plot.makePoints(measurements, Some(hue), 0))
    timeSeries.hue = hue
    timeSeries
  }

  def apply(id: String, measurements: Array[Coordinate]): TimeSeries = {
    val timeSeries = new TimeSeries(id, Plot.makePoints(measurements, None, 0))
    timeSeries
  }

  def createSet(data: Array[(String, Array[Double])], hue: Double): Array[TimeSeries] =
    null  // TODO: Implement TimeSeries.create(...)
}
