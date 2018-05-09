import org.scalajs.threejs

/**
  * Package viewable contains all classes, objects,
  * and traits that can be placed in the scene, or
  * are highly coupled with those that can be.
  *
  * Created by Dorian Thiessen on 2018-05-08.
  */
package object viewable {
  type Color = threejs.Color
  type Points = threejs.Points
  type BufferGeometry = threejs.BufferGeometry

  type Coordinate = (Double, Double, Double)
}
