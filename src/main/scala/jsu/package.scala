import org.scalajs.dom.CustomEvent
import scala.scalajs.js

/**
 * Various methods for making some tasks less verbose in ScalaJS.
 * Created by Dorian Thiessen on 2018-08-02.
 */
package object jsu {

  def newEvent(name: String, eventDetail: js.Any = js.undefined): CustomEvent = {
    // Import style suggested here: https://stackoverflow.com/questions/24619945/creating-custom-dom-events-with-scalajs
    import js.Dynamic.{global ⇒ g, newInstance ⇒ jsNew, literal}
    jsNew(g.CustomEvent)(name, literal(detail = eventDetail)).asInstanceOf[CustomEvent]
  }

}
