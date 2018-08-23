package vrdv.input.oculus

import facade.Dat
import facade.IFThree.VRController
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
    inputDetails.construct(vrc.position, getControllerDirection, hexColor)
    vrc.add(inputDetails.arrow)
    vrc.add(controllerMesh)

    // Add this controller as an input device for Dat.GuiVR
    val inputDevice = Dat.GUIVR.addInputObject(vrc).asInstanceOf[Dat.InputDevice]
    mc.addDatInput(inputDevice)

    // Setup events common to both controllers
    initCommonEventListeners(inputDevice)

    // Setup events unique for this controller

    /* -- Unused inputs

    setEventListener(Input.Right.A_PressBegan, (event: Event) => {
      Log("A Press Began")
    })

    setEventListener(Input.Right.A_PressEnded, (event: Event) => {
      Log("A Press Ended")
    })

    setEventListener(Input.Right.B_PressBegan, (event: Event) => {
      Log("B Press Began")
    })

    setEventListener(Input.Right.B_PressEnded, (event: Event) => {
      Log("B Press Ended")
    })

    */

  }

  def update(): Unit = vrc.update()
}