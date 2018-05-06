name := "VRDataVisualization"
version := "0.1"
scalaVersion := "2.12.4"


resolvers += sbt.Resolver.bintrayRepo("scalajs-facades", "scalajs-facades-releases") //add resolver
libraryDependencies ++= Seq(
  "org.scala-js" %%% "scalajs-dom" % "0.9.2",
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


enablePlugins(GhpagesPlugin)
enablePlugins(SiteScaladocPlugin)
git.remoteRepo := s"git@github.com:MaxInertia/$name.git"
mappings in makeSite ++= Seq(
  file("src/main/www/index.html") -> "index.html",
  file(s"${Paths.vrSrc}/index.html") -> "vr/index.html",
  file(s"${Paths.vrSrc}/css/style.css") -> "vr/css/style.css",
  file(s"${Paths.vrSrc}/img/disc.png") -> "vr/img/disc.png",
  file(s"${Paths.vrSrc}/img/disc2.png") -> "vr/img/disc2.png",
  file(s"${Paths.vrSrc}/img/blueOrb.png") -> "vr/img/blueOrb.png",
  file(s"${Paths.vrSrc}/img/orangeOrb.png") -> "vr/img/orangeOrb.png",
  file(s"${Paths.vrSrc}/js/lib/FirstPersonVRControls.js") -> "vr/js/lib/FirstPersonVRControls.js",
  file(s"${Paths.vrSrc}/js/lib/PhoneVR.js") -> "vr/js/lib/PhoneVR.js",
  file(s"${Paths.vrSrc}/js/lib/stats.min.js") -> "vr/js/lib/stats.min.js",
  file(s"${Paths.vrSrc}/js/lib/three.js") -> "vr/js/lib/three.js",
  file(s"${Paths.vrSrc}/js/lib/VRController.js") -> "vr/js/lib/VRController.js",
  file(s"${Paths.vrSrc}/js/lib/VRControls.js") -> "vr/js/lib/VRControls.js",
  file(s"${Paths.vrSrc}/js/lib/WebVR.js") -> "vr/js/lib/WebVR.js",
  file(s"${Paths.vrSrc}/js/lib/webvr-polyfill.min.js") -> "vr/js/lib/webvr-polyfill.min.js",
  file("target/scala-2.12/ccm-vr-fastopt.js") -> "target/scala-2.12/ccm-vr-fastopt.js"
)