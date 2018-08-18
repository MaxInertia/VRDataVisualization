package facade.webvr

import facade.IFThree.VRDisplay
import org.scalajs.dom.raw.HTMLCanvasElement

import scala.scalajs.js
import scala.scalajs.js.Promise
import scala.scalajs.js.annotation.JSGlobal

/**
  * Created by Dorian Thiessen on 2018-02-13.
  */
@js.native
@JSGlobal("webvrui")
object WebVRUI extends js.Object {
  def EnterVRButton(rendererDOM: HTMLCanvasElement, fn: Unit): EnterVRButton = js.native
}

@js.native
@JSGlobal
class EnterVRButton extends js.Object {
  var domElement: HTMLCanvasElement = js.native
  def getVRDisplay(): Promise[VRDisplay] = js.native
  def isPresenting(): Boolean = js.native
}
