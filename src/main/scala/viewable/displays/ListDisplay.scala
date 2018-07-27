package viewable.displays
import facades.IFThree.Group
import org.scalajs.threejs._
import scala.scalajs.js

/**
  * Created by Dorian Thiessen on 2018-07-26.
  */
class RowSettings(var width: Double = 0.04, var height: Double = 0.08, var margin: Double = 0.02)

class ListDisplay(val contents: Array[String],
                  rowSettings: RowSettings = new RowSettings(),
                  vertical: Boolean = true,
                  canvasWidthConstant: Int = 0,
                  canvasHeightConstant: Int = 0,
                  textSize: Int = 48) {

  val maxTextLength: Int = contents.map(_.length).max
  val RowWidth: Double = rowSettings.width * maxTextLength
  val RowHeight: Double = rowSettings.height
  val RowMargin: Double = rowSettings.margin

  var elements: Array[ListRow] = contents.map( text => {
    val row = new ListRow(text, RowWidth, RowHeight)
    row.writeContent()
    row
  })

  val group3D: Group = {
    val g = new Group()
    for(i <- elements.indices) {
      if(vertical) elements(i).object3D.position.setY(-i * (RowHeight + RowMargin))
      else elements(i).object3D.position.setX(i * (RowWidth + RowMargin))
      g.add(elements(i).object3D)
    }
    if(vertical) g.position.setY((RowHeight + RowMargin) * contents.length)
    else g.position.setX((RowWidth + RowMargin) * contents.length)
    g
  }

  // Idempotent
  def disableRow(rowIndex: Int): Unit = {
    val row = elements(rowIndex)
    row.offHover()
    row.disabled = true
    row.object3D.material.transparent = true
    row.object3D.material.opacity = 0.5
  }

  // Idempotent
  def enableRow(rowIndex: Int): Unit = {
    val row = elements(rowIndex)
    row.disabled = false
    row.object3D.material.transparent = false
  }

  class ListRow private[ListDisplay](val content: String, width: Double, height: Double) extends Display {
    private val canvas: CanvasEl = createCanvas(
      width = (maxTextLength * 24) + canvasWidthConstant,
      height = (textSize + 2) + canvasHeightConstant
    )

    override protected def get2DGraphics: Graphics2D = canvas.getContext("2d").asInstanceOf[Graphics2D]
    val contentWidth: Double = get2DGraphics.measureText(content).width

    override val object3D: Mesh = {
      val cTexture: Texture = new Texture(canvas)
      cTexture.minFilter = THREE.NearestFilter // Alternative: LinearFilter
      cTexture.magFilter = THREE.NearestFilter

      val material = new MeshBasicMaterial()
      material.side = THREE.DoubleSide
      material.map = cTexture
      material.map.needsUpdate = true

      val mesh = new Mesh(new PlaneGeometry(width, height), material)
      mesh.position.set(0, 0, 0)
      mesh
    }

    protected[ListDisplay] def writeContent(text: String = "white", background: String = "black"): Unit = {
      val graphics = get2DGraphics
      graphics.fillStyle = background
      graphics.fillRect(0, 0, canvas.width, canvas.height)

      graphics.font = s"${textSize}px serif"
      graphics.fillStyle = text
      graphics.fillText(content, maxTextLength, 40)
      object3D.material.asInstanceOf[MeshBasicMaterial].map.needsUpdate = true
    }
    writeContent()

    // Interactions

    var hovering: Boolean = false
    var disabled: Boolean = false

    def onHover(): Unit = {
      if(disabled) return
      hovering = true
      writeContent(text = "black", background = "white")
    }

    def offHover(): Unit = {
      hovering = false
      writeContent()
    }
  }

}

