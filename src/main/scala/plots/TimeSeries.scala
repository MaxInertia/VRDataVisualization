package plots

/**
  * Created by Dorian Thiessen on 2018-01-13.
  */
class TimeSeries(val tag: String, points: Points) extends Plot {
  override def getPoints: Points = points
  def getGeometry: BufferGeometry = points.geometry.asInstanceOf[BufferGeometry]
  override def getName: String = tag
}

object TimeSeries {
  def apply(id: String, points: Points, hue: Double): TimeSeries = {
    val timeSeries = new TimeSeries(id, points)
    timeSeries.hue = hue
    timeSeries
  }

  def apply(id: String, points: Points): TimeSeries = {
    val timeSeries = new TimeSeries(id, points)
    timeSeries
  }

  def createSet(data: Array[(String, Array[Double])], hue: Double): Array[TimeSeries] =
    null  // TODO: Implement TimeSeries.create(...)
}
