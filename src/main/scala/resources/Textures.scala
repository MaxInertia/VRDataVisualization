package resources

import resources.Res.Texture

private[resources] object Textures {

  // If not texture is specified when creating points, the first is used.
  val defaultPointTextureID: Int = 0

  var lastLoadedTexture: Int = -1

  // Point texture ID corresponds to index into this array.
  val pointTextureDirs: Array[String] = Array(
    "img/disc.png", // Low quality: 32x32
    "img/disc2.png", // Higher quality, but darker
    "img/orangeOrb.png", // High quality orange orb
    "img/blueOrb.png", // High quality blue orb
    "img/blackHole.png" // Black hole?
  )

  private var loadedTextures: Map[Int, Texture] = Map()
  val contains: Int => Boolean = loadedTextures.contains
  def add(i: Int, texture: Texture): Unit = {
    lastLoadedTexture = i
    loadedTextures += (i -> texture)
  }
  def get(i: Int): Texture = loadedTextures(i)
}
