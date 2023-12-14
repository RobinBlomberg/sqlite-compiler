# SQLite compiler

A library for compiling SQLite AST nodes into SQLite.

## Installation

```sh
npm install @robinblomberg/sqlite-compiler
```

## Usage

```js
import { Nodes } from '@robinblomberg/sqlite-ast';
import { compile } from '@robinblomberg/sqlite-compiler';

compile(
  Nodes.SelectStmt(
    null,
    [
      Nodes._SelectClause(
        null,
        [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
        [
          Nodes._TableQueryClause([
            Nodes._TableSelectClause(
              Nodes.SelectStmt(
                null,
                [
                  Nodes._SelectClause(
                    null,
                    [Nodes.ResultColumn(Nodes._NumericLiteral(1))],
                    [],
                    null,
                    null,
                    [],
                  ),
                ],
                null,
              ),
              null,
            ),
            Nodes.QualifiedTableName(
              Nodes._Identifier('table-name'),
              Nodes._Identifier('table-alias'),
              null,
            ),
          ]),
        ],
        null,
        null,
        [],
      ),
    ],
    null,
  ),
);
// 'SELECT result-column FROM ((SELECT 1), table-name AS table-alias)'
```
