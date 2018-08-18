package vrdv.input

import facade.IFThree.{SomeEvent, VRController}
import org.scalajs.dom
import org.scalajs.dom.raw.Event
import util.Log
import vrdv.model.PlotterModelManager
import oculus._
import vrdv.view.ViewManager

import scala.scalajs.js

/**
  * Input Controller
  * @author Dorian Thiessen | MaxInertia
  */
class DeviceConnectionManager(mc: PlotterModelManager) {
  Log.show("[InputController - Constructor]")

  // Oculus Controllers; [0: Left, 1: Right]
  var controllers: Array[OculusController] = Array(null, null)

  dom.window.addEventListener("vr controller connected", (event: SomeEvent) => {
    val controller: VRController = event.detail.asInstanceOf[VRController]
    Log.show(s"Controller Connected: ${controller.name}")

    mc.passInput(new Connect(){vrc = controller})
    //controller.standingMatrix = ViewManager.instance.renderer.vr.getStandingMatrix()

    if(controller.name == oculus.LeftControllerName)
      controllers(0) = new OculusControllerLeft(controller, mc) // TODO: Handle disconnect here so we can remove these references
    else if(controller.name == oculus.RightControllerName)
      controllers(1) = new OculusControllerRight(controller, mc)
    else {
      Log.show("[Controls]\t Unknown controller passed on event: \"vr controller connected\"")
      Log.show(controller)
    }
  })

  Log.show("Adding event listener: Disconnected")
  dom.window.addEventListener(Input.Disconnected, (event: Event) => {
    Log.show(s"!!!!!!!!!!! Input.Disconnected (${Input.Disconnected}) EVENT FIRED !!!!!!!!!!!!!!!!!!!!!!")
    Log.show(event)
    //Log.show(s"${controllers(i).name} Disconnecting...")
    //controllers(i).laser.destruct()
    //vrc.remove(controller.controllerMesh)
    //controller.parent.remove(controller)
    //Log.show(s"${controllers(i).name} Disconnected!")
    //controllers(i) = null
  })

  Log.show("[InputController - End]")
}
