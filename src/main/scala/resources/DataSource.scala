package resources

import org.scalajs.dom.ext.LocalStorage

/**
  * Created by Dorian Thiessen on 2018-05-08.
  */
trait DataSource {
  def collect(): Array[Data]
}

case class BrowserStorage(localStorageID: String) extends DataSource {
  override def collect(): Array[Data] = {
    val maybeData: Option[Array[(String, Array[Double])]] = LocalStorage(localStorageID).map(CSVParser.parse)
    if(maybeData.isEmpty) return Array()
    val datasets: Array[(String, Array[Double])] = maybeData.get
    for(d <- datasets) yield Data(d._1, d._2)
  }
}

case class FileAsText(text: String) extends DataSource {
  override def collect(): Array[Data] = {
    val datasets: Array[(String, Array[Double])] = CSVParser.parse(text)
    if(datasets.isEmpty) return Array()
    for(d <- datasets) yield Data(d._1, d._2)
  }
}