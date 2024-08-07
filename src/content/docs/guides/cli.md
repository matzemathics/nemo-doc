---
title: Command Line Interface
---

Once you obtained the `nmo` executable (see [installation](/guides/installing)), you can execute nemo rule files:

```bash
nmo my_rules.rls --export-dir results
```

For an overview of the supported command line options run the following:

```bash
nmo --help
```

## Tracing facts

You can specify facts to be traced via the command line. Example:

```txt title="rules.rls"
e(1, 2).
e(2, 3).
a(3).

p(?x, ?y) :- e(?x, ?y).
p(?x, ?z) :- p(?x, ?y), e(?y, ?z).

q(?x) :- p(_, ?x), a(?x).
```

```bash
nmo rules.rls --trace "p(1,3);q(3)"
```

This results in the following traces being produced:
```txt
 p(1, 3) :- p(1, 2), e(2, 3) .
 ├─ p(1, 2) :- e(1, 2) .
 │  └─ e(1, 2)
 └─ e(2, 3)


 q(3) :- p(1, 3), a(3) .
 ├─ p(1, 3) :- p(1, 2), e(2, 3) .
 │  ├─ p(1, 2) :- e(1, 2) .
 │  │  └─ e(1, 2)
 │  └─ e(2, 3)
 └─ a(3)
```
