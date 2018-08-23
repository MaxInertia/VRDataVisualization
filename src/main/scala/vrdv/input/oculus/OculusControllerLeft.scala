package vrdv.input.oculus

import facade.Dat
import facade.IFThree.VRController
import util.Log
import vrdv.model.PlotterModelManager


/**
  * Left Oculus Controller.
  * @author Dorian Thiessen | MaxInertia
  */
class OculusControllerLeft(vrc: VRController, val mc: PlotterModelManager) extends OculusController(vrc) {
  def name: String = LeftControllerName
  def inputParser: PlotterModelManager = mc
  protected def myCID: Int = 0
  setup()

  def setup(): Unit = {
    Log.show(s"$name Connected!")

    // Create Controller Appearance
    val hexColor = meshColorWhite
    controllerMesh = createControllerMesh(hexColor)
    inputDetails.construct(vrc.position, getControllerDirection, hexColor, isRight = false)
    vrc.add(inputDetails.arrow)
    vrc.add(controllerMesh)

    // Add this controller as an input device for Dat.GuiVR
    val inputDevice = Dat.GUIVR.addInputObject(vrc).asInstanceOf[Dat.InputDevice]
    mc.addDatInput(inputDevice)

    // Setup events common to both controllers
    initCommonEventListeners(inputDevice)

    // Setup events unique for this controller

    /* -- Unused inputs

    setEventListener(Input.Left.X_PressBegan, (event: Event) => {
      Log("X Press Began")
    })

    setEventListener(Input.Left.X_PressEnded, (event: Event) => {
      Log("X Press Ended")
    })

    setEventListener(Input.Left.Y_PressBegan, (event: Event) => {
      Log("Y Press Began")
    })

    setEventListener(Input.Left.Y_PressEnded, (event: Event) => {
      Log("Y Press Ended")
    })

    */

  }

  def update(): Unit = vrc.update()
}
