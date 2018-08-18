name := "VRDataVisualization"
version := "0.2"
scalaVersion := "2.12.6"


resolvers += sbt.Resolver.bintrayRepo("scalajs-facades", "scalajs-facades-releases") //add resolver
libraryDependencies ++= Seq(
  "org.scala-js" %%% "scalajs-dom" % "0.9.5",
  "be.doeraene" %%% "scalajs-jquery" % "0.9.3",
  "com.lihaoyi" %%% "utest" % "0.6.0" % "test",
  "org.scalajs" %%% "threejs-facade" % "0.0.88-0.1.9"
)
testFrameworks += new TestFramework("utest.runner.Framework")


enablePlugins(ScalaJSPlugin)
//scalaJSModuleKind := ModuleKind.CommonJSModule
scalaJSUseMainModuleInitializer := false // Explicitly called from script in index.html
scalacOptions += "-P:scalajs:sjsDefinedByDefault"
skip in packageJSDependencies := false
libraryDependencies += "org.scalactic" %% "scalactic" % "3.0.5"
libraryDependencies += "org.scalatest" %% "scalatest" % "3.0.5" % "test"

// sbt ghpagesPushSite
enablePlugins(GhpagesPlugin)
enablePlugins(SiteScaladocPlugin)
git.remoteRepo := s"git@github.com:MaxInertia/$name.git"
mappings in makeSite ++= Seq(
  file(s"${Paths.www}/deploy.html") -> "index.html",
  file(s"${Paths.www}/css/style.css") -> "css/style.css",
  file(s"${Paths.www}/fonts/helvetiker_regular.typeface.json") -> "fonts/helvetiker_regular.typeface.json",
  file(s"${Paths.www}/img/disc.png") -> "img/disc.png",
  file(s"${Paths.www}/img/disc2.png") -> "img/disc2.png",
  file(s"${Paths.www}/img/blueOrb.png") -> "img/blueOrb.png",
  file(s"${Paths.www}/img/orangeOrb.png") -> "img/orangeOrb.png",
  file(s"${Paths.www}/js/lib/FirstPersonVRControls.js") -> "js/lib/FirstPersonVRControls.js",
  file(s"${Paths.www}/js/lib/PhoneVR.js") -> "js/lib/PhoneVR.js",
  file(s"${Paths.www}/js/lib/stats.min.js") -> "js/lib/stats.min.js",
  file(s"${Paths.www}/js/lib/three.js") -> "js/lib/three.js",
  file(s"${Paths.www}/js/lib/VRController.js") -> "js/lib/VRController.js",
  file(s"${Paths.www}/js/lib/VRControls.js") -> "js/lib/VRControls.js",
  file(s"${Paths.www}/js/lib/WebVR.js") -> "js/lib/WebVR.js",
  file(s"${Paths.www}/js/lib/SceneUtils.js") -> "js/lib/SceneUtils.js",
  file(s"${Paths.www}/js/lib/papaparse.min.js") -> "js/lib/papaparse.min.js",
  file(s"${Paths.www}/js/lib/datguivr.js") -> "js/lib/datguivr.js",
  file(s"${Paths.www}/js/lib/webvr-polyfill.min.js") -> "js/lib/webvr-polyfill.min.js",
  file("target/scala-2.12/vrdatavisualization-opt.js") -> "js/vrdatavisualization-opt.js"
)
