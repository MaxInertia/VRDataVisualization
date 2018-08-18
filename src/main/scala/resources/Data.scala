package resources

import util.{Log, Stats}

/**
  * Created by Dorian Thiessen on 2018-07-05.
  */
case class Data(id: String, measurements: Array[Double]) {
  private var stats: Stats = Stats.create(measurements)
  val columnNumber: Int = Data.newColumnNumber
  def getStats: Stats = stats

  def updateStats(newStats: Stats): Unit = stats = newStats

  Log.show(s"Data creation: max:${getStats.max}, min${getStats.min}")
}

object Data {
  var columnsAdded: Int = 0
  def newColumnNumber: Int = {
    columnsAdded += 1
    columnsAdded - 1
  }
  type CSVColumn[T] = (String, Array[T])
}