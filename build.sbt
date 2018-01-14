name := "CCM-VR"
version := "0.1"
scalaVersion := "2.12.4"

enablePlugins(ScalaJSPlugin)

libraryDependencies ++= Seq(
  "org.scala-js" %%% "scalajs-dom" % "0.9.2",
  "com.lihaoyi" %%% "utest" % "0.6.0" % "test"
)

testFrameworks += new TestFramework("utest.runner.Framework")

resolvers += sbt.Resolver.bintrayRepo("denigma", "denigma-releases") //add resolver
libraryDependencies += "org.denigma" %%% "threejs-facade" % "0.0.77-0.1.8" //add dependency

scalaJSUseMainModuleInitializer := false // Explicitly called from script in index.html
