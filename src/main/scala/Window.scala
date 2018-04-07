import org.scalajs.{dom, threejs => THREE}
import org.scalajs.dom.raw.MouseEvent
import org.scalajs.dom.{Event, document, window}

/**
  * Created by Dorian Thiessen on 2018-01-11.
  */
object Window {

  def width: Double = dom.window.innerWidth
  def height: Double = dom.window.innerHeight
  def aspectRatio: Double = width / height
  def devicePixelRatio: Double = dom.window.devicePixelRatio

  /** Event listeners on the Window are defined and set here. */
  def setupEventListeners(camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer): Unit = {
    window.addEventListener("resize", (e: Event) => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix
      renderer.setSize(window.innerWidth, window.innerHeight)
    })

    // Add additional event listeners that require no more than the Camera or Renderer here
  }

  def setupMouseEventListener(mouse: THREE.Vector2): Unit = {
    document.addEventListener("mousemove", (event: MouseEvent) => {
      mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1
      mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1
      //dom.console.log("("+ mouse.x +", "+ mouse.y +")") // To check if event is firing
    })
  }

  // Add event listeners that require more than the Camera and Renderer here
}
