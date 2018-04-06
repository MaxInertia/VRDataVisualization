import org.scalajs.{dom, threejs => THREE}
import util.TimedFunction1

object Resources {
  val Point_Textures: Array[String] = Array(
    "img/disc.png", // Low quality: 32x32
    "img/disc2.png", // Higher quality, but darker
    "img/orangeOrb.png", // High quality orange orb
    "img/blueOrb.png", // High quality blue orb
    "img/blackHole.png" // Black hole?
  )

  def loadPointTexture(onLoad: THREE.Texture => Unit, textureIndex: Int): Unit ={
    val timedCallback: TimedFunction1[THREE.Texture] = TimedFunction1(onLoad)
    timedCallback.setDescriptions("Loading the point texture",
                                   "Processing data and drawing the plots")
    new THREE.TextureLoader().load(Point_Textures(textureIndex), timedCallback)
  }
}
