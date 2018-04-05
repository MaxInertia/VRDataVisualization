import org.scalajs.{dom, threejs => THREE}
import util.TimedFunction1

import scala.scalajs.js.Date

object Resources {
  val Point_Texture_Dir: String = "img/disc.png"

  def loadPointTexture(onLoad: THREE.Texture => Unit): Unit ={
    val timedCallback: TimedFunction1[THREE.Texture] = TimedFunction1(onLoad)
    timedCallback.setDescriptions("Loading the point texture",
                                   "Processing data and drawing the plots")
    new THREE.TextureLoader().load(Point_Texture_Dir, timedCallback)
    //new THREE.TextureLoader().load(Point_Texture_Dir, onLoad) // only req line if not timing
  }

}
