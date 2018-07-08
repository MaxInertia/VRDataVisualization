import org.scalajs
import scalajs.dom
import scalajs.threejs._
import window.Window
import facades.Dat
import facades.IFThree._
import util.Log
import viewable.Environment

/**
  * An abstraction over the users method of input.
  * Created by Dorian Thiessen on 2018-01-13.
  */
package object controls {
  // Oculus Controllers; [0: Left, 1: Right]
  var controllers: Array[VRController] = Array(null, null)

  def update(timeStamp: Double): Unit = {
    VRControllerManager.update()
    if(OculusControllerLeft.isConnected) OculusControllerLeft.update()
    if(OculusControllerRight.isConnected) OculusControllerRight.update()
  }

  type RayCaster = Raycaster
  private val rayCaster: RayCaster = new RayCaster() // Used for the mouse
  rayCaster.params.asInstanceOf[RaycasterParametersExt].Points.threshold = 0.015

  def getSelectionRayCaster(camera: => PerspectiveCamera): Option[RayCaster] = OculusControllers.getActiveRayCaster

  def setup(env: Environment): Unit = {
    Log("Controls Setup...")

    dom.window.addEventListener("vr controller connected", (event: SomeEvent) => {
      val controller: VRController = event.detail.asInstanceOf[VRController]

      if(controller.name == OculusControllerRight.name) {
        OculusControllerRight.setup(controller)
        controls.controllers(1) = controller
        env.fakeOrigin.add(controller)

      } else if(controller.name == OculusControllerLeft.name) {
        OculusControllerLeft.setup(controller)
        controls.controllers(0) = controller
        env.fakeOrigin.add(controller)

      } else Log("[Controls]\t Unknown controller passed on event: \"vr controller connected\"")
    })
  }
}
