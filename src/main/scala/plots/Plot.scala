package plots

import javafx.scene.effect.ColorInput

import org.scalajs.threejs.{Color, ShaderMaterialParameters, Texture}
import org.scalajs.{dom, threejs => THREE}

import scala.scalajs.js
import js.typedarray.Float32Array
import js.JSConverters._

/**
  * Instances of classes that extend Plot can be added to a THREE.Scene
  * Created by Dorian Thiessen on 2018-02-08.
  */
abstract class Plot(tag: String, points: THREE.Points) {
  def getGeometry: THREE.BufferGeometry = points.geometry.asInstanceOf[THREE.BufferGeometry]
  def printVertices(): Unit = for(v <- points.geometry.vertices) println(s"v(${v.x}, ${v.y}, ${v.z})")
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

  // TODO: Find out why THREE.ShaderMaterial cannot be used as the material for Points, that is what is used in the JS version.
  def makeShaderMaterial(colorIn: THREE.Color) : THREE.PointsMaterial = {
    println("\tCreating SM material")

    val myVertexShader = dom.document.getElementById("vertexshader").textContent
    val myFragmentShader = dom.document.getElementById("fragmentshader").textContent

    val params: ShaderMaterialParameters = new js.Object().asInstanceOf[ShaderMaterialParameters]
    params.fragmentShader = myFragmentShader
    params.vertexShader = myVertexShader
    params.uniforms = new js.Object {
      val color = new js.Object {
        val value: Color = colorIn
      }
      val texture = new js.Object {
        val value: Texture = myTexture
      }
    }
    params.alphaTest = 0.5

    val material = new THREE.ShaderMaterial(params)
    material.asInstanceOf[THREE.PointsMaterial]
  }
}
