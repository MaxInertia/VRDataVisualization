import org.scalajs.{threejs => THREE}

/**
  * Created by Dorian Thiessen on 2018-02-08.
  */
package object plots {
  type Points = THREE.Points
  type Coordinate = (Double, Double, Double)

  implicit def x(coordinate: Coordinate): PointCoordinate =
    new PointCoordinate(
      coordinate._1,
      coordinate._2,
      coordinate._3
    )
}

class PointCoordinate(val x: Double, val y: Double, val z: Double) {}
