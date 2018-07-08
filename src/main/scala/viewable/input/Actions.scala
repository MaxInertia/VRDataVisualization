package viewable.input

import org.scalajs.threejs.{Vector2, Vector3}
import controls.RayCaster
import viewable.Colors

/**
  * Created by Dorian Thiessen on 2018-07-07.
  */
object Actions {
  var inputPanels: Array[ActionPanel] =
    (for {
      x <- -1.0 to 1.0 by 0.25
      y <- 1.0 to 3.0 by 0.25
    } yield ActionPanel(new Vector2(0.2, 0.2), new Vector3(x, y, -3.0), Colors.Indigo)).toArray

  def update(rayCaster: Option[RayCaster]): Unit = {
    for(ip <- inputPanels) {
      // Assume it's not in hover mode
      if (ip.hoverActive()) ip.setHoverOff()

      if (rayCaster.nonEmpty) {
        val intersection = rayCaster.get.intersectObject(ip.object3D)
        if(intersection.nonEmpty) {
          if(intersection(0).`object` == ip.object3D) {
            ip.setHoverOn()
          }
        }
      }

    }
  }

}
