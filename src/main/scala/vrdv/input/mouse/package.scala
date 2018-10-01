package vrdv.input

import org.scalajs.dom.raw.MouseEvent
import org.scalajs.dom.window
import org.scalajs.threejs._
import vrdv.model.PlotterModelManager

/**
 * Created by Dorian Thiessen on 2018-09-29.
 */
package object mouse {
  object Instance extends Device {

    private var pmm: Option[PlotterModelManager] = None

    private val inputDetails: InputDetails = new InputDetails(this)
    inputDetails.constructNoHandedness()

    //private val raycaster: Raycaster = new Raycaster()

    private val mouse: Vector2 = new Vector2()
    private var clicked: Boolean = false

    def onDocumentMouseMove(event: MouseEvent): Unit = {
      event.preventDefault()
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
    }

    def onDocumentMouseClick(event: MouseEvent): Unit = {
      clicked = true
    }

    def getUpdatedRaycaster(camera: Camera): InputDetails = {
      inputDetails.rayCaster.setFromCamera(mouse, camera)
      inputDetails
    }

    def setPMM(pmm: PlotterModelManager): Unit =
      this.pmm = Some(pmm)

    def removePMM(): Unit =
      pmm = None

    def update(camera: Camera): Unit = {
      if (pmm.isEmpty) return
      if (clicked) {
        pmm.get.passInput(new Press(None, 0) {
          rc = getUpdatedRaycaster(camera)
          persist = true
        })
      } else {
        pmm.get.passInput(new Point(None, 0) {
          rc = getUpdatedRaycaster(camera)
          persist = true
        })
      }

      clicked = false
    }
  }
}
