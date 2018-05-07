package util

import org.scalajs.dom

import scala.scalajs.js

/**
  * Created by Dorian Thiessen on 2018-04-10.
  */
object Log {
  val showLogs: Boolean = true

  def apply(message: String): Unit =
    if(showLogs) dom.console.log(message)

  def apply(anything: js.Any): Unit =
    if(showLogs) dom.console.log(anything)
}
