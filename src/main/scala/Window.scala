package window

import env.{Environment, Regions}
import org.scalajs.{dom, threejs => THREE}
import org.scalajs.dom.raw.MouseEvent
import org.scalajs.dom.{Event, document, window}
import util.Log

/**
  * Event listeners on the Window are defined and set here.
  * Created by Dorian Thiessen on 2018-01-11.
  */
object Window {

  def width: Double = dom.window.innerWidth
  def height: Double = dom.window.innerHeight
  def aspectRatio: Double = width / height
  def devicePixelRatio: Double = dom.window.devicePixelRatio

  def setupEventListeners(camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer): Unit = {
    window.addEventListener("resize", (e: Event) => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix
      renderer.setSize(window.innerWidth, window.innerHeight)
    })

    // Add additional event listeners that require no more than the Camera and Renderer here

  }

  // Add event listeners that require more than the Camera and Renderer here

  def setupEventListener_MouseMove(mouse: THREE.Vector2): Unit = {
    document.addEventListener("mousemove", (event: MouseEvent) => {
      mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1
      mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1
      //Log("("+ mouse.x +", "+ mouse.y +")") // To check if event is firing
    })
  }

  def setupEventListener_MouseDoubleClick(mouse: THREE.Vector2, env: Environment): Unit = {
    document.addEventListener("dblclick", (event: MouseEvent) => {

      //This nesting is a nightmare
      for(r <- Regions.getNonEmpties if r.plot.nonEmpty) {
        val plot = r.plot.get
        if(plot.highlighted.nonEmpty && plot.savedSelections.contains(plot.highlighted.get)) {
          r.plot.get.ops.deselectHighlighted()
        } else {
          r.plot.get.ops.selectHighlighted()
        }
      }

      Log("Mouse double clicked!") // To check if event is firing
    })
  }

}
