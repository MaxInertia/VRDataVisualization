package vrdv.model

import org.scalajs.threejs.{Camera, Intersection, Scene, Vector3}
import resources.{Data, Res}
import util.Log
import vrdv.input.{Action, InputDetails, Interactions}
import vrdv.obj3D.displays.{CSC_DefaultConfig, ColumnSelectionConsole}
import vrdv.obj3D.plots._
import vrdv.obj3D.{CustomColors, DatGui, DatGuiW, SettingsGui, InitialMenu, Region}

/**
  * Created by Dorian Thiessen on 2018-07-29.
  * Modified by Wade McDonald on 2018-10-02.
  */
class Plotter(scene: Scene, camera: Camera) extends ModelComponent[Action] {

  private var DATA: Array[Array[Data]] = Array()
  private var REGIONS: Array[Region] = Array()
  private var PLOT: Array[Plot] = Array()
  private var AXES: Array[CoordinateAxes] = Array()
  private var GUI: Array[DatGuiW] = Array()

  def addGUI(gui: DatGuiW): Unit = GUI = GUI :+ gui
  def addPlot(plot: Plot): Unit = PLOT = PLOT :+ plot
  def addAxes(axes: CoordinateAxes): Unit = AXES = AXES :+ axes
  def addRegion(r: Region): Unit = {
    REGIONS = REGIONS :+ r
    scene.add(r.object3D)
  }

  def regions: Array[Region] = REGIONS

  def numOccupied(): Int = regions.length
  def isFull: Boolean = numOccupied() == 4

  override def passEvent(event: Action): Unit = {}

  // ------ Plot stuff

  /*---- New 2018-11-02 ----*/

  def getData: Array[Data] = DATA(0)
  def getPlotIndex(plot: Plot): Int = PLOT.indexOf(plot)
  def getPlot(index: Int): Plot = PLOT(index)
  def replacePlot(oldPlot: Plot, newPlot: Plot): Unit = {
    val idx = getPlotIndex(oldPlot)
    Log.show("[Plotter] replacing plot, idx = " + idx)
    regions(idx).addPlot(newPlot)
    AXES(idx) = regions(idx).maybeGetAxes().get
    PLOT(idx) = newPlot
    Log.show("[Plotter] index of new plot = " + getPlotIndex(newPlot))
  }

  private val initialMenu = new InitialMenu(this)

  def toggleGuiVisibility: Unit = {
    Log.show("Toggle GUI visibility.")
    val vis = !GUI(0).object3D.visible
    for(gui <- GUI) gui.setVisible(vis)
    //initialMenu.setVisible(vis)
  }

  def setupData(data: Array[Data], pointColor: Double = CustomColors.BLUE_HUE_SHIFT): Unit = {
    if (data.isEmpty) return
    DATA = DATA :+ data

    if(data.length >= 3) {
      //Instantiating the Initial Menu
      scene.add(initialMenu.object3D)

    } else {
      val i = data.length - 1
      val shadowManifold: ShadowManifold = ShadowManifold(data(i), Res.getLastLoadedTextureID, pointColor)
      addPlot3DToRegion(shadowManifold)
      plot2D(false)
    }
  }

  def initPlot3DWithData: Unit = {
    val data = DATA(0)
    val pointColor = CustomColors.BLUE_HUE_SHIFT

    if (PLOT.length < 3) {
      Log.show(s"Data.length == ${data.length}")

      val scatterPlot: ScatterPlot = ScatterPlot(data, Res.getLastLoadedTextureID, pointColor)

      Log("[Regions] - Adding 3D plot to new region")
      val i = regions.length
      addRegion(Region(i))
      regions(i).addPlot(scatterPlot)
      repositionRegions()


      //val gui = DatGui(scatterPlot, regions(i).maybeGetAxes().get, this)
      val gui = new SettingsGui(scatterPlot, regions(i).maybeGetAxes().get, this)
      addGUI(gui)
      //regions(i).gui = Some(gui)
      //regions(i).add(gui.object3D)
      scene.add(gui.object3D)
      gui.object3D.position.setX(regions(i).object3D.position.x - 0.5)
      gui.object3D.position.setY(regions(i).object3D.position.y + 0.5)
      gui.object3D.position.setZ(regions(i).object3D.position.z + 1.0)

      //gui.object3D.rotateY(3.14 / 4)


      addPlot(scatterPlot)
      addAxes(regions(i).maybeGetAxes().get)
      //addGUI(gui)

    }
  }

