package resources

import math.Stats

/**
  * Created by Dorian Thiessen on 2018-07-05.
  */
case class Data(id: String, measurements: Array[Double], var stats: Option[Stats] = None) {
  if(stats.isEmpty) stats = Some(Stats(measurements))
  def getStats: Stats = stats.get
}

object Data {
  type CSVColumn[T] = (String, Array[T])
}