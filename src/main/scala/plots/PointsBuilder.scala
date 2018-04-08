package plots

import org.scalajs.{dom, threejs => THREE}
import scala.scalajs.js
import scala.scalajs.js.typedarray.Float32Array
import js.JSConverters._

import plots.PointsBuilder.Prop._
import plots.PointsBuilder.{Component, makePoints}
import plots.Plot.PARTICLE_SIZE
import plots.PointsBuilder.Prop.CleanPlot

/**
  * Created by Dorian Thiessen on 2018-04-06.
  */
class PointsBuilder[Props <: Component] private(xs: Array[Double], ys: Array[Double], zs: Array[Double],
                                                textureID: Int = 0, hue: Option[Double] = None) {

  // Methods for adding the various coordinate values to the builder.
  def withXS(xValues: Array[Double]): PointsBuilder[Props with XCoordSet] =
    new PointsBuilder[Props with XCoordSet](xValues, ys, zs, textureID, hue)
  def withYS(yValues: Array[Double]): PointsBuilder[Props with YCoordSet] =
    new PointsBuilder[Props with YCoordSet](xs, yValues, zs, textureID, hue)
  def withZS(zValues: Array[Double]): PointsBuilder[Props with ZCoordSet] =
    new PointsBuilder[Props with ZCoordSet](xs, ys, zValues, textureID, hue)

  // Method for adding the textureID of the desired point texture.
  def usingTexture(textureIDin: Int): PointsBuilder[Props with Texture] =
    new PointsBuilder[Props with Texture](xs, ys, zs, textureIDin, hue)

  // If set, the hue of each successive point will shift slightly, starting at this value
  def usingHue(hueIn: Option[Double]): PointsBuilder[Props] =
    new PointsBuilder[Props](xs, ys, zs, textureID, hueIn)

  def build3D(): Points = {
    val vertices: Array[Coordinate] = Plot.zip3(xs, ys, zs)
    makePoints(vertices, hue, textureID)
  }
}

object PointsBuilder{
  type Triple = (Double, Double, Double)

  sealed trait Component
  object Prop {
    sealed trait CleanPlot extends Component
    sealed trait XCoordSet extends Component
    sealed trait YCoordSet extends Component
    sealed trait ZCoordSet extends Component
    sealed trait Texture   extends Component // If not required, can be removed.
    type Buildable2DPlot = CleanPlot with XCoordSet with YCoordSet
    type Buildable3DPlot = CleanPlot with XCoordSet with YCoordSet with ZCoordSet
  }

  def apply(): PointsBuilder[CleanPlot] = new PointsBuilder[CleanPlot](
    null,
    null,
    null)

  private def makePoints(coordinates: Array[Coordinate], hue: Option[Double], textureIndex: Int): THREE.Points = {
    val vertices = makeVertices(coordinates)
    val (geometry, minimums, maximums) = makeGeometry(vertices, hue)
    val points = new THREE.Points(geometry, makeShaderMaterial(textureIndex))
    points.receiveShadow = false
    points.castShadow = false
    // The amount to scale the points so they fit within a 1x1x1 cube.
    val xScale = scala.math.abs(maximums._1 - minimums._1)
    val yScale = scala.math.abs(maximums._2 - minimums._2)
    val zScale = scala.math.abs(maximums._3 - minimums._3)
    // Apply the scale.
    points.scale.x /= xScale
    points.scale.y /= yScale
    points.scale.z /= zScale
    // Find center of points.
    val centerX = (maximums._1 + minimums._1) / (2 * xScale)
    val centerY = (maximums._2 + minimums._2) / (2 * yScale)
    val centerZ = (maximums._3 + minimums._3) / (2 * zScale)
    // Align the points center with it's parents center.
    points.translateX(-centerX)
    points.translateY(-centerY)
    points.translateZ(-centerZ)
    points.matrixWorldNeedsUpdate = true
    points
  }

  private def makeVertices(coordinates: Array[Coordinate]): Array[THREE.Vector3] =
    coordinates.map{case (x, y, z) => new THREE.Vector3(x, y, z)}

  private def makeShaderMaterial(textureIndex: Int) : THREE.PointsMaterial = {
    dom.console.log("\tCreating SM material")

    val myVertexShader = dom.document.getElementById("vertexshader").textContent
    val myFragmentShader = dom.document.getElementById("fragmentshader").textContent

    val params: THREE.ShaderMaterialParameters = new js.Object().asInstanceOf[THREE.ShaderMaterialParameters]
    params.fragmentShader = myFragmentShader
    params.vertexShader = myVertexShader
    params.uniforms = new js.Object {
      val color: js.Object = new js.Object {
        val value: THREE.Color = new THREE.Color(Color.WHITE)
      }
      val texture: js.Object = new js.Object {
        val value: THREE.Texture = resources.Res.getTexture(textureIndex)
      }
    }
    params.alphaTest = 0.5

    val material = new THREE.ShaderMaterial(params)
    material.asInstanceOf[THREE.PointsMaterial]
  }

  private def makeGeometry(vertices: Array[THREE.Vector3], hueShift: Option[Double]): (THREE.BufferGeometry, Triple, Triple) = {
    val positions = new Float32Array( vertices.length * 3 )
    val colors = new Float32Array( vertices.length * 3 )
    val sizes = new Float32Array( vertices.length )

    val l: Double = vertices.length
    val color = new THREE.Color()
    if(hueShift.isEmpty) color.setRGB(255,255,255)

    var vertex: THREE.Vector3 = null

    var maxX = -Double.MaxValue
    var maxY = -Double.MaxValue
    var maxZ = -Double.MaxValue
    var minX = Double.MaxValue
    var minY = Double.MaxValue
    var minZ = Double.MaxValue

    for ( i <- vertices.indices) {
      vertex = vertices(i)

      positions(3*i)     = vertex.x.toFloat
      if(vertex.x > maxX) maxX = vertex.x
      if(vertex.x < minX) minX = vertex.x

      positions(3*i + 1) = vertex.y.toFloat
      if(vertex.y > maxY) maxY = vertex.y
      if(vertex.y < minY) minY = vertex.y

      positions(3*i + 2) = vertex.z.toFloat
      if(vertex.z > maxZ) maxZ = vertex.z
      if(vertex.z < minZ) minZ = vertex.z

      if(hueShift.nonEmpty) color.setHSL(hueShift.get + 0.1 * (i / l), 1.0, 0.5)
      colors(3 * i) = color.r.toFloat
      colors(3 * i + 1) = color.g.toFloat
      colors(3 * i + 2) = color.b.toFloat

      sizes(i) = PARTICLE_SIZE.toFloat
    }
    dom.console.log("Largest values:")
    dom.console.log(s"\tx: $maxX")
    dom.console.log(s"\ty: $maxY")
    dom.console.log(s"\tz: $maxZ")
    dom.console.log("Smallest values:")
    dom.console.log(s"\tx: $minX")
    dom.console.log(s"\ty: $minY")
    dom.console.log(s"\tz: $minZ")

    val geometry = new THREE.BufferGeometry()
    geometry.vertices = vertices.toJSArray
    geometry.addAttribute( "position", new THREE.BufferAttribute( positions, 3 ) )
    geometry.addAttribute( "customColor", new THREE.BufferAttribute( colors, 3 ) )
    geometry.addAttribute( "size", new THREE.BufferAttribute( sizes, 1 ) )
    (geometry, (minX, minY, minZ), (maxX, maxY, maxZ))
  }

}