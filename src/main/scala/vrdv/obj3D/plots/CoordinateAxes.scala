package vrdv.obj3D.plots

import facade.IFThree.{AxesHelper, GridHelperExt}
import org.scalajs.threejs.{LineBasicMaterial, Mesh}
import org.scalajs.{threejs ⇒ THREE}
import util.Log
import vrdv.obj3D.Text
import vrdv.obj3D.displays.PlaneDisplay

import scala.scalajs.js
import js.typedarray.Float32Array

/**
  * Created by Dorian Thiessen on 2018-02-10.
  */
abstract class CoordinateAxes(geometry: THREE.Geometry, material: THREE.LineBasicMaterial)
  extends THREE.Line(geometry, material) {
  var axesTitles: Array[Mesh] = Array()
  protected val axesTitleScale: Double = 0.04
}

class CoordinateAxes2D(geometry: THREE.Geometry, material: THREE.LineBasicMaterial)
  extends CoordinateAxes(geometry, material) {

  def createAxesTitles(xT: String, yT: String): Unit = {
    val scale = axesTitleScale

    val x = Text.createTextMesh(xT)
    x.scale.set(scale, scale, scale)
    x.position.set(0, -0.6, 0)
    x.rotateZ(-3.1415/4)
    this.add(x)

    val y = Text.createTextMesh(yT)
    y.scale.set(scale, scale, scale)
    y.position.set(-0.6, 0, 0)
    y.rotateZ(-3.1415/4)
    this.add(y)

    axesTitles = Array(x, y)
  }

  def setAxisTitle(title: String, axisID: Int): Unit = {
    val mesh = Text.createTextMesh(title)
    mesh.scale.set(axesTitleScale, axesTitleScale, axesTitleScale)
    axisID match {
      case XAxis =>
        mesh.position.set(0, -0.6, 0)
        this.remove(axesTitles(XAxis))
        axesTitles(XAxis) = mesh
        this.add(mesh)
      case YAxis =>
        mesh.position.set(-0.6, 0, 0)
        mesh.rotateZ(-3.1415/4)
        this.remove(axesTitles(YAxis))
        axesTitles(YAxis) = mesh
        this.add(mesh)
    }
  }

  def setAxesTitles(xLabel: String, yLabel: String): Unit = {
    setAxisTitle(xLabel, XAxis)
    setAxisTitle(yLabel, YAxis)
  }

}

class CoordinateAxes3D(geometry: THREE.Geometry, material: THREE.LineBasicMaterial)
  extends CoordinateAxes(geometry, material) {

  def createAxesTitles(xT: String, yT: String, zT: String): Unit = {
    val scale = axesTitleScale

    val x = Text.createTextMesh(xT)
    x.scale.set(scale, scale, scale)
    x.position.set(0.6, 0, 0)
    this.add(x)

    val y = Text.createTextMesh(yT)
    y.scale.set(scale, scale, scale)
    y.position.set(0, 0.6, 0)
    this.add(y)

    val z = Text.createTextMesh(zT)
    z.scale.set(scale, scale, scale)
    z.position.set(0, 0, 0.6)
    this.add(z)

    axesTitles = Array(x, y, z)
  }

  def setAxisTitle(title: String, axisID: Int): Unit = {
    Log.show(s"[CoordinateAxes.setAxisTitle($title, $axisID)]")
    val mesh = Text.createTextMesh(title)
    mesh.scale.set(axesTitleScale, axesTitleScale, axesTitleScale)
    axisID match {
      case XAxis =>
        mesh.position.set(0.6, 0, 0)
        this.remove(axesTitles(XAxis))
        axesTitles(XAxis) = mesh
        this.add(mesh)
      case YAxis =>
        mesh.position.set(0, 0.6, 0)
        this.remove(axesTitles(YAxis))
        axesTitles(YAxis) = mesh
        this.add(mesh)
      case ZAxis =>
        mesh.position.set(0, 0, 0.6)
        this.remove(axesTitles(ZAxis))
        axesTitles(ZAxis) = mesh
        this.add(mesh)
    }
  }

  def setAxesTitles(xLabel: String, yLabel: String, zLabel: String): Unit = {
    setAxisTitle(xLabel, XAxis)
    setAxisTitle(yLabel, YAxis)
    setAxisTitle(zLabel, ZAxis)
  }

}

//TODO: CenteredAxes3D; origin matches origin of points in region.

