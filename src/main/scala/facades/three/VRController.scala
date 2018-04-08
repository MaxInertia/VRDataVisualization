package js.three

import org.scalajs.dom.raw.Event

import scala.scalajs.js
import scala.scalajs.js.annotation.JSGlobal

/**
  * Created by Dorian Thiessen on 2018-01-13.
  */
@js.native
@JSGlobal("THREE.VRController")
class VRController extends js.Object {
  val name: String = js.native
  def update(): Unit = js.native
  def addEventListener[T <: Event](`type`: String, listener: js.Function1[T, _]): Unit = js.native
}
