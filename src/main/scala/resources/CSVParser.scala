package resources

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
    println("PreProcessing Data...")
    val temp: Array[String] = data.split("""[^ -~]""").map(_.trim).filter(!_.isEmpty)

    // Store each line as an array of strings in an ArrayBuffer
    var rows = Array[Array[String]]()
    for(line <- temp) {
      rows = rows :+ line.split(",") //.map(_.trim)
    }

    val colCount = rows(0).length
    println(s"\tcolumns: $colCount")
    for(i <- rows(0).indices) println(s"\t\tcolumn $i id: ${rows(0)(i)}")
    println(s"\trows:    ${rows.length}")

    // Create an Array for each column
    var cols = Array[Array[Double]]()
    for(i <- 0 until colCount) {
      cols = cols :+ Array[Double]()
    }

    // Store the values in the Array corresponding to the values column
    for(r <- rows.indices) {
      if(r != 0) for (c <- rows(r).indices) {
        if( isNumber( rows(r)(c) ) )
          cols(c) = cols(c) :+ rows(r)(c).toDouble
        else
          println(s"WARNING: r${r}c$c Is NAN: ${rows(r)(c)}")
      }
    }

    // Wrap the processed data and column ID's into an Array of Tuples
    var processedData = Array[(String, Array[Double])]()
    for(i <- 0 until colCount) processedData = processedData :+ (rows(0)(i), cols(i))
    processedData
  }

}
