package controls

import facades.Dat
import facades.IFThree.{AxesChangedEvent, RaycasterParametersExt, SceneUtils2, VRController}
import org.scalajs.dom.raw.Event
import org.scalajs.threejs.{ArrowHelper, Box3, BoxGeometry, Color, CylinderGeometry, Matrix4, Mesh, MeshBasicMaterial, Object3D, SceneUtils, Vector2, Vector3}
import viewable.plots.CoordinateAxes3D
import util.Log
import viewable.input.Actions
import viewable.{Colors, Environment, Regions}

import scala.scalajs.js

/**
  * Touch events for the Oculus Controllers
  */
sealed trait OculusTouchEvents {
  val ThumbRest_TouchBegan: String = "thumbrest touch began"
  val ThumbRest_TouchEnded: String = "thumbrest touch ended"
  val Primary_TouchBegan: String = "primary touch began"
  val Primary_TouchEnded: String = "primary touch ended"
}

/**
  * Common traits of the left and right Oculus Controllers.
  * Created by Dorian Thiessen on 2018-02-12.
  */
sealed abstract class OculusController extends OculusTouchEvents {
  // Event ID's
  val Primary_PressBegan: String = "primary press began"
  val Primary_ValueChanged: String = "primary value changed"
  val Primary_PressEnded: String = "primary press ended"
  val Grip_PressBegan: String = "grip press began"
  val Grip_PressEnded: String = "grip press ended"
  val Axes_Changed: String = "thumbstick axes changed"
  val Disconnected: String = "disconnected"
  // Color options for the controller mesh
  val meshColorRed: Int = 0xFF0000
  val meshColorBlue: Int = 0x0000FF
  val meshColorWhite: Int = 0xFFFFFF

  /*protected[userinput] */ var controllerEl: VRController = _
  protected var controllerMesh: Mesh = _
  protected val laser: Laser = new Laser()

  var captured: Option[Object3D] = None
  var capturedSeparation: Option[Double] = None

  var correctedPosition: Vector3 = new Vector3()
  var yOffset: Vector3 = new Vector3(0, 1.6, 0)

  protected[controls] var selecting: Boolean = false

  def isConnected: Boolean = controllerEl != null

  def isSelecting: Boolean = isConnected && laser.arrow.visible && selecting

  def isPointing: Boolean = laser.arrow != null && laser.arrow.visible

  def updatedLaser: Laser = {
    // Adjust raycaster origin to account for fakeOrigin (The controllers parent)
    laser.rayCaster.set(getCorrectedPosition, controllerDirection())
    laser
  }

  /**
    * Get the real position of the controller!
    * The place I hide away half of the fix for the controllers in the floor issue.
    * Note: The other half in Environment.fakeOrigin
    */
  def getCorrectedPosition: Vector3 = {
    correctedPosition.set(
      controllerEl.position.x,
      controllerEl.position.y,
      controllerEl.position.z
    )
    // If the controllers appear to be above the user
    // by ~1.5 meters, comment out the next line.
    correctedPosition.add(yOffset)
    correctedPosition
  }

  protected def init(vrc: VRController, hexColor: Int): Unit = {
    Log.show("some controller is being setup...")
    controllerEl = vrc
    controllerMesh = createControllerMesh(hexColor)
    laser.construct(vrc.position, controllerDirection(), hexColor)
    vrc.add(laser.arrow)
    vrc.add(controllerMesh)
  }

  protected def controllerDirection(): Vector3 = {
    val matrix = new Matrix4()
    matrix.extractRotation(controllerEl.matrix)
    var direction = new Vector3(0, 0, 1)
    direction = direction.applyMatrix4(matrix).negate()
    direction
  }

  protected def createControllerMesh(color: Int): Mesh = {
    val controllerMaterial = new MeshBasicMaterial()
    controllerMaterial.color = new Color(color)
    val controllerMesh = new Mesh(
      new CylinderGeometry(0.005, 0.05, 0.1, 6),
      controllerMaterial)
    val handleMesh = new Mesh(
      new BoxGeometry(0.03, 0.1, 0.03),
      controllerMaterial)

    //controllerMaterial.flatShading = true;
    controllerMesh.rotation.x = -Math.PI / 2
    handleMesh.position.y = -0.05
    controllerMesh.add(handleMesh)
    controllerMesh
  }

