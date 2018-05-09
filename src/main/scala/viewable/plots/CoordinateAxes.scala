package viewable.plots

import facades.IFThree.GridHelperExt
import org.scalajs.threejs.LineBasicMaterial
import org.scalajs.{threejs => THREE}

import scala.scalajs.js
import js.typedarray.Float32Array

/**
  * Created by Dorian Thiessen on 2018-02-10.
  */
abstract class CoordinateAxes(geometry: THREE.Geometry, material: THREE.LineBasicMaterial)
  extends THREE.Line(geometry, material) {}

class CoordinateAxes2D(geometry: THREE.Geometry, material: THREE.LineBasicMaterial)
  extends CoordinateAxes(geometry, material) {}

class CoordinateAxes3D(geometry: THREE.Geometry, material: THREE.LineBasicMaterial)
  extends CoordinateAxes(geometry, material) {}

//TODO: CenteredAxes3D; origin matches origin of points in region.

object CoordinateAxes3D {
  def create(length: Double, color: THREE.Color, centeredOrigin: Boolean, planeGrids: Boolean = false): CoordinateAxes3D = {
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
