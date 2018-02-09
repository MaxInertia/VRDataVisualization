package data

import utest._

/**
  * Created by Dorian Thiessen on 2018-02-05.
  */
object CSVParser_Tests extends TestSuite {
  val tests = Tests {

    'isNumberRegex { // Tests for method 'isNumber'

      'validCases {

        'no_Decimal {
          assert(CSVParser.isNumber("1"))
          assert(CSVParser.isNumber("-1"))
          assert(CSVParser.isNumber("+1"))
          assert(CSVParser.isNumber("123"))
          assert(CSVParser.isNumber("-123"))
          assert(CSVParser.isNumber("+123"))
        }

        'decimal_Of_Zero {
          assert(CSVParser.isNumber("1.0"))
          assert(CSVParser.isNumber("-1.0"))
          assert(CSVParser.isNumber("+1.0"))
        }

        'decimals {
          assert(CSVParser.isNumber("12345.6789"))
          assert(CSVParser.isNumber("-12345.6789"))
          assert(CSVParser.isNumber("+12345.6789"))
        }

        'decimal_With_No_Ones_Place {
          assert(CSVParser.isNumber(".6789"))
          assert(CSVParser.isNumber("-.6789"))
          assert(CSVParser.isNumber("+.6789"))
        }

        'integers_With_Decimal_Point {
          assert(CSVParser.isNumber("12345."))
          assert(CSVParser.isNumber("-12345."))
          assert(CSVParser.isNumber("+12345."))
        }
      }

      'invalidCases {

        'empty_String - assert(!CSVParser.isNumber(""))

        'sign_With_No_Digits {
          assert(!CSVParser.isNumber("+"))
          assert(!CSVParser.isNumber("-"))
        }

        'many_Decimal_Points {
          assert(!CSVParser.isNumber("1.."))
          assert(!CSVParser.isNumber("-1.."))
          assert(!CSVParser.isNumber("+1.."))
          assert(!CSVParser.isNumber("1.0.1"))
          assert(!CSVParser.isNumber("-1.0.1"))
          assert(!CSVParser.isNumber("+1.0.1"))
          assert(!CSVParser.isNumber("12345.67.89.4"))
          assert(!CSVParser.isNumber("-12345.67.89.4"))
          assert(!CSVParser.isNumber("+12345.67.89.4"))
        }

        'no_Digits {
          assert(!CSVParser.isNumber("A"))
          assert(!CSVParser.isNumber("alpha"))
          assert(!CSVParser.isNumber("#"))
        }

        'numbers_With_Characters {
          assert(!CSVParser.isNumber("1a"))
          assert(!CSVParser.isNumber("-1a"))
          assert(!CSVParser.isNumber("+1a"))
          assert(!CSVParser.isNumber("1.0a"))
          assert(!CSVParser.isNumber("-1.0a"))
          assert(!CSVParser.isNumber("+1.0a"))
          assert(!CSVParser.isNumber("12345.6789a"))
          assert(!CSVParser.isNumber("-12345.6789a"))
          assert(!CSVParser.isNumber("+12345.6789a"))
          assert(!CSVParser.isNumber("a1"))
          assert(!CSVParser.isNumber("a-1"))
          assert(!CSVParser.isNumber("a+1"))
          assert(!CSVParser.isNumber("a1.0"))
          assert(!CSVParser.isNumber("a-1.0"))
          assert(!CSVParser.isNumber("a+1.0"))
          assert(!CSVParser.isNumber("a12345.6789"))
          assert(!CSVParser.isNumber("a-12345.6789"))
          assert(!CSVParser.isNumber("a+12345.6789"))
        }
      }

    } // end of 'isNumber' tests
  }
}