  /**
    * All input event listeners that are shared
    * by the left and right Oculus controllers.
    *
    * If specializing an input for one of the controllers,
    * distribute the event listener to the setup method of
    * both OculusControllerLeft and OculusControllerRight.
    *
    * @param vrc VRController instance
    */
  protected def commonEvents(vrc: VRController, inputDevice: Dat.InputDevice): Unit = {

    // Primary Press - for selecting points! (requires thumbrest touch to be active)

    vrc.addEventListener(Primary_PressBegan, ((event: Event) => {
      Log("Primary Press Began")
      if (captured.isEmpty && capturedSeparation.isEmpty && laser.arrow.visible) selecting = true
    }).asInstanceOf[Any => Unit])

    vrc.addEventListener(Primary_PressEnded, ((event: Event) => {
      Log("Primary Press Ended")
      selecting = false
    }).asInstanceOf[Any => Unit])

    // Thumbrest Touch - for highlighting points!

    vrc.addEventListener(ThumbRest_TouchBegan, ((event: Event) => {
      Log("Thumbrest Touch Began")
      if (captured.isEmpty && capturedSeparation.isEmpty) laser.arrow.visible = true
    }).asInstanceOf[Any => Unit])

    vrc.addEventListener(ThumbRest_TouchEnded, ((event: Event) => {
      Log("Thumbrest Touch Ended")
      laser.arrow.visible = false
      selecting = false // Cannot be selecting without the rayCaster visible
    }).asInstanceOf[Any => Unit])

    // Attempting to grab object!

    //TODO: Operations on captured visualizations!?
    vrc.addEventListener(Grip_PressBegan, ((event: Event) => {
      Log("Grip Press Began")

      val regions = Regions.getNonEmpties
      val urc = updatedLaser.rayCaster.ray
      val intersections = updatedLaser.rayCaster.intersectObjects(Environment.instance.scene.children)
      Log.show(intersections)

      if(captured.isEmpty) {
        //inputDevice.gripped(true)
        for(i <- regions.indices) {
          val r = regions(i).object3D
          val controllerPos = getCorrectedPosition

          val sdf = urc.isIntersectionBox(new Box3(
            new Vector3(
              r.position.x - 0.5,
              r.position.y - 0.5,
              r.position.z - 0.5),
            new Vector3(
              r.position.x + 0.5,
              r.position.y + 0.5,
              r.position.z + 0.5)))

          if(r.position.distanceTo(controllerPos) < 0.5 || sdf) {
            if(r.parent == Environment.instance.scene) {
              // In this case, that region can be grabbed
              SceneUtils2.attach(r, Environment.instance.scene, vrc)
              captured = Some(r)
            }/* else {
              // That region has already been grabbed...
              // The value of the ratio of the updated distance between the controllers over
              // the current distance will be applied to the region as a scale.
              // This should appear to the user as stretching the plot.
              capturedSeparation = Some(OculusControllers.separationDistance())
            }*/
          }
        }
      }
    }).asInstanceOf[Any => Unit])

    // Releasing object (if holding)!

    vrc.addEventListener(Grip_PressEnded, ((event: Event) => {
      Log("Grip Press Ended")
      if (captured.nonEmpty) {
        val dropped = captured.get
        SceneUtils2.detach(dropped, vrc, Environment.instance.scene)
        captured = None
      } else { //if (capturedSeparation.nonEmpty) capturedSeparation = None
        //inputDevice.gripped(false)
      }
    }).asInstanceOf[Any => Unit])

    // Axes changed! - Currently no action

    Log.show("Adding event listener: Axes_Changes")

    vrc.addEventListener(Axes_Changed, ((event: AxesChangedEvent) => {
      Log.show("Axes Changed!")
      if(captured.nonEmpty) {
        Log.show("Holding something...")
        val heldObject = captured.get
        val axes = vrc.getAxes()
        if(scala.math.abs(axes(0)) > scala.math.abs(axes(1)))
          rotateAroundWorldAxis(heldObject, new Vector3(0, 1, 0), 2*axes(0)*scala.math.Pi/180)
        else
          rotateAroundWorldAxis(heldObject, new Vector3(1, 0, 0), 2*axes(1)*scala.math.Pi/180)
        // Rotate an object around an arbitrary axis in world space
        // src: https://stackoverflow.com/questions/11119753/how-to-rotate-a-object-on-axis-world-three-js
        def rotateAroundWorldAxis(object3D: Object3D, axis: Vector3, radians: Double) {
          var rotWorldMatrix = new Matrix4()
          rotWorldMatrix.makeRotationAxis(axis.normalize(), radians)
          object3D.matrix  = rotWorldMatrix.multiply(object3D.matrix)
          object3D.rotation.setFromRotationMatrix(object3D.matrix)
        }
      }
    }).asInstanceOf[Any => Unit])
  }

