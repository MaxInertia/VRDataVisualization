package viewable.plots

import facades.IFThree.GridHelperExt
import org.scalajs.threejs.{LineBasicMaterial, Mesh}
import org.scalajs.{threejs => THREE}
import viewable.{Environment, Text}
import viewable.displays.PlaneDisplay
import viewable.plots.ScatterPlot.CoordinateAxisIDs

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
  extends CoordinateAxes(geometry, material) {}

class CoordinateAxes3D(geometry: THREE.Geometry, material: THREE.LineBasicMaterial)
  extends CoordinateAxes(geometry, material) {

  def createAxesTitles(xT: String, yT: String, zT: String): Unit = {
    /*axesTitles(0).write(xT, (0, 0))
    axesTitles(1).write(yT, (10, 10))
    axesTitles(2).write(zT, (20, 20))*/
    val scale = axesTitleScale

    val x = Text.createTextMesh(xT)
    x.scale.set(scale, scale, scale)
    x.position.set(0.6, 0, 0)
    this.add(x)
    //x.lookAt(Environment.instance.camera.position)

    val y = Text.createTextMesh(yT)
    y.scale.set(scale, scale, scale)
    y.position.set(0, 0.6, 0)
    this.add(y)
    //y.lookAt(Environment.instance.camera.position)

    val z = Text.createTextMesh(zT)
    z.scale.set(scale, scale, scale)
    z.position.set(0, 0, 0.6)
    this.add(z)
    //z.lookAt(Environment.instance.camera.position)

    axesTitles = Array(x, y, z)
  }

  def setAxisTitle(title: String, axisID: Int): Unit = {
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

object CoordinateAxes3D {
  def create(length: Double, color: THREE.Color, centeredOrigin: Boolean, planeGrids: Boolean = false): CoordinateAxes3D = {
    val len = length.toFloat/2
    val geometry = new THREE.BufferGeometry()
    val material = new THREE.LineBasicMaterial()
    material.color = color
    var positions: Float32Array = null
    var colors: Float32Array = null

    val xTitle = PlaneDisplay(0.4, 0.1)
    val yTitle = PlaneDisplay(0.4, 0.1)
    val zTitle = PlaneDisplay(0.4, 0.1)

    if(centeredOrigin) { // Origin of the axes is centered
      val (x, y, z) = (0, 0, 0)
      positions = new Float32Array(36)
      for (i <- 0 until 36) i % 3 match {
        case 0 => positions(i) = x
        case 1 => positions(i) = y
        case 2 => positions(i) = z
      }

      positions(3) += len
      //xTitle.object3D.position.set(positions(3), 0, 0)
      positions(10) += len
      positions(17) += len
      //yTitle.object3D.position.set(0, positions(17), 0)
      positions(21) -= len
      positions(28) -= len
      //zTitle.object3D.position.set(0, 0, -positions(28))
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

    /*axes.add(xTitle.object3D)
    axes.add(yTitle.object3D)
    axes.add(zTitle.object3D)
    axes.axesTitles = Array(xTitle, yTitle, zTitle)
    axes.setAxesTitles("X", "Y", "Z")*/

    if(planeGrids) { // TODO: Account for the case when the origin is not centered
      val gridXZ = new GridHelperExt(1, 10, color, color)
      //val gridXZ = new GridHelperExt(1, 10, Colors.Blue, Colors.Blue)
      val gridXY = new GridHelperExt(1, 10, color, color)
      //val gridXY = new GridHelperExt(1, 10, Colors.Red, Colors.Red)
      gridXZ.rotateZ(3.1415/2)
      val gridZY = new GridHelperExt(1, 10, color, color)
      //val gridZY = new GridHelperExt(1, 10, Colors.Green, Colors.Green)
      gridZY.rotateX(3.1415/2)
      axes.add(gridXY)
      axes.add(gridXZ)
      axes.add(gridZY)
    }

    axes
  }
}
