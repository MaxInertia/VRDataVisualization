package data

import scala.scalajs.js
import js.JSConverters._
import scala.collection.mutable.ArrayBuffer

/** Preprocessor for Time Series data from csv
  *
  * Created by Dorian Thiessen on 2018-02-05.
  */
object PreProcessor {

  // Regexp that matches numbers with or without decimal and sign.
  val numberRegex = """([-+]?)((\d+\.\d+)|(\d+\.)|(\.\d+)|(\d+))"""

  // Checks if a string is a number; can be converted to a Double
  def isNumber(str: String): Boolean = str.matches(numberRegex)

  /**
    * Parses the csv into an array of 2-Tuples
    *   element 1 contains the column name
    *   element 2 is an array of the values in that column
    *
    * @param data String representation of the csv
    * @return
    */
  def process(data: String): Array[(String, Array[Double])] = {
    println("PreProcessing Data...")
    val temp: Array[String] = data.split("""(\r\n|\n|\r)/g""").map(_.trim)
    println(temp.toJSArray)

    // Store each line as an array of strings in an ArrayBuffer
    val rows = ArrayBuffer[Array[String]]()
    for(line <- temp) {
      rows += line.split(",").map(_.trim)
    }

    // Create an ArrayBuffer for each column
    val colCount = rows(0).length
    var cols = Array[ArrayBuffer[Double]]()
    for(i <- 0 to colCount) {
      cols = cols :+ ArrayBuffer[Double]()
    }

    // Store the values in the ArrayBuffer corresponding to the values column
    for(r <- rows.indices) {
      if(r != 0) for (c <- colCount until colCount) {
        if(isNumber(rows(r)(c))) cols(c) += rows(r)(c).toDouble
        else println(s"WARNING: r${r}c$c Is NAN: ${rows(r)(c)}")
      }
    }

    // Wrap the processed data and column ID's into an Array of Tuples
    var processedData = Array[(String, Array[Double])]()
    for(i <- rows(0).indices) {
      processedData = processedData :+ (rows(0)(i), cols(i).toArray)
    }

    processedData
  }

}
