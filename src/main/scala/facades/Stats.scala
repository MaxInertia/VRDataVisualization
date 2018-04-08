package facades

import scala.scalajs.js
import scala.scalajs.js.annotation.JSGlobal
import org.scalajs.dom.raw.Node

/**
  * Created by Dorian Thiessen on 2018-01-11.
  */
@js.native
@JSGlobal("Stats")
class Stats extends js.Object {
  val dom: Node = js.native
  def update(): Unit = js.native
}
