package util

import org.scalajs.dom

import scala.scalajs.js

/**
  * Created by Dorian Thiessen on 2018-04-10.
  */
object Log {
  val showLogs: Boolean = true

  def apply(message: String): Unit =
    if(showLogs) show(message)

  def apply(anything: js.Any): Unit =
    if(showLogs) show(anything)

  def show(message: String): Unit = dom.console.log(message)
  def show(anything: js.Any): Unit = dom.console.log(anything)
}
