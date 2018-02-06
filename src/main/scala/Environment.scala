import org.scalajs.{threejs => THREE}
import org.scalajs.dom

/**
  * Created by Dorian Thiessen on 2018-01-11.
  */
class Environment(val scene: THREE.Scene, val camera: THREE.PerspectiveCamera, val renderer: THREE.WebGLRenderer) {
  def render(): Unit = renderer.render(scene, camera)
}

object Environment {
  def setup(container: dom.Element): Environment = {
    println("Environment Setup...")

    // Create Scene; This is the 'scene' visible to the user.
    val scene = new THREE.Scene()
    println("\tCreated Scene")

    // Create Camera & add it to the Scene; This is the perspective through which the user views the scene.
    val camera = new THREE.PerspectiveCamera(
      65,  // Field of view
      dom.window.innerWidth / dom.window.innerHeight, // Aspect Ratio
      0.01, // Nearest distance visible
      20000) // Farthest distance visible
    scene.add(camera)
    println("\tCreated Camera, added to the Scene")

    // Create Renderer & add it to dom.document
    val renderer = new THREE.WebGLRenderer()
    renderer.setSize(dom.window.innerWidth, dom.window.innerHeight)
    renderer.devicePixelRatio = dom.window.devicePixelRatio
    container.appendChild(renderer.domElement)
    println("\tCreated Renderer, added to DOM")

    temp(scene) // TODO: Remove this function

    new Environment(scene, camera, renderer)
  }

  def temp(scene: THREE.Scene): Unit = {
    var light = new THREE.DirectionalLight(0xffffff)
    light.position.set(1, 1, 1).normalize()
    scene.add(light)

    val cubeGeo = new THREE.BoxGeometry( 1, 1, 1 )
    val cubeMaterial = new THREE.MeshBasicMaterial() { color = new THREE.Color(0x11ffff) }
    val cube = new THREE.Mesh( cubeGeo, cubeMaterial )
    cube.position.y = 0
    cube.position.z = -2
    cube.position.x = 0
    scene.add( cube )
  }
}