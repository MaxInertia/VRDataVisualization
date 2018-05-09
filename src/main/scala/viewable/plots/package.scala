package viewable

import org.scalajs.threejs

/**
  * Created by Dorian Thiessen on 2018-02-08.
  */
package object plots {
  type Color = threejs.Color
  type Points = threejs.Points
  type BufferGeometry = threejs.BufferGeometry

  type Coordinate = (Double, Double, Double)
}
