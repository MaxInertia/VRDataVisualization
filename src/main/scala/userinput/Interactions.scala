package userinput

import facades.IFThree.IntersectionExt
import org.scalajs.{threejs => THREE}
import plots.Plot
import userinput.Interactions.Intersection

/**
  * Implemented by plots that can be manipulated via user input.
  *
  * Can be thought of as the transformation an entity undergoes
  * when triggered, where the trigger happens to be user input.
  *
  * Created by Dorian Thiessen on 2018-04-07.
  */
trait Interactions[T] {
  def onIntersection(entity: T, intersections: scalajs.js.Array[Intersection]): (Int, Int)
}

object Interactions {
  type Intersection = THREE.Intersection

  implicit object PlotInteractions extends Interactions[Plot] {

    override def onIntersection(entity: Plot, intersection: scalajs.js.Array[Intersection]): (Int, Int) = {
      val index = intersection(0).asInstanceOf[IntersectionExt].index
      var oldIndex = entity.selections(0)

      if(entity.savedSelections.contains(oldIndex)) { // If previous selection is saved, ignore it by losing it's index
        oldIndex = -1
      } else if(oldIndex != index) { // Else if previous selection exists, and different than the current, deselect it
        entity.deselect(oldIndex)
      }

      entity.selections(0) = index
      entity.select(index)
      (oldIndex, entity.selections(0))
    }
  }

  //TODO: Pass additional State object? One use case: For checking if a specific button is currently selected
  def on[T: Interactions](entity: T, intersections: scalajs.js.Array[Intersection]): (Int, Int) = {
    implicitly[Interactions[T]].onIntersection(entity, intersections)
  }

}