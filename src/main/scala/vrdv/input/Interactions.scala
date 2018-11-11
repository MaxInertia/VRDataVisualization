package vrdv.input

import facade.IFThree.IntersectionExt
import org.scalajs.threejs.Intersection
import vrdv.obj3D.plots.{Plot, PointOperations}

/**
  * Implemented by plots that can be manipulated via user input.
  *
  * Can be thought of as the transformation an entity undergoes
  * when triggered, where the trigger happens to be user input.
  *
  * Created by Dorian Thiessen on 2018-04-07.
  */
trait Interactions[T] {
  def onIntersection(entity: T, intersections: scalajs.js.Array[Intersection], option: Boolean, i: Int): Boolean
}

object Interactions {
  implicit object PlotInteractions extends Interactions[Plot] {

    override def onIntersection(entity: Plot, intersection: scalajs.js.Array[Intersection], selecting: Boolean, pindex: Int = 0): Boolean = {
      val index = intersection(pindex).asInstanceOf[IntersectionExt].index

      var oldIndexMaybe = entity.highlightedPointIndex

      // If there is currently a highlighted point
      if(oldIndexMaybe.nonEmpty) {
        val oldIndex = oldIndexMaybe.get

        // If that highlighted point was selected we ignore it
        if (entity.selectedPointIndices.contains(oldIndex)) {
          oldIndexMaybe = None
        }

        // Else if highlighted point is different than the currently intersected point we deselect it
        else if (oldIndex != index) {
          PointOperations.unHighlight(entity, oldIndex)
        }
      }

      // Then we highlight the point provided
      PointOperations.highlight(entity, index)

      // and select it if the selecting argument is true
      if(selecting) PointOperations.selectHighlighted(entity)

      true
    }
  }

  def on[T: Interactions](entity: T, intersections: scalajs.js.Array[Intersection], option: Boolean, int: Int): Boolean = {
    implicitly[Interactions[T]].onIntersection(entity, intersections, option, int)
  }

}