object CoordinateAxes {
  def create2D(length: Double, color: THREE.Color, centeredOrigin: Boolean, planeGrids: Boolean = false): CoordinateAxes2D = {
    val len = length.toFloat/2
    val geometry = new THREE.BufferGeometry()
    val material = new THREE.LineBasicMaterial()
    material.color = color
    var positions: Float32Array = null
    var colors: Float32Array = null

    //val xTitle = PlaneDisplay(0.4, 0.1, 1280, 1280)
    //val yTitle = PlaneDisplay(0.4, 0.1, 1280, 1280)

    if(centeredOrigin) { // Origin of the axes is centered
      val (x, y, z) = (0, 0, 0)
      positions = new Float32Array(15)
      positions(0) = len
      positions(1) = 0
      positions(2) = 0
      positions(3) = -len
      positions(4) = 0
      positions(5) = 0
      positions(6) = 0
      positions(7) = 0
      positions(8) = 0
      positions(9) = 0
      positions(10) = len
      positions(11) = 0
      positions(12) = 0
      positions(13) = -len
      positions(14) = 0
      colors = new Float32Array(15)
      for (i <- 0 until 15) colors(i) = 0.5.toFloat

    } else { // Origin of axes is on the bottom left corner
      val (x, y, z) = (-len, -len, -len)
      positions = new Float32Array(9)
      positions(0) = len
      positions(1) = -len
      positions(2) = 0

      positions(3) = -len
      positions(4) = -len
      positions(5) = 0

      positions(6) = -len
      positions(7) = len
      positions(8) = 0
      colors = new Float32Array(8)
      for (i <- 0 until 8) colors(i) = 0.5.toFloat
    }

    geometry.addAttribute("position", new THREE.BufferAttribute(positions, 3))
    geometry.addAttribute("color", new THREE.BufferAttribute(colors, 3))
    geometry.computeBoundingSphere()
    val axes = new CoordinateAxes2D(geometry, material.asInstanceOf[LineBasicMaterial])

    if(planeGrids) { // TODO: Account for the case when the origin is not centered
      val gridXY = new GridHelperExt(1, 10, color, color)
      gridXY.rotateX(3.1415/2)
      axes.add(gridXY)
    }

    axes
  }

  def create3D(length: Double, color: THREE.Color, centeredOrigin: Boolean, planeGrids: Boolean = false): CoordinateAxes3D = {
    val len = length.toFloat/2
    val geometry = new THREE.BufferGeometry()
    val material = new THREE.LineBasicMaterial()
    material.color = color
    var positions: Float32Array = null
    var colors: Float32Array = null

    if(centeredOrigin) { // Origin of the axes is centered
      val (x, y, z) = (0, 0, 0)
      positions = new Float32Array(36)
      for (i <- 0 until 36) i % 3 match {
        case 0 => positions(i) = x
        case 1 => positions(i) = y
        case 2 => positions(i) = z
      }

      positions(3) += len
      positions(10) += len
      positions(17) += len
      positions(21) -= len
      positions(28) -= len
      positions(35) -= len
      colors = new Float32Array(36)
      for (i <- 0 until 36) colors(i) = 0.5.toFloat

    } else { // Origin of axes is on the back bottom left corner
      val (x, y, z) = (-len, -len, -len)
      positions = new Float32Array(15)
      positions(0) = x + 2*len
      positions(1) = y
      positions(2) = z
      positions(3) = x
      positions(4) = y
      positions(5) = z
      positions(6) = x
      positions(7) = y
      positions(8) = z + 2*len
      positions(9) = x
      positions(10) = y
      positions(11) = z
      positions(12) = x
      positions(13) = y + 2*len
      positions(14) = z
      colors = new Float32Array(15)
      for (i <- 0 until 15) colors(i) = 0.5.toFloat
    }

    geometry.addAttribute("position", new THREE.BufferAttribute(positions, 3))
    geometry.addAttribute("color", new THREE.BufferAttribute(colors, 3))
    geometry.computeBoundingSphere()
    val axes = new CoordinateAxes3D(geometry, material.asInstanceOf[LineBasicMaterial])

    if(planeGrids) { // TODO: Account for the case when the origin is not centered
      val gridXZ = new GridHelperExt(1, 10, color, color)
      val gridXY = new GridHelperExt(1, 10, color, color)
      gridXZ.rotateZ(3.1415/2)
      val gridZY = new GridHelperExt(1, 10, color, color)
      gridZY.rotateX(3.1415/2)
      axes.add(gridXY)
      axes.add(gridXZ)
      axes.add(gridZY)
    }

    axes
  }
}
