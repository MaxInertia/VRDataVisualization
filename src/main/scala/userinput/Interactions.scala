package userinput

import js.three.IntersectionExt
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
      val oldIndex = entity.selections(0)
      if(oldIndex != index) {
        // If previous selection exists, deselect them.
        entity.deselect(oldIndex)
      }
      entity.selections(0) = index
      entity.select(index)
      (oldIndex, entity.selections(0))
    }
  }

  def on[T: Interactions](entity: T, intersections: scalajs.js.Array[Intersection]): (Int, Int) = {
    implicitly[Interactions[T]].onIntersection(entity, intersections)
  }

}