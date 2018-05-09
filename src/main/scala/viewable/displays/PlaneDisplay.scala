package viewable.displays

import org.scalajs.threejs._

/**
  * A finite plane whose surface is an html canvas.
  * @param width  Width in scene-units (not pixels)
  * @param height Height in scene-units (not pixels)
  * Created by Dorian Thiessen on 2018-05-08.
  */
case class PlaneDisplay(width: Double, height: Double) extends Display {

  private val canvas: CanvasEl = createCanvas(1280, 1280)
  override protected def get2DGraphics: Graphics2D =
    canvas.getContext("2d")
          .asInstanceOf[Graphics2D]

  val object3D: Mesh = {
    val cTexture: Texture = new Texture(canvas)
    cTexture.minFilter = THREE.NearestFilter // Alternative: LinearFilter
    cTexture.magFilter = THREE.NearestFilter

    val material = new MeshBasicMaterial()
    material.side = THREE.DoubleSide
    material.map = cTexture
    material.map.needsUpdate = true

    val mesh = new Mesh(
      new PlaneGeometry(width, height),
      material)
    mesh.position.set(0, 0, 0)
    mesh
  }

}
