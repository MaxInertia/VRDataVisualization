import Main.env
import facades.IFThree.{LineSegments, WireframeGeometry}
import org.scalajs.{threejs => THREE}
import plots.{Colors, Plot}
import scala.scalajs.js.annotation.{JSExport, JSExportTopLevel}

/**
  * Created by Dorian Thiessen on 2018-04-07.
  */
@JSExportTopLevel("vrdv")
object Utils {

  @JSExport("switchPlot")
  def switchPlot(i: Int): Unit = env.nextPlot(i)

  @JSExport("scalePlot")
  def scalePlot(i: Int, s: Double): Unit =
    env.getActivePlot(i).getPoints.scale.multiplyScalar(s)

  var cube1: Option[THREE.Mesh] = None
  var cube2: Option[THREE.Mesh] = None

  @JSExport("showPlotBounds")
  def showPlotBounds(): Unit = {
    def getBoundingCube: THREE.Mesh = {

      def basicMaterial: THREE.MeshBasicMaterial = {
        val params: THREE.MeshBasicMaterialParameters =
          new scala.scalajs.js.Object()
            .asInstanceOf[THREE.MeshBasicMaterialParameters]
        params.color = Colors.Hex.WHITE
        new THREE.MeshBasicMaterial(params)
      }

      val sideLen = 1 + Plot.PARTICLE_SIZE/2
      val geometry = new THREE.BoxGeometry( sideLen, sideLen, sideLen )
      val cube = new THREE.Mesh( geometry, basicMaterial )
      cube.material.transparent = true
      cube.material.opacity = 0.1
      cube.position.set(0,0,0)

      var wireframe = new WireframeGeometry( geometry )
      var line = new LineSegments(wireframe)
      line.material.depthTest = false
      line.material.opacity = 0.25
      line.material.transparent = true

      cube.add(line)
      cube
    }

    if(cube1.isEmpty) {
      cube1 = Some(getBoundingCube)
      cube2 = Some(getBoundingCube)
      env.getRegions(0).add(cube1.get)
      env.getRegions(1).add(cube2.get)
    } else {
      env.getRegions(0).remove(cube1.get)
      env.getRegions(1).remove(cube2.get)
      cube1 = None
      cube2 = None
    }
  }

  @JSExport("collapse")
  def mergeRegions(): Unit = {
    env.getRegions(0).position.set(0, 1, -1)
    env.getRegions(1).position.set(0, 1, -1)
  }

  @JSExport("expand")
  def separateRegions(): Unit = env.repositionRegions()

}