  /*protected def modifyCaptured(option: Boolean): Unit = {
    if (captured.isEmpty) return

    val cid = captured.get
    val env = Environment.instance

    for (r <- Regions.getNonEmpties) {
      if (r.object3D == cid) {
        val maybeAxes = r.maybeGetAxes()
        if (maybeAxes.nonEmpty) r.object3D.remove(maybeAxes.get)
        val newAxes = CoordinateAxes3D.create(1, color = Colors.White, centeredOrigin = true, planeGrids = option)
        r.addOrUpdateAxes(Some(newAxes))
      }
    }
  }*/

}

/**
  * Contains the name, event id's and setup method for the left Oculus Controller.
  * All event listeners for inputs to this controller are here.
  *
  * Can be thought of as a mapping from a subset of the available
  * inputs to interactions (see plots.Interactions).
  */
class OculusControllerLeft(vrc: VRController) extends OculusController {
  import OculusControllerLeft._
  setup()

  def setup(): Unit = {
    Log.show(s"$name Connected!")
    init(vrc, meshColorBlue)

    // Add this controller as an input device for Dat.GuiVR

    val inputDevice = Dat.GUIVR.addInputObject(vrc).asInstanceOf[Dat.InputDevice]
    Environment.instance.scene.add(inputDevice)

    // Setup events common to both controllers

    commonEvents(vrc, inputDevice)

    // Setup events unique for this controller

    var menuLeft: Object3D = new Object3D
    var menuOpen: Boolean = false
    var panels = Actions.getPanels(new Vector2(0.03, 0.03), 0.05, 0.05 to 0.15 by 0.05, 0.05 to 0.15 by 0.05)
    for(p <- panels) menuLeft.add(p.object3D)
    vrc.addEventListener(X_PressBegan, ((event: Event) => {
      Log("X Press Began")
      //modifyCaptured(true)
      if(!menuOpen) {
        vrc.add(menuLeft)
        menuLeft.lookAt(Environment.instance.camera.position.projectOnVector(vrc.position))
      } else vrc.remove(menuLeft)
      menuOpen = !menuOpen
      inputDevice.asInstanceOf[js.Dynamic].pressed(true)
    }).asInstanceOf[Any => Unit])

    vrc.addEventListener(X_PressEnded, ((event: Event) => {
      Log("X Press Ended")
      inputDevice.asInstanceOf[js.Dynamic].pressed(false)
    }).asInstanceOf[Any => Unit])

    vrc.addEventListener(Y_PressBegan, ((event: Event) => {
      Log("Y Press Began")
      //modifyCaptured(false)
    }).asInstanceOf[Any => Unit])

    vrc.addEventListener(Y_PressEnded, ((event: Event) => {
      Log("Y Press Ended")
    }).asInstanceOf[Any => Unit])
  }

  def update(): Unit = {
    controllerEl.update()
  }

}

