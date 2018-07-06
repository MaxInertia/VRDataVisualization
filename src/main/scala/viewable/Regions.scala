package viewable

import org.scalajs.threejs.{Object3D, Vector3}
import util.Log
import viewable.plots.{CoordinateAxes3D, Plot, ScatterPlot}

object Regions {
  type MaybeRegion = Option[Region]

  private val regions: Array[MaybeRegion] = Array(None, None, None, None)

  def getNonEmpties: Array[Region] = Regions.regions.filter(_.nonEmpty).map(_.get)
  def numOccupied(): Int = getNonEmpties.length
  def isFull: Boolean = numOccupied() == 4

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

      val gui = DatGui(plot.asInstanceOf[ScatterPlot])
      regions(i).get.gui = Some(gui)
      Environment.instance.scene.add(gui.object3D)
      //DatGui.update(i)
      return regions(i)

    } else if(regions(i).nonEmpty && regions(i).get.plot.isEmpty) {
      Log("[Regions] - Adding plot to empty region")
      regions(i).get.addPlot(plot)
      //DatGui.update(i)
      return regions(i)
    }

    None
  }

  /**
    * Places regions in their default positions.
    * Default positions vary with the number of regions loaded.
    * @return The number of regions available to be moved
    */
  protected[viewable] def reposition(): Int = {
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
    var gui: Option[DatGui] = None

    private var maybeAxes: Option[CoordinateAxes3D] = Some(defaultAxes())
    def maybeGetAxes(): Option[CoordinateAxes3D] = maybeAxes
    add(maybeAxes.get)

    def addPlot(p: Plot): Unit = {
      // Remove previous plot if it exists
      if(plot.nonEmpty) remove(plot.get.getPoints)
      add(p.getPoints)
      plot = Some(p)
      updateAxes()
    }

    def addAxes(axes: CoordinateAxes3D): Unit = {
      maybeAxes = Some(axes)
      add(axes)
    }

    def updateAxes(): Unit = {
      if(plot.nonEmpty) {
        val p = plot.get//.asInstanceOf[ScatterPlot]
        Log(s"${p.xVar}, ${p.yVar}, ${p.zVar}")
      }
    }

    // Convenience methods for Object3D

    def add(something: Object3D): Unit = object3D.add(something)
    def remove(something: Object3D): Unit = object3D.remove(something)

    // Private methods

    private def defaultAxes(): CoordinateAxes3D = {
      val axes = CoordinateAxes3D.create(1, color = Colors.White, centeredOrigin = true, planeGrids = false)
      axes
    }
  }

}