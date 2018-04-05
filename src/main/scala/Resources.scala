import org.scalajs.{threejs => THREE}

object Resources {
  val Point_Texture_Dir: String = "img/disc.png"

  def loadPointTexture(onLoad: THREE.Texture => Unit): Unit ={
    new THREE.TextureLoader().load(Point_Texture_Dir, onLoad)
  }
}
