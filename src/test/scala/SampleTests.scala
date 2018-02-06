import utest._

/**
  * See https://github.com/lihaoyi/utest for more examples
  */
object SampleTests extends TestSuite {
  val tests = Tests{
    'sampleTest1 - {
      assert(true)
    }

    'sampleTest2 - {
      val x, y = 0
      assert(x == y)
    }

    def runTestChecks(fileName: String): Unit = {
      // lots of code using fileName
      assert(fileName.length() > 0)
    }
    "hello" - runTestChecks("hello")
    "world" - runTestChecks("world")
  }
}
