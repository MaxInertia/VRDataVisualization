package facade

import scala.scalajs.js
import scala.scalajs.js.annotation.JSGlobal

/**
  * Created by Dorian Thiessen on 2018-05-10.
  */
object PapaParser {

  @js.native
  @JSGlobal("Papa")
  object Papa extends js.Object {
    def parse(csv: String, config: Config): RowedResults = js.native
  }

  @js.native
  trait Config extends js.Object {
    var delimiter: String = js.native // auto-detect
    var newline: String = js.native // auto-detect
    var quoteChar: Char = js.native // '"'
    var escapeChar: Char = js.native // '"'
    var header: Boolean = js.native // false
    var trimHeader: Boolean = js.native // false
    var dynamicTyping: Boolean = js.native // false
    var preview: Int = js.native // 0
    var encoding: String = js.native //""
    var worker: Boolean = js.native // false
    var comments: Boolean = js.native // false
    var step: (Results, js.Any) = js.native //undefined
    var complete: (Results, js.Any) => Unit = js.native // undefined
    var error: (js.Any, js.Any) => Unit = js.native // undefined
    var download: Boolean = js.native // false
    var skipEmptyLines: Boolean = js.native //false
    var chunk: (Results, js.Any) = js.native //undefined
    var fastMode: Boolean = false // undefined
    var beforeFirstChunk: js.Any => js.Any = js.native // undefined
    var withCredentials: Boolean = js.native // undefined
  }

  @js.native
  trait Results extends js.Object {
    val errors: Array[ParseError] = js.native
  }

  @js.native
  trait RowedResults extends Results {
    val data: js.Array[js.Array[Any]] = js.native
    val meta: js.Object = js.native
  }

  @js.native
  trait KeyedResults extends Results {
    val data: Array[js.Object] = js.native
    val meta: js.Object = js.native
  }

  @js.native
  trait ParseError extends js.Object {
    //val type: String = js.native
    val code: String = js.native
    val message: String = js.native
    val row: Int = js.native
  }

  @js.native
  trait Meta extends js.Object {
    val delimiter: String = js.native
    val linebreak: String = js.native
    val aborted: Boolean = js.native
    val fields: Array[String] = js.native
    val truncated: Boolean = js.native
  }

}