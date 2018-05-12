package viewable.plots

import math.ScaleCenterProperties
import org.scalajs.dom
import org.scalajs.threejs._

import scala.scalajs.js
import scala.scalajs.js.typedarray.Float32Array
import js.JSConverters._
import viewable.plots.PointsBuilder.Prop._
import viewable.plots.PointsBuilder.{Component, makePoints}
import viewable.plots.Plot.PARTICLE_SIZE
import viewable.plots.PointsBuilder.Prop.CleanPlot
import util.Log

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
  def usingTexture(textureIDin: Int): PointsBuilder[Props with Textured] =
    new PointsBuilder[Props with Textured](xs, ys, zs, textureIDin, hue)

  // If set, the hue of each successive point will shift slightly, starting at this value
  def usingHue(hueIn: Option[Double]): PointsBuilder[Props] =
    new PointsBuilder[Props](xs, ys, zs, textureID, hueIn)

  def build3D(): (Points, ScaleCenterProperties) = {
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
    sealed trait Textured  extends Component // If not required, can be removed.
    type Buildable2DPlot = CleanPlot with XCoordSet with YCoordSet
    type Buildable3DPlot = CleanPlot with XCoordSet with YCoordSet with ZCoordSet
  }

  def apply(): PointsBuilder[CleanPlot] = new PointsBuilder[CleanPlot](
    null,
    null,
    null)

  private def makePoints(coordinates: Array[Coordinate], hue: Option[Double], textureIndex: Int): (Points, ScaleCenterProperties) = {
    val vertices = makeVertices(coordinates)
    val (geometry, minimums, maximums) = makeGeometry(vertices, hue)
    val points = new Points(geometry, makeShaderMaterial(textureIndex))
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

    Log.show(s"xCenter: $centerX\nxScale: $xScale")

    // Align the points center with it's parents center.
    points.translateX(-centerX)
    points.translateY(-centerY)
    points.translateZ(-centerZ)
    points.matrixWorldNeedsUpdate = true
    (points, ScaleCenterProperties(xScale, yScale, zScale, centerX, centerY, centerZ))
  }

  private def makeVertices(coordinates: Array[Coordinate]): Array[Vector3] =
    coordinates.map{case (x, y, z) => new Vector3(x, y, z)}

  private def makeShaderMaterial(textureIndex: Int) : PointsMaterial = {
    Log("[PointsBuilder] - Creating Shader Material")

    val myVertexShader = dom.document.getElementById("vertexshader").textContent
    val myFragmentShader = dom.document.getElementById("fragmentshader").textContent

    val params: ShaderMaterialParameters = new js.Object().asInstanceOf[ShaderMaterialParameters]
    params.fragmentShader = myFragmentShader
    params.vertexShader = myVertexShader
    params.alphaTest = 0.5
    params.uniforms = new js.Object {
      val color: js.Object = new js.Object {
        val value: Color = viewable.Colors.White
      }
      val texture: js.Object = new js.Object {
        val value: Texture = resources.Res.getTexture(textureIndex)
      }
    }

    val material = new ShaderMaterial(params)
    material.asInstanceOf[PointsMaterial]
  }

  private def makeGeometry(vertices: Array[Vector3], hueShift: Option[Double]): (BufferGeometry, Triple, Triple) = {
    Log("[PointsBuilder] - Creating Buffer Geometry")

    val positions = new Float32Array(vertices.length * 3)
    val colors = new Float32Array(vertices.length * 3)
    val sizes = new Float32Array(vertices.length)

    val color = new Color()
    if(hueShift.isEmpty) color.setRGB(255, 255, 255)

    var maxX = -Double.MaxValue
    var maxY = -Double.MaxValue
    var maxZ = -Double.MaxValue
    var minX = Double.MaxValue
    var minY = Double.MaxValue
    var minZ = Double.MaxValue

    val l: Double = vertices.length
    for ( i <- vertices.indices) {
      val vertex = vertices(i)

      positions(3*i) = vertex.x.toFloat
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

    showMinMax(minX, maxX, minY, maxY, minZ, maxZ)

    val geometry = new BufferGeometry()
    geometry.vertices = vertices.toJSArray
    geometry.addAttribute("position", new BufferAttribute(positions, 3))
    geometry.addAttribute("customColor", new BufferAttribute(colors, 3))
    geometry.addAttribute("size", new BufferAttribute(sizes, 1))
    (geometry, (minX, minY, minZ), (maxX, maxY, maxZ))
  }

  // For logging only
  private def showMinMax(minX: Double, maxX: Double,
                         minY: Double, maxY: Double,
                         minZ: Double, maxZ: Double): Unit = {
    Log("Largest values:")
    Log(s"\tx: $maxX")
    Log(s"\ty: $maxY")
    Log(s"\tz: $maxZ")
    Log("Smallest values:")
    Log(s"\tx: $minX")
    Log(s"\ty: $minY")
    Log(s"\tz: $minZ")
  }

}