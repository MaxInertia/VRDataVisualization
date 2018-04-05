package util

import org.scalajs.dom

import scala.scalajs.js.Date

/**
  * Created by Dorian Thiessen on 2018-04-05.
  */
class TimedFunction1[T](func: T => Unit) extends (T => Unit){
  val startTime: Double = new Date().getTime() // Time this was was instantiated

  var preCallDescription: String = _
  var onCalledDescription: String = _

  def apply(input: T): Unit = {
    val callbackTime: Double = new Date().getTime() // Time the function is called
    func(input) // Run function
    val endTime = new Date().getTime() // Time the function returns
    displayDetails(startTime, callbackTime, preCallDescription)
    displayDetails(callbackTime, endTime, onCalledDescription)
  }

  def displayDetails(startTime: Double, endTime: Double, desc: String): Unit = {
    dom.console.log(s"$desc took ${endTime - startTime}ms")
  }

  def setDescriptions(preCallbackDesc: String, callbackDesc: String): Unit = {
    preCallDescription = preCallbackDesc
    onCalledDescription = callbackDesc
  }
}

object TimedFunction1 {
  def apply[T](fn: T => Unit): TimedFunction1[T] = new TimedFunction1[T](fn)
}