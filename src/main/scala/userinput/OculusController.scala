package userinput

import facades.three.IFThree.VRController
import org.scalajs.dom
import org.scalajs.dom.raw.Event
import org.scalajs.threejs.{BoxGeometry, Color, CylinderGeometry, Mesh, MeshBasicMaterial, THREE}

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

  var controllerMesh: MeshBasicMaterial

  def createMesh(color: Int): Mesh = {
    val controllerMaterial = new MeshBasicMaterial()
    controllerMaterial.color = new Color(color)
    val controllerMesh = new Mesh(
      new CylinderGeometry( 0.005, 0.05, 0.1, 6 ),
      controllerMaterial)
    val handleMesh = new Mesh(
      new BoxGeometry(0.03, 0.1, 0.03),
      controllerMaterial)

    //controllerMaterial.flatShading = true;
    controllerMesh.rotation.x = -Math.PI / 2
    handleMesh.position.y = -0.05
    controllerMesh.add( handleMesh )
    controllerMesh
  }

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

  override var controllerMesh: MeshBasicMaterial = _

  def setup(vrc: VRController): Unit = {
    dom.console.log(s"$name Connected!")
    vrc.add(createMesh(meshColorBlue))

    vrc.addEventListener(Primary_PressBegan, ((event: Event) => {
      dom.console.log("Primary Press Began")
    }).asInstanceOf[Any => Unit])

    vrc.addEventListener(Primary_PressEnded, ((event: Event) => {
      dom.console.log("Primary Press Ended")
    }).asInstanceOf[Any => Unit])

    vrc.addEventListener(Grip_PressBegan, ((event: Event) => {
      dom.console.log("Grip Press Began")
    }).asInstanceOf[Any => Unit])

    vrc.addEventListener(Grip_PressEnded, ((event: Event) => {
      dom.console.log("Grip Press Ended")
    }).asInstanceOf[Any => Unit])

    vrc.addEventListener(Axes_Changed, ((event: Event) => {
      dom.console.log("Axes Changed")
    }).asInstanceOf[Any => Unit])

    vrc.addEventListener(X_PressBegan, ((event: Event) => {
      dom.console.log("X Press Began")
    }).asInstanceOf[Any => Unit])

    vrc.addEventListener(X_PressEnded, ((event: Event) => {
      dom.console.log("X Press Ended")
    }).asInstanceOf[Any => Unit])

    vrc.addEventListener(Y_PressBegan, ((event: Event) => {
      dom.console.log("Y Press Began")
    }).asInstanceOf[Any => Unit])

    vrc.addEventListener(Y_PressEnded, ((event: Event) => {
      dom.console.log("Y Press Ended")
    }).asInstanceOf[Any => Unit])

    vrc.addEventListener(Disconnected, ((event: Event) => {
      //vrc.parent.remove(vrc)
      //TODO: Remove meshes & raycasters associated with this controller
      dom.console.log(s"$name Disconnected!")
    }).asInstanceOf[Any => Unit])
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

  override var controllerMesh: MeshBasicMaterial = _

  def setup(vrc: VRController): Unit = {
    dom.console.log(s"$name Connected!")
    vrc.add(createMesh(meshColorRed))

    vrc.addEventListener(Primary_PressBegan, ((event: Event) => {
      dom.console.log("Primary Press Began")
    }).asInstanceOf[Any => Unit])

    vrc.addEventListener(Primary_PressEnded, ((event: Event) => {
      dom.console.log("Primary Press Ended")
    }).asInstanceOf[Any => Unit])

    vrc.addEventListener(Grip_PressBegan, ((event: Event) => {
      dom.console.log("Grip Press Began")
    }).asInstanceOf[Any => Unit])

    vrc.addEventListener(Grip_PressEnded, ((event: Event) => {
      dom.console.log("Grip Press Ended")
    }).asInstanceOf[Any => Unit])

    vrc.addEventListener(Axes_Changed, ((event: Event) => {
      dom.console.log("Axes Changed")
    }).asInstanceOf[Any => Unit])

    vrc.addEventListener(A_PressBegan, ((event: Event) => {
      dom.console.log("A Press Began")
    }).asInstanceOf[Any => Unit])

    vrc.addEventListener(A_PressEnded, ((event: Event) => {
      dom.console.log("A Press Ended")
    }).asInstanceOf[Any => Unit])

    vrc.addEventListener(B_PressBegan, ((event: Event) => {
      dom.console.log("B Press Began")
    }).asInstanceOf[Any => Unit])

    vrc.addEventListener(B_PressEnded, ((event: Event) => {
      dom.console.log("B Press Ended")
    }).asInstanceOf[Any => Unit])

    vrc.addEventListener(Disconnected, ((event: Event) => {
      //vrc.parent.remove(vrc)
      //TODO: Remove meshes & raycasters associated with this controller
      dom.console.log(s"$name Disconnected!")
    }).asInstanceOf[Any => Unit])

  }
}
