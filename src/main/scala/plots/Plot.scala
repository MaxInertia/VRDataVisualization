package plots

import org.scalajs.{dom, threejs => THREE}
import scala.scalajs.js
import js.typedarray.Float32Array
import js.JSConverters._

/**
  * An abstract wrapper for THREE.Points that includes various
  * operations one may want to perform on the points.
  *
  * Created by Dorian Thiessen on 2018-02-08.
  */
abstract class Plot(tag: String, points: THREE.Points) {
  def getGeometry: THREE.BufferGeometry = points.geometry.asInstanceOf[THREE.BufferGeometry]
  @inline def getColorsAttribute: js.Dynamic = getGeometry.getAttribute("customColor")
  @inline def getSizesAttribute: js.Dynamic  = getGeometry.getAttribute("size")

  /**
    * Select the set of points at the provided indices.
    * @param pIndices Point indices
    */
  def select(pIndices: Int*): Unit = {
    if(Selection.changesColor) updateColors(Selection.red, Selection.green, Selection.blue, pIndices)
    if(Selection.changesSize)  updateSizes(Plot.PARTICLE_SIZE.toFloat*Selection.scale, pIndices)
  }

  /**
    * Deselect the set of points at the provided indices.
    * Deselected points are restored to their original color and size.
    * @param pIndices Point indices
    */
  def deselect(pIndices: Int*): Unit = {
    if(Selection.changesColor) updateColors(Default.red, Default.green, Default.blue, pIndices)
    if(Selection.changesSize)  updateSizes(Plot.PARTICLE_SIZE.toFloat, pIndices)
  }

  private def updateColors(r: Float, g: Float, b: Float, pIndices: Seq[Int]): Unit = {
    // Buffer Attributes for point colors as RGB values
    val colorsAttr = getColorsAttribute
    val cArr = colorsAttr.array.asInstanceOf[Float32Array]
    for(i <- pIndices) {
      cArr(3*i) = r
      cArr(3*i + 1) = g
      cArr(3*i + 2) = b
    }
    colorsAttr.needsUpdate = true
  }

  private def updateSizes(newSize: Float, pIndices: Seq[Int]): Unit = {
    // Buffer Attributes for point sizes
    val sizesAttr = getSizesAttribute
    val sArr = sizesAttr.array.asInstanceOf[Float32Array]
    for(i <- pIndices) sArr(i) = newSize
    sizesAttr.needsUpdate = true
  }

  /**
    * Properties of selected points
    */
  private object Selection {
    var changesColor: Boolean = true
    var red: Float = 1.toFloat
    var green: Float = 1.toFloat
    var blue: Float = 1.toFloat
    var changesSize: Boolean = true
    var scale: Float = 1.5.toFloat
  }

  /**
    * Contains default point properties used to revert points
    * to their original state after deselecting them.
    */
  private object Default {
    var red: Float = _
    var green: Float = _
    var blue: Float = _
    // Method 'init' exists to initialize the default RGB values
    // to avoid (1) descending into the depths of the geometry more than once,
    // and (2) keeping a reference to the float32array.
    def init() {
      val defaultColors = getGeometry.getAttribute("customColor").array.asInstanceOf[Float32Array]
      red = defaultColors(0)
      green = defaultColors(1)
      blue = defaultColors(2)
    }
    init()
  }
}

/**
  * The companion object for the Plot class.
  * Encapsulates general Plot initialization methods.
  */
object Plot {
  val PARTICLE_SIZE: Double = 0.1
  var myTexture: THREE.Texture = _

  def makeVertices(coordinates: Array[Coordinate]): Array[THREE.Vector3] =
    coordinates.map{case (x, y, z) => new THREE.Vector3(x, y, z)}

  def makeGeometry(vertices: Array[THREE.Vector3], hueShift: Double): THREE.BufferGeometry = {
    val positions = new Float32Array( vertices.length * 3 )
    val colors = new Float32Array( vertices.length * 3 )
    val sizes = new Float32Array( vertices.length )

    val l = vertices.length
    val color = new THREE.Color()
    var vertex: THREE.Vector3 = null
    for ( i <- vertices.indices) {
      vertex = vertices(i)
      positions(3*i)     = vertex.x.toFloat
      positions(3*i + 1) = vertex.y.toFloat
      positions(3*i + 2) = vertex.z.toFloat

      color.setHSL( hueShift + 0.1 * ( i / l ), 1.0, 0.5 )
      colors(3*i)     = color.r.toFloat
      colors(3*i + 1) = color.g.toFloat
      colors(3*i + 2) = color.b.toFloat

      sizes(i) = PARTICLE_SIZE.toFloat
    }

    val geometry = new THREE.BufferGeometry()
    geometry.vertices = vertices.toJSArray
    geometry.addAttribute( "position", new THREE.BufferAttribute( positions, 3 ) )
    geometry.addAttribute( "customColor", new THREE.BufferAttribute( colors, 3 ) )
    geometry.addAttribute( "size", new THREE.BufferAttribute( sizes, 1 ) )
    geometry
  }

  def zip3[A, B, C](fA: =>Array[A], fB: =>Array[B], fC: =>Array[C]): Array[(A, B, C)] =
    (fA zip fB zip fC) map { case ((a, b), c) => (a, b, c)}

  def makeShaderMaterial() : THREE.PointsMaterial = {
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
        val value: THREE.Texture = myTexture
      }
    }
    params.alphaTest = 0.5

    val material = new THREE.ShaderMaterial(params)
    material.asInstanceOf[THREE.PointsMaterial]
  }
}
