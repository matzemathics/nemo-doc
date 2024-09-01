---
title: Nemo's rule language
---

Nemo is controlled by programs in a simple rule language, where a *rule* is a basic "if-then" statement that describes how new information is derived from given information. For example, the following rule states that adults are persons who are at least 18 years old (the "then" part is on the left of `:-`, as is common in logic programming):

```
adult(?X) :- person(?X), age(?X,?age), ?age >= 18.
```

Rules are meaningful and can be read by humans: If you know what `person` and `age` represent in your application, then you can understand the above rule, no matter what other rules you use, which order you write them in, or how the rules may depend on the outputs of other rules. The emphasis is on what you want to do rather than how it needs to be realized on a technical level, whether you run Nemo [as a command-line client](/nemo-doc/guides/cli) or [in your browser](https://tools.iccl.inf.tu-dresden.de/nemo). In other words, Nemo is *fully declarative*.

In addition, Nemo integrates modern language features. You can use Unicode characters in all your data and identifiers, process URIs and abbreviate them with namespace prefixes, and load data from many file formats. This is also why Nemo deviates from the traditional Prolog-style logic programming syntax in some places.

The following page describes the main features of the Nemo rule language step by step.

## How to write basic rules

The core of Nemo is the well-known rule language Datalog (see [Wikipedia](https://en.wikipedia.org/wiki/Datalog)), which allows us to write programs (=sets of rules) like the following:

```
% Facts:
father(alice, bob).
mother(bob, carla).
father(bob, darius).

% Rules:
parent(?X, ?Y) :- mother(?X, ?Y) .
parent(?X, ?Y) :- father(?X, ?Y) .
```

***Hint:*** You can try out this example, and all the other examples below, at [Nemo's public online demo page](https://tools.iccl.inf.tu-dresden.de/nemo/). Of course, it will also work in the [Nemo client](/nemo-doc/guides/installing), if you have it installed.

Note that all statements end with a full stop `.`, whereas whitespace and linebreaks are often not important.
Anything from `%` to the end of the current line is a comment.
The first three lines are *facts* that specify some concrete data for individual elements (denoted by terms like `alice` here).
The final two lines are proper *rules* with their conclusion (aka *head*) on the left and their premise (aka *body*) on the right of `:-`.
The question mark `?` signifies *variables*, which act as placeholders for arbitrary elements. For example, the first rule says that "all mothers are parents", or more precisely:

> `?X` has `?Y` as a parent whenever `?X` has `?Y` as mother

As the final rule shows (and in agreement with real life), this is not the only way in which a parent relation can be established.
Given the initial question mark, variables can be named as desired, so one can also use speaking names to enhance readability:

```
parent(?child, ?mother) :- mother(?child, ?mother) .
```

The scope of all variables is local to a single rule, so the names chosen in one rule are independent from the names chosen in any other rule.
Rule bodies can consist of several pre-conditions, separated by a comma (to be read as *and*):

```
ancestor(?X,?Y) :- parent(?X, ?Y) .
ancestor(?X,?Z) :- ancestor(?X, ?Y), parent(?Y, ?Z) .
ancestorOfAlice(?X) :- ancestor(alice,?X).
```

Together with the first set of rules above, this program then computes all ancestors, and selects those
that belong to `alice`. Note that the computation of ancestors is recursive (ancestor facts may entail further ancestor facts).
Nemo makes sure that each fact is derived only once (even if there are several reasons for it to be there). In particular, this guarantees that basic programs like the above are not in danger of running forever, even if recursive rules are used.

## How to write names and data values

Before diving into further expressive features, it is useful to know how to write names of *predicates* (such as `ancestor` above) and *variables*, and what kind of data values are supported.

- **Predicates** are used to organize data in your knowledge base. For example, in the fact `mother(bob, carla).`, the predicate `mother` specifies the intended relationship, whereas the constant values `bob` and `carla` denote concrete elements that stand in this relation.
- **Data values** or **constants** denote individual elements. They can be mere names (such as `alice`) or values of datatypes such as integer, string, or some kind of floating point number.

### Constants and predicate names

There are three basic forms for predicate names and abstract constant names in Nemo:
- `alice`, `mother`: Simple string names that can start with a letter and that may also contain numbers or `_`
- `<http://www.wikidata.org/entity/Q1172264>`: Complete [IRIs](https://en.wikipedia.org/wiki/Internationalized_Resource_Identifier) of whatever form IRIs are allowed to take (this is not limited to URLs but can also be something like <tel:+12-3456-789>, and is not restricted to existing protocols like `http` or `tel`).
- `wikidata:Q1172264`: A prefixed name that abbreviates a long IRI. For this to work, the prefix must have been declared in the file, for example like this:
  ```
  @prefix wikidata: <http://www.wikidata.org/entity/> .
  ```

Internally, Nemo treats all of these as IRIs. Prefixed names are expanded by concatenating prefix and local name (so `wikidata:Q1172264` would be another way of writing `<http://www.wikidata.org/entity/Q1172264>`, and simple string names are interpreted as *relative* IRIs (so `alice` would be another way of writing `<alice>`). You can write your predicate names and constants as you prefer, or use own prefixes as a mere way of adding some "namespaces" to your identifiers.

### Values of other datatypes

Besides IRIs, values in Nemo can have a whole range of other datatypes, for example to represent strings or numbers. Similar to RDF and SPARQL, Nemo let's you use any type of data in any place, without imposing rigid schema constraints. This is illustrated with the following example:

```
mydata(a,b) .
mydata("hello", 42) .
mydata(3.14, "2023-06-19"^^<http://www.w3.org/2001/XMLSchema#date>) .

resultA(?N + 10) :- mydata(_, ?N) .
resultB(?R) :- mydata(?X, ?Y), ?R = SQRT(?X) .
resultC(?D) :- mydata(?X, _), ?D = DATATYPE(?X) .
```

Here, we create three facts for `mydata`. The first uses abstract constants (=relative IRIs); the second a string and an integer; and the third a double (64bit float) and a date in the XML Schema date type, given as a precise RDF literal syntax with full type IRI. The three rules yield the following results:
- `resultA` contains a single fact `resultA(52)`, since the `+` function is defined on the integer 42 but not on IRIs or dates
- `resultB` contains a single fact `resultB(1.772004514666935)`, since `3.14` is the only value in the first parameter to which the square root function `SQRT` can be applied.
- `resultC` contains three facts with the types `http://www.w3.org/2001/XMLSchema#anyURL`, `http://www.w3.org/2001/XMLSchema#string`, and `http://www.w3.org/2001/XMLSchema#double`, since these are the XML Schema types that Nemo uses for representing IRIs, strings, and doubles.

In general, most values can be written in the long RDF syntax format `"lexical value"^^<datatype IRI>` and IRIs can always be written with surrounding `<...>`. Prefixes can be declared to abbreviate the IRIs, so the following defines the same facts as in the previous example:

```
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
mydata(<a>,<b>) .
mydata("hello"^^xsd:string, "42"^^xsd:integer) .
mydata("3.14"^^xsd:double, "2023-06-19"^^xsd:date) .
```

However, it is often nicer to use the shortcuts:
- *Strings* can be written in `"double quotes"` or in `'single quotes'`, and multi-line strings also can be delimited in `"""` and `'''`.
- *Integers* can be written as plain numerals with an optional sign: `42`, `-23`, `+911` all work.
- *Double precision floats* can be written with decimal point and optional exponent: `3.14`, `.05`, `10.345E6` all work.
- *Language-tagged strings* are written like in RDF, e.g., `"Dresden"@de` or `ドレスデン@ja`.

For other datatypes, the long form is needed.

### Datatype support and possible pitfalls

Nemo let's you mix and match data of different types in a single predicate, but it will be very exact when distinguishing
values of different datatypes. This is generally desired but can be a source of errors, in particular:

- *Strings are not constants*: the value `a` is short for the IRI `<a>` and different from the string `"a"`.
- *Doubles are not floats*: Nemo supports 64bit and 32 bit floating point numbers (aka "double" and "float"). As in XML Schema, the values of these two encoding systems are always different, so `23.4` is short for `"23.4"^^<http://www.w3.org/2001/XMLSchema#double>` and not the same as `"23.4"^^<http://www.w3.org/2001/XMLSchema#float>`.
- *Double and float are not integers*: Just like no double ever equals a float, neither doubles nor floats can ever equal an integer. For example, `42` is different from `42.0` for this reason.

Nemo offers a number of built-in functions to explicitly convert between datatypes in order to bridge such discrepancies. For example, `STR` converts values to strings, and `DOUBLE` converts numbers to doubles.

However, Nemo does understand all XML Schema integer types and knows that they have overlapping value spaces. For example, the values `"42"^^<http://www.w3.org/2001/XMLSchema#integer>`, `"42"^^<http://www.w3.org/2001/XMLSchema#long>`, `"42"^^<http://www.w3.org/2001/XMLSchema#unsignedInt>`, and `"42"^^<http://www.w3.org/2001/XMLSchema#byte>`  in Nemo all denote the same number that can be written as `42`. In general, Nemo *normalizes* values of known types so that it does not matter which of several equivalent writings was used. This also means that Nemo has no way of preserving syntactic details across the computation: results will always be formatted in a normalized form.

It is possible to use arbitrary datatypes, including those that Nemo does not know about. Values of such types are treated verbatim (no normalization). Generic built-in functions like `DATATYPE` (retrieving the datatype of a literal) can still be used in such cases.

### Blank nodes and nulls

Nemo supports *nulls*, a kind of value mostly used for anonymous placeholder values. In RDF, such values are known as *blank nodes* (or *bnodes*), whereas in relational databases they correspond to *named nulls*. The attribute *named* hints at the fact that there can be many distinct nulls (as opposed to the single `NULL` value of SQL, which is further overloaded to mean either "some unspecified value" or "no value", depending on context). However, the name of a null is only relevant to distinguish them from other nulls, it is not guaranteed to be stable (in fact, Nemo may rename nulls internally), and it can therefore not be used to refer to the null "globally" (e.g., you cannot have several files that all speak about the same named null).

For computational purposes, Nemo treats named nulls just like any other type of data. In particular, the possibility of them being equal to other values does not influence how rules are applied, since Nemo is only interested in cases where values are certainly equal.

To write named nulls in rule and data files, we use a syntax introduced by RDF: `_:nullId`, where the `nullId` is any alphanumeric identifier. Often, one just uses some number, as in `_:234`, and this is what Nemo will do when returning or storing bnodes in files. As stated above, the identifier (name) only serves to distinguish nulls and can change during processing. Nemo merely guarantees that two distinctly named nulls will not be renamed to become the same null.

Due to the difficulty of referring to them globally (or locally in queries), the use of blank nodes is often not practical. However, they play important roles in some file formats (e.g., as auxiliary nodes in W3C OWL/RDF files) and for representing newly invented values in *existential rules*.

## Working with external data

Nemo allows importing external data files as predicates. The general syntax for this is as follows:
```
@import table :- csv{resource = "path/to/file.csv"} .
```

Here, `table` denotes the predicate that data is imported to, `csv` is the data format (comma-separated values),
and `path/to/file.csv` is the path to the file. Instead of a local path, it is also possible to define a URL from
which data should be downloaded, e.g., `resource = <https://example.org/file.csv>`.

The following formats are currently supported:
- Delimiter-separated values: `csv`, `tsv` (tab-separated), `dsv` (delimiter required as parameter, e.g., `delimiter=";"`)
- RDF triples: `ntriples` (NT), `turtle` (Turtle), `rdfxml` (RDF/XML); data is always imported in order "subject, predicate, object"
- RDF quads: `nquads` (NQuads), `trig` (TRiG); data is always imported in order "graphname, subject, predicate, object"
- General RDF: `rdf` can be used for RDF that is not further specified; the actual format will be guessed using the file name and predicate arity
- (experimental - not yet in 0.5) JSON objects: `json` deserializes json data into a table representation consisting of triples of the form "object-id, key, object-id" (see table below, how each json type is represented). The root object of the document always has object-id 0. Furthermore, for each object-id a triple of the form "object-id, `<type>`, type-id" is stored, where type-id is one of `"object"`, `"array"`, `"string"`, `"number"`, `"bool"` or `"null"`. Literal values will be assigned an object-id as well, with a triple of the form "object-id, `<value>`, literal-value"

```
JSON                              | nemo
----------------------------------------------------------------------------------------------
{"key1": value1, "key2": value2}  | (0, type, "object"),
                                  | (0, "key1", 1),
                                  | (0, "key2", 2),
                                  | (1, type, ...),
                                  | (2, type, ...)
                                  |
[value1, value2]                  | (0, type, "array"),
                                  | (0, 0, 1),
                                  | (0, 1, 2),
                                  | (1, type, ...),
                                  | (2, type, ...)
                                  |
"foobar"                          | (0, type, "string"),
                                  | (0, value, "foobar")
                                  |
42.1337                           | (0, type, "number"),
                                  | (0, value, 42.1337)
                                  |
true                              | (0, type, "bool"),
                                  | (0, value, "true"^^<http://www.w3.org/2001/XMLSchema#boolean>)
                                  |
null                              | (0, type, "null")
```

Some formats, such as CSV, do not specify how values in the file should be interpreted. By default, Nemo will heuristically interpret data.
For example, in CSV files, the string `123` will be interpreted as an integer, but the string `abc` as a constant name (relative IRI). To control this in more detail, the parameter `format` can be used. It takes a list of format strings, like in the following example:

```
@import data :- csv{resource="file.csv", format=(string,string,int,any)} .
```

This example imports from a CSV file that should have four columns: the first two will be read as literal strings, the third as an integer, and the final as "anything" that seems right (the default format, also good for IRIs). Lines that cannot be interpreted in this format will be skipped silently, e.g., if a line has something in the third field that does not look like an integer. Therefore, all imported data is guaranteed to have the chosen format. Currently, Nemo supports the following formats:

- `any`: the default best-effort parsing
- `string`: try to interpret all values as plain strings, fastest import option for CSV
- `int`: interpret values as integers, if possible
- `double`: interpret values as double precision floats (f64), if possible
- `skip`: special format to ignore a column entirely (if used, the imported data has smaller arity than the table in the file)

The same formats can be used in RDF imports as well. RDF has a more precise type system, where every value has an unambiguous type. The formats then mainly act as filters that will remove triples that do not fit (e.g., to load only triples with integer values). For converting values to other datatypes, e.g., from integers to strings, rules with built-in functions (in this case `STR`) can be used after import.

Import directives support various other optional parameters:
- `limit`: if specified, only at most this many tuples are imported (great for testing when working with large files)
- `compression`: used to define a compression format (`gzip` or `none`); this will normally be guessed correctly from the file extension, but can be useful for non-standard file names or URLs
- `delimiter`: only for import format `dsv`, specify a delimiter string (should be a single character)
- `base`: specify the base IRI to be used when importing RDF data; if given, relative IRIs will be made absolute based on this base; otherwise, relative IRIs remain relative in Nemo

## Returning and storing results

To return or store results, you can use `@export` directives, which work analogously to `@import`. For example, the following directive exports the data for predicate `result` to an RDF file in Turtle format:

```
@export result :- turtle{resource="out.ttl"} .
```

Export directives largely work like imports, and support the same formats (such as `turtle` in the example) and most of the same parameters. For example, the following export writes a CSV file that contains two columns, with the first formatted as plain string and the second as an integer. The third parameter of the exported predicate `result` is skipped and will not be in the file:

```
@export result :- csv{resource="out.csv.gz", format=(string,int,skip)} .
```

The output will be gzipped (guessed from file name). Tuples that contain anything other than a string in the first component and an integer in the second will not be exported and ignored silently. Instead of writing data to a file, one can also return it in the standard output (on the command line). For this, an empty string should be given as a resource, as in this example that prints the first 10 triples in RDF format:

```
@export triples :- turtle{resource="", limit=10} .
```

In exports, it is also possible to omit the `resource` parameter altogether. In this case, a default file name will be chosen based on the exported predicate, file format, and compression. For example, the following will export to `triples.nt.gz`:

```
@export triples :- ntriples{compression="gzip"} .
```

When using the [Nemo command-line client](/nemo-doc/guides/cli), some options are available to override the export directives in the program, to set the output (base) directory, and to control if existing files should be overwritten.

## Built-in functions and predicates

Nemo offers many functions and predicates to work with data. In contrast to the user-defined symbols, such functions and predicates are called *built-ins*. Many functions are made for particular types of input data, such as the `STRLEN` function that computes the length of a string. However, built-ins are generally robust and can be used with all kinds of data: if they do not return any valid result for a given input (e.g., when calling `STRLEN` with an integer number as input), then the rule where they are used is not applicable to this data. Here is an example:

```
input(42) .
intput("example") .
length(?X, STRLEN(?X)) :- input(?X) .
```

Only one `length` fact will be computed, namely `length("example", 7)`, but there will not be any visible error.

In general, many functions in Nemo are named like corresponding functions in SPARQL, and Nemo strives to implement them in the same way.

***Known restriction in Nemo v0.5.0.*** As of Nemo v0.5.0, built-in functions are strictly case-sensitive. Using functions that are not recognized by Nemo leads to an error (in fact, a panic). Future versions of Nemo will support user-defined nested functions.

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

***Known restriction in Nemo v0.5.0.*** As of Nemo v0.5.0, functions that return booleans cannot yet be used as predicates in rule atoms ([#465](https://github.com/konwsys/nemo/issues/465)).
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

## Negation

Nemo supports negation to check for the absence of facts, but requires that there are no recursive dependency cycles that involve negation (this is called *stratification*). To negate an atom, `~` is used in front of it in rule bodies.

*todo: expand documentation*

## Existential rules

Nemo supports so-called *existential rules*, which can entail that some values *exist* without specifying in detail what these values are. In mathematical logic, this corresponds to the use of existential quantifiers in the conclusion of rules. In Nemo, instead of adding logical symbols, we use `!` to denote existential variables in rule heads.

For example, the following tribute to the [FOAF](http://xmlns.com/foaf/spec/) project loads RDF data about people and arranges it in a table. The first rule covers the case where given name and family name are available. The second rule then states that already the availability of the given name should be sufficient to get a row in the `person` table: the existential variable `!family` can be seen as a placeholder value  in this case:

```
@prefix foaf: <http://xmlns.com/foaf/0.1/> .
@import rdf: ntriples{resource="mydata.nt.gz"} .
person(?x, ?given, ?family) :- rdf(?x, foaf:givenName, ?given), rdf(?x, foaf:familyName, ?family) .
person(?x, ?given, !family) :- rdf(?x, foaf:givenName, ?given) .
```

Nemo is smart enough to prioritize the first rule, and to apply the second only in cases where we do not yet have a row with the `?x` and `?given` and some concrete family name. In this way, existential rules can be used as fallback values to handle incomplete data. The newly created values are *named nulls*.

Existential rules have several other possible uses besides acting as placeholders for missing values:
- They can be used for creating unique identifiers ("keys") for tuples. The following rules create the union of two inputs relations, and create a key for each, but Nemo will still make sure that each tuple only has one key (even if it occurs in both inputs):
```
result(?v1,?v2,?v3,!key) :- inputA(?v1,?v2,?v3) .
result(?v1,?v2,?v3,!key) :- inputB(?v1,?v2,?v3) .
```
A similar transformation is the so-called *reification* of RDF triples, where we mint identifiers for triples that can subsequently be used to attach further (meta)data to the triple.
- Existential rules also are known to increase the theoretical computational power of Datalog significantly. While plain Datalog can only express (some) computations that can be performed in polynomial time over the data, existential rules can capture all recursively enumerable computations over a knowledge graph.

There are several ways of processing existential variables in rules. The approach implemented in Nemo is known as the *Datalog-first restricted chase* (sometimes *Datalog-first standard chase*). It has the advantage that it is often successful in creating relatively few null values, and rather re-using known values if any (as in the above example), whereas still being efficient to implement.

***Note:*** Nemo supports several other ways of creating new values (that are not taken from the input). For example, arithmetic operations can be used to create new integer numbers, and string concatenation can be used to form new strings. Such mechanisms have the potential of being used for some of the same purposes as existential variables. The main difference is that these approaches rely on you to specify how a new identifier should look (and making sure that it is new in the first place), whereas existential variables are newly introduced on-demand by Nemo (but have no intelligible name). What is more appropriate should be decided (or tried out) for each application.

## Aggregates

### Reference

Aggregates can be used in head atoms of Nemo rules. Aggrates are computed after the evalutating body of a rule (e.g. arithmetic operations). Currently, there is a maximum of one aggregate per rule.

The following aggregate functions are available:

-   `#count(?A, ?D1, ?D2, ?D3, ..., ?DN)`: count of distinct tuple values `(?A, ?D1, ?D2, ?D3, ..., ?DN)`. The aggregated variable is required, the distict variables are optional.
-   `#min(?A)`: minimum numerical value
-   `#max(?A)`: minimum numerical value
-   `#sum(?A, ?D1, ?D2, ?D3, ..., ?DN)`: sum of the numberical values of only the first component of distinct tuple values `(?A, ?D1, ?D2, ?D3, ..., ?DN)`. The aggregated variable is required, the distict variables are optional. The distict variables allow to sum up the value of the aggregated variable multiple times, exactly once for ever combination of distinct variable values that are matched.

### Usage

#### Most basic form

Aggregates allow you to combine multiple tuples into one. This is done by computing a function, such as min, max, sum or count, over a body variable of a rule. In general, they are similar to how aggregate functions work in SQL:

```
% ID and department, and salary
employee(1, "IT", 40) .
employee(2, "Sales", 50) .
employee(3, "Sales", 30) .

departmentCount(#count(?DEPARTMENT)) :- employee(?ID, ?DEPARTMENT, ?SALARY). % This infers the fact `departmentCount(2)`
```

#### Group-by variables

All variables that you use outside of aggregates in the head will implicitly become group-by variables:

```
sumOfsalariesByDepartment(?DEPARTMENT, #sum(?SALARY)) :- employee(?ID, ?DEPARTMENT, ?SALARY). % This infers the facts `sumOfsalariesByDepartment("IT", 40)` and `sumOfsalariesByDepartment("Sales", 80)`
```

#### Distinct variables

*todo*

## Currently undocumented

Besides the TODOs above, there are some more things that are not mentioned anywhere yet:
* Output directives