  def newPlot3DWithData(xCol: Int, yCol: Int, zCol: Int): Plot = {
    val data = DATA(0)
    val pointColor = CustomColors.BLUE_HUE_SHIFT
    val scatterPlot: ScatterPlot = ScatterPlot(data, Res.getLastLoadedTextureID, pointColor)
    scatterPlot.switchAxis(0, data(xCol), true)
    scatterPlot.switchAxis(1, data(yCol), true)
    scatterPlot.switchAxis(2, data(zCol), true)

    scatterPlot
  }

  def newPlot2DWithData(columnNumber: Int): Plot = {
    val xs = DATA(0)(columnNumber)
    val plot2D = TimeSeriesPlot2D(xs)
    plot2D
  }

  def newShadowManifoldWithData(columnNumber: Int, tau: Int = 1): Plot = {
    val data = DATA(0)
    val pointColor = CustomColors.BLUE_HUE_SHIFT
    val scatterPlot: ScatterPlot = ScatterPlot(data, Res.getLastLoadedTextureID, pointColor)
    scatterPlot.switchAxis(0, data(columnNumber), true)
    scatterPlot.switchAxis(1, data(columnNumber), true)
    scatterPlot.switchAxis(2, data(columnNumber), true)

    val newSM: ShadowManifold = ShadowManifold.fromScatterPlot(scatterPlot)(tau, 0).get
    newSM.fixScale()
    newSM.setVisiblePointRange(0, newSM.numPoints - 2 * tau)
    newSM.requestFullGeometryUpdate()

    newSM
  }

  /*
  def requestEmbedding(axisID: AxisID, columnIndex: Int, tau: Int, plotIndex: Int = 0): Unit = {
    Log.show("[Plotter.requestEmbedding()]")

    /*var regionCreated: Boolean = false
    if (plotIndex >= PLOT.length) {
      regionCreated = true
      val i = regions.length
      addRegion(Region(i))
      repositionRegions()
    }*/

    val maybeNewSM: Option[ShadowManifold] =
      PLOT(plotIndex) match {
        case sm: ShadowManifold =>
          Log.show(s"embedding from SM->SM with columnIndex: $columnIndex (id: ${DATA(0)(columnIndex).id})")
          ShadowManifold.fromShadowManifold(sm)(tau)
        case sp: ScatterPlot => ShadowManifold.fromScatterPlot(sp)(tau, axisID)
      }

    if (maybeNewSM.isEmpty) {
      Log.show("[Plotter.requestEmbedding()] maybeNewSM.isEmpty == true")
      return
    }

    val newSM: ShadowManifold = maybeNewSM.get
    PLOT(plotIndex) = newSM
    newSM.fixScale()
    newSM.setVisiblePointRange(0, newSM.numPoints - 2 * tau)
    newSM.requestFullGeometryUpdate()

    Log.show(s"[Plotter.requestEmbedding()] (x, y, z) = (${newSM.xVar}, ${newSM.yVar}, ${newSM.zVar})")

