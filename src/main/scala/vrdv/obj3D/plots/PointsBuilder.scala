package vrdv.obj3D.plots

import org.scalajs.dom
import org.scalajs.threejs._

import scala.scalajs.js
import scala.scalajs.js.typedarray.Float32Array
import js.JSConverters._
import util.{Log, ScaleCenterProperties, Stats}
import vrdv.obj3D.plots.PointsBuilder._
import Prop._
import vrdv.obj3D.CustomColors

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

  def build3D(): (Points, ScaleCenterProperties, Array[Stats]) = {
    Log.show("build3D called")
    makePoints(xs, ys, zs, hue, textureID)
  }

  def build2D(): (Points, ScaleCenterProperties, Array[Stats]) = {
    Log.show("build2D called")
    makePoints(xs, ys, hue = hue, textureIndex = textureID)
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

  def apply(): PointsBuilder[CleanPlot] = new PointsBuilder[CleanPlot](null, null, null)

  private def makePoints(xs: Array[Double], ys: Array[Double], zs: Array[Double] = Array(), hue: Option[Double], textureIndex: Int): (Points, ScaleCenterProperties, Array[Stats]) = {
    val vertices = makeVertices(xs, ys, zs)
    Log.show("makeGeometry next")
    val (geometry, minimums, maximums) = if(zs.nonEmpty) make3DGeometry(vertices, hue) else make2DGeometry(vertices, hue)
    Log.show("ShaderMaterial next")
    val shaderMaterial = makeShaderMaterial(textureIndex)
    Log.show("Points next")
    val points = new Points(geometry, shaderMaterial)
    points.receiveShadow = false
    points.castShadow = false
    Log.show("after points")
    println(s"During plot creation; max:${maximums._1}, min:${minimums._1}")
    println(s"During plot creation; max:${maximums._2}, min:${minimums._2}")
    println(s"During plot creation; max:${maximums._3}, min:${minimums._3}")

    val stats = Array(
      Stats(-2, -5, minimums._1, maximums._1),
      Stats(-3, -6, minimums._2, maximums._2),
      Stats(-4, -7, minimums._3, maximums._3))
    Log.show("after stats")

    val scaleCenterProps =
      if(zs.nonEmpty)PointOperations.confineToRegion3D(points, minimums, maximums)
      else PointOperations.confineToRegion2D(points,
        (minimums._1, minimums._2),
        (maximums._1, maximums._2)
      )
    Log.show("after PointOperations.confineToRegion")

    (points, scaleCenterProps, stats)
  }

  private def makeVertices(xs: Array[Double], ys: Array[Double], zs: Array[Double]): Array[Vector3] = {
    val lengths = Array(xs.length, ys.length, zs.length)
    var vertices: Array[Vector3] = Array()

    if(zs.nonEmpty) { // 3D Points
      if (lengths.min != lengths.max) Log.show("Input data columns appear to have varying row counts")
      val length = lengths.min
      for (i <- 0 until length) vertices = vertices :+ new Vector3(xs(i), ys(i), zs(i))

    } else { // '2D' Points
      if (xs.length != ys.length) Log.show("Input data columns appear to have varying row counts")
      val length = lengths.filter(_ > 0).min
      for (i <- 0 until length) vertices = vertices :+ new Vector3(xs(i), ys(i), 0d)
    }

    vertices
  }
    //coordinates.map{case (x, y, z) => new Vector3(x, y, z)}

  private def makeShaderMaterial(textureIndex: Int) : PointsMaterial = {
    Log.show(s"[PointsBuilder] - Creating Shader Material. Texture: $textureIndex")

    val myVertexShader = dom.document.getElementById("vertexshader").textContent
    val myFragmentShader = dom.document.getElementById("fragmentshader").textContent

    val params: ShaderMaterialParameters = new js.Object().asInstanceOf[ShaderMaterialParameters]
    params.fragmentShader = myFragmentShader
    params.vertexShader = myVertexShader
    params.alphaTest = 0.5
    params.uniforms = new js.Object {
      val color: js.Object = new js.Object {
        val value: Color = CustomColors.White
      }
      val texture: js.Object = new js.Object {
        val value: Texture = resources.Res.getTexture(textureIndex)
      }
    }

    val material = new ShaderMaterial(params)
    material.asInstanceOf[PointsMaterial]
  }

  private def make3DGeometry(vertices: Array[Vector3], hueShift: Option[Double]): (BufferGeometry, Triple, Triple) = {
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

      if(hueShift.nonEmpty) color.setHSL(hueShift.get + Plot3D.HUE_GRADIENT_FACTOR * (i / l), 1.0, 0.5)
      colors(3 * i) = color.r.toFloat
      colors(3 * i + 1) = color.g.toFloat
      colors(3 * i + 2) = color.b.toFloat
      sizes(i) = Plot3D.PARTICLE_SIZE.toFloat
    }

    showMinMax(minX, maxX, minY, maxY, minZ, maxZ)

    val geometry = new BufferGeometry()
    geometry.vertices = vertices.toJSArray
    geometry.addAttribute("position", new BufferAttribute(positions, 3))
    geometry.addAttribute("customColor", new BufferAttribute(colors, 3))
    geometry.addAttribute("size", new BufferAttribute(sizes, 1))
    (geometry, (minX, minY, minZ), (maxX, maxY, maxZ))
  }

  private def make2DGeometry(vertices: Array[Vector3], hueShift: Option[Double]): (BufferGeometry, Triple, Triple) = {
    Log("[PointsBuilder] - Creating Buffer Geometry")

    val positions = new Float32Array(vertices.length * 3)
    val colors = new Float32Array(vertices.length * 3)
    val sizes = new Float32Array(vertices.length)

    val color = new Color()
    if(hueShift.isEmpty) color.setRGB(255, 255, 255)

    var maxX = -Double.MaxValue
    var maxY = -Double.MaxValue
    var minX = Double.MaxValue
    var minY = Double.MaxValue

    val l: Double = vertices.length
    var vertex: Vector3 = null
    for ( i <- vertices.indices) {
      vertex = vertices(i)

      positions(3*i) = vertex.x.toFloat
      if(vertex.x > maxX) maxX = vertex.x
      if(vertex.x < minX) minX = vertex.x
      positions(3*i + 1) = vertex.y.toFloat
      if(vertex.y > maxY) maxY = vertex.y
      if(vertex.y < minY) minY = vertex.y
      positions(3*i + 2) = 0f

      if(hueShift.nonEmpty) color.setHSL(hueShift.get + Plot3D.HUE_GRADIENT_FACTOR * (i / l), 1.0, 0.5)
      colors(3 * i) = color.r.toFloat
      colors(3 * i + 1) = color.g.toFloat
      colors(3 * i + 2) = color.b.toFloat
      sizes(i) = Plot3D.PARTICLE_SIZE
    }

    showMinMax(minX, maxX, minY, maxY, 0f, 0f)

    val geometry = new BufferGeometry()
    geometry.vertices = vertices.toJSArray
    geometry.addAttribute("position", new BufferAttribute(positions, 3))
    geometry.addAttribute("customColor", new BufferAttribute(colors, 3))
    geometry.addAttribute("size", new BufferAttribute(sizes, 1))
    (geometry, (minX, minY, 0f), (maxX, maxY, 0f))
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