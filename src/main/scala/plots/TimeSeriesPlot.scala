package plots

/**
  * Created by Dorian Thiessen on 2018-01-13.
  */
class TimeSeriesPlot(val tag: String, points: Points) extends Plot {
  override val ops: SelectionOps = new SelectionOps{}
  override def getPoints: Points = points
  def getGeometry: BufferGeometry = points.geometry.asInstanceOf[BufferGeometry]
  override def getName: String = tag
}

object TimeSeriesPlot {
  def apply(id: String, points: Points, hue: Double): TimeSeriesPlot = {
    val timeSeries = new TimeSeriesPlot(id, points)
    timeSeries.hue = hue
    timeSeries
  }

  def apply(id: String, points: Points): TimeSeriesPlot = {
    val timeSeries = new TimeSeriesPlot(id, points)
    timeSeries
  }

  def createSet(data: Array[(String, Array[Double])], hue: Double): Array[TimeSeriesPlot] =
    null  // TODO: Implement TimeSeries.create(...)
}
