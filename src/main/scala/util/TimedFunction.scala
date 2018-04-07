package util

import org.scalajs.dom
import scala.scalajs.js.Date

/**
  * Created by Dorian Thiessen on 2018-04-07.
  */
trait Timing {
  val startTime: Double
  var preCallDescription: Option[String] = None
  var onCalledDescription: Option[String] = None

  def displayDetails(startTime: Double, endTime: Double, desc: Option[String]): Unit = {
    if(desc.nonEmpty) dom.console.log(s"${desc.get} took ${endTime - startTime}ms")
  }

  def setDescriptions(preCallbackDesc: Option[String], callbackDesc: Option[String] = None): Unit = {
    if(preCallbackDesc.nonEmpty) preCallDescription = preCallbackDesc
    if(callbackDesc.nonEmpty) onCalledDescription = callbackDesc
  }

  def setDescriptions(preCallbackDesc: String, callbackDesc: String): Unit = {
    preCallDescription = if(preCallbackDesc.nonEmpty) Some(preCallbackDesc) else None
    onCalledDescription = if(callbackDesc.nonEmpty) Some(callbackDesc) else None
  }
}

/**
  * Created by Dorian Thiessen on 2018-04-05.
  */
class TimedFunction1[T](func: T => Unit) extends (T => Unit) with Timing {
  val startTime: Double = new Date().getTime() // Time this was was instantiated
  def apply(input: T): Unit = {
    val callbackTime: Double = new Date().getTime() // Time the function is called
    func(input) // Run function
    val endTime = new Date().getTime() // Time the function returns
    displayDetails(startTime, callbackTime, preCallDescription)
    displayDetails(callbackTime, endTime, onCalledDescription)
  }
}

class TimedFunction2[T, S](func: (T, S) => Unit) extends ((T, S) => Unit) with Timing {
  val startTime: Double = new Date().getTime() // Time this was was instantiated
  def apply(input1: T, input2: S): Unit = {
    val callbackTime: Double = new Date().getTime() // Time the function is called
    func(input1, input2) // Run function
    val endTime = new Date().getTime() // Time the function returns
    displayDetails(startTime, callbackTime, preCallDescription)
    displayDetails(callbackTime, endTime, onCalledDescription)
  }
}

object TimedFunction {
  def apply[T](fn: T => Unit): TimedFunction1[T] = new TimedFunction1[T](fn)
  def apply[T, S](fn: (T, S) => Unit): TimedFunction2[T, S] = new TimedFunction2[T, S](fn)
}