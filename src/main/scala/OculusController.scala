import js.three.VRController
import org.scalajs.dom.raw.Event

/**
  * Common traits of the left and right Oculus Controllers.
  * Created by Dorian Thiessen on 2018-02-12.
  */
abstract class OculusController {
  val name: String
  // Event ID's
  val Primary_PressBegan = "primary press began"
  val Primary_PressEnded = "primary press ended"
  val Grip_PressBegan = "grip press began"
  val Grip_PressEnded = "grip press ended"
  val Axes_Changed = "axes changed"
  val Disconnected = "disconnected"
  // Color options for the controller mesh
  val meshColorRed = 0xFF0000
  val meshColorBlue = 0x0000FF
  val meshColorWhite = 0xFFFFFF

  def setup(vrc: VRController): Unit
}

/**
  * Contains the name, event id's and setup method for the left Oculus Controller.
  */
object OculusControllerLeft extends OculusController {
  override val name = "Oculus Touch (Left)"
  // Event ID's specific to the Left controller
  val X_PressBegan = "X press began"
  val X_PressEnded = "X press ended"
  val Y_PressBegan = "Y press began"
  val Y_PressEnded = "Y press ended"

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
  */
object OculusControllerRight extends OculusController {
  override val name = "Oculus Touch (Right)"
  // Event ID's specific to the Right controller
  val A_PressBegan = "A press began"
  val A_PressEnded = "A press ended"
  val B_PressBegan = "B press began"
  val B_PressEnded = "B press ended"

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