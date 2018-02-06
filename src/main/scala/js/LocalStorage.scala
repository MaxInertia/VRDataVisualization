package js

import scala.scalajs.js
import scala.scalajs.js.annotation.JSGlobal

/**
  * Created by Dorian Thiessen on 2018-02-05.
  */
@js.native
@JSGlobal("LocalStorage")
class LocalStorage extends js.Object {
  def getItem(item: String): String = js.native
}
