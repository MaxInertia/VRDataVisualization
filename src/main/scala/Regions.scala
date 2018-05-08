package env

import org.scalajs.threejs.Vector3
import org.scalajs.threejs.Object3D
import plots.{Colors, CoordinateAxes3D, Plot}
import util.Log


object Regions {
  type MaybeRegion = Option[Region]
  type Group = Object3D // TODO: Use Group? Not in facade.

  private val regions: Array[MaybeRegion] = Array(None, None, None, None)

  def numOccupied(): Int = getNonEmpties.length
  def isFull: Boolean = numOccupied() == 4

  def getNonEmpties: Array[Region] = Regions.regions.filter(_.nonEmpty).map(_.get)

  /**
    * Adds a plot to a region in the scene if there is room, otherwise does nothing.
    * @param plot Some instance of a class that implements trait Plot.
    * @return The region the plot was added to if successful, otherwise None.
    */
  def add(plot: Plot): Option[Region] = {
    for(i <- regions.indices) if(regions(i).isEmpty) {
      Log("[Regions] - Adding plot to new region")
      regions(i) = Some(Region(i))
      regions(i).get.addPlot(plot)
      reposition()
      return regions(i)

    } else if(regions(i).nonEmpty && regions(i).get.plot.isEmpty) {
      Log("[Regions] - Adding plot to empty region")
      regions(i).get.addPlot(plot)
      return regions(i)
    }
    None
  }

  protected[env] def reposition(): Int = {
    def getPos(i: Int): Vector3 = regions(i).get.object3D.position
    val num = numOccupied()
     num match {
      case 0 => // Nothing
      case 1 =>
        getPos(0).set(0, 1, -2) // north
      case 2 =>
        getPos(0).set(-1, 1, -1) // north west
        getPos(1).set(1, 1, -1) // north east
      case 3 =>
        getPos(0).set(-1, 1, -1) // north west
        getPos(1).set(1, 1, -1) // north east
        getPos(2).set(-2, 1, 0) // west
      case 4 =>
        getPos(0).set(-1, 1, -1) // north west
        getPos(1).set(1, 1, -1) // north east
        getPos(2).set(-2, 1, 0) // west
        getPos(3).set(2, 1, 0) // east
      case _ => // Undefined for more regions
    }
    num
  }

  /**
    * A Region represents a position in the scene,
    * it is used to anchor multiple objects to one another.
    */
  case class Region(id: Int, object3D: Object3D = new Object3D()) {
    var plot: Option[Plot] = None // TODO: Make this private (required changes to rendering section in Environment)

    private var maybeAxes: Option[CoordinateAxes3D] = Some(defaultAxes())
    def maybeGetAxes(): Option[CoordinateAxes3D] = maybeAxes
    add(maybeAxes.get)

    def addPlot(p: Plot): Unit = {
      // Remove previous plot if it exists
      if(plot.nonEmpty) remove(plot.get.getPoints)
      add(p.getPoints)
      plot = Some(p)
    }

    def addAxes(axes: CoordinateAxes3D): Unit = {
      maybeAxes = Some(axes)
      add(axes)
    }

    // Convenience methods for Object3D

    def add(something: Object3D): Unit = object3D.add(something)
    def remove(something: Object3D): Unit = object3D.remove(something)

    // Private methods

    private def defaultAxes(): CoordinateAxes3D = {
      val axes = CoordinateAxes3D.create(1, color = Colors.White, centeredOrigin = true, planeGrids = true)
      axes
    }
  }

}