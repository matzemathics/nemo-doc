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

The section on [datatypes](/nemo-doc/reference/datatypes) provides more information on the supported datatypes, notably it lists some [pitfalls](/nemo-doc/reference/datatypes#pitfalls) that you might run into when starting to work with Nemo.

## Working with external data

Nemo allows importing external data files as predicates. The general syntax for this is as follows:
```
@import table :- csv{resource = "path/to/file.csv"} .
```

Here, `table` denotes the predicate that data is imported to, `csv` is the data format (comma-separated values),
and `path/to/file.csv` is the path to the file. Instead of a local path, it is also possible to define a URL from
which data should be downloaded, e.g., `resource = <https://example.org/file.csv>`.

The section on [importing data](/nemo-doc/reference/imports) provides information on the supported data formats and additional features of the `@import` directive.

## Returning and storing results

To return or store results, you can use `@export` directives, which work analogously to `@import`. For example, the following directive exports the data for predicate `result` to an RDF file in Turtle format:

```
@export result :- turtle{resource="out.ttl"} .
```

Export directives largely work like imports, and support the same formats (such as `turtle` in the example) and most of the same parameters. For reference, see the section on [exporting data](/nemo-doc/reference/exports).

## Built-in functions and predicates

Nemo offers many functions and predicates to work with data. In contrast to the user-defined symbols, such functions and predicates are called *built-ins*. Many functions are made for particular types of input data, such as the `STRLEN` function that computes the length of a string. However, built-ins are generally robust and can be used with all kinds of data: if they do not return any valid result for a given input (e.g., when calling `STRLEN` with an integer number as input), then the rule where they are used is not applicable to this data. Here is an example:

```
input(42) .
input("example") .

length(?X, STRLEN(?X)) :- input(?X) .
```

Only one `length` fact will be computed, namely `length("example", 7)`, but there will not be any visible error.

In general, many functions in Nemo are named like corresponding functions in SPARQL, and Nemo strives to implement them in the same way. Built-ins are not case-sensitive.

For a comprehensive list of built-in functions and predicates, see the section on [built-ins](/nemo-doc/reference/builtins).

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

Aggregates are a powerful feature of Nemo that allow you to compute statistics over groups of data. The following example computes the average age of people in a table:

```
sum(#sum(?age)) :- person(_, _, ?age).
count(#count(?id)) :- person(?id, _, _).

avg(DOUBLE(?sum) / ?count) :- sum(?sum), count(?count).

person(1, "Alice", 25).
person(2, "Bob", 30).
```

The `#` symbol is used to denote aggregate functions -
in this example, the `sum` rule computes the sum of all ages using the `#sum` aggregate and the `count` rule counts the number of people.
Since only one aggregate function per rule is supported currently, the average has to be computed in a seperate rule, where the `DOUBLE` function is used to convert the sum to a floating-point number.

The section on [aggregates](/nemo-doc/reference/aggregates) provides a comprehensive list of supported aggregate functions.
