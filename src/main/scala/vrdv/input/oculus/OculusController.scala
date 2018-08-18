package vrdv.input.oculus

import facade.Dat
import facade.IFThree.{AxesChangedEvent, ColorExt, VRController}
import org.scalajs.dom.raw.Event
import org.scalajs.threejs.{BoxGeometry, Color, CylinderGeometry, Matrix4, Mesh, MeshBasicMaterial, Object3D, Vector3}
import util.Log
import vrdv.input
import vrdv.input._
import vrdv.model.PlotterModelManager
import vrdv.obj3D.MotionOperations

import scala.scalajs.js

/**
  * Common traits of the left and right Oculus Controllers.
  * @author Dorian Thiessen
  */
abstract class OculusController(vrc: VRController) extends input.Device {
  // Color options for the controller mesh
  //val meshColorRed: Int = 0xFF0000
  //val meshColorBlue: Int = 0x0000FF
  val meshColorWhite: Int = 0xFFFFFF

  protected def myCID: Int
  protected var controllerMesh: Mesh = _
  var currentColor: String = "white"
  def currentColorIs(color: String): Boolean = currentColor == color
  def setControllerColor(color: String = "white"): Unit = {
    currentColor = color
    val newColor = new ColorExt(color)
    controllerMesh.material.asInstanceOf[MeshBasicMaterial].color = newColor
    laser.arrow.material.color = newColor
    controllerMesh.material.needsUpdate = true
    laser.arrow.material.needsUpdate = true
  }

  protected val laser: ActionLaser = new ActionLaser(this)
  protected var captured: Option[Object3D] = None

  protected var correctedPosition: Vector3 = new Vector3()
  protected var yOffset: Vector3 = new Vector3(0, 1.6, 0)

  def isConnected: Boolean = vrc != null
  def isSelecting: Boolean = isConnected && laser.arrow.visible && laser.clicking
  def isPointing: Boolean = laser.arrow != null && laser.arrow.visible

  def updatedLaser: ActionLaser = {
    // Adjust raycaster origin to account for fakeOrigin (The controllers parent)
    laser.rayCaster.set(getCorrectedPosition, getControllerDirection)
    laser
  }

  /**
    * Get the real position of the controller!
    * The place I hide away half of the fix for the controllers in the floor issue.
    * Note: The other half in Environment.fakeOrigin
    */
  def getCorrectedPosition: Vector3 = {
    correctedPosition.set(
      vrc.position.x,
      vrc.position.y,
      vrc.position.z
    )
    // If the controllers appear to be above the user
    // by ~1.5 meters, comment out the next line.
    correctedPosition.add(yOffset)
    correctedPosition
  }

  def name: String

  // TEMP
  def inputParser: PlotterModelManager

  def setEventListener(eventType: String, eventFn: Event => Unit): Unit =
    vrc.addEventListener(eventType, eventFn.asInstanceOf[Any => Unit])
  def setAxesEventListener(eventType: String, eventFn: AxesChangedEvent => Unit): Unit =
    vrc.addEventListener(eventType, eventFn.asInstanceOf[Any => Unit])

  protected def getControllerDirection: Vector3 = {
    val matrix = new Matrix4()
    matrix.extractRotation(vrc.matrix)
    var direction = new Vector3(0, 0, 1)
    direction = direction.applyMatrix4(matrix).negate()
    direction
  }

