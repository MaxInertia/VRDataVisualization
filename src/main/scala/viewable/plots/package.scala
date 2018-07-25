package viewable

import facades.IFThree
import org.scalajs.threejs

/**
  * Created by Dorian Thiessen on 2018-02-08.
  */
package object plots {
  type Color = threejs.Color
  type Points = IFThree.PointsR93
  type BufferGeometry = threejs.BufferGeometry

  type Coordinate = (Double, Double, Double)

  // AxisIDs
  type AxisID = Int
  val XAxis: AxisID = 0
  val YAxis: AxisID = 1
  val ZAxis: AxisID = 2
}
