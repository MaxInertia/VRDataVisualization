package vrdv.input

import facade.IFThree.RaycasterParametersExt
import org.scalajs.dom.raw.MouseEvent
import org.scalajs.dom.window
import org.scalajs.threejs._
import vrdv.model.PlotterModelManager

/**
 * Created by Dorian Thiessen on 2018-09-29.
 */
package object mouse {
  private var pmm: Option[PlotterModelManager] = None

  private val inputDetails: InputDetails = {
    val inputDetails = new InputDetails(null)
    inputDetails.rayCaster = new Raycaster()
    inputDetails.rayCaster.params.asInstanceOf[RaycasterParametersExt].Points.threshold = 0.01
    var material = new LineBasicMaterial()
    material.color.setHex(0xFFFFFF)
    val geometry = new Geometry()
    geometry.vertices.push(new Vector3(0, 0, -1))
    geometry.vertices.push(new Vector3(0, 0, 0))
    geometry.vertices.push(new Vector3(0, 0, 0))
    inputDetails.arrow = new Line(geometry, material)
    inputDetails.arrow.material.transparent = true
    inputDetails.arrow.material.opacity = 0.5
    inputDetails.arrow.visible = false
    inputDetails
  }

  //private val raycaster: Raycaster = new Raycaster()

  private var mouse: Vector2 = new Vector2()
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
    if(pmm.isEmpty) return
    pmm.get.passInput(new Point(None, 0) {
      rc = getUpdatedRaycaster(camera)
      persist = clicked
    })

    clicked = !clicked
  }
}