  protected def createControllerMesh(color: Int): Mesh = {
    val controllerMaterial = new MeshBasicMaterial()
    controllerMaterial.color = new Color(color)
    val controllerMesh = new Mesh(new CylinderGeometry(0.005, 0.05, 0.1, 6), controllerMaterial)
    val handleMesh = new Mesh(new BoxGeometry(0.03, 0.1, 0.03), controllerMaterial)
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
    */
  protected def initCommonEventListeners(inputDevice: Dat.InputDevice): Unit = {

    // Primary Press - for selecting points! (requires thumbrest touch to be active)

    /*setEventListener(Input.Primary_TouchBegan, (event: Event) => {
      Log("Primary Touch Began")
    })

    setEventListener(Input.Primary_TouchEnded, (event: Event) => {
      Log("Primary Touch Ended")
    })

    setEventListener(Input.Grip_TouchBegan, (event: Event) => {
      Log("Grip Touch Began")
    })

    setEventListener(Input.Grip_TouchEnded, (event: Event) => {
      Log("Grip Touch Ended")
    })*/

    /*setEventListener(Input.Primary_PressBegan, (event: Event) => {
      Log("Primary Press Began")
      inputDevice.pressed(true) // For DAT.GuiVR
      inputParser.passInput(new Point(vrc, myCID) {
        rc = laser
        magnitude = primaryValue(event.target)
        persist = true
      })
    })*/

    setEventListener(Input.Primary_ValueChanged, (event: Event) => {
      Log("Primary Value Changed")//; Log(event)
      val value = primaryValue(event.target)
      if(value > 0.05) {
        laser.arrow.visible = true
        inputDevice.pressed(true)
      } else {
        laser.arrow.visible = false
        inputDevice.pressed(false)
      }

      if(value < 0.95) {
        inputParser.passInput(new Point(vrc, myCID) {
          rc = laser
          magnitude = value
          persist = magnitude > 0.05
        })
      } else {
        inputParser.passInput(new Press(vrc, myCID) {
          rc = laser
          magnitude = value
          persist = true
        })
      }
    })

    /*setEventListener(Input.Primary_PressEnded, (event: Event) => {
      Log("Primary Press Ended")
      inputDevice.pressed(false)// For DAT.GuiVR
      val value: Double = primaryValue(event.target)
      inputParser.passInput(new Point(vrc, myCID) {
        rc = laser
        magnitude = value
        persist = false
      })
    })*/

    // Thumbrest Touch

    /*setEventListener(Input.ThumbRest_TouchBegan, (event: Event) => {
      Log("Thumbrest Touch Began")
      //if(captured.isEmpty) laser.arrow.visible = true
    })

    setEventListener(Input.ThumbRest_TouchEnded, (event: Event) => {
      Log("Thumbrest Touch Ended")
      //laser.arrow.visible = false
      //laser.clicking = false // Cannot be selecting without the rayCaster visible
    })*/

    // Attempting to grab object!

    /*setEventListener(Input.Grip_PressBegan, (event: Event) => {
      Log.show("Grip Press Began")

      inputParser.passInput(new Grab {
        source = vrc
        sourcePosition = correctedPosition
        rc = laser
      }) match {
        case NothingHappened => // ...
        case r: Result => captured = Some(r.object3D)
      }})*/

    // Releasing object (if holding)!

    setEventListener(Input.Grip_ValueChanged, (event: Event) => {
      Log("Grip Value Changed")//; Log(event)

      if(captured.isEmpty && event.asInstanceOf[js.Dynamic].value.asInstanceOf[Double] >= 0.5)
        inputParser.passInput(new Grab {
          source = vrc
          sourcePosition = correctedPosition
          rc = laser
        }) match {
          case NothingHappened => // ...
          case r: Result => captured = Some(r.object3D)
        }

      else if(captured.nonEmpty && event.asInstanceOf[js.Dynamic].value.asInstanceOf[Double] <= 0.5) {
        inputParser.passInput(new Drop {
          source = vrc
          target = captured.get
        }) match {
          case NothingHappened => // ...
          case r: Result => captured = None
        }
      }
    })

    /*setEventListener(Input.Grip_PressEnded, (event: Event) => {
      Log.show("Grip Press Ended")
      if (captured.nonEmpty) inputParser.passInput(new Drop {
        source = vrc
        target = captured.get
      }) match {
        case NothingHappened => // ...
        case r: Result => captured = None
      }
    })*/

    // Axes changed! - Currently no action

    Log.show("Adding event listener: Axes_Changes")

    setAxesEventListener(Input.Axes_Changed, (event: AxesChangedEvent) => {
      Log("Axes Changed!")
      if(captured.nonEmpty) {
        val heldObject = captured.get
        val axes = vrc.getAxes()
        if(scala.math.abs(axes(0)) > scala.math.abs(axes(1)))
          MotionOperations.rotateAroundWorldAxis(heldObject, new Vector3(0, 1, 0), 2*axes(0)*scala.math.Pi/180)
        else
          MotionOperations.rotateAroundWorldAxis(heldObject, new Vector3(1, 0, 0), 2*axes(1)*scala.math.Pi/180)
      }
    })
  } // end of initCommonEventListeners

}



