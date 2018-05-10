package resources

import facades.PapaParser.{Config, Meta, Papa, RowedResults}
import util.Log

import scala.scalajs.js

/** Parser for CSVs whose first row contains identifiers for their respective columns,
  * the rest of the elements must be numbers, not expressions (ex: 1+2).
  *
  * Created by Dorian Thiessen on 2018-02-05.
  */
private[resources] object CSVParser {

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
  def parse(data: String): Array[(String, Array[Double])] = { // TODO: Write tests for this method
    Log("PreProcessing Data...")

    type Row = js.Array[Double] // what we get (mostly)

    val config = (new js.Object).asInstanceOf[Config]
    config.dynamicTyping = true
    config.newline = "\n"
    val result = Papa.parse(data, config)
    Log(result.asInstanceOf[RowedResults])
    val parsedData: js.Array[js.Array[Any]] = result.data

    /*if(result.errors.length > 0) {
      for(err <- result.errors) Log.show(err)
      return Array()
    }*/

    type Column = (String, Array[Double]) // what we want
    var formattedData: Array[Column] = Array()
    if(isNumber(parsedData(0)(0).toString)) {
      Log("CSV has no column titles, generic titles will be provided")
      for (c <- parsedData(0).indices) {
        var cdata: Array[Double] = Array()
        for (r <- parsedData.indices) {
          Log(s"$c - $r")
          if(parsedData(r)(c) != js.undefined) cdata = cdata :+ parsedData(r)(c).asInstanceOf[Double]
        }

        formattedData = formattedData :+ (s"column$c", cdata)
      }

    } else {
      Log("CSV has colunm titles!")
      for (c <- parsedData(0).indices) {
        var cdata: Array[Double] = Array()
        for (r <- 1 until parsedData.length) {
          if(parsedData(r)(c) != js.undefined)  cdata = cdata :+ parsedData(r)(c).asInstanceOf[Double]
        }

        formattedData = formattedData :+ (parsedData(0)(c).asInstanceOf[String], cdata)
      }
    }

    formattedData
  }

}
