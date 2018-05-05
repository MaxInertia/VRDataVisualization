package userinput

import env.Environment
import facades.IFThree.{RaycasterParametersExt, VRController}
import org.scalajs.dom
import org.scalajs.dom.raw.Event
import org.scalajs.threejs.{ArrowHelper, BoxGeometry, Color, CylinderGeometry, Matrix4, Mesh, MeshBasicMaterial, Object3D, SceneUtils, Vector3}
import userinput.Controls.RayCaster
import util.Log

trait OculusTouchEvents {
  val ThumbRest_TouchBegan: String = "thumbrest touch began"
  val ThumbRest_TouchEnded: String = "thumbrest touch ended"
}

/**
  * Common traits of the left and right Oculus Controllers.
  * Created by Dorian Thiessen on 2018-02-12.
  */
sealed abstract class OculusController extends OculusTouchEvents {
  val name: String
  // Event ID's
  val Primary_PressBegan: String = "primary press began"
  val Primary_PressEnded: String = "primary press ended"
  val Grip_PressBegan: String = "grip press began"
  val Grip_PressEnded: String = "grip press ended"
  val Axes_Changed: String = "thumbstick axes changed"
  val Disconnected: String = "disconnected"
  // Color options for the controller mesh
  val meshColorRed: Int = 0xFF0000
  val meshColorBlue: Int = 0x0000FF
  val meshColorWhite: Int = 0xFFFFFF

  protected var controllerEl: VRController = _
  protected var controllerMesh: Mesh = _
  protected var rayCasterEl: RayCaster = _
  protected[userinput] var rayCasterArrow: ArrowHelper = _ // effectively the rayCaster mesh

  def setup(vrc: VRController): Unit
  def isPointing: Boolean = rayCasterArrow!=null && rayCasterArrow.visible
  def updatedRayCaster: RayCaster = {
    rayCasterEl.set(
      controllerEl.position,
      controllerDirection())
    rayCasterEl
  }

  protected def init(vrc: VRController, hexColor: Int): Unit = {
    controllerEl = vrc
    controllerMesh = createControllerMesh(hexColor)

    rayCasterEl = new RayCaster()
    rayCasterEl.set(
      vrc.position,
      controllerDirection())
    rayCasterEl.params.asInstanceOf[RaycasterParametersExt].Points.threshold = 0.015

    rayCasterArrow = new ArrowHelper(
      new Vector3(0, 0, -1),
      new Vector3(0, 0, 0),
      100, hexColor)
    rayCasterArrow.visible = false
    rayCasterArrow.cone.visible = false

    vrc.add(rayCasterArrow)
    vrc.add(controllerMesh)
  }

  protected def controllerDirection(): Vector3 = {
    val matrix = new Matrix4()
    matrix.extractRotation( controllerEl.matrix )
    var direction = new Vector3( 0, 0, 1 )
    direction = direction.applyMatrix4(matrix).negate()
    direction
  }

