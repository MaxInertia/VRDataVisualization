package resources

private[resources] object Textures {

  // If not texture is specified when creating points, the first is used.
  val defaultPointTextureID: Int = 0
  // Point texture ID corresponds to index into this array.
  val points: Array[String] = Array(
    "img/disc.png", // Low quality: 32x32
    "img/disc2.png", // Higher quality, but darker
    "img/orangeOrb.png", // High quality orange orb
    "img/blueOrb.png", // High quality blue orb
    "img/blackHole.png" // Black hole?
  )

}
