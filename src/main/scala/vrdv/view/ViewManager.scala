package vrdv.view

import facade.IFThree.{VRControllerManager, WEBVR, WebGLRendererExt}
import facade.Stats
import org.scalajs.dom
import org.scalajs.dom.raw.Element
import org.scalajs.dom.{Event, console, window}
import org.scalajs.threejs.{PerspectiveCamera, Renderer}
import util.Log
import vrdv.model.RenderRequirements

/**
  * View Controller
  * @author Dorian Thiessen | MaxInertia
  */
private[vrdv] class ViewManager(mc: RenderRequirements) extends SuppliesRenderer {
  Log.show("[ViewController - Constructor]")
  /*private */val renderer: WebGLRendererExt = new WebGLRendererExt()
  private val stats = new Stats()

  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.devicePixelRatio = window.devicePixelRatio
  renderer.vr.enabled = true
  renderer.vr.setAnimationLoop(render)

  def render(timestamp: Double): Unit = {
    stats.update()
    val (scene, camera) = mc.getRenderables // Request renderable model contents
    renderer.render(scene, camera) // Render scene from cameras POV
    //VRControllerM.update()
    VRControllerManager.update()
    mc.afterRender() // Inform model of render completion
  }

  def assignToContainer(container: dom.Element): Unit = {
    container.appendChild(renderer.domElement) // Add the scene to the container
    container.appendChild(stats.dom) // Add FPS stats to the container
    container.appendChild( WEBVR.createButton(renderer) ) // Append "ENTER VR" Button to DOM
  }

  // ===============================
  // ===( Trait Implementations )===
  // ===============================

  // # SuppliesRenderer
  override def passRendererTo[T](f: WebGLRendererExt => T): T = f(renderer)

}

object ViewManager {

  def apply(r: RenderRequirements, viewContainer: Element): ViewManager = {
    // Wraps rendering-specific objects and methods
    val view = new ViewManager(r)
    view.assignToContainer(viewContainer)

    // Get Camera instance for use in window event listeners
    val (_, camera: PerspectiveCamera) = r.getRenderables

    // Add window event listeners
    view.passRendererTo(resizeEventListener)(camera)
    //vc.passRendererTo(fullscreenEventListener)

    view
  }

  /**
   * Adds an event listener that modifies the content that
   * is rendered after the window has changed size.
   */
  private val resizeEventListener: Renderer => PerspectiveCamera => Unit =
    renderer => {
      camera => {
        window.addEventListener("resize", (e: Event) => {
          camera.aspect = window.innerWidth / window.innerHeight
          camera.updateProjectionMatrix
          renderer.setSize(window.innerWidth, window.innerHeight)
        })
        console.log("Camera supplied to resizeEventListener")
      }
        console.log("Renderer supplied to resizeEventListener")
    }

  /*private val fullscreenEventListener: Renderer => Unit = renderer => {
    document.getElementById("fullscreenButton").addEventListener("onclick", _ => {
      console.log("Fullscreen Requested.")
      val el = renderer.domElement.asInstanceOf[DomElementExt2]
      if(el.mozRequestFullScreen.asInstanceOf[Boolean]) {
        el.asInstanceOf[DomElementExt2].mozRequestFullScreen()
      } // Firefox
      else if(el.webkitRequestFullscreen.asInstanceOf[Boolean]) {
        el.asInstanceOf[DomElementExt2].webkitRequestFullscreen()
      } // Chrome
      else if(el.msRequestFullscreen.asInstanceOf[Boolean]) {
        el.asInstanceOf[DomElementExt2].msRequestFullscreen()
      } // Internet Explorer
      else if(el.requestFullscreen.asInstanceOf[Boolean])  {
        el.asInstanceOf[DomElementExt2].requestFullscreen()
      }})
    console.log("Renderer supplied to fullscreenEventListener")
  }*/
}