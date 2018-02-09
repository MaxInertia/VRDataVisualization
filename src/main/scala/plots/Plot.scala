package plots

import org.scalajs.{threejs => THREE}
import scala.scalajs.js
import js.typedarray.Float32Array
import js.JSConverters._

/**
  * Created by Dorian Thiessen on 2018-02-08.
  */
class Plot(geometry: THREE.Geometry, material: THREE.PointsMaterial)
  extends THREE.Points(geometry, material) {

  def printVertices(): Unit = for(v <- geometry.vertices) println(s"v(${v.x}, ${v.y}, ${v.z})")
}


object Plot {

  val PARTICLE_SIZE: Double = 0.025

  def makeVertices(coordinates: Array[Coordinate]): Array[THREE.Vector3] =
    coordinates.map{case (x, y, z) => new THREE.Vector3(x, y, z)}


  def makeGeometry(vertices: Array[THREE.Vector3], hueShift: Double): THREE.BufferGeometry = {
    val positions = new Float32Array( vertices.length * 3 )
    val colors = new Float32Array( vertices.length * 3 )
    val sizes = new Float32Array( vertices.length )

    val l = vertices.length
    val color = new THREE.Color()

    for ( i <- vertices.indices) {
      val vertex = vertices(i)
      positions(i)   = vertex.x.toFloat
      positions(i+1) = vertex.y.toFloat
      positions(i+2) = vertex.z.toFloat
      color.setHSL( hueShift + 0.1 * ( i / l ), 1.0, 0.5 )
      colors(i)   = color.r.toFloat
      colors(i+1) = color.g.toFloat
      colors(i+2) = color.b.toFloat
      sizes(i) = PARTICLE_SIZE.toFloat
    }

    val geometry = new THREE.BufferGeometry()
    geometry.vertices = vertices.toJSArray
    geometry.addAttribute( "position", new THREE.BufferAttribute( positions, 3 ) )
    geometry.addAttribute( "customColor", new THREE.BufferAttribute( colors, 3 ) )
    geometry.addAttribute( "size", new THREE.BufferAttribute( sizes, 1 ) )
    geometry
  }


  def makeMaterial(): THREE.PointsMaterial = {
    var material = new THREE.PointsMaterial()
    material.size = PARTICLE_SIZE
    material
  }


  def zip3[A, B, C](fA: Array[A], fB: Array[B], fC: Array[C]): Array[(A, B, C)] =
    (fA zip fB zip fC) map { case ((a, b), c) => (a, b, c)}


  // TODO: Find out why THREE.ShaderMaterial cannot be used as the material for Points, that is what is used in the JS version.
  /*def makeMaterial() : THREE.PointsMaterial = {
    println("\tCreating SM material")

    val material = new THREE.ShaderMaterial()
    val myTexture = new THREE.TextureLoader()//.load( "img/disc.png" )

    myTexture.load("img/disc.png", (t)=>{
      val tmap = mutable.Map(
        "color" -> mutable.Map("value" -> new THREE.Color(0xffffff)),
        "texture" -> mutable.Map("value" -> myTexture)
      )
      material.uniforms = tmap.toJSDictionary
    })

    val myVertexShader = dom.document.getElementById( "vertexshader" ).textContent
    val myFragmentShader = dom.document.getElementById( "fragmentshader" ).textContent

    //val material = new THREE.ShaderMaterial()

    material.vertexShader = myVertexShader
    material.fragmentShader = myFragmentShader
    material.alphaTest = 0.5
    material.asInstanceOf[THREE.PointsMaterial]
  }*/
}