package vrdv.view

import facade.IFThree._
import facade.Stats
import org.scalajs.dom
import org.scalajs.dom.raw.Element
import org.scalajs.dom.{Event, window}
import org.scalajs.threejs.{PerspectiveCamera, Renderer}
import util.Log
import vrdv.input.mouse
import vrdv.model.RenderRequirements

/**
  * View Controller
  * @author Dorian Thiessen | MaxInertia
  */
private[vrdv] class ViewManager(mc: RenderRequirements) extends SuppliesRenderer {
  Log.show("[ViewManager - Constructor]")
  val renderer: WebGLRendererExt = new WebGLRendererExt()
  private val stats = new Stats()

  // ========== Temporary
  val (scene, camera) = mc.getRenderables
  val fpcontrols: FirstPersonVRControls = new FirstPersonVRControls(camera, scene)
  // ==========

  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.devicePixelRatio = window.devicePixelRatio

  //Comment out the next line to use keyboard controls in browser - VR will not work
  //renderer.vr.enabled = true
  renderer.vr.setAnimationLoop(renderVR)
  dom.window.requestAnimationFrame(renderNonVR)

  def render(timestamp: Double): Unit = {
    val (scene, camera) = mc.getRenderables // Request renderable model contents
    renderer.render(scene, camera)          // Render scene from cameras POV
    mc.afterRender()                        // Post-render actions
    stats.update()
  }

  def renderVR(timestamp: Double): Unit = {
    VRControllerManager.update()
    render(timestamp)
  }

  def renderNonVR(timestamp: Double): Unit = {
    render(timestamp)
    fpcontrols.update(timestamp)
    mouse.Instance.update(camera)
    dom.window.requestAnimationFrame(renderNonVR)
  }

  def assignToContainer(container: dom.Element): Unit = {
    container.appendChild(renderer.domElement)            // Add the scene to the container
    container.appendChild(stats.dom)                      // Add FPS stats to the container
    container.appendChild( WEBVR.createButton(renderer) ) // Append "ENTER VR" Button to DOM
  }

  override def passRendererTo[T](f: WebGLRendererExt => T): T = f(renderer)
}

object ViewManager {

  def apply(r: RenderRequirements, viewContainer: Element): ViewManager = {
    val view = new ViewManager(r)                            // Wraps rendering-specific objects and methods
    view.assignToContainer(viewContainer)
    val (_, camera: PerspectiveCamera) = r.getRenderables    // Get Camera instance for use in window event listeners
    view.passRendererTo(resizeEventListener)(camera)         // Add window event listeners
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
        //console.log("Camera supplied to resizeEventListener")
      }
      //console.log("Renderer supplied to resizeEventListener")
    }

}