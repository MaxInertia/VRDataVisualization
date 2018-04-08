package userinput

import facades.three.VRController
import org.scalajs.dom.raw.Event

/**
  * Common traits of the left and right Oculus Controllers.
  * Created by Dorian Thiessen on 2018-02-12.
  */
sealed abstract class OculusController {
  val name: String
  // Event ID's
  val Primary_PressBegan: String = "primary press began"
  val Primary_PressEnded: String = "primary press ended"
  val Grip_PressBegan: String = "grip press began"
  val Grip_PressEnded: String = "grip press ended"
  val Axes_Changed: String = "axes changed"
  val Disconnected: String = "disconnected"
  // Color options for the controller mesh
  val meshColorRed: Int = 0xFF0000
  val meshColorBlue: Int = 0x0000FF
  val meshColorWhite: Int = 0xFFFFFF

  def setup(vrc: VRController): Unit
}

/**
  * Contains the name, event id's and setup method for the left Oculus Controller.
  * All event listeners for inputs to this controller are here.
  *
  * Can be thought of as a mapping from a subset of the available
  * inputs to interactions (see plots.Interactions).
  */
object OculusControllerLeft extends OculusController {
  override val name: String = "Oculus Touch (Left)"
  // Event ID's specific to the Left controller
  val X_PressBegan: String = "X press began"
  val X_PressEnded: String = "X press ended"
  val Y_PressBegan: String = "Y press began"
  val Y_PressEnded: String = "Y press ended"

  def setup(vrc: VRController): Unit = {
    // TODO: Add mesh
    println(s"$name Connected!")
    /*vrc.addEventListener(Primary_PressBegan, (event: Event) => {})
    vrc.addEventListener(Primary_PressEnded, (event: Event) => {})
    vrc.addEventListener(Grip_PressBegan, (event: Event) => {})
    vrc.addEventListener(Grip_PressEnded, (event: Event) => {})
    vrc.addEventListener(Axes_Changed, (event: Event) => {})
    vrc.addEventListener(X_PressBegan, (event: Event) => {})
    vrc.addEventListener(X_PressEnded, (event: Event) => {})
    vrc.addEventListener(Y_PressBegan, (event: Event) => {})
    vrc.addEventListener(Y_PressEnded, (event: Event) => {})*/
    vrc.addEventListener(Disconnected, (event: Event) => {
      //vrc.parent.remove(vrc)
      //TODO: Remove meshes & raycasters associated with this controller
      println(s"$name Disconnected!")
    })
  }
}

/**
  * Contains the name, event id's and setup method for the right Oculus Controller.
  * All event listeners for inputs to this controller are here.
  *
  * Can be thought of as a mapping from a subset of the available
  * inputs to interactions (see plots.Interactions).
  */
object OculusControllerRight extends OculusController {
  override val name: String = "Oculus Touch (Right)"
  // Event ID's specific to the Right controller
  val A_PressBegan: String = "A press began"
  val A_PressEnded: String = "A press ended"
  val B_PressBegan: String = "B press began"
  val B_PressEnded: String = "B press ended"

  def setup(vrc: VRController): Unit = {
    // TODO: Add mesh
    println(s"$name Connected!")
    /*vrc.addEventListener(Primary_PressBegan, (event: Event) => {})
    vrc.addEventListener(Primary_PressEnded, (event: Event) => {})
    vrc.addEventListener(Grip_PressBegan, (event: Event) => {})
    vrc.addEventListener(Grip_PressEnded, (event: Event) => {})
    vrc.addEventListener(Axes_Changed, (event: Event) => {})
    vrc.addEventListener(A_PressBegan, (event: Event) => {})
    vrc.addEventListener(A_PressEnded, (event: Event) => {})
    vrc.addEventListener(B_PressEnded, (event: Event) => {})
    vrc.addEventListener(B_PressBegan, (event: Event) => {})*/
    vrc.addEventListener(Disconnected, (event: Event) => {
      //vrc.parent.remove(vrc)
      //TODO: Remove meshes & raycasters associated with this controller
      println(s"$name Disconnected!")
    })
  }
}
