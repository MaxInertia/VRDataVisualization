import facades.IFThree.{DomElementExt, DomElementExt2, WebGLRendererExt}
import facades.Stats
import org.scalajs.dom
import viewable.Environment

import scala.scalajs.js
import js.JSConverters._

/**
  * Created by Dorian Thiessen on 2018-07-11.
  */
object Rendering {
  def start(env: Environment, stats: Stats): Unit = {
    val r = env.renderer.asInstanceOf[WebGLRendererExt]
    r.setAnimationLoop(renderNonVR)
    r.vr.setAnimationLoop(renderVR)

    // The render loop when using a VR headset.
    def renderVR(timestamp: Double): Unit = {
      controls.update()
      env.render()
      stats.update()
    }

    // The render loop when using a standard monitor.
    def renderNonVR(timestamp: Double): Unit = {
      controls.update()
      env.render()
      stats.update()
    }
  }

  def enterFullscreen(el: DomElementExt2): Unit = {
    dom.console.log("enterFullscreen!")

    if ((el.requestFullscreen _).asInstanceOf[Boolean])  {
      dom.console.log("Generic!")
      el.asInstanceOf[DomElementExt2].requestFullscreen()
      return
    }
    if ((el.mozRequestFullScreen _).asInstanceOf[Boolean]) {
      dom.console.log("FireFox!")
      el.asInstanceOf[DomElementExt2].mozRequestFullScreen()
      return
    } // Firefox
    if ((el.webkitRequestFullscreen _).asInstanceOf[Boolean]) {
      el.asInstanceOf[DomElementExt2].webkitRequestFullscreen()
      return
    } // Chrome
    if ((el.msRequestFullscreen _).asInstanceOf[Boolean]) {
      el.asInstanceOf[DomElementExt2].msRequestFullscreen()
      return
    } // Internet Explorer
  }
}
