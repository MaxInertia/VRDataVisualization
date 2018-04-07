import org.scalajs.dom.ext.LocalStorage
import org.scalajs.{threejs => THREE}
import util.TimedFunction1

/**
  * This package handles resource loading. For simplicity every object in this
  * package is private to this package with the exception of those in this file.
  *
  * Created by Dorian Thiessen on 2018-04-06.
  */
package object resources {

  object Res {
    type Texture = THREE.Texture

    def loadPointTexture(onLoad: Texture => Unit, textureIndex: Int): Unit = {
      val timedCallback: TimedFunction1[Texture] = TimedFunction1(onLoad)
      timedCallback.setDescriptions("Loading the point texture",
        "Processing data and drawing the plots")
      new THREE.TextureLoader().load(Textures.points(textureIndex), timedCallback)
    }
  }

  object BrowserStorage {
    /** A tuple containing the ID and values of a column */
    type CSVColumn[T] = (String, Array[T])

    def timeSeriesFromCSV(localStorageID: String): Option[Array[CSVColumn[Double]]] = {
      LocalStorage(localStorageID).map(CSVParser.parse)
    }
  }

}