/**
  * Contains the name, event id's and setup method for the right Oculus Controller.
  * All event listeners for inputs to this controller are here.
  *
  * Can be thought of as a mapping from a subset of the available
  * inputs to interactions (see plots.Interactions).
  */
class OculusControllerRight(vrc: VRController) extends OculusController {
  import OculusControllerRight._
  setup()

  def setup(): Unit = {
    Log.show(s"$name Connected!")
    init(vrc, meshColorRed)

    // Add this controller as an input device for Dat.GuiVR

    val inputDevice = Dat.GUIVR.addInputObject(vrc).asInstanceOf[Dat.InputDevice]
    Environment.instance.scene.add(inputDevice) //

    // Setup events common to both controllers

    commonEvents(vrc, inputDevice)

    // Setup events unique for this controller

    vrc.addEventListener(A_PressBegan, ((event: Event) => {
      Log("A Press Began")
      //modifyCaptured(true)
      inputDevice.asInstanceOf[js.Dynamic].pressed(true)
    }).asInstanceOf[Any => Unit])
    vrc.addEventListener(A_PressEnded, ((event: Event) => {
      Log("A Press Ended")
      inputDevice.asInstanceOf[js.Dynamic].pressed(false)
    }).asInstanceOf[Any => Unit])
    vrc.addEventListener(B_PressBegan, ((event: Event) => {
      Log("B Press Began")
      //modifyCaptured(false)
    }).asInstanceOf[Any => Unit])
    vrc.addEventListener(B_PressEnded, ((event: Event) => {
      Log("B Press Ended")
    }).asInstanceOf[Any => Unit])
  }

  def update(): Unit = controllerEl.update()

}

object OculusControllerRight {
  val name: String = "Oculus Touch (Right)"

  // Event ID's specific to the Right controller
  val A_PressBegan: String = "A press began"
  val A_PressEnded: String = "A press ended"
  val B_PressBegan: String = "B press began"
  val B_PressEnded: String = "B press ended"

  protected[OculusControllerRight] var instance: Option[OculusControllerRight] = None
  def isConnected: Boolean = instance.nonEmpty

  def setup(vrc: VRController): Unit = {
    if(instance.nonEmpty) Log.show(s"$name connected but the instance is nonempty")
    val controller: OculusControllerRight = new OculusControllerRight(vrc)
    instance = Some(controller)

    Log.show("Adding event listener: Disconnected")
    vrc.addEventListener(controller.Disconnected, ((event: Event) => {
      Log.show(s"$name Disconnecting...")
      controller.laser.destruct()
      vrc.remove(controller.controllerMesh)
      vrc.parent.remove(vrc)
      instance = None
      Log.show(s"$name Disconnected!")
    }).asInstanceOf[Any => Unit])
  }

  // get assumes you checked that it's connected!
  def get: OculusControllerRight = instance.get
}

object OculusControllerLeft {
  val name: String = "Oculus Touch (Left)"
  // Event ID's specific to the Left controller
  val X_PressBegan: String = "X press began"
  val X_PressEnded: String = "X press ended"
  val Y_PressBegan: String = "Y press began"
  val Y_PressEnded: String = "Y press ended"

  protected[OculusControllerLeft] var instance: Option[OculusControllerLeft] = None
  def isConnected: Boolean = instance.nonEmpty

  // get assumes you checked that it's connected!
  def get: OculusControllerLeft = instance.get

  def setup(vrc: VRController): Unit = {
    if(instance.nonEmpty) Log.show(s"$name connected but the instance is nonempty")
    val controller: OculusControllerLeft = new OculusControllerLeft(vrc)
    instance = Some(controller)

    Log.show("Adding event listener: Disconnected")
    vrc.addEventListener(controller.Disconnected, ((event: Event) => {
      Log.show(s"$name Disconnecting...")
      controller.laser.destruct()
      vrc.remove(controller.controllerMesh)
      vrc.parent.remove(vrc)
      instance = None
      Log.show(s"$name Disconnected!")
    }).asInstanceOf[Any => Unit])
  }

}