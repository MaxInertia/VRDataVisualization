import org.scalajs.{threejs => THREE}

/**
  * Created by Dorian Thiessen on 2018-02-08.
  */
package object plots {
  type Points = THREE.Points
  type Coordinate = (Double, Double, Double)

  type BufferGeometry = THREE.BufferGeometry
}