    AXES(plotIndex) match {
      case a2D: CoordinateAxes2D ⇒ a2D.setAxesTitles(newSM.xVar, newSM.yVar)
      case a3D: CoordinateAxes3D ⇒ a3D.setAxesTitles(newSM.xVar, newSM.yVar, newSM.zVar)
    }
  } // -- eof
   */

  /*---- End New ----*/

  def plot2D3D(data: Array[Data], pointColor: Double = CustomColors.BLUE_HUE_SHIFT): Unit = {
    if (data.isEmpty) return
    DATA = DATA :+ data

    if(data.length >= 3) {
      val scatterPlot: ScatterPlot = ScatterPlot(data, Res.getLastLoadedTextureID, pointColor)
      addPlot3DToRegion(scatterPlot)
      plot2D(true)

      val csc = new ColumnSelectionConsole(data.map(_.id), CSC_DefaultConfig)
      REGIONS(0).object3D.parent.add(csc.object3D)
      csc.object3D.position.set(0.8, 0.5, -2)
      //csc.object3D.rotateY(-3.1415/4)
      ColumnSelectionConsole.setInstance(csc)

    } else {
      val i = data.length - 1
      val shadowManifold: ShadowManifold = ShadowManifold(data(i), Res.getLastLoadedTextureID, pointColor)
      addPlot3DToRegion(shadowManifold)
      plot2D(false)
    }
  }

  def plot2D(scatter: Boolean): Unit = {
    if(scatter) {
      val plot3D = PLOT(0).asInstanceOf[ScatterPlot]
      val xs = DATA(0)(plot3D.getColumnData(XAxis).columnNumber)
      val plot2D = TimeSeriesPlot2D(xs)
      addPlot2DToRegion(plot2D)

    } else {
      val plot3D = PLOT(0).asInstanceOf[ShadowManifold]
      val xs = DATA(0)(1)
      val plot2D = TimeSeriesPlot2D(xs)
      addPlot2DToRegion(plot2D)
    }
  }

  def plot3D(data: Array[Data], pointColor: Double = CustomColors.BLUE_HUE_SHIFT): Unit = {
    if (data.isEmpty) return
    DATA = DATA :+ data

    Log.show(s"Data.length == ${data.length}")
    if(data.length >= 3) {
      val scatterPlot: ScatterPlot = ScatterPlot(data, Res.getLastLoadedTextureID, pointColor)
      addPlot3DToRegion(scatterPlot)
      val config = CSC_DefaultConfig
      config.scatter = false
      val csc = new ColumnSelectionConsole(data.map(_.id), config)
      REGIONS(0).object3D.parent.add(csc.object3D)
      csc.object3D.position.set(1, 0.5, -1)
      csc.object3D.rotateY(-3.1415/4)
      ColumnSelectionConsole.setInstance(csc)

    } else {
      val i = data.length - 1
      val shadowManifold: ShadowManifold = ShadowManifold(data(i), Res.getLastLoadedTextureID, pointColor)
      addPlot3DToRegion(shadowManifold)
    }
  }

  /**
    * Adds a plot to a region in the scene if there is room, otherwise does nothing.
    * @param plot Some instance of a class that implements trait Plot.
    * @return The region the plot was added to if successful, otherwise None.
    */

  def addPlot3DToRegion(plot: Plot3D): Unit = {
    Log("[Regions] - Adding 3D plot to new region")
    val i = regions.length
    addRegion(Region(i))
    regions(i).addPlot(plot)
    repositionRegions()

    val gui = DatGui(plot, regions(i).maybeGetAxes().get, this)
    regions(i).gui = Some(gui)
    scene.add(gui.object3D)

    addPlot(plot)
    addAxes(regions(i).maybeGetAxes().get)
    //addGUI(gui)
  }

  /**
   * Adds a 2D plot to a region in the scene if there is room, otherwise does nothing.
   * @param plot Some instance of a class that implements trait Plot.
   * @return The region the plot was added to if successful, otherwise None.
   */
  def addPlot2DToRegion(plot: Plot): Unit = {
    Log("[Regions] - Adding 2D plot to new region")
    val i = regions.length
    addRegion(Region(i))
    regions(i).addPlot(plot)
    repositionRegions()
    addPlot(plot)
    addAxes(regions(i).maybeGetAxes().get)
  }

  def update(): Unit = {
    for (r <- regions if r.maybeGetAxes().nonEmpty) {
      r.object3D.updateMatrixWorld()
      val axes = r.maybeGetAxes().get
      val camPos = camera.position
      for(i <- axes.axesTitles.indices) {
        val modCamPos = camPos.clone()
        i match {
          case 0 => modCamPos.x -= 0.5
          case 1 => modCamPos.y -= 0.5
          case 2 => modCamPos.z -= 0.5
        }
        r.object3D.worldToLocal (modCamPos)
        axes.axesTitles (i).lookAt (modCamPos)
      }

      axes match {
        case _: CoordinateAxes2D ⇒
          axes.axesTitles(1).rotateZ(3.1415/2)
        case _: CoordinateAxes3D ⇒
      }
    }
  }

  def setVisiblePointRange(start: Int, end: Int): Unit = {

    for(plot <- PLOT) {
      plot match {
          //TODO Case for Plot3D
        case plot2D: TimeSeriesPlot2D => {
          Log.show("Position:")
          Log.show(plot2D.getPoints.position)
          val prevStart = plot2D.firstVisiblePointIndex
          val prevEnd = plot2D.visiblePoints + prevStart
          plot2D.setVisiblePointRange(start, end)

          // 1. Shift plot (-x) proportional to |start|
          val numPoints = plot2D.numPoints
          val points = plot2D.getPoints
          val deltaT = 1.0 / numPoints // distance between points along x-axis

          val prevDist2FirstVisible = 1.0 / (prevEnd - prevStart) * prevStart
          val dist2FirstVisible = 1.0 / plot2D.visiblePoints * start
          points.translateX(prevDist2FirstVisible - dist2FirstVisible)


          // 2. Scale plot (x) proportional to | end - start |
          Log.show("Scale: ")
          Log.show(points.scale)
          val scaleChange = (1.0 * (prevEnd - prevStart)) / (1.0 * (end - start))
          Log.show(s"Scale Change: $scaleChange")
          points.scale.setX(scaleChange * points.scale.x)
        }
        case _: Any =>
      }
    }
  }

  // Applies an axis change. Changes (1) plot point positions, (2) axes titles, and (3) gui labels
  def requestAxisChange(plotIndex: Int, axisID: AxisID, columnIndex: Int): Unit = {
    Log.show("[requestAxisChange] start")
    if(columnIndex >= DATA(0).length) return

    Log.show("[requestAxisChange] getting axes from Plotter plotIndex = " + plotIndex)
    val axes: CoordinateAxes = AXES(plotIndex)
    //val gui: DatGui = GUI(plotIndex)
    var plot: Plot = null

    Log.show("[requestAxisChange] matching PLOT(plotIndex)")
    PLOT(plotIndex) match {
      case sm: ShadowManifold ⇒
        val tau = sm.tau
        val sp: ScatterPlot = ScatterPlot.fromShadowManifold(sm)
        sp.switchAxis(axisID, DATA(0)(columnIndex)) // assuming a single data source
        plot = ShadowManifold.fromScatterPlot(sp)(tau).get
        PLOT(plotIndex) = plot

      case _: ScatterPlot ⇒
        plot = PLOT(plotIndex).asInstanceOf[ScatterPlot]
        plot.asInstanceOf[ScatterPlot].switchAxis(axisID, DATA(0)(columnIndex)) // assuming a single data source
        //gui.updateFolderLabels(plot.xVar, plot.yVar, plot.zVar)

      case _: ScatterPlot2D ⇒
        plot = PLOT(plotIndex).asInstanceOf[ScatterPlot2D]
        plot.asInstanceOf[ScatterPlot2D].switchAxis(axisID, DATA(0)(columnIndex))
    }

    //gui.updateFolderLabels(plot.xVar, plot.yVar, plot.zVar)
    plot match {
      case _: Plot3D =>
        axes.asInstanceOf[CoordinateAxes3D].setAxesTitles(plot.xVar, plot.yVar, plot.asInstanceOf[Plot3D].zVar)
      case _: Plot2D =>
        axes.asInstanceOf[CoordinateAxes2D].setAxesTitles(plot.xVar, plot.yVar)
    }


    /*
    // We set the new variable bound to the 3D Plots x axis to the 2D plots y axes
    if(axisID == XAxis) {
      PLOT(plotIndex + 1).asInstanceOf[ScatterPlot2D].switchAxis(YAxis, DATA(0)(columnIndex))
      AXES(plotIndex + 1).asInstanceOf[CoordinateAxes2D].setAxisTitle(DATA(0)(columnIndex).id, YAxis)
    }
    */

    Log.show("[requestAxisChange] Updating axis titles...")
    AXES(plotIndex) match {

      case a2D: CoordinateAxes2D ⇒
        axisID match { // Currently viewing a scatter-plot, so we can settle with modifying a single axis
          case XAxis => a2D.setAxisTitle(plot.xVar, XAxis)
          case YAxis => a2D.setAxisTitle(plot.yVar, YAxis)
        }

      case a3D: CoordinateAxes3D ⇒
        axisID match { // Currently viewing a scatter-plot, so we can settle with modifying a single axis
          case XAxis =>
            a3D.setAxisTitle(plot.xVar, XAxis)
            //gui.updateFolderLabels(x = plot.xVar)
          case YAxis =>
            a3D.setAxisTitle(plot.yVar, YAxis)
            //gui.updateFolderLabels(y = plot.yVar)
          case ZAxis =>
            a3D.setAxisTitle(plot.asInstanceOf[Plot3D].zVar, ZAxis)
            //gui.updateFolderLabels(z = plot.zVar)
        }

    }
  } // -- eof

  def requestEmbedding(axisID: AxisID, columnIndex: Int, tau: Int, plotIndex: Int = 0): Unit = {
    Log.show("[Plotter.requestEmbedding()]")

    /*var regionCreated: Boolean = false
    if (plotIndex >= PLOT.length) {
      regionCreated = true
      val i = regions.length
      addRegion(Region(i))
      repositionRegions()
    }*/

    val maybeNewSM: Option[ShadowManifold] =
      PLOT(plotIndex) match {
        case sm: ShadowManifold =>
          Log.show(s"embedding from SM->SM with columnIndex: $columnIndex (id: ${DATA(0)(columnIndex).id})")
          ShadowManifold.fromShadowManifold(sm)(tau)
        case sp: ScatterPlot => ShadowManifold.fromScatterPlot(sp)(tau, axisID)
      }

    if (maybeNewSM.isEmpty) {
      Log.show("[Plotter.requestEmbedding()] maybeNewSM.isEmpty == true")
      return
    }

    val newSM: ShadowManifold = maybeNewSM.get
    PLOT(plotIndex) = newSM
    newSM.fixScale()
    newSM.setVisiblePointRange(0, newSM.numPoints - 2 * tau)
    newSM.requestFullGeometryUpdate()

    Log.show(s"[Plotter.requestEmbedding()] (x, y, z) = (${newSM.xVar}, ${newSM.yVar}, ${newSM.zVar})")

    AXES(plotIndex) match {
      case a2D: CoordinateAxes2D ⇒ a2D.setAxesTitles(newSM.xVar, newSM.yVar)
      case a3D: CoordinateAxes3D ⇒ a3D.setAxesTitles(newSM.xVar, newSM.yVar, newSM.zVar)
    }
  } // -- eof


  // Point highlighting and such

  def hoverAction(laser: InputDetails, select: Boolean): Unit = {
    var ids: (Option[Int], Int) = (None, 0)

    // # Point Highlighting
    // For every region (each of which contains a plot)
    for (index <- regions.indices) {
      val region = regions(index)
      if (region.plot.nonEmpty) {
        // Get the active plot in this region
        val plot = region.plot.get
        // Retrieve intersections on an available ray caster
        val intersects: scalajs.js.Array[Intersection] = laser.rayCaster.intersectObject(plot.getPoints)
        // If intersections exist apply interaction behaviour
        if (intersects.nonEmpty) {
          // Apply highlighting to the first point intersected if it's visible
          val interactionFound = Interactions.on(plot, intersects, select)
          if(interactionFound) {
            // Assumes if this region has a plot, all previous regions have a plot
            var h = 2
            var q = (index + 1) % PLOT.length
            while(q != index) {
              Interactions.on(PLOT(q), intersects, select)
              q = (index + h) % PLOT.length
              h += 1
            }
            //if(PLOT.length > 2) Interactions.on(PLOT(2), intersects, select)

            // Shrink laser so endpoint is on the intersected point
            laser.updateLengthScale(intersects(0).distance)
            return
          } // else that point was not visible, continue...
        }
      }
    }

    var interactionFound =
      if(ColumnSelectionConsole.getInstance.nonEmpty)
        ColumnSelectionConsole.getInstance.get.interactionCheck(laser, this, select)
      else false

    // Extend laser
    if (!interactionFound) laser.updateLengthScale(5)
  }

  def selectAllHighlightedPoints(): Unit = for (r <- regions if r.plot.nonEmpty) PointOperations.selectHighlighted(r.plot.get)

  def clearSelections(): Unit = {
    for (r <- regions) {
      if (r.plot.nonEmpty) {
        val plot = r.plot.get
        for(p <- plot.selectedPointIndices) PointOperations.deselect(plot, p)
        plot.selectedPointIndices = plot.selectedPointIndices.empty
        PointOperations.updateSelectedSummary(plot)
      }
    }
  }

  /**
    * Places regions in their default positions.
    * Default positions vary with the number of regions loaded.
    * @return The number of regions available to be moved
    */
  protected def repositionRegions(): Int = {
    def getPos(i: Int): Vector3 = regions(i).object3D.position

    val num = numOccupied()
    num match {
      case 0 => // Nothing
      case 1 =>
        getPos(0).set(0, 1, -2) // north
      case 2 =>
        /*
        getPos(0).set(-1, 1, -1) // north west
        getPos(1).set(1, 1, -1) // north east
        */
        getPos(0).set(0, 1, -2) // north
        getPos(1).set(1.5, 1, -2) // north east
      case 3 =>
        /*
        getPos(0).set(-1, 1, -1) // north west
        getPos(1).set(1, 1, -1) // north east
        getPos(2).set(-2, 1, 0) // west
        */
        getPos(0).set(0, 1, -2) // north
        getPos(1).set(1.5, 1, -2) // north east
        getPos(2).set(-1.5, 1, -2) // north west
      case 4 =>
        /*
        getPos(0).set(-1, 1, -1) // north west
        getPos(1).set(1, 1, -1) // north east
        getPos(2).set(-2, 1, 0) // west
        getPos(3).set(2, 1, 0) // east
        */
        getPos(0).set(0, 1, -2) // north
        getPos(1).set(1.5, 1, -2) // north east
        getPos(2).set(-1.5, 1, -2) // north west
        getPos(3).set(2, 1, 0) // east
      case _ => // Undefined for more regions
    }
    num
  }

}