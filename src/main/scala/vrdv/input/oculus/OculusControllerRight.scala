package vrdv.input.oculus

import facade.Dat
import facade.IFThree.VRController
import org.scalajs.dom.raw.Event
import util.Log
import vrdv.model.PlotterModelManager

/**
  * Right Oculus Controller.
  * @author Dorian Thiessen | MaxInertia
  */
class OculusControllerRight(vrc: VRController, val mc: PlotterModelManager) extends OculusController(vrc) {
  def name: String = RightControllerName
  def inputParser: PlotterModelManager = mc
  protected def myCID: Int = 1
  setup()

  def setup(): Unit = {
    Log.show(s"$name Connected!")

    // Create Controller Appearance
    val hexColor = meshColorWhite
    controllerMesh = createControllerMesh(hexColor)
    inputDetails.construct(vrc.position, getControllerDirection, hexColor, isRight = true)
    vrc.add(inputDetails.arrow)
    vrc.add(controllerMesh)

    // Add this controller as an input device for Dat.GuiVR
    val inputDevice = Dat.GUIVR.addInputObject(vrc).asInstanceOf[Dat.InputDevice]
    mc.addDatInput(inputDevice)

    // Setup events common to both controllers
    initCommonEventListeners(inputDevice)

    // Setup events unique for this controller

    // -- Unused inputs

    setEventListener(Input.Right.A_PressBegan, (event: Event) => {
      Log.show("A Press Began")
    })

    setEventListener(Input.Right.A_PressEnded, (event: Event) => {
      Log.show("A Press Ended")
    })

    setEventListener(Input.Right.B_PressBegan, (event: Event) => {
      Log.show("B Press Began")
    })

    setEventListener(Input.Right.B_PressEnded, (event: Event) => {
      Log.show("B Press Ended")
    })

    setEventListener(Input.Right.Thumbstick_PressBegan, (event: Event) => {
      Log.show("Right Thumbstick Button Pressed - event: " + event.`type`)
    })

    setEventListener(Input.Right.Thumbstick_PressEnded, (event: Event) => {
      Log.show("Right Thumbstick Button Pressed - event: " + event.`type`)
    })

    setEventListener(Input.Right.ThumbRest_TouchBegan, (event: Event) => {
      Log.show("Right Thumbrest Touch Began - event: " + event.`type`)
    })

    setEventListener(Input.Right.Thumbstick_PressBegan, (event: Event) => {
      Log.show("Right Thumbstick Button Pressed - event: " + event.`type`)
    })

    setEventListener(Input.Right.Thumbstick_PressEnded, (event: Event) => {
      Log.show("Right Thumbstick Button Pressed - event: " + event.`type`)
    })

    setEventListener(Input.Right.ThumbRest_TouchEnded, (event: Event) => {
      Log.show("Right Thumbrest Touch Ended - event: " + event.`type`)
    })

    setEventListener(Input.Right.A_TouchBegan, (event: Event) => {
      Log.show("A Touch Began - event: " + event.`type`)
    })

    setEventListener(Input.Right.A_TouchEnded, (event: Event) => {
      Log.show("A Touch Ended - event: " + event.`type`)
    })

    setEventListener(Input.Right.B_TouchBegan, (event: Event) => {
      Log.show("B Touch Began - event: " + event.`type`)
    })

    setEventListener(Input.Right.B_TouchEnded, (event: Event) => {
      Log.show("B Touch Ended - event: " + event.`type`)
    })

  }

  def update(): Unit = vrc.update()
}