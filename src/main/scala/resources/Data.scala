package resources

import math.Stats
import util.Log

/**
  * Created by Dorian Thiessen on 2018-07-05.
  */
case class Data(id: String, measurements: Array[Double]) {
  private var stats: Stats = Stats.create(measurements)
  def getStats: Stats = stats

  def updateStats(newStats: Stats): Unit = stats = newStats

  Log.show(s"Data creation: max:${getStats.max}, min${getStats.min}")
}

object Data {
  type CSVColumn[T] = (String, Array[T])
}