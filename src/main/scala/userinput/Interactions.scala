package userinput

import facades.IFThree.IntersectionExt
import org.scalajs.threejs.Intersection
import plots.Plot

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

      if(oldIndexMaybe.nonEmpty) {
        val oldIndex = oldIndexMaybe.get

        // If previously highlighted point was saved, ignore it
        if (entity.savedSelections.contains(oldIndex)) {
          oldIndexMaybe = None
        }

        // Else if previously highlighted exists, and different than the current, deselect it
        else if (oldIndex != index) {
          entity.ops.unHighlight(oldIndex)
        }
      }

      // Then we highlight the point!
      entity.highlighted = Some(index)
      entity.ops.highlight(index)

      // TODO: Remove undesireable coupling with Controller instances (Replaceable with idea in TODO below)
      if(OculusControllerRight.isSelecting || OculusControllerLeft.isSelecting) {
        entity.ops.selectHighlighted()
      }

      (oldIndexMaybe, index)
    }
  }

  //TODO: Pass additional State object? One use case: For checking if a specific button is currently selected
  def on[T: Interactions](entity: T, intersections: scalajs.js.Array[Intersection]): (Option[Int], Int) = {
    implicitly[Interactions[T]].onIntersection(entity, intersections)
  }

}