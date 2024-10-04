---
title: Builtin Functions
---


### General-purpose functions

The following functions can be meaningfully used on data of arbitrary types:
- `DATATYPE` returns the datatype of the value. For IRIs (and constant), the type is reported as `http://www.w3.org/2001/XMLSchema#anyURI`. For language-tagged strings, the type is `http://www.w3.org/1999/02/22-rdf-syntax-ns#langString`. As of Nemo v0.5.0, named nulls (blank nodes) have no defined type and `DATATYPE` does not return a valid result for such value. Moreover, the datatype is currently returned as a string, but will be an IRI in future versions ([#463](https://github.com/knowsys/nemo/issues/463)).
- `STR` returns the value as a string. For IRIs, this is the IRI string itself. For all other datatypes, this is the canonical form of the lexical value (without any datatype).
- `fullStr` returns the value as a string that is formatted as in RDF. Such stings would also be correct ways of writing the value in a Nemo rules file (though there might be shorter ways due to Nemo's abbreviations).

### Functions for strings

Nemo supports the following functions on strings.
- `STRLEN`: computes the (integer) length of a string
- `UCASE` and `LCASE`: convert a string to upper case and lower case, respectively
- `CONCAT`: creates a new string by concatenating the input strings
- `SUBSTR`: this function requires *two* parameters: a string and an integer index. The function returns the substring
that starts at the given index and extends to the end of the string.
- `SUBSTRING`: this function requires *three* parameters: a string, an integer denoting a start position, and an integer denoting a length. The function returns the substring that starts at the given index and has the supplied length.
- `STRAFTER`: takes two string parameters A and B, and returns the substring of A that follows the first occurrence of B in A. For example, `STRAFTER("3.14",".")` is `"14"`.
- `STRBEFORE`: takes two string parameters A and B, and returns the substring of A that ends before the first occurrence of B in A. For example, `STRBEFORE("3.14",".")` is `"3"`.
- `COMPARE`: compares two strings alphabetically. The result is `-1` if the first string is alphabetically before the second, `1` if it is after, and `0` if they are equal.

Moreover, there are several test functions on strings that return true or false. Please take note of the remarks about "Functions that return true or false" below when using these:

- `STRSTARTS`: checks if the string given as the first parameter starts with the string given as second parameter
- `STRENDS`: checks if the string given as the first parameter ends with the string given as second parameter
- `CONTAINS`: checks if the string given as the first parameter contains the string given as second parameter

### Functions for language tagged strings

A language-tagged string is a value like `"Hello world"@en`. The function `LANG` can be used to extract the language tag (`en` in the example), whereas `STR` can be used to obtain the lexical value (`"Hello world"`).

### Functions for numbers

Nemo supports many standard arithmetic functions. Currently, these include the following functions on single input parameters:
`ABS` (absolute), `SQRT` (square root), `SIN` (sine), `COS` (cosine), `TAN` (tangent), `ROUND` (rounding up or down), `CEIL` (rounding up), `FLOOR` (rounding down). Moreover, the following functions require two parameters:
- `LOG(x,y)`: computes the logarithm of x to base y
- `POW(x,y)`: computes the power of x to the y.
- `REM(x,y)`: computes the remainder of dividing x by y.
- `SUM(x_1, ..., x_n)`: computes the sum of the given arguments
- `PROD(x_1, ..., x_n)`: computes the product of the given arguments
- `MIN(x_1, ..., x_n)`: returns the minimum of the given arguments
- `MAX(x_1, ..., x_n)`: returns the maximum of the given arguments
- `LUKA(x_1, ..., x_n)`: computes the Łukasiewicz t-norm for the given arguments
- `BITAND(x_1, ..., x_n)`: computes the bitwise "and" of the given arguments
- `BITOR(x_1, ..., x_n)`: computes the bitwise "or" of the given arguments
- `BITXOR(x_1, ..., x_n)`: computes the bitwise "xor" of the given arguments

Nemo supports the following conversion functions:
- `INT`: Convert the given value to an integer. This works for various datatypes (not just numbers), but only for data that already corresponds to an integer. The following all evaluate to `42`: `INT(42)`, `INT(42.0)`, `INT("42")`, `INT("42"^^<http://www.w3.org/2001/XMLSchema#gYear>)`, `INT(ROUND(42.1))`. However, `INT(42.1)` does not return a result.
- `DOUBLE`: Convert a given value to a double. This function works for various datatypes (not just numbers). For example, the following evaluate to `42.0`: `DOUBLE(42)`, `DOUBLE("42.0")`, `DOUBLE("42").`
- `FLOAT`: Convert a given value to a float. This is analogous to `DOUBLE` but for 32bit floating point numbers.

It is also possible to mix numeric types, which implicitly converts them to 64-bit floating point numbers. For example, `SUM(3 * 4.0, 5, 1.0)` returns the 64-bit floating point number `18.0`.

### Functions that return true or false

Nemo supports the usual Boolean functions (`AND`, `OR`, and `NOT`), but requires them to be written in prefix-notation like other functions, e.g., `OR(?X,?Y)` rather than `?X OR ?Y`. Moreover, there are various test functions that return true if a condition is met. All of the followig expect one argument:

- `isInteger`: tests if the argument is an integer number
- `isFloat`: tests if the argument is a 32bit floating point number (float)
- `isDouble`: tests if the argument is a 64bit floating point number (double)
- `isIri`: tests if the argument is an IRI, including a "plain constant", which Nemo considers to be relative IRIs
- `isNumeric`: tests if the argument is of any numeric type
- `isNull`: tests if the argument is a named null (blank node)
- `isString`: tests if the argument is a plain string (without a language tag)

For example, the following program computes `result("true"^^<http://www.w3.org/2001/XMLSchema#boolean>)`:

```
data(a) .
result(isIri(?x)) :- data(?x) .
```

However, the following modified program does not work as expected:

```
data(a) .
result(?x) :- data(?x), isIri(?x) .
```

Here, `result` is empty, and in fact, Nemo will consider `isIri` as a user-defined predicate that has no data.
To perform the intended check, one currently has to require that `isIri` (as a function) returns "true", like so:

```
result(?x) :- data(?x), isIri(?x) = "true"^^<http://www.w3.org/2001/XMLSchema#boolean> .
```

If this pattern is required in many places, it would be convenient to define a predicate `isTrue` by giving a single fact `isTrue("true"^^<http://www.w3.org/2001/XMLSchema#boolean>)`. Then one could also write `isTrue(isIri(?x))` in rule bodies.
