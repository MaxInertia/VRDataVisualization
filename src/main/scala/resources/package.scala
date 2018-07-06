import org.scalajs.{threejs => THREE}
import scala.concurrent.{Future, Promise}
import scala.scalajs.js
import scala.util.Try
import js.JSConverters._

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

    def textureIsLoaded(i: Int): Boolean = Textures.contains(i)

    def getTexture(i: Int): Texture = Textures.get(i)

    def getLastLoadedTextureID: Int = Textures.lastLoadedTexture

    def loadPointTexture(i: Int): Future[Texture] = {
      import scala.concurrent.ExecutionContext.Implicits.global
      // If we have already loaded this texture, don't load it again, just return it
      if(Textures.contains(i)) {
        Future[Texture]{ Textures.get(i) }

      } else { // We haven't loaded the requested texture yet
        val promise: Promise[Texture] = Promise()
        val timedCallback = new TimedFunction1[Texture](
          (texture: Texture) => {
            Textures.add(i, texture)
            promise.complete(Try(texture))
          })
        timedCallback.setDescriptions(Some("Loading the texture"), None)
        new THREE.TextureLoader().load(
          Textures.pointTextureDirs(i),
          timedCallback
        )
        promise.future
      }
    }
  }

}
