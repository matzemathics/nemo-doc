---
title: Export Directives
---

Export directives are used to write computation results to files.

## Syntax
The syntax of an export directive is as follows:
```
@export <predicate> :- <format>{<parameter>=<value>, ...} .
```

For example, the following export writes a CSV file that contains two columns, with the first formatted as plain string and the second as an integer. The third parameter of the exported predicate `result` is skipped and will not be in the file:

```
@export result :- csv{resource="out.csv.gz", format=(string,int,skip)} .
```

The output will be gzipped (guessed from file name). Tuples that contain anything other than a string in the first component and an integer in the second will not be exported and ignored silently.

## Formats

Currently the following formats are supported:

| <span class="pe-8">Format</span> | Description |
|:-------|-------------|
| `csv`  | Comma-separated values. |
| `dsv`  | Delimited separated values. (Like `csv`, but allows specifying different delimiters) |
| `rdf` | Generic RDF format. This chooses either `ntriples` or `nquads` based on the arity of the predicate. |
| `ntriples` | RDF Ntriples format. |
| `nquads` | RDF NQuads format. |
| `trig` | RDF TriG format. |
| `rdfxml` | RDF/XML format. |
| `turtle` | RDF Turtle format. |

## Parameters

The following parameters are available for all formats:

| <span class="pe-6">Parameter</span> | Description |
| :-------- | :---------- |
| `resource` | The file name to write to. If it contains an extension, this is used to automatically set the `compression` parameter. If set to the empty string `""`, the tuples are directed to the standard output. If omitted, this is set based on the predicate name, file format and compression type: `<predicate-name>.<format>.<compression>`. |
| `compression` | The compression to use. Currently only `gzip` or `none` is supported. |
| `limit` | The maximum number of tuples to export. |

Besides the above, there are format-specific parameters:

| <span class="pe-4">Parameter</span> | Formats | Description |
| :-------- | :------ | :---------- |
| `delimiter` | `dsv` | The delimiter to use. |
| `format` | `csv`, `dsv` | The output-format of the exported data. Might be `int`, `double`, `string`, `rdf` or `skip`. |

When using the [Nemo command-line client](/nemo-doc/guides/cli), some cli options are available to override the export directives in the program, to set the output (base) directory, and to control if existing files should be overwritten.
