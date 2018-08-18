/**
  * Created by Dorian Thiessen on 2018-05-05.
  */
object Paths {

  val www: String = "src/main/www/"

  /** Files & Directories associated with Development
    * that are copied to a deployment folder */
  object Devel {
    // Directories
    val jsLibDir: String = www + """js/lib/"""
    // Files
    val index: String = www + """index.html"""
    val fullOptJS: String = """./target/scala-2.12/vrdv-opt.js"""
  }

  /** File & Director*/
  object Deploy {
    // Directories
    val dir: String = """./deploy/"""
    val jsDir: String = dir + """js/"""
    val jsLibDir: String = jsDir + """lib/"""
    // Files
    val index: String = dir + """index.html"""
    val fullOptJS: String = jsDir + """vrdv-opt.js"""
  }

  val jsLibs: Seq[String] = Seq(
    "stats.min.js",
    "WebVR.js",
    "three.min.js",
    "VRControls.js",
    "VREffect.js",
    "VRController.js",
    "FirstPersonVRControls.js")
}
