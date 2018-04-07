package plots



import org.scalajs.{threejs => THREE}

import scala.annotation.implicitNotFound

/**
  * Created by Dorian Thiessen on 2018-04-06.
  */
object PointsBuilder{
  sealed trait Component
  object Prop {
    sealed trait CleanPlot extends Component
    sealed trait XCoordSet extends Component
    sealed trait YCoordSet extends Component
    sealed trait ZCoordSet extends Component
    sealed trait Texture   extends Component // If not required, can be removed.
    type Buildable2DPlot = CleanPlot with XCoordSet with YCoordSet
    type Buildable3DPlot = CleanPlot with XCoordSet with YCoordSet with ZCoordSet
  }

  import plots.PointsBuilder.Prop._
  class PointsBuilder[Props <: Component] private(xs: Array[Double], ys: Array[Double], zs: Array[Double],
                                                  textureID: Int = 0, hue: Option[Double]) {

    // Methods for adding the various coordinate values to the builder.
    def withXS(xValues: Array[Double]): PointsBuilder[Props with XCoordSet] =
      new PointsBuilder[Props with XCoordSet](xValues, ys, zs, textureID, None)
    def withYS(yValues: Array[Double]): PointsBuilder[Props with YCoordSet] =
      new PointsBuilder[Props with YCoordSet](xs, yValues, zs, textureID, None)
    def withZS(zValues: Array[Double]): PointsBuilder[Props with ZCoordSet] =
      new PointsBuilder[Props with ZCoordSet](xs, ys, zValues, textureID, None)

    // Method for adding the textureID of the desired point texture.
    def usingTexture(textureIn: THREE.Texture): PointsBuilder[Props with Texture] =
      new PointsBuilder[Props with Texture](xs, ys, zs, textureID, None)

    // If set, the hue of each successive point will shift slightly, starting at this value
    def usingHue(hueIn: Option[Double]): PointsBuilder[Props] =
      new PointsBuilder[Props](xs, ys, zs, textureID, hueIn)

    @implicitNotFound("Not enough variables provided to construct a 3D plot")
    def build3D(implicit ev: Props =:= Buildable3DPlot): Points = {
      val vertices: Array[Coordinate] = Plot.zip3(xs, ys, zs)
      Plot.makePoints(vertices, hue, textureID)
    }

  }
}