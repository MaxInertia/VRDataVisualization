package userinput

import facades.IFThree.IntersectionExt
import org.scalajs.threejs.Intersection
import viewable.plots.Plot

/**
  * Implemented by plots that can be manipulated via user input.
  *
  * Can be thought of as the transformation an entity undergoes
  * when triggered, where the trigger happens to be user input.
  *
  * Created by Dorian Thiessen on 2018-04-07.
  */
trait Interactions[T] {
  def onIntersection(entity: T, intersections: scalajs.js.Array[Intersection]): (Option[Int], Int)
}

object Interactions {
  implicit object PlotInteractions extends Interactions[Plot] {

    override def onIntersection(entity: Plot, intersection: scalajs.js.Array[Intersection]): (Option[Int], Int) = {
      val index = intersection(0).asInstanceOf[IntersectionExt].index
      var oldIndexMaybe = entity.highlighted

      // If there is currently a highlighted point
      if(oldIndexMaybe.nonEmpty) {
        val oldIndex = oldIndexMaybe.get

        // If that highlighted point was selected we ignore it
        if (entity.savedSelections.contains(oldIndex)) {
          oldIndexMaybe = None
        }

        // Else if highlighted point is different than the currently intersected point we deselect it
        else if (oldIndex != index) {
          entity.ops.unHighlight(oldIndex)
        }
      }

      // Then we highlight the point provided
      entity.ops.highlight(index)

      // TODO: Remove undesireable coupling with Controller instances (Replaceable with idea in TODO below)
      if(OculusControllerRight.isSelecting || OculusControllerLeft.isSelecting) {
        entity.ops.selectHighlighted()
        OculusControllers.stopSelecting()

      }

      (oldIndexMaybe, index)
    }
  }

  //TODO: Pass additional State object? One use case: For checking if a specific button is currently selected
  def on[T: Interactions](entity: T, intersections: scalajs.js.Array[Intersection]): (Option[Int], Int) = {
    implicitly[Interactions[T]].onIntersection(entity, intersections)
  }

}