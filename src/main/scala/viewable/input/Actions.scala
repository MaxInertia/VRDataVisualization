package viewable.input

import org.scalajs.threejs.{Object3D, Vector2, Vector3}
import controls.{ActionLaser, RayCaster}
import facades.IFThree.Object3DR93
import viewable.Colors

import scala.collection.immutable.NumericRange

/**
  * Created by Dorian Thiessen on 2018-07-07.
  */
object Actions {
  var inputPanels: Array[ActionPanel] =
    (for {
      x <- -1.0 to 1.0 by 0.25
      y <- 1.0 to 3.0 by 0.25
    } yield ActionPanel(new Vector2(0.2, 0.2), new Vector3(x, y, -3.0), Colors.Indigo)).toArray

  def update(laser: Option[ActionLaser]): Unit = {
    for(ip <- inputPanels) {
      // Assume it's not in hover mode
      if (ip.hoverActive()) ip.setHoverOff()

      if (laser.nonEmpty) {
        val intersection = laser.get.rayCaster.intersectObject(ip.object3D)
        if(intersection.nonEmpty) {
          if(intersection(0).`object` == ip.object3D) {
            ip.setHoverOn()
          }
        }
      }

    }
  }

  var menuLeft: Object3D = new Object3D

  def getPanels(panelSize: Vector2, z: Double, xs: NumericRange[Double], ys: NumericRange[Double]): Array[ActionPanel] =
    (for {x <- xs; y <- ys}
      yield ActionPanel(panelSize, new Vector3(x, y, z), Colors.Indigo)).toArray
}
