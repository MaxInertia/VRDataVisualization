name := "CCM-VR"
version := "0.1"
scalaVersion := "2.12.4"

enablePlugins(ScalaJSPlugin)

resolvers += sbt.Resolver.bintrayRepo("scalajs-facades", "scalajs-facades-releases") //add resolver

libraryDependencies ++= Seq(
  "org.scala-js" %%% "scalajs-dom" % "0.9.2",
  "com.lihaoyi" %%% "utest" % "0.6.0" % "test",
  "org.scalajs" %%% "threejs-facade" % "0.0.88-0.1.9",
  "be.doeraene" %%% "scalajs-jquery" % "0.9.3"
)

testFrameworks += new TestFramework("utest.runner.Framework")

//resolvers += Resolver.sonatypeRepo("releases")

/*libraryDependencies ++= Seq(
  "io.scalajs" %%% "nodejs-core" % "0.4.2",
  "io.scalajs.npm" %%% "eclairjs" % "0.4.2",
)*/

//scalaJSModuleKind := ModuleKind.CommonJSModule
scalaJSUseMainModuleInitializer := false // Explicitly called from script in index.html
scalacOptions += "-P:scalajs:sjsDefinedByDefault"

skip in packageJSDependencies := false