  protected def createControllerMesh(color: Int): Mesh = {
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
    Log(s"$name Connected!")
    init(vrc, meshColorBlue)

    // Touch events

    vrc.addEventListener(ThumbRest_TouchBegan, ((event: Event) => {
      Log("Thumbrest Touch Began")
      rayCasterArrow.visible = true
    }).asInstanceOf[Any => Unit])
    vrc.addEventListener(ThumbRest_TouchEnded, ((event: Event) => {
      Log("Thumbrest Touch Ended")
      rayCasterArrow.visible = false
    }).asInstanceOf[Any => Unit])

    // Other events

    vrc.addEventListener(Primary_PressBegan, ((event: Event) => {
      Log("Primary Press Began")
    }).asInstanceOf[Any => Unit])
    vrc.addEventListener(Primary_PressEnded, ((event: Event) => {
      Log("Primary Press Ended")
    }).asInstanceOf[Any => Unit])
    vrc.addEventListener(Grip_PressBegan, ((event: Event) => {
      Log("Grip Press Began")
    }).asInstanceOf[Any => Unit])
    vrc.addEventListener(Grip_PressEnded, ((event: Event) => {
      Log("Grip Press Ended")
    }).asInstanceOf[Any => Unit])
    vrc.addEventListener(Axes_Changed, ((event: Event) => {
      Log("Axes Changed")
    }).asInstanceOf[Any => Unit])
    vrc.addEventListener(X_PressBegan, ((event: Event) => {
      Log("X Press Began")
    }).asInstanceOf[Any => Unit])
    vrc.addEventListener(X_PressEnded, ((event: Event) => {
      Log("X Press Ended")
    }).asInstanceOf[Any => Unit])
    vrc.addEventListener(Y_PressBegan, ((event: Event) => {
      Log("Y Press Began")
    }).asInstanceOf[Any => Unit])
    vrc.addEventListener(Y_PressEnded, ((event: Event) => {
      Log("Y Press Ended")
    }).asInstanceOf[Any => Unit])

    vrc.addEventListener(Disconnected, ((event: Event) => {
      vrc.parent.remove(vrc)
      //TODO: Remove meshes & raycasters associated with this controller
      Log(s"$name Disconnected!")
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

  var captured: Option[Object3D] = None
  var capturedDiff: Vector3 = _

  def setup(vrc: VRController): Unit = {
    Log(s"$name Connected!")
    init(vrc, meshColorRed)

    // Touch Events

    vrc.addEventListener(ThumbRest_TouchBegan, ((event: Event) => {
      Log("Thumbrest Touch Began")
      rayCasterArrow.visible = true
    }).asInstanceOf[Any => Unit])
    vrc.addEventListener(ThumbRest_TouchEnded, ((event: Event) => {
      Log("Thumbrest Touch Ended")
      rayCasterArrow.visible = false
    }).asInstanceOf[Any => Unit])

    // Other Events

    vrc.addEventListener(Primary_PressBegan, ((event: Event) => {
      Log("Primary Press Began")
    }).asInstanceOf[Any => Unit])
    vrc.addEventListener(Primary_PressEnded, ((event: Event) => {
      Log("Primary Press Ended")
    }).asInstanceOf[Any => Unit])
    vrc.addEventListener(Grip_PressBegan, ((event: Event) => {
      val regions = Environment.instance.getRegions
      for(r <- regions) {
        val controllerPos = vrc.position
        if(captured.isEmpty && r.position.distanceTo(controllerPos) < 0.5) {
          SceneUtils.attach(r, Environment.instance.scene, vrc)
          captured = Some(r)
        }
      }
      Log("Grip Press Began")
    }).asInstanceOf[Any => Unit])
    vrc.addEventListener(Grip_PressEnded, ((event: Event) => {
      if(captured.nonEmpty) {
        val dropped = captured.get
        SceneUtils.detach(dropped, vrc, Environment.instance.scene)
        captured = None
      }
      Log("Grip Press Ended")
    }).asInstanceOf[Any => Unit])
    vrc.addEventListener(Axes_Changed, ((event: Event) => {
      Log("Axes Changed")
    }).asInstanceOf[Any => Unit])
    vrc.addEventListener(A_PressBegan, ((event: Event) => {
      Log("A Press Began")
    }).asInstanceOf[Any => Unit])
    vrc.addEventListener(A_PressEnded, ((event: Event) => {
      Log("A Press Ended")
    }).asInstanceOf[Any => Unit])
    vrc.addEventListener(B_PressBegan, ((event: Event) => {
      Log("B Press Began")
    }).asInstanceOf[Any => Unit])
    vrc.addEventListener(B_PressEnded, ((event: Event) => {
      Log("B Press Ended")
    }).asInstanceOf[Any => Unit])

    vrc.addEventListener(Disconnected, ((event: Event) => {
      vrc.parent.remove(vrc)
      //TODO: Remove meshes & raycasters associated with this controller
      Log(s"$name Disconnected!")
    }).asInstanceOf[Any => Unit])

  }
}

object OculusControllers {
  def getActiveRayCaster: Option[RayCaster] = {
    if(OculusControllerRight.isPointing) Some(OculusControllerRight.updatedRayCaster)
    else if(OculusControllerLeft.isPointing) Some(OculusControllerLeft.updatedRayCaster)
    else None
  }
}