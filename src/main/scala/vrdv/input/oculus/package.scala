package vrdv.input

import scala.scalajs.js

/**
  * @author Dorian Thiessen | MaxInertia
  */
package object oculus {
  val RightControllerName: String = "Oculus Touch (Right)"
  val LeftControllerName: String = "Oculus Touch (Left)"

  object Input {
    val Primary_PressBegan: String = "primary press began"
    val Primary_ValueChanged: String = "primary value changed"
    val Primary_PressEnded: String = "primary press ended"

    val Grip_PressBegan: String = "grip press began"
    val Grip_ValueChanged: String = "grip value changed"
    val Grip_PressEnded: String = "grip press ended"

    val ThumbRest_TouchBegan: String = "thumbrest touch began"
    val ThumbRest_TouchEnded: String = "thumbrest touch ended"

    val Axes_Changed: String = "thumbstick axes changed"
    val Disconnected: String = "vr controller disconnected"

    object Left {
      // Event ID's specific to the Left controller
      val X_PressBegan: String = "X press began"
      val X_PressEnded: String = "X press ended"
      val Y_PressBegan: String = "Y press began"
      val Y_PressEnded: String = "Y press ended"
    }

    object Right {
      // Event ID's specific to the Right controller
      val A_PressBegan: String = "A press began"
      val A_PressEnded: String = "A press ended"
      val B_PressBegan: String = "B press began"
      val B_PressEnded: String = "B press ended"
    }

    // These touch events for Oculus Controls are not registering. (Firefox 61.0.1)
    val Primary_TouchBegan: String = "primary touch began"
    val Primary_TouchEnded: String = "primary touch ended"
    val Grip_TouchBegan: String = "grip touch began"
    val Grip_TouchEnded: String = "grip touch ended"
  }

  def primaryValue(target: Any): Double = target
    .asInstanceOf[js.Dynamic].getButton(1).value.asInstanceOf[Double]

}
