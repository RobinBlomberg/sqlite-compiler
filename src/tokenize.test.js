import { Nodes } from '@robinblomberg/sqlite-ast';
import { deepStrictEqual } from 'assert';
import { describe, it } from 'vitest';
import { tokenize, Expr as tokenizeExpr } from './tokenize.js';
import * as Tokens from './tokens.js';

describe('@robinblomberg/sqlite-compiler', () => {
  describe('tokenize', () => {
    describe('AggregateFunctionInvocation', () => {
      it('aggregate-func(DISTINCT [expr])', () => {
        deepStrictEqual(
          tokenize(
            Nodes.AggregateFunctionInvocation(
              Nodes._Identifier('aggregate-func'),
              Nodes._Args(true, [Nodes._Identifier('expr')]),
              null,
            ),
          ),
          [
            Tokens.Identifier('aggregate-func'),
            Tokens.Punctuator('('),
            Tokens.Keyword('DISTINCT'),
            Tokens.Identifier('expr'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('aggregate-func([expr1], [expr2])', () => {
        deepStrictEqual(
          tokenize(
            Nodes.AggregateFunctionInvocation(
              Nodes._Identifier('aggregate-func'),
              Nodes._Args(false, [
                Nodes._Identifier('expr1'),
                Nodes._Identifier('expr2'),
              ]),
              null,
            ),
          ),
          [
            Tokens.Identifier('aggregate-func'),
            Tokens.Punctuator('('),
            Tokens.Identifier('expr1'),
            Tokens.Punctuator(','),
            Tokens.Identifier('expr2'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('aggregate-func(*)', () => {
        deepStrictEqual(
          tokenize(
            Nodes.AggregateFunctionInvocation(
              Nodes._Identifier('aggregate-func'),
              '*',
              null,
            ),
          ),
          [
            Tokens.Identifier('aggregate-func'),
            Tokens.Punctuator('('),
            Tokens.Punctuator('*'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('aggregate-func()', () => {
        deepStrictEqual(
          tokenize(
            Nodes.AggregateFunctionInvocation(
              Nodes._Identifier('aggregate-func'),
              null,
              null,
            ),
          ),
          [
            Tokens.Identifier('aggregate-func'),
            Tokens.Punctuator('('),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('aggregate-func(DISTINCT [expr]) [filter-clause]', () => {
        deepStrictEqual(
          tokenize(
            Nodes.AggregateFunctionInvocation(
              Nodes._Identifier('aggregate-func'),
              Nodes._Args(true, [Nodes._Identifier('expr')]),
              Nodes.FilterClause(
                Nodes._WhereClause(
                  Nodes._BinaryExpression(
                    Nodes._Path(
                      Nodes._Identifier('table-name'),
                      Nodes._Identifier('column-name'),
                    ),
                    '>',
                    Nodes._NumericLiteral(30),
                  ),
                ),
              ),
            ),
          ),
          [
            Tokens.Identifier('aggregate-func'),
            Tokens.Punctuator('('),
            Tokens.Keyword('DISTINCT'),
            Tokens.Identifier('expr'),
            Tokens.Punctuator(')'),
            Tokens.Keyword('FILTER'),
            Tokens.Punctuator('('),
            Tokens.Keyword('WHERE'),
            Tokens.Identifier('table-name'),
            Tokens.Punctuator('.'),
            Tokens.Identifier('column-name'),
            Tokens.Punctuator('>'),
            Tokens.Numeric('30'),
            Tokens.Punctuator(')'),
          ],
        );
      });
    });

    describe('AlterTableStmt', () => {
      it('ALTER TABLE schema-name.table-name RENAME TO new-table-name', () => {
        deepStrictEqual(
          tokenize(
            Nodes.AlterTableStmt(
              Nodes._Path(
                Nodes._Identifier('schema-name'),
                Nodes._Identifier('table-name'),
              ),
              Nodes._RenameClause(null, Nodes._Identifier('new-table-name')),
            ),
          ),
          [
            Tokens.Keyword('ALTER'),
            Tokens.Keyword('TABLE'),
            Tokens.Identifier('schema-name'),
            Tokens.Punctuator('.'),
            Tokens.Identifier('table-name'),
            Tokens.Keyword('RENAME'),
            Tokens.Keyword('TO'),
            Tokens.Identifier('new-table-name'),
          ],
        );
      });

      it('ALTER TABLE table-name RENAME column-name TO new-table-name', () => {
        deepStrictEqual(
          tokenize(
            Nodes.AlterTableStmt(
              Nodes._Identifier('table-name'),
              Nodes._RenameClause(
                Nodes._Identifier('column-name'),
                Nodes._Identifier('new-table-name'),
              ),
            ),
          ),
          [
            Tokens.Keyword('ALTER'),
            Tokens.Keyword('TABLE'),
            Tokens.Identifier('table-name'),
            Tokens.Keyword('RENAME'),
            Tokens.Identifier('column-name'),
            Tokens.Keyword('TO'),
            Tokens.Identifier('new-table-name'),
          ],
        );
      });

      it('ALTER TABLE table-name ADD [column-def]', () => {
        deepStrictEqual(
          tokenize(
            Nodes.AlterTableStmt(
              Nodes._Identifier('table-name'),
              Nodes._AddClause(
                Nodes.ColumnDef(
                  Nodes._Identifier('column-name'),
                  Nodes.TypeName(['VARCHAR'], []),
                  [Nodes.ColumnConstraint(null, Nodes._NotNullClause(null))],
                ),
              ),
            ),
          ),
          [
            Tokens.Keyword('ALTER'),
            Tokens.Keyword('TABLE'),
            Tokens.Identifier('table-name'),
            Tokens.Keyword('ADD'),
            Tokens.Identifier('column-name'),
            Tokens.Keyword('VARCHAR'),
            Tokens.Keyword('NOT'),
            Tokens.Keyword('NULL'),
          ],
        );
      });
    });

    describe('AnalyzeStmt', () => {
      it('ANALYZE', () => {
        deepStrictEqual(tokenize(Nodes.AnalyzeStmt(null)), [
          Tokens.Keyword('ANALYZE'),
        ]);
      });

      it('ANALYZE schema-name', () => {
        deepStrictEqual(
          tokenize(Nodes.AnalyzeStmt(Nodes._Identifier('schema-name'))),
          [Tokens.Keyword('ANALYZE'), Tokens.Identifier('schema-name')],
        );
      });

      it('ANALYZE index-or-table-name', () => {
        deepStrictEqual(
          tokenize(Nodes.AnalyzeStmt(Nodes._Identifier('index-or-table-name'))),
          [Tokens.Keyword('ANALYZE'), Tokens.Identifier('index-or-table-name')],
        );
      });

      it('ANALYZE schema-name.table-or-index-name', () => {
        deepStrictEqual(
          tokenize(
            Nodes.AnalyzeStmt(
              Nodes._Path(
                Nodes._Identifier('schema-name'),
                Nodes._Identifier('table-or-index-name'),
              ),
            ),
          ),
          [
            Tokens.Keyword('ANALYZE'),
            Tokens.Identifier('schema-name'),
            Tokens.Punctuator('.'),
            Tokens.Identifier('table-or-index-name'),
          ],
        );
      });
    });

    describe('AttachStmt', () => {
      it('ATTACH [expr] AS schema-name', () => {
        deepStrictEqual(
          tokenize(
            Nodes.AttachStmt(
              Nodes._StringLiteral('c:\\sqlite\\db\\contacts.db'),
              Nodes._Identifier('schema-name'),
            ),
          ),
          [
            Tokens.Keyword('ATTACH'),
            Tokens.String("'c:\\\\sqlite\\\\db\\\\contacts.db'"),
            Tokens.Keyword('AS'),
            Tokens.Identifier('schema-name'),
          ],
        );
      });
    });

    describe('BeginStmt', () => {
      it('BEGIN', () => {
        deepStrictEqual(tokenize(Nodes.BeginStmt(null)), [
          Tokens.Keyword('BEGIN'),
        ]);
      });

      it('BEGIN DEFERRED', () => {
        deepStrictEqual(tokenize(Nodes.BeginStmt('DEFERRED')), [
          Tokens.Keyword('BEGIN'),
          Tokens.Keyword('DEFERRED'),
        ]);
      });

      it('BEGIN IMMEDIATE', () => {
        deepStrictEqual(tokenize(Nodes.BeginStmt('IMMEDIATE')), [
          Tokens.Keyword('BEGIN'),
          Tokens.Keyword('IMMEDIATE'),
        ]);
      });

      it('BEGIN EXCLUSIVE', () => {
        deepStrictEqual(tokenize(Nodes.BeginStmt('EXCLUSIVE')), [
          Tokens.Keyword('BEGIN'),
          Tokens.Keyword('EXCLUSIVE'),
        ]);
      });
    });

    describe('ColumnConstraint', () => {
      it('PRIMARY KEY', () => {
        deepStrictEqual(
          tokenize(
            Nodes.ColumnConstraint(
              null,
              Nodes._PrimaryKeyClause(null, null, false),
            ),
          ),
          [Tokens.Keyword('PRIMARY'), Tokens.Keyword('KEY')],
        );
      });

      it('CONSTRAINT name PRIMARY KEY ASC|DESC [conflict-clause] AUTOINCREMENT', () => {
        deepStrictEqual(
          tokenize(
            Nodes.ColumnConstraint(
              Nodes._Identifier('name'),
              Nodes._PrimaryKeyClause(
                'ASC',
                Nodes.ConflictClause('FAIL'),
                true,
              ),
            ),
          ),
          [
            Tokens.Keyword('CONSTRAINT'),
            Tokens.Identifier('name'),
            Tokens.Keyword('PRIMARY'),
            Tokens.Keyword('KEY'),
            Tokens.Keyword('ASC'),
            Tokens.Keyword('ON'),
            Tokens.Keyword('CONFLICT'),
            Tokens.Keyword('FAIL'),
            Tokens.Keyword('AUTOINCREMENT'),
          ],
        );
      });

      it('NOT NULL [conflict-clause]', () => {
        deepStrictEqual(
          tokenize(Nodes.ColumnConstraint(null, Nodes._NotNullClause(null))),
          [Tokens.Keyword('NOT'), Tokens.Keyword('NULL')],
        );
        deepStrictEqual(
          tokenize(
            Nodes.ColumnConstraint(
              null,
              Nodes._NotNullClause(Nodes.ConflictClause('ROLLBACK')),
            ),
          ),
          [
            Tokens.Keyword('NOT'),
            Tokens.Keyword('NULL'),
            Tokens.Keyword('ON'),
            Tokens.Keyword('CONFLICT'),
            Tokens.Keyword('ROLLBACK'),
          ],
        );
      });

      it('UNIQUE [conflict-clause]', () => {
        deepStrictEqual(
          tokenize(Nodes.ColumnConstraint(null, Nodes._UniqueClause(null))),
          [Tokens.Keyword('UNIQUE')],
        );
        deepStrictEqual(
          tokenize(
            Nodes.ColumnConstraint(
              null,
              Nodes._UniqueClause(Nodes.ConflictClause('ABORT')),
            ),
          ),
          [
            Tokens.Keyword('UNIQUE'),
            Tokens.Keyword('ON'),
            Tokens.Keyword('CONFLICT'),
            Tokens.Keyword('ABORT'),
          ],
        );
      });

      it('CHECK ([expr])', () => {
        deepStrictEqual(
          tokenize(
            Nodes.ColumnConstraint(
              null,
              Nodes._CheckClause(
                Nodes._BinaryExpression(
                  Nodes._Identifier('email'),
                  'LIKE',
                  Nodes._StringLiteral('%er'),
                ),
              ),
            ),
          ),
          [
            Tokens.Keyword('CHECK'),
            Tokens.Punctuator('('),
            Tokens.Identifier('email'),
            Tokens.Keyword('LIKE'),
            Tokens.String("'%er'"),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('DEFAULT ([expr])', () => {
        deepStrictEqual(
          tokenize(
            Nodes.ColumnConstraint(
              null,
              Nodes._DefaultClause(
                Nodes._BinaryExpression(
                  Nodes._FunctionInvocation(
                    Nodes._Identifier('round'),
                    Nodes._Args(false, [
                      Nodes._FunctionInvocation(
                        Nodes._Identifier('julianday'),
                        Nodes._Args(false, [Nodes._StringLiteral('now')]),
                        null,
                        null,
                      ),
                    ]),
                    null,
                    null,
                  ),
                  '+',
                  Nodes._NumericLiteral(10.5),
                ),
              ),
            ),
          ),
          [
            Tokens.Keyword('DEFAULT'),
            Tokens.Punctuator('('),
            Tokens.Identifier('round'),
            Tokens.Punctuator('('),
            Tokens.Identifier('julianday'),
            Tokens.Punctuator('('),
            Tokens.String("'now'"),
            Tokens.Punctuator(')'),
            Tokens.Punctuator(')'),
            Tokens.Punctuator('+'),
            Tokens.Numeric('10.5'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('DEFAULT [literal-value]', () => {
        deepStrictEqual(
          tokenize(
            Nodes.ColumnConstraint(
              null,
              Nodes._DefaultClause(Nodes._StringLiteral('literal-value')),
            ),
          ),
          [Tokens.Keyword('DEFAULT'), Tokens.String("'literal-value'")],
        );
      });

      it('DEFAULT [signed-number]', () => {
        deepStrictEqual(
          tokenize(
            Nodes.ColumnConstraint(
              null,
              Nodes._DefaultClause(Nodes._NumericLiteral(100)),
            ),
          ),
          [Tokens.Keyword('DEFAULT'), Tokens.Numeric('100')],
        );
      });

      it('COLLATE collation-name', () => {
        deepStrictEqual(
          tokenize(
            Nodes.ColumnConstraint(
              null,
              Nodes._CollateClause(Nodes._Identifier('NOCASE')),
            ),
          ),
          [Tokens.Keyword('COLLATE'), Tokens.Identifier('NOCASE')],
        );
      });

      it('[foreign-key-clause]', () => {
        deepStrictEqual(
          tokenize(
            Nodes.ColumnConstraint(
              null,
              Nodes.ForeignKeyClause(
                Nodes._Identifier('foreign-table'),
                [],
                [],
                null,
              ),
            ),
          ),
          [Tokens.Keyword('REFERENCES'), Tokens.Identifier('foreign-table')],
        );
      });

      it('GENERATED ALWAYS AS ([expr])', () => {
        deepStrictEqual(
          tokenize(
            Nodes.ColumnConstraint(
              null,
              Nodes._AsClause(true, Nodes._Identifier('expr'), null),
            ),
          ),
          [
            Tokens.Keyword('GENERATED'),
            Tokens.Keyword('ALWAYS'),
            Tokens.Keyword('AS'),
            Tokens.Punctuator('('),
            Tokens.Identifier('expr'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('GENERATED ALWAYS AS ([expr]) STORED|VIRTUAL', () => {
        deepStrictEqual(
          tokenize(
            Nodes.ColumnConstraint(
              null,
              Nodes._AsClause(true, Nodes._Identifier('expr'), 'STORED'),
            ),
          ),
          [
            Tokens.Keyword('GENERATED'),
            Tokens.Keyword('ALWAYS'),
            Tokens.Keyword('AS'),
            Tokens.Punctuator('('),
            Tokens.Identifier('expr'),
            Tokens.Punctuator(')'),
            Tokens.Keyword('STORED'),
          ],
        );
      });

      it('AS ([expr]) STORED|VIRTUAL', () => {
        deepStrictEqual(
          tokenize(
            Nodes.ColumnConstraint(
              null,
              Nodes._AsClause(false, Nodes._Identifier('expr'), 'VIRTUAL'),
            ),
          ),
          [
            Tokens.Keyword('AS'),
            Tokens.Punctuator('('),
            Tokens.Identifier('expr'),
            Tokens.Punctuator(')'),
            Tokens.Keyword('VIRTUAL'),
          ],
        );
      });
    });

    describe('ColumnDef', () => {
      it('column-name', () => {
        deepStrictEqual(
          tokenize(Nodes.ColumnDef(Nodes._Identifier('column-name'), null, [])),
          [Tokens.Identifier('column-name')],
        );
      });

      it('column-name [column-constraint]', () => {
        deepStrictEqual(
          tokenize(
            Nodes.ColumnDef(Nodes._Identifier('column-name'), null, [
              Nodes.ColumnConstraint(null, Nodes._NotNullClause(null)),
            ]),
          ),
          [
            Tokens.Identifier('column-name'),
            Tokens.Keyword('NOT'),
            Tokens.Keyword('NULL'),
          ],
        );
      });

      it('column-name [column-constraint] [column-constraint]', () => {
        deepStrictEqual(
          tokenize(
            Nodes.ColumnDef(Nodes._Identifier('column-name'), null, [
              Nodes.ColumnConstraint(null, Nodes._NotNullClause(null)),
              Nodes.ColumnConstraint(
                null,
                Nodes._CheckClause(
                  Nodes._BinaryExpression(
                    Nodes._Identifier('column-name'),
                    '<',
                    Nodes._NumericLiteral(100),
                  ),
                ),
              ),
            ]),
          ),
          [
            Tokens.Identifier('column-name'),
            Tokens.Keyword('NOT'),
            Tokens.Keyword('NULL'),
            Tokens.Keyword('CHECK'),
            Tokens.Punctuator('('),
            Tokens.Identifier('column-name'),
            Tokens.Punctuator('<'),
            Tokens.Numeric('100'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('column-name [type-name]', () => {
        deepStrictEqual(
          tokenize(
            Nodes.ColumnDef(
              Nodes._Identifier('column-name'),
              Nodes.TypeName(
                ['CHARACTER', 'VARYING'],
                [Nodes._NumericLiteral(255)],
              ),
              [],
            ),
          ),
          [
            Tokens.Identifier('column-name'),
            Tokens.Keyword('CHARACTER'),
            Tokens.Keyword('VARYING'),
            Tokens.Punctuator('('),
            Tokens.Numeric('255'),
            Tokens.Punctuator(')'),
          ],
        );
      });
    });

    describe('ColumnNameList', () => {
      it('(column-name)', () => {
        deepStrictEqual(
          tokenize(Nodes.ColumnNameList([Nodes._Identifier('column-name')])),
          [
            Tokens.Punctuator('('),
            Tokens.Identifier('column-name'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('(column-name1, column-name2)', () => {
        deepStrictEqual(
          tokenize(
            Nodes.ColumnNameList([
              Nodes._Identifier('column-name1'),
              Nodes._Identifier('column-name2'),
            ]),
          ),
          [
            Tokens.Punctuator('('),
            Tokens.Identifier('column-name1'),
            Tokens.Punctuator(','),
            Tokens.Identifier('column-name2'),
            Tokens.Punctuator(')'),
          ],
        );
      });
    });

    describe('CommitStmt', () => {
      it('COMMIT', () => {
        deepStrictEqual(tokenize(Nodes.CommitStmt()), [
          Tokens.Keyword('COMMIT'),
        ]);
      });
    });

    describe('CommonTableExpression', () => {
      it('table-name AS ([select-stmt])', () => {
        deepStrictEqual(
          tokenize(
            Nodes.CommonTableExpression(
              Nodes.CteTableName(Nodes._Identifier('table-name'), []),
              Nodes.SelectStmt(
                null,
                [
                  Nodes._SelectClause(
                    null,
                    [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
                    [],
                    null,
                    null,
                    [],
                  ),
                ],
                null,
              ),
            ),
          ),
          [
            Tokens.Identifier('table-name'),
            Tokens.Keyword('AS'),
            Tokens.Punctuator('('),
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('table-name(column-name) AS ([select-stmt])', () => {
        deepStrictEqual(
          tokenize(
            Nodes.CommonTableExpression(
              Nodes.CteTableName(Nodes._Identifier('table-name'), [
                Nodes._Identifier('column-name'),
              ]),
              Nodes.SelectStmt(
                null,
                [
                  Nodes._SelectClause(
                    null,
                    [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
                    [],
                    null,
                    null,
                    [],
                  ),
                ],
                null,
              ),
            ),
          ),
          [
            Tokens.Identifier('table-name'),
            Tokens.Punctuator('('),
            Tokens.Identifier('column-name'),
            Tokens.Punctuator(')'),
            Tokens.Keyword('AS'),
            Tokens.Punctuator('('),
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('table-name(column-name1, column-name2) AS ([select-stmt])', () => {
        deepStrictEqual(
          tokenize(
            Nodes.CommonTableExpression(
              Nodes.CteTableName(Nodes._Identifier('table-name'), [
                Nodes._Identifier('column-name1'),
                Nodes._Identifier('column-name2'),
              ]),
              Nodes.SelectStmt(
                null,
                [
                  Nodes._SelectClause(
                    null,
                    [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
                    [],
                    null,
                    null,
                    [],
                  ),
                ],
                null,
              ),
            ),
          ),
          [
            Tokens.Identifier('table-name'),
            Tokens.Punctuator('('),
            Tokens.Identifier('column-name1'),
            Tokens.Punctuator(','),
            Tokens.Identifier('column-name2'),
            Tokens.Punctuator(')'),
            Tokens.Keyword('AS'),
            Tokens.Punctuator('('),
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
            Tokens.Punctuator(')'),
          ],
        );
      });
    });

    describe('ConflictClause', () => {
      it('ON CONFLICT ROLLBACK|ABORT|FAIL|IGNORE|REPLACE', () => {
        deepStrictEqual(tokenize(Nodes.ConflictClause('ROLLBACK')), [
          Tokens.Keyword('ON'),
          Tokens.Keyword('CONFLICT'),
          Tokens.Keyword('ROLLBACK'),
        ]);
      });
    });

    describe('CreateIndexStmt', () => {
      it('CREATE INDEX index-name ON table-name (indexed-column)', () => {
        deepStrictEqual(
          tokenize(
            Nodes.CreateIndexStmt(
              false,
              false,
              Nodes._Identifier('index-name'),
              Nodes._Identifier('table-name'),
              Nodes._ColumnSelectorClause(
                [
                  Nodes.IndexedColumn(
                    Nodes._Identifier('indexed-column'),
                    null,
                    null,
                  ),
                ],
                null,
              ),
            ),
          ),
          [
            Tokens.Keyword('CREATE'),
            Tokens.Keyword('INDEX'),
            Tokens.Identifier('index-name'),
            Tokens.Keyword('ON'),
            Tokens.Identifier('table-name'),
            Tokens.Punctuator('('),
            Tokens.Identifier('indexed-column'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('CREATE UNIQUE INDEX IF NOT EXISTS index-name ON table-name (indexed-column)', () => {
        deepStrictEqual(
          tokenize(
            Nodes.CreateIndexStmt(
              true,
              true,
              Nodes._Identifier('index-name'),
              Nodes._Identifier('table-name'),
              Nodes._ColumnSelectorClause(
                [
                  Nodes.IndexedColumn(
                    Nodes._Identifier('indexed-column'),
                    null,
                    null,
                  ),
                ],
                null,
              ),
            ),
          ),
          [
            Tokens.Keyword('CREATE'),
            Tokens.Keyword('UNIQUE'),
            Tokens.Keyword('INDEX'),
            Tokens.Keyword('IF'),
            Tokens.Keyword('NOT'),
            Tokens.Keyword('EXISTS'),
            Tokens.Identifier('index-name'),
            Tokens.Keyword('ON'),
            Tokens.Identifier('table-name'),
            Tokens.Punctuator('('),
            Tokens.Identifier('indexed-column'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('CREATE INDEX index-name ON table-name (indexed-column1, indexed-column2)', () => {
        deepStrictEqual(
          tokenize(
            Nodes.CreateIndexStmt(
              false,
              false,
              Nodes._Identifier('index-name'),
              Nodes._Identifier('table-name'),
              Nodes._ColumnSelectorClause(
                [
                  Nodes.IndexedColumn(
                    Nodes._Identifier('indexed-column1'),
                    null,
                    null,
                  ),
                  Nodes.IndexedColumn(
                    Nodes._Identifier('indexed-column2'),
                    null,
                    null,
                  ),
                ],
                null,
              ),
            ),
          ),
          [
            Tokens.Keyword('CREATE'),
            Tokens.Keyword('INDEX'),
            Tokens.Identifier('index-name'),
            Tokens.Keyword('ON'),
            Tokens.Identifier('table-name'),
            Tokens.Punctuator('('),
            Tokens.Identifier('indexed-column1'),
            Tokens.Punctuator(','),
            Tokens.Identifier('indexed-column2'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('CREATE INDEX index-name ON table-name (indexed-column) WHERE 1', () => {
        deepStrictEqual(
          tokenize(
            Nodes.CreateIndexStmt(
              false,
              false,
              Nodes._Identifier('index-name'),
              Nodes._Identifier('table-name'),
              Nodes._ColumnSelectorClause(
                [
                  Nodes.IndexedColumn(
                    Nodes._Identifier('indexed-column'),
                    null,
                    null,
                  ),
                ],
                Nodes._WhereClause(Nodes._NumericLiteral(1)),
              ),
            ),
          ),
          [
            Tokens.Keyword('CREATE'),
            Tokens.Keyword('INDEX'),
            Tokens.Identifier('index-name'),
            Tokens.Keyword('ON'),
            Tokens.Identifier('table-name'),
            Tokens.Punctuator('('),
            Tokens.Identifier('indexed-column'),
            Tokens.Punctuator(')'),
            Tokens.Keyword('WHERE'),
            Tokens.Numeric('1'),
          ],
        );
      });
    });

    describe('CreateTableStmt', () => {
      it('CREATE TABLE table-name AS [select-stmt]', () => {
        deepStrictEqual(
          tokenize(
            Nodes.CreateTableStmt(
              false,
              false,
              Nodes._Identifier('table-name1'),
              Nodes.SelectStmt(
                null,
                [
                  Nodes._SelectClause(
                    null,
                    [Nodes.ResultColumn(Nodes._AllColumnsClause(null))],
                    [
                      Nodes.QualifiedTableName(
                        Nodes._Identifier('table-name2'),
                        null,
                        null,
                      ),
                    ],
                    null,
                    null,
                    [],
                  ),
                ],
                null,
              ),
            ),
          ),
          [
            Tokens.Keyword('CREATE'),
            Tokens.Keyword('TABLE'),
            Tokens.Identifier('table-name1'),
            Tokens.Keyword('AS'),
            Tokens.Keyword('SELECT'),
            Tokens.Punctuator('*'),
            Tokens.Keyword('FROM'),
            Tokens.Identifier('table-name2'),
          ],
        );
      });

      it('CREATE TEMP TABLE IF NOT EXISTS schema-name.table-name AS [select-stmt]', () => {
        deepStrictEqual(
          tokenize(
            Nodes.CreateTableStmt(
              true,
              true,
              Nodes._Path(
                Nodes._Identifier('schema-name'),
                Nodes._Identifier('table-name'),
              ),
              Nodes.SelectStmt(
                null,
                [
                  Nodes._SelectClause(
                    null,
                    [Nodes.ResultColumn(Nodes._AllColumnsClause(null))],
                    [
                      Nodes.QualifiedTableName(
                        Nodes._Identifier('table-name'),
                        null,
                        null,
                      ),
                    ],
                    null,
                    null,
                    [],
                  ),
                ],
                null,
              ),
            ),
          ),
          [
            Tokens.Keyword('CREATE'),
            Tokens.Keyword('TEMP'),
            Tokens.Keyword('TABLE'),
            Tokens.Keyword('IF'),
            Tokens.Keyword('NOT'),
            Tokens.Keyword('EXISTS'),
            Tokens.Identifier('schema-name'),
            Tokens.Punctuator('.'),
            Tokens.Identifier('table-name'),
            Tokens.Keyword('AS'),
            Tokens.Keyword('SELECT'),
            Tokens.Punctuator('*'),
            Tokens.Keyword('FROM'),
            Tokens.Identifier('table-name'),
          ],
        );
      });

      it('CREATE TABLE table-name([column-def])', () => {
        deepStrictEqual(
          tokenize(
            Nodes.CreateTableStmt(
              false,
              false,
              Nodes._Identifier('table-name'),
              Nodes._TableDef(
                [Nodes.ColumnDef(Nodes._Identifier('name'), null, [])],
                [],
                false,
              ),
            ),
          ),
          [
            Tokens.Keyword('CREATE'),
            Tokens.Keyword('TABLE'),
            Tokens.Identifier('table-name'),
            Tokens.Punctuator('('),
            Tokens.Identifier('name'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it(
        'CREATE TABLE table-name([column-def1], [column-def2] ' +
          '[table-constraint1], [table-constraint2] WITHOUT ROWID)',
        () => {
          deepStrictEqual(
            tokenize(
              Nodes.CreateTableStmt(
                false,
                false,
                Nodes._Identifier('table-name'),
                Nodes._TableDef(
                  [
                    Nodes.ColumnDef(Nodes._Identifier('name'), null, []),
                    Nodes.ColumnDef(
                      Nodes._Identifier('email'),
                      Nodes.TypeName(
                        ['CHARACTER', 'VARYING'],
                        [Nodes._NumericLiteral(255)],
                      ),
                      [
                        Nodes.ColumnConstraint(
                          null,
                          Nodes._NotNullClause(null),
                        ),
                      ],
                    ),
                  ],
                  [
                    Nodes.TableConstraint(
                      null,
                      Nodes._ForeignKeyConstraint(
                        [Nodes._Identifier('column-name')],
                        Nodes.ForeignKeyClause(
                          Nodes._Identifier('table-name'),
                          [Nodes._Identifier('column-name')],
                          [
                            Nodes._OnClause('UPDATE', 'RESTRICT'),
                            Nodes._OnClause('DELETE', 'RESTRICT'),
                          ],
                          null,
                        ),
                      ),
                    ),
                  ],
                  true,
                ),
              ),
            ),
            [
              Tokens.Keyword('CREATE'),
              Tokens.Keyword('TABLE'),
              Tokens.Identifier('table-name'),
              Tokens.Punctuator('('),
              Tokens.Identifier('name'),
              Tokens.Punctuator(','),
              Tokens.Identifier('email'),
              Tokens.Keyword('CHARACTER'),
              Tokens.Keyword('VARYING'),
              Tokens.Punctuator('('),
              Tokens.Numeric('255'),
              Tokens.Punctuator(')'),
              Tokens.Keyword('NOT'),
              Tokens.Keyword('NULL'),
              Tokens.Punctuator(','),
              Tokens.Keyword('FOREIGN'),
              Tokens.Keyword('KEY'),
              Tokens.Punctuator('('),
              Tokens.Identifier('column-name'),
              Tokens.Punctuator(')'),
              Tokens.Keyword('REFERENCES'),
              Tokens.Identifier('table-name'),
              Tokens.Punctuator('('),
              Tokens.Identifier('column-name'),
              Tokens.Punctuator(')'),
              Tokens.Keyword('ON'),
              Tokens.Keyword('UPDATE'),
              Tokens.Keyword('RESTRICT'),
              Tokens.Keyword('ON'),
              Tokens.Keyword('DELETE'),
              Tokens.Keyword('RESTRICT'),
              Tokens.Punctuator(')'),
              Tokens.Keyword('WITHOUT'),
              Tokens.Keyword('ROWID'),
            ],
          );
        },
      );
    });

    describe('CreateTriggerStmt', () => {
      it('CREATE TRIGGER trigger-name DELETE ON table-name BEGIN [select-stmt]; END', () => {
        deepStrictEqual(
          tokenize(
            Nodes.CreateTriggerStmt(
              false,
              false,
              Nodes._Identifier('trigger-name'),
              null,
              'DELETE',
              Nodes._Identifier('table-name'),
              false,
              null,
              [
                Nodes.SelectStmt(
                  null,
                  [
                    Nodes._SelectClause(
                      null,
                      [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
                      [],
                      null,
                      null,
                      [],
                    ),
                  ],
                  null,
                ),
              ],
            ),
          ),
          [
            Tokens.Keyword('CREATE'),
            Tokens.Keyword('TRIGGER'),
            Tokens.Identifier('trigger-name'),
            Tokens.Keyword('DELETE'),
            Tokens.Keyword('ON'),
            Tokens.Identifier('table-name'),
            Tokens.Keyword('BEGIN'),
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
            Tokens.Punctuator(';'),
            Tokens.Keyword('END'),
          ],
        );
      });

      it(
        'CREATE TEMP TRIGGER IF NOT EXISTS schema-name.trigger-name INSTEAD OF ' +
          'UPDATE OF column-name1, column-name2 ON table-name FOR EACH ROW WHEN 1 ' +
          'BEGIN [select-stmt]; END',
        () => {
          deepStrictEqual(
            tokenize(
              Nodes.CreateTriggerStmt(
                true,
                true,
                Nodes._Path(
                  Nodes._Identifier('schema-name'),
                  Nodes._Identifier('trigger-name'),
                ),
                'INSTEAD OF',
                [
                  Nodes._Identifier('column-name1'),
                  Nodes._Identifier('column-name2'),
                ],
                Nodes._Identifier('table-name'),
                true,
                Nodes._NumericLiteral(1),
                [
                  Nodes.SelectStmt(
                    null,
                    [
                      Nodes._SelectClause(
                        null,
                        [
                          Nodes.ResultColumn(
                            Nodes._Identifier('result-column'),
                          ),
                        ],
                        [],
                        null,
                        null,
                        [],
                      ),
                    ],
                    null,
                  ),
                ],
              ),
            ),
            [
              Tokens.Keyword('CREATE'),
              Tokens.Keyword('TEMP'),
              Tokens.Keyword('TRIGGER'),
              Tokens.Keyword('IF'),
              Tokens.Keyword('NOT'),
              Tokens.Keyword('EXISTS'),
              Tokens.Identifier('schema-name'),
              Tokens.Punctuator('.'),
              Tokens.Identifier('trigger-name'),
              Tokens.Keyword('INSTEAD'),
              Tokens.Keyword('OF'),
              Tokens.Keyword('UPDATE'),
              Tokens.Keyword('OF'),
              Tokens.Identifier('column-name1'),
              Tokens.Punctuator(','),
              Tokens.Identifier('column-name2'),
              Tokens.Keyword('ON'),
              Tokens.Identifier('table-name'),
              Tokens.Keyword('FOR'),
              Tokens.Keyword('EACH'),
              Tokens.Keyword('ROW'),
              Tokens.Keyword('WHEN'),
              Tokens.Numeric('1'),
              Tokens.Keyword('BEGIN'),
              Tokens.Keyword('SELECT'),
              Tokens.Identifier('result-column'),
              Tokens.Punctuator(';'),
              Tokens.Keyword('END'),
            ],
          );
        },
      );
    });

    describe('CreateViewStmt', () => {
      it('CREATE VIEW view-name AS [select-stmt]', () => {
        deepStrictEqual(
          tokenize(
            Nodes.CreateViewStmt(
              false,
              false,
              Nodes._Identifier('view-name'),
              [],
              Nodes.SelectStmt(
                null,
                [
                  Nodes._SelectClause(
                    null,
                    [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
                    [],
                    null,
                    null,
                    [],
                  ),
                ],
                null,
              ),
            ),
          ),
          [
            Tokens.Keyword('CREATE'),
            Tokens.Keyword('VIEW'),
            Tokens.Identifier('view-name'),
            Tokens.Keyword('AS'),
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
          ],
        );
      });

      it(
        'CREATE TEMP VIEW IF NOT EXISTS schema-name.view-name(column-name1, column-name2) ' +
          'AS [select-stmt]',
        () => {
          deepStrictEqual(
            tokenize(
              Nodes.CreateViewStmt(
                true,
                true,
                Nodes._Path(
                  Nodes._Identifier('schema-name'),
                  Nodes._Identifier('view-name'),
                ),
                [
                  Nodes._Identifier('column-name1'),
                  Nodes._Identifier('column-name2'),
                ],
                Nodes.SelectStmt(
                  null,
                  [
                    Nodes._SelectClause(
                      null,
                      [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
                      [],
                      null,
                      null,
                      [],
                    ),
                  ],
                  null,
                ),
              ),
            ),
            [
              Tokens.Keyword('CREATE'),
              Tokens.Keyword('TEMP'),
              Tokens.Keyword('VIEW'),
              Tokens.Keyword('IF'),
              Tokens.Keyword('NOT'),
              Tokens.Keyword('EXISTS'),
              Tokens.Identifier('schema-name'),
              Tokens.Punctuator('.'),
              Tokens.Identifier('view-name'),
              Tokens.Punctuator('('),
              Tokens.Identifier('column-name1'),
              Tokens.Punctuator(','),
              Tokens.Identifier('column-name2'),
              Tokens.Punctuator(')'),
              Tokens.Keyword('AS'),
              Tokens.Keyword('SELECT'),
              Tokens.Identifier('result-column'),
            ],
          );
        },
      );
    });

    describe('CreateVirtualTableStmt', () => {
      it('CREATE VIRTUAL TABLE table-name USING module-name', () => {
        deepStrictEqual(
          tokenize(
            Nodes.CreateVirtualTableStmt(
              false,
              Nodes._Identifier('table-name'),
              Nodes._Identifier('module-name'),
              [],
            ),
          ),
          [
            Tokens.Keyword('CREATE'),
            Tokens.Keyword('VIRTUAL'),
            Tokens.Keyword('TABLE'),
            Tokens.Identifier('table-name'),
            Tokens.Keyword('USING'),
            Tokens.Identifier('module-name'),
          ],
        );
      });

      it(
        'CREATE VIRTUAL TABLE IF NOT EXISTS schema-name.table-name ' +
          'USING module-name(module-argument1, module-argument2)',
        () => {
          deepStrictEqual(
            tokenize(
              Nodes.CreateVirtualTableStmt(
                true,
                Nodes._Path(
                  Nodes._Identifier('schema-name'),
                  Nodes._Identifier('table-name'),
                ),
                Nodes._Identifier('module-name'),
                [
                  Nodes._Identifier('module-argument1'),
                  Nodes._Identifier('module-argument2'),
                ],
              ),
            ),
            [
              Tokens.Keyword('CREATE'),
              Tokens.Keyword('VIRTUAL'),
              Tokens.Keyword('TABLE'),
              Tokens.Keyword('IF'),
              Tokens.Keyword('NOT'),
              Tokens.Keyword('EXISTS'),
              Tokens.Identifier('schema-name'),
              Tokens.Punctuator('.'),
              Tokens.Identifier('table-name'),
              Tokens.Keyword('USING'),
              Tokens.Identifier('module-name'),
              Tokens.Punctuator('('),
              Tokens.Identifier('module-argument1'),
              Tokens.Punctuator(','),
              Tokens.Identifier('module-argument2'),
              Tokens.Punctuator(')'),
            ],
          );
        },
      );
    });

    describe('CteTableName', () => {
      it('table-name', () => {
        deepStrictEqual(
          tokenize(Nodes.CteTableName(Nodes._Identifier('table-name'), [])),
          [Tokens.Identifier('table-name')],
        );
      });

      it('table-name(column-name)', () => {
        deepStrictEqual(
          tokenize(
            Nodes.CteTableName(Nodes._Identifier('table-name'), [
              Nodes._Identifier('column-name'),
            ]),
          ),
          [
            Tokens.Identifier('table-name'),
            Tokens.Punctuator('('),
            Tokens.Identifier('column-name'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('table-name(column-name1, column-name2)', () => {
        deepStrictEqual(
          tokenize(
            Nodes.CteTableName(Nodes._Identifier('table-name'), [
              Nodes._Identifier('column-name1'),
              Nodes._Identifier('column-name2'),
            ]),
          ),
          [
            Tokens.Identifier('table-name'),
            Tokens.Punctuator('('),
            Tokens.Identifier('column-name1'),
            Tokens.Punctuator(','),
            Tokens.Identifier('column-name2'),
            Tokens.Punctuator(')'),
          ],
        );
      });
    });

    describe('DeleteStmt', () => {
      it('DELETE FROM [qualified-table-name]', () => {
        deepStrictEqual(
          tokenize(
            Nodes.DeleteStmt(
              null,
              Nodes.QualifiedTableName(
                Nodes._Identifier('qualified-table-name'),
                null,
                null,
              ),
              null,
              null,
            ),
          ),
          [
            Tokens.Keyword('DELETE'),
            Tokens.Keyword('FROM'),
            Tokens.Identifier('qualified-table-name'),
          ],
        );
      });

      it('WITH [common-table-expression] DELETE FROM [qualified-table-name] WHERE [expr]', () => {
        deepStrictEqual(
          tokenize(
            Nodes.DeleteStmt(
              Nodes.WithClause(false, [
                Nodes.CommonTableExpression(
                  Nodes.CteTableName(
                    Nodes._Identifier('common-table-expression'),
                    [],
                  ),
                  Nodes.SelectStmt(
                    null,
                    [
                      Nodes._SelectClause(
                        null,
                        [
                          Nodes.ResultColumn(
                            Nodes._Identifier('result-column'),
                          ),
                        ],
                        [],
                        null,
                        null,
                        [],
                      ),
                    ],
                    null,
                  ),
                ),
              ]),
              Nodes.QualifiedTableName(
                Nodes._Identifier('qualified-table-name'),
                null,
                null,
              ),
              Nodes._WhereClause(Nodes._Identifier('expr')),
              null,
            ),
          ),
          [
            Tokens.Keyword('WITH'),
            Tokens.Identifier('common-table-expression'),
            Tokens.Keyword('AS'),
            Tokens.Punctuator('('),
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
            Tokens.Punctuator(')'),
            Tokens.Keyword('DELETE'),
            Tokens.Keyword('FROM'),
            Tokens.Identifier('qualified-table-name'),
            Tokens.Keyword('WHERE'),
            Tokens.Identifier('expr'),
          ],
        );
      });

      it(
        'WITH RECURSIVE [common-table-expression] DELETE FROM [qualified-table-name] ' +
          'WHERE [expr] ORDER BY [ordering-term] LIMIT [expr]',
        () => {
          deepStrictEqual(
            tokenize(
              Nodes.DeleteStmt(
                Nodes.WithClause(true, [
                  Nodes.CommonTableExpression(
                    Nodes.CteTableName(
                      Nodes._Identifier('common-table-expression'),
                      [],
                    ),
                    Nodes.SelectStmt(
                      null,
                      [
                        Nodes._SelectClause(
                          null,
                          [
                            Nodes.ResultColumn(
                              Nodes._Identifier('result-column'),
                            ),
                          ],
                          [],
                          null,
                          null,
                          [],
                        ),
                      ],
                      null,
                    ),
                  ),
                ]),
                Nodes.QualifiedTableName(
                  Nodes._Identifier('qualified-table-name'),
                  null,
                  null,
                ),
                Nodes._WhereClause(Nodes._Identifier('expr')),
                Nodes._LimiterClause(
                  [
                    Nodes.OrderingTerm(
                      Nodes.IndexedColumn(
                        Nodes._Identifier('indexed-column'),
                        null,
                        null,
                      ),
                      null,
                    ),
                  ],
                  Nodes._LimitClause(Nodes._Identifier('expr'), null),
                ),
              ),
            ),
            [
              Tokens.Keyword('WITH'),
              Tokens.Keyword('RECURSIVE'),
              Tokens.Identifier('common-table-expression'),
              Tokens.Keyword('AS'),
              Tokens.Punctuator('('),
              Tokens.Keyword('SELECT'),
              Tokens.Identifier('result-column'),
              Tokens.Punctuator(')'),
              Tokens.Keyword('DELETE'),
              Tokens.Keyword('FROM'),
              Tokens.Identifier('qualified-table-name'),
              Tokens.Keyword('WHERE'),
              Tokens.Identifier('expr'),
              Tokens.Keyword('ORDER'),
              Tokens.Keyword('BY'),
              Tokens.Identifier('indexed-column'),
              Tokens.Keyword('LIMIT'),
              Tokens.Identifier('expr'),
            ],
          );
        },
      );
    });

    describe('DetachStmt', () => {
      it('DETACH schema-name', () => {
        deepStrictEqual(
          tokenize(Nodes.DetachStmt(Nodes._Identifier('schema-name'))),
          [Tokens.Keyword('DETACH'), Tokens.Identifier('schema-name')],
        );
      });
    });

    describe('DropIndexStmt', () => {
      it('DROP INDEX index-name', () => {
        deepStrictEqual(
          tokenize(Nodes.DropIndexStmt(false, Nodes._Identifier('index-name'))),
          [
            Tokens.Keyword('DROP'),
            Tokens.Keyword('INDEX'),
            Tokens.Identifier('index-name'),
          ],
        );
      });

      it('DROP INDEX IF EXISTS schema-name.index-name', () => {
        deepStrictEqual(
          tokenize(
            Nodes.DropIndexStmt(
              true,
              Nodes._Path(
                Nodes._Identifier('schema-name'),
                Nodes._Identifier('index-name'),
              ),
            ),
          ),
          [
            Tokens.Keyword('DROP'),
            Tokens.Keyword('INDEX'),
            Tokens.Keyword('IF'),
            Tokens.Keyword('EXISTS'),
            Tokens.Identifier('schema-name'),
            Tokens.Punctuator('.'),
            Tokens.Identifier('index-name'),
          ],
        );
      });
    });

    describe('DropTableStmt', () => {
      it('DROP TABLE table-name', () => {
        deepStrictEqual(
          tokenize(Nodes.DropTableStmt(false, Nodes._Identifier('table-name'))),
          [
            Tokens.Keyword('DROP'),
            Tokens.Keyword('TABLE'),
            Tokens.Identifier('table-name'),
          ],
        );
      });

      it('DROP TABLE IF EXISTS schema-name.table-name', () => {
        deepStrictEqual(
          tokenize(
            Nodes.DropTableStmt(
              true,
              Nodes._Path(
                Nodes._Identifier('schema-name'),
                Nodes._Identifier('table-name'),
              ),
            ),
          ),
          [
            Tokens.Keyword('DROP'),
            Tokens.Keyword('TABLE'),
            Tokens.Keyword('IF'),
            Tokens.Keyword('EXISTS'),
            Tokens.Identifier('schema-name'),
            Tokens.Punctuator('.'),
            Tokens.Identifier('table-name'),
          ],
        );
      });
    });

    describe('DropTriggerStmt', () => {
      it('DROP TRIGGER trigger-name', () => {
        deepStrictEqual(
          tokenize(
            Nodes.DropTriggerStmt(false, Nodes._Identifier('trigger-name')),
          ),
          [
            Tokens.Keyword('DROP'),
            Tokens.Keyword('TRIGGER'),
            Tokens.Identifier('trigger-name'),
          ],
        );
      });

      it('DROP TRIGGER IF EXISTS schema-name.trigger-name', () => {
        deepStrictEqual(
          tokenize(
            Nodes.DropTriggerStmt(
              true,
              Nodes._Path(
                Nodes._Identifier('schema-name'),
                Nodes._Identifier('trigger-name'),
              ),
            ),
          ),
          [
            Tokens.Keyword('DROP'),
            Tokens.Keyword('TRIGGER'),
            Tokens.Keyword('IF'),
            Tokens.Keyword('EXISTS'),
            Tokens.Identifier('schema-name'),
            Tokens.Punctuator('.'),
            Tokens.Identifier('trigger-name'),
          ],
        );
      });
    });

    describe('DropViewStmt', () => {
      it('DROP VIEW view-name', () => {
        deepStrictEqual(
          tokenize(Nodes.DropViewStmt(false, Nodes._Identifier('view-name'))),
          [
            Tokens.Keyword('DROP'),
            Tokens.Keyword('VIEW'),
            Tokens.Identifier('view-name'),
          ],
        );
      });

      it('DROP VIEW IF EXISTS schema-name.view-name', () => {
        deepStrictEqual(
          tokenize(
            Nodes.DropViewStmt(
              true,
              Nodes._Path(
                Nodes._Identifier('schema-name'),
                Nodes._Identifier('view-name'),
              ),
            ),
          ),
          [
            Tokens.Keyword('DROP'),
            Tokens.Keyword('VIEW'),
            Tokens.Keyword('IF'),
            Tokens.Keyword('EXISTS'),
            Tokens.Identifier('schema-name'),
            Tokens.Punctuator('.'),
            Tokens.Identifier('view-name'),
          ],
        );
      });
    });

    describe('Expr', () => {
      it('[literal-value]', () => {
        deepStrictEqual(tokenize(Nodes._NumericLiteral(123.456)), [
          Tokens.Numeric('123.456'),
        ]);
        deepStrictEqual(tokenize(Nodes._StringLiteral("foo 'bar'")), [
          Tokens.String("'foo \\'bar\\''"),
        ]);
        deepStrictEqual(tokenize(Nodes._BlobLiteral(['0500', 'ab07'])), [
          Tokens.Hex("x'0500'"),
          Tokens.Hex("x'ab07'"),
        ]);
        deepStrictEqual(tokenize(Nodes._KeywordLiteral('NULL')), [
          Tokens.Keyword('NULL'),
        ]);
      });

      it('bind-parameter', () => {
        deepStrictEqual(tokenize(Nodes._Identifier('bind-parameter')), [
          Tokens.Identifier('bind-parameter'),
        ]);
      });

      it('column-name', () => {
        deepStrictEqual(tokenize(Nodes._Identifier('column-name')), [
          Tokens.Identifier('column-name'),
        ]);
      });

      it('table-name.column-name', () => {
        deepStrictEqual(
          tokenize(
            Nodes._Path(
              Nodes._Identifier('table-name'),
              Nodes._Identifier('column-name'),
            ),
          ),
          [
            Tokens.Identifier('table-name'),
            Tokens.Punctuator('.'),
            Tokens.Identifier('column-name'),
          ],
        );
      });

      it('schema-name.table-name.column-name', () => {
        deepStrictEqual(
          tokenize(
            Nodes._QualifiedPath(
              Nodes._Identifier('schema-name'),
              Nodes._Path(
                Nodes._Identifier('table-name'),
                Nodes._Identifier('column-name'),
              ),
            ),
          ),
          [
            Tokens.Identifier('schema-name'),
            Tokens.Punctuator('.'),
            Tokens.Identifier('table-name'),
            Tokens.Punctuator('.'),
            Tokens.Identifier('column-name'),
          ],
        );
      });

      it('unary-operator [expr]', () => {
        deepStrictEqual(
          tokenize(Nodes._UnaryExpression('NOT', Nodes._Identifier('expr'))),
          [Tokens.Keyword('NOT'), Tokens.Identifier('expr')],
        );
      });

      it('[expr] binary-operator [expr]', () => {
        deepStrictEqual(
          tokenize(
            Nodes._BinaryExpression(
              Nodes._NumericLiteral(1),
              '+',
              Nodes._NumericLiteral(2),
            ),
          ),
          [Tokens.Numeric('1'), Tokens.Punctuator('+'), Tokens.Numeric('2')],
        );
      });

      it('(a OR b) + 5', () => {
        deepStrictEqual(
          tokenize(
            Nodes._BinaryExpression(
              Nodes._BinaryExpression(
                Nodes._Identifier('a'),
                'OR',
                Nodes._Identifier('b'),
              ),
              '+',
              Nodes._NumericLiteral(5),
            ),
          ),
          [
            Tokens.Punctuator('('),
            Tokens.Identifier('a'),
            Tokens.Keyword('OR'),
            Tokens.Identifier('b'),
            Tokens.Punctuator(')'),
            Tokens.Punctuator('+'),
            Tokens.Numeric('5'),
          ],
        );
      });

      it('[raise-function]', () => {
        deepStrictEqual(tokenize(Nodes.RaiseFunction(null)), [
          Tokens.Keyword('RAISE'),
          Tokens.Punctuator('('),
          Tokens.Keyword('IGNORE'),
          Tokens.Punctuator(')'),
        ]);
        deepStrictEqual(
          tokenize(
            Nodes.RaiseFunction([
              'ROLLBACK',
              Nodes._StringLiteral('Error message'),
            ]),
          ),
          [
            Tokens.Keyword('RAISE'),
            Tokens.Punctuator('('),
            Tokens.Keyword('ROLLBACK'),
            Tokens.Punctuator(','),
            Tokens.String("'Error message'"),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('function-name()', () => {
        deepStrictEqual(
          tokenize(
            Nodes._FunctionInvocation(
              Nodes._Identifier('function-name'),
              null,
              null,
              null,
            ),
          ),
          [
            Tokens.Identifier('function-name'),
            Tokens.Punctuator('('),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('function-name(*)', () => {
        deepStrictEqual(
          tokenize(
            Nodes._FunctionInvocation(
              Nodes._Identifier('function-name'),
              '*',
              null,
              null,
            ),
          ),
          [
            Tokens.Identifier('function-name'),
            Tokens.Punctuator('('),
            Tokens.Punctuator('*'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('function-name(DISTINCT expr)', () => {
        deepStrictEqual(
          tokenize(
            Nodes._FunctionInvocation(
              Nodes._Identifier('function-name'),
              Nodes._Args(true, [Nodes._Identifier('expr')]),
              null,
              null,
            ),
          ),
          [
            Tokens.Identifier('function-name'),
            Tokens.Punctuator('('),
            Tokens.Keyword('DISTINCT'),
            Tokens.Identifier('expr'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('function-name(DISTINCT expr1, expr2)', () => {
        deepStrictEqual(
          tokenize(
            Nodes._FunctionInvocation(
              Nodes._Identifier('function-name'),
              Nodes._Args(true, [
                Nodes._Identifier('expr1'),
                Nodes._Identifier('expr2'),
              ]),
              null,
              null,
            ),
          ),
          [
            Tokens.Identifier('function-name'),
            Tokens.Punctuator('('),
            Tokens.Keyword('DISTINCT'),
            Tokens.Identifier('expr1'),
            Tokens.Punctuator(','),
            Tokens.Identifier('expr2'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('function-name() [filter-clause]', () => {
        deepStrictEqual(
          tokenize(
            Nodes._FunctionInvocation(
              Nodes._Identifier('function-name'),
              null,
              Nodes.FilterClause(
                Nodes._WhereClause(
                  Nodes._BinaryExpression(
                    Nodes._Path(
                      Nodes._Identifier('table-name'),
                      Nodes._Identifier('column-name'),
                    ),
                    '>',
                    Nodes._NumericLiteral(30),
                  ),
                ),
              ),
              null,
            ),
          ),
          [
            Tokens.Identifier('function-name'),
            Tokens.Punctuator('('),
            Tokens.Punctuator(')'),
            Tokens.Keyword('FILTER'),
            Tokens.Punctuator('('),
            Tokens.Keyword('WHERE'),
            Tokens.Identifier('table-name'),
            Tokens.Punctuator('.'),
            Tokens.Identifier('column-name'),
            Tokens.Punctuator('>'),
            Tokens.Numeric('30'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('function-name() [over-clause]', () => {
        deepStrictEqual(
          tokenize(
            Nodes._FunctionInvocation(
              Nodes._Identifier('function-name'),
              null,
              null,
              Nodes.OverClause(Nodes.WindowDefn(null, [], [], null)),
            ),
          ),
          [
            Tokens.Identifier('function-name'),
            Tokens.Punctuator('('),
            Tokens.Punctuator(')'),
            Tokens.Keyword('OVER'),
            Tokens.Punctuator('('),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('([expr])', () => {
        deepStrictEqual(
          tokenize(Nodes._ArrayExpression([Nodes._Identifier('expr')])),
          [
            Tokens.Punctuator('('),
            Tokens.Identifier('expr'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('([expr1], [expr2])', () => {
        deepStrictEqual(
          tokenize(
            Nodes._ArrayExpression([
              Nodes._Identifier('expr1'),
              Nodes._Identifier('expr2'),
            ]),
          ),
          [
            Tokens.Punctuator('('),
            Tokens.Identifier('expr1'),
            Tokens.Punctuator(','),
            Tokens.Identifier('expr2'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('CAST ([expr] AS [type-name])', () => {
        deepStrictEqual(
          tokenize(
            Nodes._CastExpression(
              Nodes._Identifier('expr'),
              Nodes.TypeName(['VARCHAR'], [Nodes._NumericLiteral(255)]),
            ),
          ),
          [
            Tokens.Keyword('CAST'),
            Tokens.Punctuator('('),
            Tokens.Identifier('expr'),
            Tokens.Keyword('AS'),
            Tokens.Keyword('VARCHAR'),
            Tokens.Punctuator('('),
            Tokens.Numeric('255'),
            Tokens.Punctuator(')'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('[expr] COLLATE collation-name', () => {
        deepStrictEqual(
          tokenize(
            Nodes._CollateExpression(
              Nodes._Identifier('expr'),
              Nodes._Identifier('collation-name'),
            ),
          ),
          [
            Tokens.Identifier('expr'),
            Tokens.Keyword('COLLATE'),
            Tokens.Identifier('collation-name'),
          ],
        );
      });

      it('[expr1] LIKE [expr2]', () => {
        deepStrictEqual(
          tokenize(
            Nodes._BinaryKeywordExpression(
              Nodes._Identifier('expr1'),
              false,
              'LIKE',
              Nodes._Identifier('expr2'),
              null,
            ),
          ),
          [
            Tokens.Identifier('expr1'),
            Tokens.Keyword('LIKE'),
            Tokens.Identifier('expr2'),
          ],
        );
      });

      it('[expr1] NOT GLOB [expr2] ESCAPE [expr3]', () => {
        deepStrictEqual(
          tokenize(
            Nodes._BinaryKeywordExpression(
              Nodes._Identifier('expr1'),
              true,
              'GLOB',
              Nodes._Identifier('expr2'),
              Nodes._Identifier('expr3'),
            ),
          ),
          [
            Tokens.Identifier('expr1'),
            Tokens.Keyword('NOT'),
            Tokens.Keyword('GLOB'),
            Tokens.Identifier('expr2'),
            Tokens.Keyword('ESCAPE'),
            Tokens.Identifier('expr3'),
          ],
        );
      });

      it('[expr] IS NULL', () => {
        deepStrictEqual(
          tokenize(
            Nodes._NullComparisonExpression(Nodes._Identifier('expr'), false),
          ),
          [Tokens.Identifier('expr'), Tokens.Keyword('ISNULL')],
        );
      });

      it('[expr] NOTNULL', () => {
        deepStrictEqual(
          tokenize(
            Nodes._NullComparisonExpression(Nodes._Identifier('expr'), true),
          ),
          [Tokens.Identifier('expr'), Tokens.Keyword('NOTNULL')],
        );
      });

      it('[expr1] IS [expr2]', () => {
        deepStrictEqual(
          tokenize(
            Nodes._IsExpression(
              Nodes._Identifier('expr1'),
              false,
              Nodes._Identifier('expr2'),
            ),
          ),
          [
            Tokens.Identifier('expr1'),
            Tokens.Keyword('IS'),
            Tokens.Identifier('expr2'),
          ],
        );
      });

      it('[expr1] IS NOT [expr2]', () => {
        deepStrictEqual(
          tokenize(
            Nodes._IsExpression(
              Nodes._Identifier('expr1'),
              true,
              Nodes._Identifier('expr2'),
            ),
          ),
          [
            Tokens.Identifier('expr1'),
            Tokens.Keyword('IS'),
            Tokens.Keyword('NOT'),
            Tokens.Identifier('expr2'),
          ],
        );
      });

      it('[expr1] BETWEEN [expr2] AND [expr3]', () => {
        deepStrictEqual(
          tokenize(
            Nodes._BetweenExpression(
              Nodes._Identifier('expr1'),
              false,
              Nodes._Identifier('expr2'),
              Nodes._Identifier('expr3'),
            ),
          ),
          [
            Tokens.Identifier('expr1'),
            Tokens.Keyword('BETWEEN'),
            Tokens.Identifier('expr2'),
            Tokens.Keyword('AND'),
            Tokens.Identifier('expr3'),
          ],
        );
      });

      it('[expr1] NOT BETWEEN [expr2] AND [expr3]', () => {
        deepStrictEqual(
          tokenize(
            Nodes._BetweenExpression(
              Nodes._Identifier('expr1'),
              true,
              Nodes._Identifier('expr2'),
              Nodes._Identifier('expr3'),
            ),
          ),
          [
            Tokens.Identifier('expr1'),
            Tokens.Keyword('NOT'),
            Tokens.Keyword('BETWEEN'),
            Tokens.Identifier('expr2'),
            Tokens.Keyword('AND'),
            Tokens.Identifier('expr3'),
          ],
        );
      });

      it('[expr] IN ([select-stmt])', () => {
        deepStrictEqual(
          tokenize(
            Nodes._InExpression(
              Nodes._Identifier('expr'),
              false,
              Nodes._SelectorClause(
                Nodes.SelectStmt(
                  null,
                  [
                    Nodes._SelectClause(
                      null,
                      [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
                      [],
                      null,
                      null,
                      [],
                    ),
                  ],
                  null,
                ),
              ),
            ),
          ),
          [
            Tokens.Identifier('expr'),
            Tokens.Keyword('IN'),
            Tokens.Punctuator('('),
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('[expr1] NOT IN ([expr2])', () => {
        deepStrictEqual(
          tokenize(
            Nodes._InExpression(
              Nodes._Identifier('expr1'),
              true,
              Nodes._SelectorClause([Nodes._Identifier('expr2')]),
            ),
          ),
          [
            Tokens.Identifier('expr1'),
            Tokens.Keyword('NOT'),
            Tokens.Keyword('IN'),
            Tokens.Punctuator('('),
            Tokens.Identifier('expr2'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('[expr] IN table-name', () => {
        deepStrictEqual(
          tokenize(
            Nodes._InExpression(
              Nodes._Identifier('expr'),
              false,
              Nodes._TableSelectorClause(Nodes._Identifier('table-name'), []),
            ),
          ),
          [
            Tokens.Identifier('expr'),
            Tokens.Keyword('IN'),
            Tokens.Identifier('table-name'),
          ],
        );
      });

      it('[expr1] IN schema-name.table-name([expr2])', () => {
        deepStrictEqual(
          tokenize(
            Nodes._InExpression(
              Nodes._Identifier('expr1'),
              false,
              Nodes._TableSelectorClause(
                Nodes._Path(
                  Nodes._Identifier('schema-name'),
                  Nodes._Identifier('table-name'),
                ),
                [Nodes._Identifier('expr2')],
              ),
            ),
          ),
          [
            Tokens.Identifier('expr1'),
            Tokens.Keyword('IN'),
            Tokens.Identifier('schema-name'),
            Tokens.Punctuator('.'),
            Tokens.Identifier('table-name'),
            Tokens.Punctuator('('),
            Tokens.Identifier('expr2'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('[expr1] IN schema-name.table-name([expr2], [expr3])', () => {
        deepStrictEqual(
          tokenize(
            Nodes._InExpression(
              Nodes._Identifier('expr1'),
              false,
              Nodes._TableSelectorClause(
                Nodes._Path(
                  Nodes._Identifier('schema-name'),
                  Nodes._Identifier('table-name'),
                ),
                [Nodes._Identifier('expr2'), Nodes._Identifier('expr3')],
              ),
            ),
          ),
          [
            Tokens.Identifier('expr1'),
            Tokens.Keyword('IN'),
            Tokens.Identifier('schema-name'),
            Tokens.Punctuator('.'),
            Tokens.Identifier('table-name'),
            Tokens.Punctuator('('),
            Tokens.Identifier('expr2'),
            Tokens.Punctuator(','),
            Tokens.Identifier('expr3'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('([select-stmt])', () => {
        deepStrictEqual(
          tokenizeExpr(
            Nodes.SelectStmt(
              null,
              [
                Nodes._SelectClause(
                  null,
                  [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
                  [],
                  null,
                  null,
                  [],
                ),
              ],
              null,
            ),
          ),
          [
            Tokens.Punctuator('('),
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('EXISTS ([select-stmt])', () => {
        deepStrictEqual(
          tokenize(
            Nodes._ExistsExpression(
              false,
              Nodes.SelectStmt(
                null,
                [
                  Nodes._SelectClause(
                    null,
                    [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
                    [],
                    null,
                    null,
                    [],
                  ),
                ],
                null,
              ),
            ),
          ),
          [
            Tokens.Keyword('EXISTS'),
            Tokens.Punctuator('('),
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('NOT EXISTS ([select-stmt])', () => {
        deepStrictEqual(
          tokenize(
            Nodes._ExistsExpression(
              true,
              Nodes.SelectStmt(
                null,
                [
                  Nodes._SelectClause(
                    null,
                    [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
                    [],
                    null,
                    null,
                    [],
                  ),
                ],
                null,
              ),
            ),
          ),
          [
            Tokens.Keyword('NOT'),
            Tokens.Keyword('EXISTS'),
            Tokens.Punctuator('('),
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('CASE WHEN [expr1] THEN [expr2] END', () => {
        deepStrictEqual(
          tokenize(
            Nodes._CaseExpression(
              null,
              [
                Nodes._CaseClause(
                  Nodes._NumericLiteral(1),
                  Nodes._NumericLiteral(2),
                ),
              ],
              null,
            ),
          ),
          [
            Tokens.Keyword('CASE'),
            Tokens.Keyword('WHEN'),
            Tokens.Numeric('1'),
            Tokens.Keyword('THEN'),
            Tokens.Numeric('2'),
            Tokens.Keyword('END'),
          ],
        );
      });

      it(
        'CASE [expr1] WHEN [expr2] THEN [expr3] WHEN [expr4] THEN [expr5] ' +
          'ELSE [expr6] END',
        () => {
          deepStrictEqual(
            tokenize(
              Nodes._CaseExpression(
                Nodes._Identifier('expr1'),
                [
                  Nodes._CaseClause(
                    Nodes._Identifier('expr2'),
                    Nodes._Identifier('expr3'),
                  ),
                  Nodes._CaseClause(
                    Nodes._Identifier('expr4'),
                    Nodes._Identifier('expr5'),
                  ),
                ],
                Nodes._Identifier('expr6'),
              ),
            ),
            [
              Tokens.Keyword('CASE'),
              Tokens.Identifier('expr1'),
              Tokens.Keyword('WHEN'),
              Tokens.Identifier('expr2'),
              Tokens.Keyword('THEN'),
              Tokens.Identifier('expr3'),
              Tokens.Keyword('WHEN'),
              Tokens.Identifier('expr4'),
              Tokens.Keyword('THEN'),
              Tokens.Identifier('expr5'),
              Tokens.Keyword('ELSE'),
              Tokens.Identifier('expr6'),
              Tokens.Keyword('END'),
            ],
          );
        },
      );

      it('[raise-function]', () => {
        deepStrictEqual(tokenize(Nodes.RaiseFunction(null)), [
          Tokens.Keyword('RAISE'),
          Tokens.Punctuator('('),
          Tokens.Keyword('IGNORE'),
          Tokens.Punctuator(')'),
        ]);
      });
    });

    describe('FactoredSelectStmt', () => {
      it('[select-core]', () => {
        deepStrictEqual(
          tokenize(
            Nodes.FactoredSelectStmt(
              null,
              [
                Nodes._SelectClause(
                  null,
                  [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
                  [],
                  null,
                  null,
                  [],
                ),
              ],
              null,
            ),
          ),
          [Tokens.Keyword('SELECT'), Tokens.Identifier('result-column')],
        );
      });

      it('[select-core] [compound-operator] [select-core]', () => {
        deepStrictEqual(
          tokenize(
            Nodes.FactoredSelectStmt(
              null,
              [
                Nodes._SelectClause(
                  null,
                  [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
                  [],
                  null,
                  null,
                  [],
                ),
                Nodes._SelectCompound(
                  'UNION ALL',
                  Nodes._ValuesClause([
                    Nodes._ValueClause([Nodes._Identifier('expr')]),
                  ]),
                ),
              ],
              null,
            ),
          ),
          [
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
            Tokens.Keyword('UNION'),
            Tokens.Keyword('ALL'),
            Tokens.Keyword('VALUES'),
            Tokens.Punctuator('('),
            Tokens.Identifier('expr'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('WITH RECURSIVE [common-table-expression] [select-core]', () => {
        deepStrictEqual(
          tokenize(
            Nodes.FactoredSelectStmt(
              Nodes.WithClause(true, [
                Nodes.CommonTableExpression(
                  Nodes.CteTableName(
                    Nodes._Identifier('common-table-expression'),
                    [],
                  ),
                  Nodes.SelectStmt(
                    null,
                    [
                      Nodes._SelectClause(
                        null,
                        [
                          Nodes.ResultColumn(
                            Nodes._Identifier('result-column'),
                          ),
                        ],
                        [],
                        null,
                        null,
                        [],
                      ),
                    ],
                    null,
                  ),
                ),
              ]),
              [
                Nodes._SelectClause(
                  null,
                  [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
                  [],
                  null,
                  null,
                  [],
                ),
              ],
              null,
            ),
          ),
          [
            Tokens.Keyword('WITH'),
            Tokens.Keyword('RECURSIVE'),
            Tokens.Identifier('common-table-expression'),
            Tokens.Keyword('AS'),
            Tokens.Punctuator('('),
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
            Tokens.Punctuator(')'),
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
          ],
        );
      });

      it('[select-core] ORDER BY [ordering-term]', () => {
        deepStrictEqual(
          tokenize(
            Nodes.FactoredSelectStmt(
              null,
              [
                Nodes._SelectClause(
                  null,
                  [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
                  [],
                  null,
                  null,
                  [],
                ),
              ],
              Nodes._LimiterClause(
                [
                  Nodes.OrderingTerm(
                    Nodes.IndexedColumn(
                      Nodes._Identifier('indexed-column'),
                      null,
                      null,
                    ),
                    null,
                  ),
                ],
                null,
              ),
            ),
          ),
          [
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
            Tokens.Keyword('ORDER'),
            Tokens.Keyword('BY'),
            Tokens.Identifier('indexed-column'),
          ],
        );
      });

      it('[select-core] LIMIT [expr]', () => {
        deepStrictEqual(
          tokenize(
            Nodes.FactoredSelectStmt(
              null,
              [
                Nodes._SelectClause(
                  null,
                  [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
                  [],
                  null,
                  null,
                  [],
                ),
              ],
              Nodes._LimiterClause(
                [],
                Nodes._LimitClause(Nodes._Identifier('expr'), null),
              ),
            ),
          ),
          [
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
            Tokens.Keyword('LIMIT'),
            Tokens.Identifier('expr'),
          ],
        );
      });
    });

    describe('FilterClause', () => {
      it('FILTER (WHERE expr)', () => {
        deepStrictEqual(
          tokenize(
            Nodes.FilterClause(
              Nodes._WhereClause(
                Nodes._BinaryExpression(
                  Nodes._Path(
                    Nodes._Identifier('table-name'),
                    Nodes._Identifier('column-name'),
                  ),
                  '>',
                  Nodes._NumericLiteral(30),
                ),
              ),
            ),
          ),
          [
            Tokens.Keyword('FILTER'),
            Tokens.Punctuator('('),
            Tokens.Keyword('WHERE'),
            Tokens.Identifier('table-name'),
            Tokens.Punctuator('.'),
            Tokens.Identifier('column-name'),
            Tokens.Punctuator('>'),
            Tokens.Numeric('30'),
            Tokens.Punctuator(')'),
          ],
        );
      });
    });

    describe('ForeignKeyClause', () => {
      it('REFERENCES foreign-table', () => {
        deepStrictEqual(
          tokenize(
            Nodes.ForeignKeyClause(
              Nodes._Identifier('foreign-table'),
              [],
              [],
              null,
            ),
          ),
          [Tokens.Keyword('REFERENCES'), Tokens.Identifier('foreign-table')],
        );
      });

      it('REFERENCES foreign-table(column-name)', () => {
        deepStrictEqual(
          tokenize(
            Nodes.ForeignKeyClause(
              Nodes._Identifier('foreign-table'),
              [Nodes._Identifier('column-name')],
              [],
              null,
            ),
          ),
          [
            Tokens.Keyword('REFERENCES'),
            Tokens.Identifier('foreign-table'),
            Tokens.Punctuator('('),
            Tokens.Identifier('column-name'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('REFERENCES foreign-table(column-name1, column-name2)', () => {
        deepStrictEqual(
          tokenize(
            Nodes.ForeignKeyClause(
              Nodes._Identifier('foreign-table'),
              [
                Nodes._Identifier('column-name1'),
                Nodes._Identifier('column-name2'),
              ],
              [],
              null,
            ),
          ),
          [
            Tokens.Keyword('REFERENCES'),
            Tokens.Identifier('foreign-table'),
            Tokens.Punctuator('('),
            Tokens.Identifier('column-name1'),
            Tokens.Punctuator(','),
            Tokens.Identifier('column-name2'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it(
        'REFERENCES foreign-table ON {DELETE|UPDATE} ' +
          '{SET NULL|SET DEFAULT|CASCADE|RESTRICT|NO ACTION}',
        () => {
          deepStrictEqual(
            tokenize(
              Nodes.ForeignKeyClause(
                Nodes._Identifier('foreign-table'),
                [],
                [Nodes._OnClause('DELETE', 'SET NULL')],
                null,
              ),
            ),
            [
              Tokens.Keyword('REFERENCES'),
              Tokens.Identifier('foreign-table'),
              Tokens.Keyword('ON'),
              Tokens.Keyword('DELETE'),
              Tokens.Keyword('SET'),
              Tokens.Keyword('NULL'),
            ],
          );
        },
      );

      it('REFERENCES foreign-table MATCH name', () => {
        deepStrictEqual(
          tokenize(
            Nodes.ForeignKeyClause(
              Nodes._Identifier('foreign-table'),
              [],
              [Nodes._MatchClause(Nodes._Identifier('name'))],
              null,
            ),
          ),
          [
            Tokens.Keyword('REFERENCES'),
            Tokens.Identifier('foreign-table'),
            Tokens.Keyword('MATCH'),
            Tokens.Identifier('name'),
          ],
        );
      });

      it('REFERENCES foreign-table DEFERRABLE', () => {
        deepStrictEqual(
          tokenize(
            Nodes.ForeignKeyClause(
              Nodes._Identifier('foreign-table'),
              [],
              [],
              Nodes._DeferrableClause(false, null),
            ),
          ),
          [
            Tokens.Keyword('REFERENCES'),
            Tokens.Identifier('foreign-table'),
            Tokens.Keyword('DEFERRABLE'),
          ],
        );
      });

      it(
        'REFERENCES foreign-table(column-name1, column-name2) ON UPDATE RESTRICT' +
          'MATCH name NOT DEFERRABLE INITIALLY DEFERRED',
        () => {
          deepStrictEqual(
            tokenize(
              Nodes.ForeignKeyClause(
                Nodes._Identifier('foreign-table'),
                [
                  Nodes._Identifier('column-name1'),
                  Nodes._Identifier('column-name2'),
                ],
                [
                  Nodes._OnClause('UPDATE', 'RESTRICT'),
                  Nodes._MatchClause(Nodes._Identifier('name')),
                ],
                Nodes._DeferrableClause(true, 'DEFERRED'),
              ),
            ),
            [
              Tokens.Keyword('REFERENCES'),
              Tokens.Identifier('foreign-table'),
              Tokens.Punctuator('('),
              Tokens.Identifier('column-name1'),
              Tokens.Punctuator(','),
              Tokens.Identifier('column-name2'),
              Tokens.Punctuator(')'),
              Tokens.Keyword('ON'),
              Tokens.Keyword('UPDATE'),
              Tokens.Keyword('RESTRICT'),
              Tokens.Keyword('MATCH'),
              Tokens.Identifier('name'),
              Tokens.Keyword('NOT'),
              Tokens.Keyword('DEFERRABLE'),
              Tokens.Keyword('INITIALLY'),
              Tokens.Keyword('DEFERRED'),
            ],
          );
        },
      );
    });

    describe('FrameSpec', () => {
      it('RANGE BETWEEN UNBOUNDED PRECEDING AND [expr] PRECEDING', () => {
        deepStrictEqual(
          tokenize(
            Nodes.FrameSpec(
              'RANGE',
              Nodes._FrameSpecBetweenClause(
                'UNBOUNDED PRECEDING',
                Nodes._FrameSpecExprClause(
                  Nodes._Identifier('expr'),
                  'PRECEDING',
                ),
              ),
              null,
            ),
          ),
          [
            Tokens.Keyword('RANGE'),
            Tokens.Keyword('BETWEEN'),
            Tokens.Keyword('UNBOUNDED'),
            Tokens.Keyword('PRECEDING'),
            Tokens.Keyword('AND'),
            Tokens.Identifier('expr'),
            Tokens.Keyword('PRECEDING'),
          ],
        );
      });

      it('ROWS BETWEEN [expr] PRECEDING AND CURRENT ROW EXCLUDE NOT OTHERS', () => {
        deepStrictEqual(
          tokenize(
            Nodes.FrameSpec(
              'ROWS',
              Nodes._FrameSpecBetweenClause(
                Nodes._FrameSpecExprClause(
                  Nodes._Identifier('expr'),
                  'PRECEDING',
                ),
                'CURRENT ROW',
              ),
              'NOT OTHERS',
            ),
          ),
          [
            Tokens.Keyword('ROWS'),
            Tokens.Keyword('BETWEEN'),
            Tokens.Identifier('expr'),
            Tokens.Keyword('PRECEDING'),
            Tokens.Keyword('AND'),
            Tokens.Keyword('CURRENT'),
            Tokens.Keyword('ROW'),
            Tokens.Keyword('EXCLUDE'),
            Tokens.Keyword('NOT'),
            Tokens.Keyword('OTHERS'),
          ],
        );
      });

      it('GROUPS UNBOUNDED PRECEDING EXCLUDE TIES', () => {
        deepStrictEqual(
          tokenize(Nodes.FrameSpec('GROUPS', 'UNBOUNDED PRECEDING', 'TIES')),
          [
            Tokens.Keyword('GROUPS'),
            Tokens.Keyword('UNBOUNDED'),
            Tokens.Keyword('PRECEDING'),
            Tokens.Keyword('EXCLUDE'),
            Tokens.Keyword('TIES'),
          ],
        );
      });

      it('RANGE [expr] PRECEDING', () => {
        deepStrictEqual(
          tokenize(Nodes.FrameSpec('RANGE', Nodes._Identifier('expr'), null)),
          [
            Tokens.Keyword('RANGE'),
            Tokens.Identifier('expr'),
            Tokens.Keyword('PRECEDING'),
          ],
        );
      });
    });

    describe('IndexedColumn', () => {
      it('column-name', () => {
        deepStrictEqual(
          tokenize(
            Nodes.IndexedColumn(Nodes._Identifier('column-name'), null, null),
          ),
          [Tokens.Identifier('column-name')],
        );
      });

      it('column-name COLLATE collation-name ASC', () => {
        deepStrictEqual(
          tokenize(
            Nodes.IndexedColumn(
              Nodes._Identifier('column-name'),
              Nodes._Identifier('collation-name'),
              'ASC',
            ),
          ),
          [
            Tokens.Identifier('column-name'),
            Tokens.Keyword('COLLATE'),
            Tokens.Identifier('collation-name'),
            Tokens.Keyword('ASC'),
          ],
        );
      });

      it('[expr] DESC', () => {
        deepStrictEqual(
          tokenize(
            Nodes.IndexedColumn(
              Nodes._BinaryExpression(
                Nodes._NumericLiteral(3),
                '+',
                Nodes._NumericLiteral(4),
              ),
              null,
              'DESC',
            ),
          ),
          [
            Tokens.Numeric('3'),
            Tokens.Punctuator('+'),
            Tokens.Numeric('4'),
            Tokens.Keyword('DESC'),
          ],
        );
      });
    });

    describe('InsertStmt', () => {
      it('REPLACE INTO table-name(column-name) VALUES ([expr])', () => {
        deepStrictEqual(
          tokenize(
            Nodes.InsertStmt(
              null,
              'REPLACE',
              Nodes._Identifier('table-name'),
              null,
              [Nodes._Identifier('column-name')],
              Nodes._InsertValuesClause(
                Nodes._ValuesClause([
                  Nodes._ValueClause([Nodes._Identifier('expr')]),
                ]),
                null,
              ),
            ),
          ),
          [
            Tokens.Keyword('REPLACE'),
            Tokens.Keyword('INTO'),
            Tokens.Identifier('table-name'),
            Tokens.Punctuator('('),
            Tokens.Identifier('column-name'),
            Tokens.Punctuator(')'),
            Tokens.Keyword('VALUES'),
            Tokens.Punctuator('('),
            Tokens.Identifier('expr'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it(
        'INSERT INTO table-name(column-name1, column-name2) VALUES ([expr]) ' +
          '[upsert-clause]',
        () => {
          deepStrictEqual(
            tokenize(
              Nodes.InsertStmt(
                null,
                'INSERT',
                Nodes._Identifier('table-name'),
                null,
                [
                  Nodes._Identifier('column-name1'),
                  Nodes._Identifier('column-name2'),
                ],
                Nodes._InsertValuesClause(
                  Nodes._ValuesClause([
                    Nodes._ValueClause([Nodes._Identifier('expr')]),
                  ]),
                  Nodes.UpsertClause(null, null),
                ),
              ),
            ),
            [
              Tokens.Keyword('INSERT'),
              Tokens.Keyword('INTO'),
              Tokens.Identifier('table-name'),
              Tokens.Punctuator('('),
              Tokens.Identifier('column-name1'),
              Tokens.Punctuator(','),
              Tokens.Identifier('column-name2'),
              Tokens.Punctuator(')'),
              Tokens.Keyword('VALUES'),
              Tokens.Punctuator('('),
              Tokens.Identifier('expr'),
              Tokens.Punctuator(')'),
              Tokens.Keyword('ON'),
              Tokens.Keyword('CONFLICT'),
              Tokens.Keyword('DO'),
              Tokens.Keyword('NOTHING'),
            ],
          );
        },
      );

      it('INSERT OR ABORT INTO table-name [select-stmt]', () => {
        deepStrictEqual(
          tokenize(
            Nodes.InsertStmt(
              null,
              'INSERT OR ABORT',
              Nodes._Identifier('table-name'),
              null,
              [],
              Nodes._InsertSelectClause(
                Nodes.SelectStmt(
                  null,
                  [
                    Nodes._SelectClause(
                      null,
                      [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
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
            ),
          ),
          [
            Tokens.Keyword('INSERT'),
            Tokens.Keyword('OR'),
            Tokens.Keyword('ABORT'),
            Tokens.Keyword('INTO'),
            Tokens.Identifier('table-name'),
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
          ],
        );
      });

      it('INSERT OR FAIL INTO table-name [select-stmt] [upsert-clause]', () => {
        deepStrictEqual(
          tokenize(
            Nodes.InsertStmt(
              null,
              'INSERT OR FAIL',
              Nodes._Identifier('table-name'),
              null,
              [],
              Nodes._InsertSelectClause(
                Nodes.SelectStmt(
                  null,
                  [
                    Nodes._SelectClause(
                      null,
                      [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
                      [],
                      null,
                      null,
                      [],
                    ),
                  ],
                  null,
                ),
                Nodes.UpsertClause(null, null),
              ),
            ),
          ),
          [
            Tokens.Keyword('INSERT'),
            Tokens.Keyword('OR'),
            Tokens.Keyword('FAIL'),
            Tokens.Keyword('INTO'),
            Tokens.Identifier('table-name'),
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
            Tokens.Keyword('ON'),
            Tokens.Keyword('CONFLICT'),
            Tokens.Keyword('DO'),
            Tokens.Keyword('NOTHING'),
          ],
        );
      });

      it('INSERT OR IGNORE INTO schema-name.table-name DEFAULT VALUES', () => {
        deepStrictEqual(
          tokenize(
            Nodes.InsertStmt(
              null,
              'INSERT OR IGNORE',
              Nodes._Path(
                Nodes._Identifier('schema-name'),
                Nodes._Identifier('table-name'),
              ),
              null,
              [],
              'DEFAULT VALUES',
            ),
          ),
          [
            Tokens.Keyword('INSERT'),
            Tokens.Keyword('OR'),
            Tokens.Keyword('IGNORE'),
            Tokens.Keyword('INTO'),
            Tokens.Identifier('schema-name'),
            Tokens.Punctuator('.'),
            Tokens.Identifier('table-name'),
            Tokens.Keyword('DEFAULT'),
            Tokens.Keyword('VALUES'),
          ],
        );
      });

      it('INSERT OR REPLACE INTO table-name AS alias DEFAULT VALUES', () => {
        deepStrictEqual(
          tokenize(
            Nodes.InsertStmt(
              null,
              'INSERT OR REPLACE',
              Nodes._Identifier('table-name'),
              Nodes._Identifier('alias'),
              [],
              'DEFAULT VALUES',
            ),
          ),
          [
            Tokens.Keyword('INSERT'),
            Tokens.Keyword('OR'),
            Tokens.Keyword('REPLACE'),
            Tokens.Keyword('INTO'),
            Tokens.Identifier('table-name'),
            Tokens.Keyword('AS'),
            Tokens.Identifier('alias'),
            Tokens.Keyword('DEFAULT'),
            Tokens.Keyword('VALUES'),
          ],
        );
      });

      it('WITH [common-table-expression] INSERT OR ROLLBACK INTO table-name DEFAULT VALUES', () => {
        deepStrictEqual(
          tokenize(
            Nodes.InsertStmt(
              Nodes.WithClause(false, [
                Nodes.CommonTableExpression(
                  Nodes.CteTableName(
                    Nodes._Identifier('common-table-expression'),
                    [],
                  ),
                  Nodes.SelectStmt(
                    null,
                    [
                      Nodes._SelectClause(
                        null,
                        [
                          Nodes.ResultColumn(
                            Nodes._Identifier('result-column'),
                          ),
                        ],
                        [],
                        null,
                        null,
                        [],
                      ),
                    ],
                    null,
                  ),
                ),
              ]),
              'INSERT OR ROLLBACK',
              Nodes._Identifier('table-name'),
              null,
              [],
              'DEFAULT VALUES',
            ),
          ),
          [
            Tokens.Keyword('WITH'),
            Tokens.Identifier('common-table-expression'),
            Tokens.Keyword('AS'),
            Tokens.Punctuator('('),
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
            Tokens.Punctuator(')'),
            Tokens.Keyword('INSERT'),
            Tokens.Keyword('OR'),
            Tokens.Keyword('ROLLBACK'),
            Tokens.Keyword('INTO'),
            Tokens.Identifier('table-name'),
            Tokens.Keyword('DEFAULT'),
            Tokens.Keyword('VALUES'),
          ],
        );
      });
    });

    describe('JoinClause', () => {
      it('[table-or-subquery]', () => {
        deepStrictEqual(
          tokenize(
            Nodes.JoinClause([
              Nodes.QualifiedTableName(
                Nodes._Identifier('table-name'),
                null,
                null,
              ),
            ]),
          ),
          [Tokens.Identifier('table-name')],
        );
      });

      it('[table-or-subquery] [join-operator] [table-or-subquery]', () => {
        deepStrictEqual(
          tokenize(
            Nodes.JoinClause([
              Nodes.QualifiedTableName(
                Nodes._Identifier('table-name1'),
                null,
                null,
              ),
              Nodes._JoinCompound(
                ',',
                Nodes.QualifiedTableName(
                  Nodes._Identifier('table-name2'),
                  null,
                  null,
                ),
                null,
              ),
            ]),
          ),
          [
            Tokens.Identifier('table-name1'),
            Tokens.Punctuator(','),
            Tokens.Identifier('table-name2'),
          ],
        );
      });

      it('[table-or-subquery] [join-operator] [table-or-subquery] [join-constraint]', () => {
        deepStrictEqual(
          tokenize(
            Nodes.JoinClause([
              Nodes.QualifiedTableName(
                Nodes._Identifier('table-name1'),
                null,
                null,
              ),
              Nodes._JoinCompound(
                'NATURAL LEFT OUTER JOIN',
                Nodes.QualifiedTableName(
                  Nodes._Identifier('table-name2'),
                  null,
                  null,
                ),
                Nodes.JoinConstraint(
                  Nodes._JoinOnClause(Nodes._Identifier('expr')),
                ),
              ),
            ]),
          ),
          [
            Tokens.Identifier('table-name1'),
            Tokens.Keyword('NATURAL'),
            Tokens.Keyword('LEFT'),
            Tokens.Keyword('OUTER'),
            Tokens.Keyword('JOIN'),
            Tokens.Identifier('table-name2'),
            Tokens.Keyword('ON'),
            Tokens.Identifier('expr'),
          ],
        );
      });
    });

    describe('JoinConstraint', () => {
      it('ON [expr]', () => {
        deepStrictEqual(
          tokenize(
            Nodes.JoinConstraint(
              Nodes._JoinOnClause(Nodes._Identifier('expr')),
            ),
          ),
          [Tokens.Keyword('ON'), Tokens.Identifier('expr')],
        );
      });

      it('USING (column-name)', () => {
        deepStrictEqual(
          tokenize(
            Nodes.JoinConstraint(
              Nodes._JoinUsingClause([Nodes._Identifier('column-name')]),
            ),
          ),
          [
            Tokens.Keyword('USING'),
            Tokens.Punctuator('('),
            Tokens.Identifier('column-name'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('USING (column-name1, column-name2)', () => {
        deepStrictEqual(
          tokenize(
            Nodes.JoinConstraint(
              Nodes._JoinUsingClause([
                Nodes._Identifier('column-name1'),
                Nodes._Identifier('column-name2'),
              ]),
            ),
          ),
          [
            Tokens.Keyword('USING'),
            Tokens.Punctuator('('),
            Tokens.Identifier('column-name1'),
            Tokens.Punctuator(','),
            Tokens.Identifier('column-name2'),
            Tokens.Punctuator(')'),
          ],
        );
      });
    });

    describe('LiteralValue', () => {
      it('numeric-literal (positive float)', () => {
        deepStrictEqual(tokenize(Nodes._NumericLiteral(123.456)), [
          Tokens.Numeric('123.456'),
        ]);
      });

      it('numeric-literal (negative integer)', () => {
        deepStrictEqual(tokenize(Nodes._NumericLiteral(-94)), [
          Tokens.Numeric('-94'),
        ]);
      });

      it('string-literal (unescaped)', () => {
        deepStrictEqual(tokenize(Nodes._StringLiteral('foo')), [
          Tokens.String("'foo'"),
        ]);
      });

      it('string-literal (escaped)', () => {
        deepStrictEqual(tokenize(Nodes._StringLiteral("foo 'bar'")), [
          Tokens.String("'foo \\'bar\\''"),
        ]);
      });

      it('blob-literal', () => {
        deepStrictEqual(tokenize(Nodes._BlobLiteral(['0500', 'ab07'])), [
          Tokens.Hex("x'0500'"),
          Tokens.Hex("x'ab07'"),
        ]);
      });

      it('NULL', () => {
        deepStrictEqual(tokenize(Nodes._KeywordLiteral('NULL')), [
          Tokens.Keyword('NULL'),
        ]);
      });

      it('TRUE', () => {
        deepStrictEqual(tokenize(Nodes._KeywordLiteral('TRUE')), [
          Tokens.Keyword('TRUE'),
        ]);
      });

      it('FALSE', () => {
        deepStrictEqual(tokenize(Nodes._KeywordLiteral('FALSE')), [
          Tokens.Keyword('FALSE'),
        ]);
      });

      it('CURRENT_TIME', () => {
        deepStrictEqual(tokenize(Nodes._KeywordLiteral('CURRENT_TIME')), [
          Tokens.Keyword('CURRENT_TIME'),
        ]);
      });

      it('CURRENT_DATE', () => {
        deepStrictEqual(tokenize(Nodes._KeywordLiteral('CURRENT_DATE')), [
          Tokens.Keyword('CURRENT_DATE'),
        ]);
      });

      it('CURRENT_TIMESTAMP', () => {
        deepStrictEqual(tokenize(Nodes._KeywordLiteral('CURRENT_TIMESTAMP')), [
          Tokens.Keyword('CURRENT_TIMESTAMP'),
        ]);
      });
    });

    describe('OrderingTerm', () => {
      it('[expr]', () => {
        deepStrictEqual(
          tokenize(
            Nodes.OrderingTerm(
              Nodes.IndexedColumn(Nodes._Identifier('expr'), null, null),
              null,
            ),
          ),
          [Tokens.Identifier('expr')],
        );
      });

      it('[expr] COLLATE collation-name ASC NULLS FIRST', () => {
        deepStrictEqual(
          tokenize(
            Nodes.OrderingTerm(
              Nodes.IndexedColumn(
                Nodes._Identifier('expr'),
                Nodes._Identifier('collation-name'),
                'ASC',
              ),
              'FIRST',
            ),
          ),
          [
            Tokens.Identifier('expr'),
            Tokens.Keyword('COLLATE'),
            Tokens.Identifier('collation-name'),
            Tokens.Keyword('ASC'),
            Tokens.Keyword('NULLS'),
            Tokens.Keyword('FIRST'),
          ],
        );
      });

      it('[expr] COLLATE collation-name DESC NULLS LAST', () => {
        deepStrictEqual(
          tokenize(
            Nodes.OrderingTerm(
              Nodes.IndexedColumn(
                Nodes._Identifier('expr'),
                Nodes._Identifier('collation-name'),
                'DESC',
              ),
              'LAST',
            ),
          ),
          [
            Tokens.Identifier('expr'),
            Tokens.Keyword('COLLATE'),
            Tokens.Identifier('collation-name'),
            Tokens.Keyword('DESC'),
            Tokens.Keyword('NULLS'),
            Tokens.Keyword('LAST'),
          ],
        );
      });
    });

    describe('OverClause', () => {
      it('OVER window-name', () => {
        deepStrictEqual(
          tokenize(Nodes.OverClause(Nodes._Identifier('window-name'))),
          [Tokens.Keyword('OVER'), Tokens.Identifier('window-name')],
        );
      });

      it('OVER ()', () => {
        deepStrictEqual(
          tokenize(Nodes.OverClause(Nodes.WindowDefn(null, [], [], null))),
          [
            Tokens.Keyword('OVER'),
            Tokens.Punctuator('('),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('OVER (base-window-name)', () => {
        deepStrictEqual(
          tokenize(
            Nodes.OverClause(
              Nodes.WindowDefn(
                Nodes._Identifier('base-window-name'),
                [],
                [],
                null,
              ),
            ),
          ),
          [
            Tokens.Keyword('OVER'),
            Tokens.Punctuator('('),
            Tokens.Identifier('base-window-name'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('OVER (PARTITION BY [expr])', () => {
        deepStrictEqual(
          tokenize(
            Nodes.OverClause(
              Nodes.WindowDefn(null, [Nodes._Identifier('expr')], [], null),
            ),
          ),
          [
            Tokens.Keyword('OVER'),
            Tokens.Punctuator('('),
            Tokens.Keyword('PARTITION'),
            Tokens.Keyword('BY'),
            Tokens.Identifier('expr'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('OVER (PARTITION BY [expr1], [expr2])', () => {
        deepStrictEqual(
          tokenize(
            Nodes.OverClause(
              Nodes.WindowDefn(
                null,
                [Nodes._Identifier('expr1'), Nodes._Identifier('expr2')],
                [],
                null,
              ),
            ),
          ),
          [
            Tokens.Keyword('OVER'),
            Tokens.Punctuator('('),
            Tokens.Keyword('PARTITION'),
            Tokens.Keyword('BY'),
            Tokens.Identifier('expr1'),
            Tokens.Punctuator(','),
            Tokens.Identifier('expr2'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('OVER (ORDER BY [ordering-term])', () => {
        deepStrictEqual(
          tokenize(
            Nodes.OverClause(
              Nodes.WindowDefn(
                null,
                [],
                [
                  Nodes.OrderingTerm(
                    Nodes.IndexedColumn(
                      Nodes._Identifier('indexed-column'),
                      null,
                      null,
                    ),
                    null,
                  ),
                ],
                null,
              ),
            ),
          ),
          [
            Tokens.Keyword('OVER'),
            Tokens.Punctuator('('),
            Tokens.Keyword('ORDER'),
            Tokens.Keyword('BY'),
            Tokens.Identifier('indexed-column'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('OVER (ORDER BY [ordering-term1], [ordering-term2])', () => {
        deepStrictEqual(
          tokenize(
            Nodes.OverClause(
              Nodes.WindowDefn(
                null,
                [],
                [
                  Nodes.OrderingTerm(
                    Nodes.IndexedColumn(
                      Nodes._Identifier('indexed-column1'),
                      null,
                      null,
                    ),
                    null,
                  ),
                  Nodes.OrderingTerm(
                    Nodes.IndexedColumn(
                      Nodes._Identifier('indexed-column2'),
                      null,
                      null,
                    ),
                    null,
                  ),
                ],
                null,
              ),
            ),
          ),
          [
            Tokens.Keyword('OVER'),
            Tokens.Punctuator('('),
            Tokens.Keyword('ORDER'),
            Tokens.Keyword('BY'),
            Tokens.Identifier('indexed-column1'),
            Tokens.Punctuator(','),
            Tokens.Identifier('indexed-column2'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('OVER [frame-spec]', () => {
        deepStrictEqual(
          tokenize(
            Nodes.OverClause(
              Nodes.WindowDefn(
                null,
                [],
                [],
                Nodes.FrameSpec(
                  'RANGE',
                  Nodes._FrameSpecBetweenClause(
                    'UNBOUNDED PRECEDING',
                    Nodes._FrameSpecExprClause(
                      Nodes._Identifier('expr'),
                      'PRECEDING',
                    ),
                  ),
                  null,
                ),
              ),
            ),
          ),
          [
            Tokens.Keyword('OVER'),
            Tokens.Punctuator('('),
            Tokens.Keyword('RANGE'),
            Tokens.Keyword('BETWEEN'),
            Tokens.Keyword('UNBOUNDED'),
            Tokens.Keyword('PRECEDING'),
            Tokens.Keyword('AND'),
            Tokens.Identifier('expr'),
            Tokens.Keyword('PRECEDING'),
            Tokens.Punctuator(')'),
          ],
        );
      });
    });

    describe('PragmaStmt', () => {
      it('PRAGMA pragma-name', () => {
        deepStrictEqual(
          tokenize(Nodes.PragmaStmt(Nodes._Identifier('pragma-name'), null)),
          [Tokens.Keyword('PRAGMA'), Tokens.Identifier('pragma-name')],
        );
      });

      it('PRAGMA schema-name.pragma-name = [pragma-value]', () => {
        deepStrictEqual(
          tokenize(
            Nodes.PragmaStmt(
              Nodes._Path(
                Nodes._Identifier('schema-name'),
                Nodes._Identifier('pragma-name'),
              ),
              Nodes._PragmaSetter(
                Nodes.PragmaValue(Nodes._KeywordLiteral('pragma-value')),
              ),
            ),
          ),
          [
            Tokens.Keyword('PRAGMA'),
            Tokens.Identifier('schema-name'),
            Tokens.Punctuator('.'),
            Tokens.Identifier('pragma-name'),
            Tokens.Punctuator('='),
            Tokens.Keyword('pragma-value'),
          ],
        );
      });

      it('PRAGMA pragma-name([pragma-value])', () => {
        deepStrictEqual(
          tokenize(
            Nodes.PragmaStmt(
              Nodes._Identifier('pragma-name'),
              Nodes._PragmaGetter(
                Nodes.PragmaValue(Nodes._KeywordLiteral('pragma-value')),
              ),
            ),
          ),
          [
            Tokens.Keyword('PRAGMA'),
            Tokens.Identifier('pragma-name'),
            Tokens.Punctuator('('),
            Tokens.Keyword('pragma-value'),
            Tokens.Punctuator(')'),
          ],
        );
      });
    });

    describe('PragmaValue', () => {
      it('[signed-number]', () => {
        deepStrictEqual(
          tokenize(Nodes.PragmaValue(Nodes._NumericLiteral(-123.456))),
          [Tokens.Numeric('-123.456')],
        );
      });

      it('name|signed-literal', () => {
        deepStrictEqual(
          tokenize(Nodes.PragmaValue(Nodes._KeywordLiteral('INCREMENTAL'))),
          [Tokens.Keyword('INCREMENTAL')],
        );
      });
    });

    describe('QualifiedTableName', () => {
      it('table-name', () => {
        deepStrictEqual(
          tokenize(
            Nodes.QualifiedTableName(
              Nodes._Identifier('table-name'),
              null,
              null,
            ),
          ),
          [Tokens.Identifier('table-name')],
        );
      });

      it('schema-name.table-name', () => {
        deepStrictEqual(
          tokenize(
            Nodes.QualifiedTableName(
              Nodes._Path(
                Nodes._Identifier('schema-name'),
                Nodes._Identifier('table-name'),
              ),
              null,
              null,
            ),
          ),
          [
            Tokens.Identifier('schema-name'),
            Tokens.Punctuator('.'),
            Tokens.Identifier('table-name'),
          ],
        );
      });

      it('table-name AS alias', () => {
        deepStrictEqual(
          tokenize(
            Nodes.QualifiedTableName(
              Nodes._Identifier('table-name'),
              Nodes._Identifier('alias'),
              null,
            ),
          ),
          [
            Tokens.Identifier('table-name'),
            Tokens.Keyword('AS'),
            Tokens.Identifier('alias'),
          ],
        );
      });

      it('table-name INDEXED BY index-name', () => {
        deepStrictEqual(
          tokenize(
            Nodes.QualifiedTableName(
              Nodes._Identifier('table-name'),
              null,
              Nodes._Identifier('index-name'),
            ),
          ),
          [
            Tokens.Identifier('table-name'),
            Tokens.Keyword('INDEXED'),
            Tokens.Keyword('BY'),
            Tokens.Identifier('index-name'),
          ],
        );
      });

      it('table-name NOT INDEXED', () => {
        deepStrictEqual(
          tokenize(
            Nodes.QualifiedTableName(
              Nodes._Identifier('table-name'),
              null,
              false,
            ),
          ),
          [
            Tokens.Identifier('table-name'),
            Tokens.Keyword('NOT'),
            Tokens.Keyword('INDEXED'),
          ],
        );
      });

      it('schema-name.table-name AS alias INDEX BY index-name', () => {
        deepStrictEqual(
          tokenize(
            Nodes.QualifiedTableName(
              Nodes._Path(
                Nodes._Identifier('schema-name'),
                Nodes._Identifier('table-name'),
              ),
              Nodes._Identifier('alias'),
              Nodes._Identifier('index-name'),
            ),
          ),
          [
            Tokens.Identifier('schema-name'),
            Tokens.Punctuator('.'),
            Tokens.Identifier('table-name'),
            Tokens.Keyword('AS'),
            Tokens.Identifier('alias'),
            Tokens.Keyword('INDEXED'),
            Tokens.Keyword('BY'),
            Tokens.Identifier('index-name'),
          ],
        );
      });
    });

    describe('RaiseFunction', () => {
      it('RAISE (IGNORE)', () => {
        deepStrictEqual(tokenize(Nodes.RaiseFunction(null)), [
          Tokens.Keyword('RAISE'),
          Tokens.Punctuator('('),
          Tokens.Keyword('IGNORE'),
          Tokens.Punctuator(')'),
        ]);
      });

      it("RAISE (ROLLBACK, 'Error message')", () => {
        deepStrictEqual(
          tokenize(
            Nodes.RaiseFunction([
              'ROLLBACK',
              Nodes._StringLiteral('Error message'),
            ]),
          ),
          [
            Tokens.Keyword('RAISE'),
            Tokens.Punctuator('('),
            Tokens.Keyword('ROLLBACK'),
            Tokens.Punctuator(','),
            Tokens.String("'Error message'"),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it("RAISE (ABORT, 'Error message')", () => {
        deepStrictEqual(
          tokenize(
            Nodes.RaiseFunction([
              'ABORT',
              Nodes._StringLiteral('Error message'),
            ]),
          ),
          [
            Tokens.Keyword('RAISE'),
            Tokens.Punctuator('('),
            Tokens.Keyword('ABORT'),
            Tokens.Punctuator(','),
            Tokens.String("'Error message'"),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it("RAISE (FAIL, 'Error message')", () => {
        deepStrictEqual(
          tokenize(
            Nodes.RaiseFunction([
              'FAIL',
              Nodes._StringLiteral('Error message'),
            ]),
          ),
          [
            Tokens.Keyword('RAISE'),
            Tokens.Punctuator('('),
            Tokens.Keyword('FAIL'),
            Tokens.Punctuator(','),
            Tokens.String("'Error message'"),
            Tokens.Punctuator(')'),
          ],
        );
      });
    });

    describe('RecursiveCte', () => {
      it('[cte-table-name] AS (initial-select UNION recursive-select)', () => {
        deepStrictEqual(
          tokenize(
            Nodes.RecursiveCte(
              Nodes.CteTableName(Nodes._Identifier('cte-table-name'), []),
              Nodes._Identifier('initial-select'),
              false,
              Nodes._Identifier('recursive-select'),
            ),
          ),
          [
            Tokens.Identifier('cte-table-name'),
            Tokens.Keyword('AS'),
            Tokens.Punctuator('('),
            Tokens.Identifier('initial-select'),
            Tokens.Keyword('UNION'),
            Tokens.Identifier('recursive-select'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('[cte-table-name] AS (initial-select UNION ALL recursive-select)', () => {
        deepStrictEqual(
          tokenize(
            Nodes.RecursiveCte(
              Nodes.CteTableName(Nodes._Identifier('cte-table-name'), []),
              Nodes._Identifier('initial-select'),
              true,
              Nodes._Identifier('recursive-select'),
            ),
          ),
          [
            Tokens.Identifier('cte-table-name'),
            Tokens.Keyword('AS'),
            Tokens.Punctuator('('),
            Tokens.Identifier('initial-select'),
            Tokens.Keyword('UNION'),
            Tokens.Keyword('ALL'),
            Tokens.Identifier('recursive-select'),
            Tokens.Punctuator(')'),
          ],
        );
      });
    });

    describe('ReindexStmt', () => {
      it('REINDEX', () => {
        deepStrictEqual(tokenize(Nodes.ReindexStmt(null)), [
          Tokens.Keyword('REINDEX'),
        ]);
      });

      it('REINDEX {collation-name | table-name | index-name}', () => {
        deepStrictEqual(
          tokenize(Nodes.ReindexStmt(Nodes._Identifier('collation-name'))),
          [Tokens.Keyword('REINDEX'), Tokens.Identifier('collation-name')],
        );
      });

      it('REINDEX schema-name.{table-name | index-name}', () => {
        deepStrictEqual(
          tokenize(
            Nodes.ReindexStmt(
              Nodes._Path(
                Nodes._Identifier('schema-name'),
                Nodes._Identifier('table-name'),
              ),
            ),
          ),
          [
            Tokens.Keyword('REINDEX'),
            Tokens.Identifier('schema-name'),
            Tokens.Punctuator('.'),
            Tokens.Identifier('table-name'),
          ],
        );
      });
    });

    describe('ReleaseStmt', () => {
      it('RELEASE savepoint-name', () => {
        deepStrictEqual(
          tokenize(Nodes.ReleaseStmt(Nodes._Identifier('savepoint-name'))),
          [Tokens.Keyword('RELEASE'), Tokens.Identifier('savepoint-name')],
        );
      });
    });

    describe('ResultColumn', () => {
      it('[expr]', () => {
        deepStrictEqual(
          tokenize(Nodes.ResultColumn(Nodes._Identifier('expr'))),
          [Tokens.Identifier('expr')],
        );
      });

      it('[expr] column-alias', () => {
        deepStrictEqual(
          tokenize(
            Nodes.ResultColumn(
              Nodes._ColumnAliasClause(
                Nodes._Identifier('expr'),
                Nodes._Identifier('column-alias'),
              ),
            ),
          ),
          [Tokens.Identifier('expr'), Tokens.Identifier('column-alias')],
        );
      });

      it('*', () => {
        deepStrictEqual(
          tokenize(Nodes.ResultColumn(Nodes._AllColumnsClause(null))),
          [Tokens.Punctuator('*')],
        );
      });

      it('table-name.*', () => {
        deepStrictEqual(
          tokenize(
            Nodes.ResultColumn(
              Nodes._AllColumnsClause(Nodes._Identifier('table-name')),
            ),
          ),
          [
            Tokens.Identifier('table-name'),
            Tokens.Punctuator('.'),
            Tokens.Punctuator('*'),
          ],
        );
      });
    });

    describe('RollbackStmt', () => {
      it('ROLLBACK', () => {
        deepStrictEqual(tokenize(Nodes.RollbackStmt(null)), [
          Tokens.Keyword('ROLLBACK'),
        ]);
      });

      it('ROLLBACK TO savepoint-name', () => {
        deepStrictEqual(
          tokenize(Nodes.RollbackStmt(Nodes._Identifier('savepoint-name'))),
          [
            Tokens.Keyword('ROLLBACK'),
            Tokens.Keyword('TO'),
            Tokens.Identifier('savepoint-name'),
          ],
        );
      });
    });

    describe('SavepointStmt', () => {
      it('SAVEPOINT savepoint-name', () => {
        deepStrictEqual(
          tokenize(Nodes.SavepointStmt(Nodes._Identifier('savepoint-name'))),
          [Tokens.Keyword('SAVEPOINT'), Tokens.Identifier('savepoint-name')],
        );
      });
    });

    describe('SelectCore', () => {
      it('SELECT [result-column]', () => {
        deepStrictEqual(
          tokenize(
            Nodes._SelectClause(
              null,
              [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
              [],
              null,
              null,
              [],
            ),
          ),
          [Tokens.Keyword('SELECT'), Tokens.Identifier('result-column')],
        );
      });

      it('SELECT [result-column1], [result-column2]', () => {
        deepStrictEqual(
          tokenize(
            Nodes._SelectClause(
              null,
              [
                Nodes.ResultColumn(Nodes._Identifier('result-column1')),
                Nodes.ResultColumn(Nodes._Identifier('result-column2')),
              ],
              [],
              null,
              null,
              [],
            ),
          ),
          [
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column1'),
            Tokens.Punctuator(','),
            Tokens.Identifier('result-column2'),
          ],
        );
      });

      it('SELECT DISTINCT|ALL [result-column]', () => {
        deepStrictEqual(
          tokenize(
            Nodes._SelectClause(
              'DISTINCT',
              [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
              [],
              null,
              null,
              [],
            ),
          ),
          [
            Tokens.Keyword('SELECT'),
            Tokens.Keyword('DISTINCT'),
            Tokens.Identifier('result-column'),
          ],
        );
      });

      it('SELECT [result-column] FROM table-name', () => {
        deepStrictEqual(
          tokenize(
            Nodes._SelectClause(
              null,
              [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
              [
                Nodes.QualifiedTableName(
                  Nodes._Identifier('table-name'),
                  null,
                  null,
                ),
              ],
              null,
              null,
              [],
            ),
          ),
          [
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
            Tokens.Keyword('FROM'),
            Tokens.Identifier('table-name'),
          ],
        );
      });

      it('SELECT [result-column] FROM table-name AS table-alias', () => {
        deepStrictEqual(
          tokenize(
            Nodes._SelectClause(
              null,
              [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
              [
                Nodes.QualifiedTableName(
                  Nodes._Identifier('table-name'),
                  Nodes._Identifier('table-alias'),
                  null,
                ),
              ],
              null,
              null,
              [],
            ),
          ),
          [
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
            Tokens.Keyword('FROM'),
            Tokens.Identifier('table-name'),
            Tokens.Keyword('AS'),
            Tokens.Identifier('table-alias'),
          ],
        );
      });

      it('SELECT [result-column] FROM table-name AS table-alias NOT INDEXED', () => {
        deepStrictEqual(
          tokenize(
            Nodes._SelectClause(
              null,
              [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
              [
                Nodes.QualifiedTableName(
                  Nodes._Identifier('table-name'),
                  Nodes._Identifier('table-alias'),
                  false,
                ),
              ],
              null,
              null,
              [],
            ),
          ),
          [
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
            Tokens.Keyword('FROM'),
            Tokens.Identifier('table-name'),
            Tokens.Keyword('AS'),
            Tokens.Identifier('table-alias'),
            Tokens.Keyword('NOT'),
            Tokens.Keyword('INDEXED'),
          ],
        );
      });

      it('SELECT [result-column] FROM schema-name.table-name', () => {
        deepStrictEqual(
          tokenize(
            Nodes._SelectClause(
              null,
              [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
              [
                Nodes.QualifiedTableName(
                  Nodes._Path(
                    Nodes._Identifier('schema-name'),
                    Nodes._Identifier('table-name'),
                  ),
                  null,
                  null,
                ),
              ],
              null,
              null,
              [],
            ),
          ),
          [
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
            Tokens.Keyword('FROM'),
            Tokens.Identifier('schema-name'),
            Tokens.Punctuator('.'),
            Tokens.Identifier('table-name'),
          ],
        );
      });

      it('SELECT [result-column] FROM table-function-name([expr])', () => {
        deepStrictEqual(
          tokenize(
            Nodes._SelectClause(
              null,
              [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
              [
                Nodes._TableCallClause(
                  Nodes._Identifier('table-function-name'),
                  [Nodes._Identifier('expr')],
                  null,
                ),
              ],
              null,
              null,
              [],
            ),
          ),
          [
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
            Tokens.Keyword('FROM'),
            Tokens.Identifier('table-function-name'),
            Tokens.Punctuator('('),
            Tokens.Identifier('expr'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it(
        'SELECT [result-column] FROM schema-name.table-function-name' +
          '([expr1], [expr2]) table-alias',
        () => {
          deepStrictEqual(
            tokenize(
              Nodes._SelectClause(
                null,
                [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
                [
                  Nodes._TableCallClause(
                    Nodes._Path(
                      Nodes._Identifier('schema-name'),
                      Nodes._Identifier('table-function-name'),
                    ),
                    [Nodes._Identifier('expr1'), Nodes._Identifier('expr2')],
                    Nodes._Identifier('table-alias'),
                  ),
                ],
                null,
                null,
                [],
              ),
            ),
            [
              Tokens.Keyword('SELECT'),
              Tokens.Identifier('result-column'),
              Tokens.Keyword('FROM'),
              Tokens.Identifier('schema-name'),
              Tokens.Punctuator('.'),
              Tokens.Identifier('table-function-name'),
              Tokens.Punctuator('('),
              Tokens.Identifier('expr1'),
              Tokens.Punctuator(','),
              Tokens.Identifier('expr2'),
              Tokens.Punctuator(')'),
              Tokens.Identifier('table-alias'),
            ],
          );
        },
      );

      it('SELECT [result-column] FROM (SELECT 1)', () => {
        deepStrictEqual(
          tokenize(
            Nodes._SelectClause(
              null,
              [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
              [
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
              ],
              null,
              null,
              [],
            ),
          ),
          [
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
            Tokens.Keyword('FROM'),
            Tokens.Punctuator('('),
            Tokens.Keyword('SELECT'),
            Tokens.Numeric('1'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('SELECT [result-column] FROM (SELECT 1) table-alias', () => {
        deepStrictEqual(
          tokenize(
            Nodes._SelectClause(
              null,
              [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
              [
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
                  Nodes._Identifier('table-alias'),
                ),
              ],
              null,
              null,
              [],
            ),
          ),
          [
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
            Tokens.Keyword('FROM'),
            Tokens.Punctuator('('),
            Tokens.Keyword('SELECT'),
            Tokens.Numeric('1'),
            Tokens.Punctuator(')'),
            Tokens.Identifier('table-alias'),
          ],
        );
      });

      it('SELECT [result-column] FROM ((SELECT 1), table-name AS table-alias)', () => {
        deepStrictEqual(
          tokenize(
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
          ),
          [
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
            Tokens.Keyword('FROM'),
            Tokens.Punctuator('('),
            Tokens.Punctuator('('),
            Tokens.Keyword('SELECT'),
            Tokens.Numeric('1'),
            Tokens.Punctuator(')'),
            Tokens.Punctuator(','),
            Tokens.Identifier('table-name'),
            Tokens.Keyword('AS'),
            Tokens.Identifier('table-alias'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('SELECT [result-column] WHERE [expr]', () => {
        deepStrictEqual(
          tokenize(
            Nodes._SelectClause(
              null,
              [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
              [],
              Nodes._WhereClause(Nodes._Identifier('expr')),
              null,
              [],
            ),
          ),
          [
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
            Tokens.Keyword('WHERE'),
            Tokens.Identifier('expr'),
          ],
        );
      });

      it('SELECT [result-column] GROUP BY [expr]', () => {
        deepStrictEqual(
          tokenize(
            Nodes._SelectClause(
              null,
              [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
              [],
              null,
              Nodes._GroupByClause([Nodes._Identifier('expr')], null),
              [],
            ),
          ),
          [
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
            Tokens.Keyword('GROUP'),
            Tokens.Keyword('BY'),
            Tokens.Identifier('expr'),
          ],
        );
      });

      it('SELECT [result-column] GROUP BY [expr1], [expr2]', () => {
        deepStrictEqual(
          tokenize(
            Nodes._SelectClause(
              null,
              [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
              [],
              null,
              Nodes._GroupByClause(
                [Nodes._Identifier('expr1'), Nodes._Identifier('expr2')],
                null,
              ),
              [],
            ),
          ),
          [
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
            Tokens.Keyword('GROUP'),
            Tokens.Keyword('BY'),
            Tokens.Identifier('expr1'),
            Tokens.Punctuator(','),
            Tokens.Identifier('expr2'),
          ],
        );
      });

      it('SELECT [result-column] GROUP BY [expr1] HAVING [expr2]', () => {
        deepStrictEqual(
          tokenize(
            Nodes._SelectClause(
              null,
              [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
              [],
              null,
              Nodes._GroupByClause(
                [Nodes._Identifier('expr1')],
                Nodes._Identifier('expr2'),
              ),
              [],
            ),
          ),
          [
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
            Tokens.Keyword('GROUP'),
            Tokens.Keyword('BY'),
            Tokens.Identifier('expr1'),
            Tokens.Keyword('HAVING'),
            Tokens.Identifier('expr2'),
          ],
        );
      });

      it('SELECT [result-column] WINDOW window-name AS window-defn', () => {
        deepStrictEqual(
          tokenize(
            Nodes._SelectClause(
              null,
              [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
              [],
              null,
              null,
              [
                Nodes._WindowAsClause(
                  Nodes._Identifier('window-name'),
                  Nodes._Identifier('window-defn'),
                ),
              ],
            ),
          ),
          [
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
            Tokens.Keyword('WINDOW'),
            Tokens.Identifier('window-name'),
            Tokens.Keyword('AS'),
            Tokens.Identifier('window-defn'),
          ],
        );
      });

      it('SELECT [result-column] WINDOW [window1], [window2]', () => {
        deepStrictEqual(
          tokenize(
            Nodes._SelectClause(
              null,
              [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
              [],
              null,
              null,
              [
                Nodes._WindowAsClause(
                  Nodes._Identifier('window-name1'),
                  Nodes._Identifier('window-defn1'),
                ),
                Nodes._WindowAsClause(
                  Nodes._Identifier('window-name2'),
                  Nodes._Identifier('window-defn2'),
                ),
              ],
            ),
          ),
          [
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
            Tokens.Keyword('WINDOW'),
            Tokens.Identifier('window-name1'),
            Tokens.Keyword('AS'),
            Tokens.Identifier('window-defn1'),
            Tokens.Punctuator(','),
            Tokens.Identifier('window-name2'),
            Tokens.Keyword('AS'),
            Tokens.Identifier('window-defn2'),
          ],
        );
      });

      it('VALUES ([expr])', () => {
        deepStrictEqual(
          tokenize(
            Nodes._ValuesClause([
              Nodes._ValueClause([Nodes._Identifier('expr')]),
            ]),
          ),
          [
            Tokens.Keyword('VALUES'),
            Tokens.Punctuator('('),
            Tokens.Identifier('expr'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('VALUES ([expr1], [expr2])', () => {
        deepStrictEqual(
          tokenize(
            Nodes._ValuesClause([
              Nodes._ValueClause([
                Nodes._Identifier('expr1'),
                Nodes._Identifier('expr2'),
              ]),
            ]),
          ),
          [
            Tokens.Keyword('VALUES'),
            Tokens.Punctuator('('),
            Tokens.Identifier('expr1'),
            Tokens.Punctuator(','),
            Tokens.Identifier('expr2'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('VALUES ([expr1], [expr2]), ([expr])', () => {
        deepStrictEqual(
          tokenize(
            Nodes._ValuesClause([
              Nodes._ValueClause([
                Nodes._Identifier('expr1'),
                Nodes._Identifier('expr2'),
              ]),
              Nodes._ValueClause([Nodes._Identifier('expr')]),
            ]),
          ),
          [
            Tokens.Keyword('VALUES'),
            Tokens.Punctuator('('),
            Tokens.Identifier('expr1'),
            Tokens.Punctuator(','),
            Tokens.Identifier('expr2'),
            Tokens.Punctuator(')'),
            Tokens.Punctuator(','),
            Tokens.Punctuator('('),
            Tokens.Identifier('expr'),
            Tokens.Punctuator(')'),
          ],
        );
      });
    });

    describe('SelectStmt', () => {
      it('SELECT [result-column]', () => {
        deepStrictEqual(
          tokenize(
            Nodes.SelectStmt(
              null,
              [
                Nodes._SelectClause(
                  null,
                  [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
                  [],
                  null,
                  null,
                  [],
                ),
              ],
              null,
            ),
          ),
          [Tokens.Keyword('SELECT'), Tokens.Identifier('result-column')],
        );
      });

      it('SELECT [result-column1], [result-column2]', () => {
        deepStrictEqual(
          tokenize(
            Nodes.SelectStmt(
              null,
              [
                Nodes._SelectClause(
                  null,
                  [
                    Nodes.ResultColumn(Nodes._Identifier('result-column1')),
                    Nodes.ResultColumn(Nodes._Identifier('result-column2')),
                  ],
                  [],
                  null,
                  null,
                  [],
                ),
              ],
              null,
            ),
          ),
          [
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column1'),
            Tokens.Punctuator(','),
            Tokens.Identifier('result-column2'),
          ],
        );
      });

      it('SELECT DISTINCT|ALL [result-column]', () => {
        deepStrictEqual(
          tokenize(
            Nodes.SelectStmt(
              null,
              [
                Nodes._SelectClause(
                  'DISTINCT',
                  [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
                  [],
                  null,
                  null,
                  [],
                ),
              ],
              null,
            ),
          ),
          [
            Tokens.Keyword('SELECT'),
            Tokens.Keyword('DISTINCT'),
            Tokens.Identifier('result-column'),
          ],
        );
      });

      it('[with-clause] SELECT [result-column]', () => {
        deepStrictEqual(
          tokenize(
            Nodes.SelectStmt(
              Nodes.WithClause(false, [
                Nodes.CommonTableExpression(
                  Nodes.CteTableName(Nodes._Identifier('table-name'), []),
                  Nodes.SelectStmt(
                    null,
                    [
                      Nodes._SelectClause(
                        null,
                        [
                          Nodes.ResultColumn(
                            Nodes._Identifier('result-column'),
                          ),
                        ],
                        [],
                        null,
                        null,
                        [],
                      ),
                    ],
                    null,
                  ),
                ),
              ]),
              [
                Nodes._SelectClause(
                  null,
                  [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
                  [],
                  null,
                  null,
                  [],
                ),
              ],
              null,
            ),
          ),
          [
            Tokens.Keyword('WITH'),
            Tokens.Identifier('table-name'),
            Tokens.Keyword('AS'),
            Tokens.Punctuator('('),
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
            Tokens.Punctuator(')'),
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
          ],
        );
      });

      it('SELECT [result-column] FROM table-name', () => {
        deepStrictEqual(
          tokenize(
            Nodes.SelectStmt(
              null,
              [
                Nodes._SelectClause(
                  null,
                  [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
                  [
                    Nodes.QualifiedTableName(
                      Nodes._Identifier('table-name'),
                      null,
                      null,
                    ),
                  ],
                  null,
                  null,
                  [],
                ),
              ],
              null,
            ),
          ),
          [
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
            Tokens.Keyword('FROM'),
            Tokens.Identifier('table-name'),
          ],
        );
      });

      it('SELECT [result-column] FROM table-name AS table-alias', () => {
        deepStrictEqual(
          tokenize(
            Nodes.SelectStmt(
              null,
              [
                Nodes._SelectClause(
                  null,
                  [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
                  [
                    Nodes.QualifiedTableName(
                      Nodes._Identifier('table-name'),
                      Nodes._Identifier('table-alias'),
                      null,
                    ),
                  ],
                  null,
                  null,
                  [],
                ),
              ],
              null,
            ),
          ),
          [
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
            Tokens.Keyword('FROM'),
            Tokens.Identifier('table-name'),
            Tokens.Keyword('AS'),
            Tokens.Identifier('table-alias'),
          ],
        );
      });

      it('SELECT [result-column] FROM table-name AS table-alias NOT INDEXED', () => {
        deepStrictEqual(
          tokenize(
            Nodes.SelectStmt(
              null,
              [
                Nodes._SelectClause(
                  null,
                  [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
                  [
                    Nodes.QualifiedTableName(
                      Nodes._Identifier('table-name'),
                      Nodes._Identifier('table-alias'),
                      false,
                    ),
                  ],
                  null,
                  null,
                  [],
                ),
              ],
              null,
            ),
          ),
          [
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
            Tokens.Keyword('FROM'),
            Tokens.Identifier('table-name'),
            Tokens.Keyword('AS'),
            Tokens.Identifier('table-alias'),
            Tokens.Keyword('NOT'),
            Tokens.Keyword('INDEXED'),
          ],
        );
      });

      it('SELECT [result-column] FROM schema-name.table-name', () => {
        deepStrictEqual(
          tokenize(
            Nodes.SelectStmt(
              null,
              [
                Nodes._SelectClause(
                  null,
                  [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
                  [
                    Nodes.QualifiedTableName(
                      Nodes._Path(
                        Nodes._Identifier('schema-name'),
                        Nodes._Identifier('table-name'),
                      ),
                      null,
                      null,
                    ),
                  ],
                  null,
                  null,
                  [],
                ),
              ],
              null,
            ),
          ),
          [
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
            Tokens.Keyword('FROM'),
            Tokens.Identifier('schema-name'),
            Tokens.Punctuator('.'),
            Tokens.Identifier('table-name'),
          ],
        );
      });

      it('SELECT [result-column] FROM table-function-name([expr])', () => {
        deepStrictEqual(
          tokenize(
            Nodes.SelectStmt(
              null,
              [
                Nodes._SelectClause(
                  null,
                  [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
                  [
                    Nodes._TableCallClause(
                      Nodes._Identifier('table-function-name'),
                      [Nodes._Identifier('expr')],
                      null,
                    ),
                  ],
                  null,
                  null,
                  [],
                ),
              ],
              null,
            ),
          ),
          [
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
            Tokens.Keyword('FROM'),
            Tokens.Identifier('table-function-name'),
            Tokens.Punctuator('('),
            Tokens.Identifier('expr'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it(
        'SELECT [result-column] FROM schema-name.table-function-name' +
          '([expr1], [expr2]) table-alias',
        () => {
          deepStrictEqual(
            tokenize(
              Nodes.SelectStmt(
                null,
                [
                  Nodes._SelectClause(
                    null,
                    [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
                    [
                      Nodes._TableCallClause(
                        Nodes._Path(
                          Nodes._Identifier('schema-name'),
                          Nodes._Identifier('table-function-name'),
                        ),
                        [
                          Nodes._Identifier('expr1'),
                          Nodes._Identifier('expr2'),
                        ],
                        Nodes._Identifier('table-alias'),
                      ),
                    ],
                    null,
                    null,
                    [],
                  ),
                ],
                null,
              ),
            ),
            [
              Tokens.Keyword('SELECT'),
              Tokens.Identifier('result-column'),
              Tokens.Keyword('FROM'),
              Tokens.Identifier('schema-name'),
              Tokens.Punctuator('.'),
              Tokens.Identifier('table-function-name'),
              Tokens.Punctuator('('),
              Tokens.Identifier('expr1'),
              Tokens.Punctuator(','),
              Tokens.Identifier('expr2'),
              Tokens.Punctuator(')'),
              Tokens.Identifier('table-alias'),
            ],
          );
        },
      );

      it('SELECT [result-column] FROM (SELECT 1)', () => {
        deepStrictEqual(
          tokenize(
            Nodes.SelectStmt(
              null,
              [
                Nodes._SelectClause(
                  null,
                  [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
                  [
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
                  ],
                  null,
                  null,
                  [],
                ),
              ],
              null,
            ),
          ),
          [
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
            Tokens.Keyword('FROM'),
            Tokens.Punctuator('('),
            Tokens.Keyword('SELECT'),
            Tokens.Numeric('1'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('SELECT [result-column] FROM (SELECT 1) table-alias', () => {
        deepStrictEqual(
          tokenize(
            Nodes.SelectStmt(
              null,
              [
                Nodes._SelectClause(
                  null,
                  [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
                  [
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
                      Nodes._Identifier('table-alias'),
                    ),
                  ],
                  null,
                  null,
                  [],
                ),
              ],
              null,
            ),
          ),
          [
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
            Tokens.Keyword('FROM'),
            Tokens.Punctuator('('),
            Tokens.Keyword('SELECT'),
            Tokens.Numeric('1'),
            Tokens.Punctuator(')'),
            Tokens.Identifier('table-alias'),
          ],
        );
      });

      it('SELECT [result-column] FROM ((SELECT 1), table-name AS table-alias)', () => {
        deepStrictEqual(
          tokenize(
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
          ),
          [
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
            Tokens.Keyword('FROM'),
            Tokens.Punctuator('('),
            Tokens.Punctuator('('),
            Tokens.Keyword('SELECT'),
            Tokens.Numeric('1'),
            Tokens.Punctuator(')'),
            Tokens.Punctuator(','),
            Tokens.Identifier('table-name'),
            Tokens.Keyword('AS'),
            Tokens.Identifier('table-alias'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('SELECT [result-column] WHERE [expr]', () => {
        deepStrictEqual(
          tokenize(
            Nodes.SelectStmt(
              null,
              [
                Nodes._SelectClause(
                  null,
                  [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
                  [],
                  Nodes._WhereClause(Nodes._Identifier('expr')),
                  null,
                  [],
                ),
              ],
              null,
            ),
          ),
          [
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
            Tokens.Keyword('WHERE'),
            Tokens.Identifier('expr'),
          ],
        );
      });

      it('SELECT [result-column] GROUP BY [expr]', () => {
        deepStrictEqual(
          tokenize(
            Nodes.SelectStmt(
              null,
              [
                Nodes._SelectClause(
                  null,
                  [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
                  [],
                  null,
                  Nodes._GroupByClause([Nodes._Identifier('expr')], null),
                  [],
                ),
              ],
              null,
            ),
          ),
          [
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
            Tokens.Keyword('GROUP'),
            Tokens.Keyword('BY'),
            Tokens.Identifier('expr'),
          ],
        );
      });

      it('SELECT [result-column] GROUP BY [expr1], [expr2]', () => {
        deepStrictEqual(
          tokenize(
            Nodes.SelectStmt(
              null,
              [
                Nodes._SelectClause(
                  null,
                  [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
                  [],
                  null,
                  Nodes._GroupByClause(
                    [Nodes._Identifier('expr1'), Nodes._Identifier('expr2')],
                    null,
                  ),
                  [],
                ),
              ],
              null,
            ),
          ),
          [
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
            Tokens.Keyword('GROUP'),
            Tokens.Keyword('BY'),
            Tokens.Identifier('expr1'),
            Tokens.Punctuator(','),
            Tokens.Identifier('expr2'),
          ],
        );
      });

      it('SELECT [result-column] GROUP BY [expr1] HAVING [expr2]', () => {
        deepStrictEqual(
          tokenize(
            Nodes.SelectStmt(
              null,
              [
                Nodes._SelectClause(
                  null,
                  [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
                  [],
                  null,
                  Nodes._GroupByClause(
                    [Nodes._Identifier('expr1')],
                    Nodes._Identifier('expr2'),
                  ),
                  [],
                ),
              ],
              null,
            ),
          ),
          [
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
            Tokens.Keyword('GROUP'),
            Tokens.Keyword('BY'),
            Tokens.Identifier('expr1'),
            Tokens.Keyword('HAVING'),
            Tokens.Identifier('expr2'),
          ],
        );
      });

      it('SELECT [result-column] WINDOW window-name AS window-defn', () => {
        deepStrictEqual(
          tokenize(
            Nodes.SelectStmt(
              null,
              [
                Nodes._SelectClause(
                  null,
                  [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
                  [],
                  null,
                  null,
                  [
                    Nodes._WindowAsClause(
                      Nodes._Identifier('window-name'),
                      Nodes._Identifier('window-defn'),
                    ),
                  ],
                ),
              ],
              null,
            ),
          ),
          [
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
            Tokens.Keyword('WINDOW'),
            Tokens.Identifier('window-name'),
            Tokens.Keyword('AS'),
            Tokens.Identifier('window-defn'),
          ],
        );
      });

      it('SELECT [result-column] WINDOW [window1], [window2]', () => {
        deepStrictEqual(
          tokenize(
            Nodes.SelectStmt(
              null,
              [
                Nodes._SelectClause(
                  null,
                  [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
                  [],
                  null,
                  null,
                  [
                    Nodes._WindowAsClause(
                      Nodes._Identifier('window-name1'),
                      Nodes._Identifier('window-defn1'),
                    ),
                    Nodes._WindowAsClause(
                      Nodes._Identifier('window-name2'),
                      Nodes._Identifier('window-defn2'),
                    ),
                  ],
                ),
              ],
              null,
            ),
          ),
          [
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
            Tokens.Keyword('WINDOW'),
            Tokens.Identifier('window-name1'),
            Tokens.Keyword('AS'),
            Tokens.Identifier('window-defn1'),
            Tokens.Punctuator(','),
            Tokens.Identifier('window-name2'),
            Tokens.Keyword('AS'),
            Tokens.Identifier('window-defn2'),
          ],
        );
      });

      it('VALUES ([expr])', () => {
        deepStrictEqual(
          tokenize(
            Nodes.SelectStmt(
              null,
              [
                Nodes._ValuesClause([
                  Nodes._ValueClause([Nodes._Identifier('expr')]),
                ]),
              ],
              null,
            ),
          ),
          [
            Tokens.Keyword('VALUES'),
            Tokens.Punctuator('('),
            Tokens.Identifier('expr'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('VALUES ([expr1], [expr2])', () => {
        deepStrictEqual(
          tokenize(
            Nodes.SelectStmt(
              null,
              [
                Nodes._ValuesClause([
                  Nodes._ValueClause([
                    Nodes._Identifier('expr1'),
                    Nodes._Identifier('expr2'),
                  ]),
                ]),
              ],
              null,
            ),
          ),
          [
            Tokens.Keyword('VALUES'),
            Tokens.Punctuator('('),
            Tokens.Identifier('expr1'),
            Tokens.Punctuator(','),
            Tokens.Identifier('expr2'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('VALUES ([expr1], [expr2]), ([expr])', () => {
        deepStrictEqual(
          tokenize(
            Nodes.SelectStmt(
              null,
              [
                Nodes._ValuesClause([
                  Nodes._ValueClause([
                    Nodes._Identifier('expr1'),
                    Nodes._Identifier('expr2'),
                  ]),
                  Nodes._ValueClause([Nodes._Identifier('expr')]),
                ]),
              ],
              null,
            ),
          ),
          [
            Tokens.Keyword('VALUES'),
            Tokens.Punctuator('('),
            Tokens.Identifier('expr1'),
            Tokens.Punctuator(','),
            Tokens.Identifier('expr2'),
            Tokens.Punctuator(')'),
            Tokens.Punctuator(','),
            Tokens.Punctuator('('),
            Tokens.Identifier('expr'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('SELECT [result-column] UNION ALL VALUES ([expr])', () => {
        deepStrictEqual(
          tokenize(
            Nodes.SelectStmt(
              null,
              [
                Nodes._SelectClause(
                  null,
                  [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
                  [],
                  null,
                  null,
                  [],
                ),
                Nodes._SelectCompound(
                  'UNION ALL',
                  Nodes._ValuesClause([
                    Nodes._ValueClause([Nodes._Identifier('expr')]),
                  ]),
                ),
              ],
              null,
            ),
          ),
          [
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
            Tokens.Keyword('UNION'),
            Tokens.Keyword('ALL'),
            Tokens.Keyword('VALUES'),
            Tokens.Punctuator('('),
            Tokens.Identifier('expr'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('SELECT [result-column] ORDER BY [ordering-term]', () => {
        deepStrictEqual(
          tokenize(
            Nodes.SelectStmt(
              null,
              [
                Nodes._SelectClause(
                  null,
                  [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
                  [],
                  null,
                  null,
                  [],
                ),
              ],
              Nodes._LimiterClause(
                [
                  Nodes.OrderingTerm(
                    Nodes.IndexedColumn(
                      Nodes._Identifier('indexed-column'),
                      null,
                      null,
                    ),
                    null,
                  ),
                ],
                null,
              ),
            ),
          ),
          [
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
            Tokens.Keyword('ORDER'),
            Tokens.Keyword('BY'),
            Tokens.Identifier('indexed-column'),
          ],
        );
      });

      it(
        'SELECT [result-column] ORDER BY [ordering-term], ' +
          '[expr] COLLATE collation-name ASC NULLS FIRST',
        () => {
          deepStrictEqual(
            tokenize(
              Nodes.SelectStmt(
                null,
                [
                  Nodes._SelectClause(
                    null,
                    [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
                    [],
                    null,
                    null,
                    [],
                  ),
                ],
                Nodes._LimiterClause(
                  [
                    Nodes.OrderingTerm(
                      Nodes.IndexedColumn(
                        Nodes._Identifier('indexed-column1'),
                        null,
                        null,
                      ),
                      null,
                    ),
                    Nodes.OrderingTerm(
                      Nodes.IndexedColumn(
                        Nodes._Identifier('indexed-column2'),
                        Nodes._Identifier('collation-name'),
                        'ASC',
                      ),
                      'FIRST',
                    ),
                  ],
                  null,
                ),
              ),
            ),
            [
              Tokens.Keyword('SELECT'),
              Tokens.Identifier('result-column'),
              Tokens.Keyword('ORDER'),
              Tokens.Keyword('BY'),
              Tokens.Identifier('indexed-column1'),
              Tokens.Punctuator(','),
              Tokens.Identifier('indexed-column2'),
              Tokens.Keyword('COLLATE'),
              Tokens.Identifier('collation-name'),
              Tokens.Keyword('ASC'),
              Tokens.Keyword('NULLS'),
              Tokens.Keyword('FIRST'),
            ],
          );
        },
      );

      it('SELECT [result-column] LIMIT [expr]', () => {
        deepStrictEqual(
          tokenize(
            Nodes.SelectStmt(
              null,
              [
                Nodes._SelectClause(
                  null,
                  [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
                  [],
                  null,
                  null,
                  [],
                ),
              ],
              Nodes._LimiterClause(
                [],
                Nodes._LimitClause(Nodes._Identifier('expr'), null),
              ),
            ),
          ),
          [
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
            Tokens.Keyword('LIMIT'),
            Tokens.Identifier('expr'),
          ],
        );
      });

      it('SELECT [result-column] LIMIT [expr1] OFFSET [expr2]', () => {
        deepStrictEqual(
          tokenize(
            Nodes.SelectStmt(
              null,
              [
                Nodes._SelectClause(
                  null,
                  [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
                  [],
                  null,
                  null,
                  [],
                ),
              ],
              Nodes._LimiterClause(
                [],
                Nodes._LimitClause(
                  Nodes._Identifier('expr1'),
                  Nodes._LimitTailClause(true, Nodes._Identifier('expr2')),
                ),
              ),
            ),
          ),
          [
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
            Tokens.Keyword('LIMIT'),
            Tokens.Identifier('expr1'),
            Tokens.Keyword('OFFSET'),
            Tokens.Identifier('expr2'),
          ],
        );
      });

      it('SELECT [result-column] LIMIT [expr1], [expr2]', () => {
        deepStrictEqual(
          tokenize(
            Nodes.SelectStmt(
              null,
              [
                Nodes._SelectClause(
                  null,
                  [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
                  [],
                  null,
                  null,
                  [],
                ),
              ],
              Nodes._LimiterClause(
                [],
                Nodes._LimitClause(
                  Nodes._Identifier('expr1'),
                  Nodes._LimitTailClause(false, Nodes._Identifier('expr2')),
                ),
              ),
            ),
          ),
          [
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
            Tokens.Keyword('LIMIT'),
            Tokens.Identifier('expr1'),
            Tokens.Punctuator(','),
            Tokens.Identifier('expr2'),
          ],
        );
      });
    });

    describe('SimpleFunctionInvocation', () => {
      it('simple-func()', () => {
        deepStrictEqual(
          tokenize(
            Nodes.SimpleFunctionInvocation(
              Nodes._Identifier('simple-func'),
              [],
            ),
          ),
          [
            Tokens.Identifier('simple-func'),
            Tokens.Punctuator('('),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('simple-func(*)', () => {
        deepStrictEqual(
          tokenize(
            Nodes.SimpleFunctionInvocation(
              Nodes._Identifier('simple-func'),
              '*',
            ),
          ),
          [
            Tokens.Identifier('simple-func'),
            Tokens.Punctuator('('),
            Tokens.Punctuator('*'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('simple-func([expr])', () => {
        deepStrictEqual(
          tokenize(
            Nodes.SimpleFunctionInvocation(Nodes._Identifier('simple-func'), [
              Nodes._Identifier('expr'),
            ]),
          ),
          [
            Tokens.Identifier('simple-func'),
            Tokens.Punctuator('('),
            Tokens.Identifier('expr'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('simple-func([expr1], [expr2])', () => {
        deepStrictEqual(
          tokenize(
            Nodes.SimpleFunctionInvocation(Nodes._Identifier('simple-func'), [
              Nodes._Identifier('expr1'),
              Nodes._Identifier('expr2'),
            ]),
          ),
          [
            Tokens.Identifier('simple-func'),
            Tokens.Punctuator('('),
            Tokens.Identifier('expr1'),
            Tokens.Punctuator(','),
            Tokens.Identifier('expr2'),
            Tokens.Punctuator(')'),
          ],
        );
      });
    });

    describe('SimpleSelectStmt', () => {
      it('SELECT [result-column]', () => {
        deepStrictEqual(
          tokenize(
            Nodes.SimpleSelectStmt(
              null,
              Nodes._SelectClause(
                null,
                [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
                [],
                null,
                null,
                [],
              ),
              null,
            ),
          ),
          [Tokens.Keyword('SELECT'), Tokens.Identifier('result-column')],
        );
      });

      it('SELECT [result-column1], [result-column2]', () => {
        deepStrictEqual(
          tokenize(
            Nodes.SimpleSelectStmt(
              null,
              Nodes._SelectClause(
                null,
                [
                  Nodes.ResultColumn(Nodes._Identifier('result-column1')),
                  Nodes.ResultColumn(Nodes._Identifier('result-column2')),
                ],
                [],
                null,
                null,
                [],
              ),
              null,
            ),
          ),
          [
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column1'),
            Tokens.Punctuator(','),
            Tokens.Identifier('result-column2'),
          ],
        );
      });

      it('SELECT DISTINCT|ALL [result-column]', () => {
        deepStrictEqual(
          tokenize(
            Nodes.SimpleSelectStmt(
              null,
              Nodes._SelectClause(
                'DISTINCT',
                [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
                [],
                null,
                null,
                [],
              ),
              null,
            ),
          ),
          [
            Tokens.Keyword('SELECT'),
            Tokens.Keyword('DISTINCT'),
            Tokens.Identifier('result-column'),
          ],
        );
      });

      it('[with-clause] SELECT [result-column]', () => {
        deepStrictEqual(
          tokenize(
            Nodes.SimpleSelectStmt(
              Nodes.WithClause(false, [
                Nodes.CommonTableExpression(
                  Nodes.CteTableName(Nodes._Identifier('table-name'), []),
                  Nodes.SelectStmt(
                    null,
                    [
                      Nodes._SelectClause(
                        null,
                        [
                          Nodes.ResultColumn(
                            Nodes._Identifier('result-column'),
                          ),
                        ],
                        [],
                        null,
                        null,
                        [],
                      ),
                    ],
                    null,
                  ),
                ),
              ]),
              Nodes._SelectClause(
                null,
                [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
                [],
                null,
                null,
                [],
              ),
              null,
            ),
          ),
          [
            Tokens.Keyword('WITH'),
            Tokens.Identifier('table-name'),
            Tokens.Keyword('AS'),
            Tokens.Punctuator('('),
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
            Tokens.Punctuator(')'),
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
          ],
        );
      });

      it('SELECT [result-column] FROM table-name', () => {
        deepStrictEqual(
          tokenize(
            Nodes.SimpleSelectStmt(
              null,
              Nodes._SelectClause(
                null,
                [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
                [
                  Nodes.QualifiedTableName(
                    Nodes._Identifier('table-name'),
                    null,
                    null,
                  ),
                ],
                null,
                null,
                [],
              ),
              null,
            ),
          ),
          [
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
            Tokens.Keyword('FROM'),
            Tokens.Identifier('table-name'),
          ],
        );
      });

      it('SELECT [result-column] FROM table-name AS table-alias', () => {
        deepStrictEqual(
          tokenize(
            Nodes.SimpleSelectStmt(
              null,
              Nodes._SelectClause(
                null,
                [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
                [
                  Nodes.QualifiedTableName(
                    Nodes._Identifier('table-name'),
                    Nodes._Identifier('table-alias'),
                    null,
                  ),
                ],
                null,
                null,
                [],
              ),
              null,
            ),
          ),
          [
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
            Tokens.Keyword('FROM'),
            Tokens.Identifier('table-name'),
            Tokens.Keyword('AS'),
            Tokens.Identifier('table-alias'),
          ],
        );
      });

      it('SELECT [result-column] FROM table-name AS table-alias NOT INDEXED', () => {
        deepStrictEqual(
          tokenize(
            Nodes.SimpleSelectStmt(
              null,
              Nodes._SelectClause(
                null,
                [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
                [
                  Nodes.QualifiedTableName(
                    Nodes._Identifier('table-name'),
                    Nodes._Identifier('table-alias'),
                    false,
                  ),
                ],
                null,
                null,
                [],
              ),
              null,
            ),
          ),
          [
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
            Tokens.Keyword('FROM'),
            Tokens.Identifier('table-name'),
            Tokens.Keyword('AS'),
            Tokens.Identifier('table-alias'),
            Tokens.Keyword('NOT'),
            Tokens.Keyword('INDEXED'),
          ],
        );
      });

      it('SELECT [result-column] FROM schema-name.table-name', () => {
        deepStrictEqual(
          tokenize(
            Nodes.SimpleSelectStmt(
              null,
              Nodes._SelectClause(
                null,
                [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
                [
                  Nodes.QualifiedTableName(
                    Nodes._Path(
                      Nodes._Identifier('schema-name'),
                      Nodes._Identifier('table-name'),
                    ),
                    null,
                    null,
                  ),
                ],
                null,
                null,
                [],
              ),
              null,
            ),
          ),
          [
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
            Tokens.Keyword('FROM'),
            Tokens.Identifier('schema-name'),
            Tokens.Punctuator('.'),
            Tokens.Identifier('table-name'),
          ],
        );
      });

      it('SELECT [result-column] FROM table-function-name([expr])', () => {
        deepStrictEqual(
          tokenize(
            Nodes.SimpleSelectStmt(
              null,
              Nodes._SelectClause(
                null,
                [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
                [
                  Nodes._TableCallClause(
                    Nodes._Identifier('table-function-name'),
                    [Nodes._Identifier('expr')],
                    null,
                  ),
                ],
                null,
                null,
                [],
              ),
              null,
            ),
          ),
          [
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
            Tokens.Keyword('FROM'),
            Tokens.Identifier('table-function-name'),
            Tokens.Punctuator('('),
            Tokens.Identifier('expr'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it(
        'SELECT [result-column] FROM schema-name.table-function-name' +
          '([expr1], [expr2]) table-alias',
        () => {
          deepStrictEqual(
            tokenize(
              Nodes.SimpleSelectStmt(
                null,
                Nodes._SelectClause(
                  null,
                  [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
                  [
                    Nodes._TableCallClause(
                      Nodes._Path(
                        Nodes._Identifier('schema-name'),
                        Nodes._Identifier('table-function-name'),
                      ),
                      [Nodes._Identifier('expr1'), Nodes._Identifier('expr2')],
                      Nodes._Identifier('table-alias'),
                    ),
                  ],
                  null,
                  null,
                  [],
                ),
                null,
              ),
            ),
            [
              Tokens.Keyword('SELECT'),
              Tokens.Identifier('result-column'),
              Tokens.Keyword('FROM'),
              Tokens.Identifier('schema-name'),
              Tokens.Punctuator('.'),
              Tokens.Identifier('table-function-name'),
              Tokens.Punctuator('('),
              Tokens.Identifier('expr1'),
              Tokens.Punctuator(','),
              Tokens.Identifier('expr2'),
              Tokens.Punctuator(')'),
              Tokens.Identifier('table-alias'),
            ],
          );
        },
      );

      it('SELECT [result-column] FROM (SELECT 1)', () => {
        deepStrictEqual(
          tokenize(
            Nodes.SimpleSelectStmt(
              null,
              Nodes._SelectClause(
                null,
                [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
                [
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
                ],
                null,
                null,
                [],
              ),
              null,
            ),
          ),
          [
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
            Tokens.Keyword('FROM'),
            Tokens.Punctuator('('),
            Tokens.Keyword('SELECT'),
            Tokens.Numeric('1'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('SELECT [result-column] FROM (SELECT 1) table-alias', () => {
        deepStrictEqual(
          tokenize(
            Nodes.SimpleSelectStmt(
              null,
              Nodes._SelectClause(
                null,
                [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
                [
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
                    Nodes._Identifier('table-alias'),
                  ),
                ],
                null,
                null,
                [],
              ),
              null,
            ),
          ),
          [
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
            Tokens.Keyword('FROM'),
            Tokens.Punctuator('('),
            Tokens.Keyword('SELECT'),
            Tokens.Numeric('1'),
            Tokens.Punctuator(')'),
            Tokens.Identifier('table-alias'),
          ],
        );
      });

      it('SELECT [result-column] FROM ((SELECT 1), table-name AS table-alias)', () => {
        deepStrictEqual(
          tokenize(
            Nodes.SimpleSelectStmt(
              null,
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
              null,
            ),
          ),
          [
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
            Tokens.Keyword('FROM'),
            Tokens.Punctuator('('),
            Tokens.Punctuator('('),
            Tokens.Keyword('SELECT'),
            Tokens.Numeric('1'),
            Tokens.Punctuator(')'),
            Tokens.Punctuator(','),
            Tokens.Identifier('table-name'),
            Tokens.Keyword('AS'),
            Tokens.Identifier('table-alias'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('SELECT [result-column] WHERE [expr]', () => {
        deepStrictEqual(
          tokenize(
            Nodes.SimpleSelectStmt(
              null,
              Nodes._SelectClause(
                null,
                [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
                [],
                Nodes._WhereClause(Nodes._Identifier('expr')),
                null,
                [],
              ),
              null,
            ),
          ),
          [
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
            Tokens.Keyword('WHERE'),
            Tokens.Identifier('expr'),
          ],
        );
      });

      it('SELECT [result-column] GROUP BY [expr]', () => {
        deepStrictEqual(
          tokenize(
            Nodes.SimpleSelectStmt(
              null,
              Nodes._SelectClause(
                null,
                [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
                [],
                null,
                Nodes._GroupByClause([Nodes._Identifier('expr')], null),
                [],
              ),
              null,
            ),
          ),
          [
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
            Tokens.Keyword('GROUP'),
            Tokens.Keyword('BY'),
            Tokens.Identifier('expr'),
          ],
        );
      });

      it('SELECT [result-column] GROUP BY [expr1], [expr2]', () => {
        deepStrictEqual(
          tokenize(
            Nodes.SimpleSelectStmt(
              null,
              Nodes._SelectClause(
                null,
                [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
                [],
                null,
                Nodes._GroupByClause(
                  [Nodes._Identifier('expr1'), Nodes._Identifier('expr2')],
                  null,
                ),
                [],
              ),
              null,
            ),
          ),
          [
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
            Tokens.Keyword('GROUP'),
            Tokens.Keyword('BY'),
            Tokens.Identifier('expr1'),
            Tokens.Punctuator(','),
            Tokens.Identifier('expr2'),
          ],
        );
      });

      it('SELECT [result-column] GROUP BY [expr1] HAVING [expr2]', () => {
        deepStrictEqual(
          tokenize(
            Nodes.SimpleSelectStmt(
              null,
              Nodes._SelectClause(
                null,
                [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
                [],
                null,
                Nodes._GroupByClause(
                  [Nodes._Identifier('expr1')],
                  Nodes._Identifier('expr2'),
                ),
                [],
              ),
              null,
            ),
          ),
          [
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
            Tokens.Keyword('GROUP'),
            Tokens.Keyword('BY'),
            Tokens.Identifier('expr1'),
            Tokens.Keyword('HAVING'),
            Tokens.Identifier('expr2'),
          ],
        );
      });

      it('SELECT [result-column] WINDOW window-name AS window-defn', () => {
        deepStrictEqual(
          tokenize(
            Nodes.SimpleSelectStmt(
              null,
              Nodes._SelectClause(
                null,
                [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
                [],
                null,
                null,
                [
                  Nodes._WindowAsClause(
                    Nodes._Identifier('window-name'),
                    Nodes._Identifier('window-defn'),
                  ),
                ],
              ),
              null,
            ),
          ),
          [
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
            Tokens.Keyword('WINDOW'),
            Tokens.Identifier('window-name'),
            Tokens.Keyword('AS'),
            Tokens.Identifier('window-defn'),
          ],
        );
      });

      it('SELECT [result-column] WINDOW [window1], [window2]', () => {
        deepStrictEqual(
          tokenize(
            Nodes.SimpleSelectStmt(
              null,
              Nodes._SelectClause(
                null,
                [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
                [],
                null,
                null,
                [
                  Nodes._WindowAsClause(
                    Nodes._Identifier('window-name1'),
                    Nodes._Identifier('window-defn1'),
                  ),
                  Nodes._WindowAsClause(
                    Nodes._Identifier('window-name2'),
                    Nodes._Identifier('window-defn2'),
                  ),
                ],
              ),
              null,
            ),
          ),
          [
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
            Tokens.Keyword('WINDOW'),
            Tokens.Identifier('window-name1'),
            Tokens.Keyword('AS'),
            Tokens.Identifier('window-defn1'),
            Tokens.Punctuator(','),
            Tokens.Identifier('window-name2'),
            Tokens.Keyword('AS'),
            Tokens.Identifier('window-defn2'),
          ],
        );
      });

      it('VALUES ([expr])', () => {
        deepStrictEqual(
          tokenize(
            Nodes.SimpleSelectStmt(
              null,
              Nodes._ValuesClause([
                Nodes._ValueClause([Nodes._Identifier('expr')]),
              ]),
              null,
            ),
          ),
          [
            Tokens.Keyword('VALUES'),
            Tokens.Punctuator('('),
            Tokens.Identifier('expr'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('VALUES ([expr1], [expr2])', () => {
        deepStrictEqual(
          tokenize(
            Nodes.SimpleSelectStmt(
              null,
              Nodes._ValuesClause([
                Nodes._ValueClause([
                  Nodes._Identifier('expr1'),
                  Nodes._Identifier('expr2'),
                ]),
              ]),
              null,
            ),
          ),
          [
            Tokens.Keyword('VALUES'),
            Tokens.Punctuator('('),
            Tokens.Identifier('expr1'),
            Tokens.Punctuator(','),
            Tokens.Identifier('expr2'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('VALUES ([expr1], [expr2]), ([expr])', () => {
        deepStrictEqual(
          tokenize(
            Nodes.SimpleSelectStmt(
              null,
              Nodes._ValuesClause([
                Nodes._ValueClause([
                  Nodes._Identifier('expr1'),
                  Nodes._Identifier('expr2'),
                ]),
                Nodes._ValueClause([Nodes._Identifier('expr')]),
              ]),
              null,
            ),
          ),
          [
            Tokens.Keyword('VALUES'),
            Tokens.Punctuator('('),
            Tokens.Identifier('expr1'),
            Tokens.Punctuator(','),
            Tokens.Identifier('expr2'),
            Tokens.Punctuator(')'),
            Tokens.Punctuator(','),
            Tokens.Punctuator('('),
            Tokens.Identifier('expr'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('SELECT [result-column] ORDER BY [ordering-term]', () => {
        deepStrictEqual(
          tokenize(
            Nodes.SimpleSelectStmt(
              null,
              Nodes._SelectClause(
                null,
                [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
                [],
                null,
                null,
                [],
              ),
              Nodes._LimiterClause(
                [
                  Nodes.OrderingTerm(
                    Nodes.IndexedColumn(
                      Nodes._Identifier('indexed-column'),
                      null,
                      null,
                    ),
                    null,
                  ),
                ],
                null,
              ),
            ),
          ),
          [
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
            Tokens.Keyword('ORDER'),
            Tokens.Keyword('BY'),
            Tokens.Identifier('indexed-column'),
          ],
        );
      });

      it(
        'SELECT [result-column] ORDER BY [ordering-term], ' +
          '[expr] COLLATE collation-name ASC NULLS FIRST',
        () => {
          deepStrictEqual(
            tokenize(
              Nodes.SimpleSelectStmt(
                null,
                Nodes._SelectClause(
                  null,
                  [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
                  [],
                  null,
                  null,
                  [],
                ),
                Nodes._LimiterClause(
                  [
                    Nodes.OrderingTerm(
                      Nodes.IndexedColumn(
                        Nodes._Identifier('indexed-column1'),
                        null,
                        null,
                      ),
                      null,
                    ),
                    Nodes.OrderingTerm(
                      Nodes.IndexedColumn(
                        Nodes._Identifier('indexed-column2'),
                        Nodes._Identifier('collation-name'),
                        'ASC',
                      ),
                      'FIRST',
                    ),
                  ],
                  null,
                ),
              ),
            ),
            [
              Tokens.Keyword('SELECT'),
              Tokens.Identifier('result-column'),
              Tokens.Keyword('ORDER'),
              Tokens.Keyword('BY'),
              Tokens.Identifier('indexed-column1'),
              Tokens.Punctuator(','),
              Tokens.Identifier('indexed-column2'),
              Tokens.Keyword('COLLATE'),
              Tokens.Identifier('collation-name'),
              Tokens.Keyword('ASC'),
              Tokens.Keyword('NULLS'),
              Tokens.Keyword('FIRST'),
            ],
          );
        },
      );

      it('SELECT [result-column] LIMIT [expr]', () => {
        deepStrictEqual(
          tokenize(
            Nodes.SimpleSelectStmt(
              null,
              Nodes._SelectClause(
                null,
                [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
                [],
                null,
                null,
                [],
              ),
              Nodes._LimiterClause(
                [],
                Nodes._LimitClause(Nodes._Identifier('expr'), null),
              ),
            ),
          ),
          [
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
            Tokens.Keyword('LIMIT'),
            Tokens.Identifier('expr'),
          ],
        );
      });

      it('SELECT [result-column] LIMIT [expr1] OFFSET [expr2]', () => {
        deepStrictEqual(
          tokenize(
            Nodes.SimpleSelectStmt(
              null,
              Nodes._SelectClause(
                null,
                [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
                [],
                null,
                null,
                [],
              ),
              Nodes._LimiterClause(
                [],
                Nodes._LimitClause(
                  Nodes._Identifier('expr1'),
                  Nodes._LimitTailClause(true, Nodes._Identifier('expr2')),
                ),
              ),
            ),
          ),
          [
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
            Tokens.Keyword('LIMIT'),
            Tokens.Identifier('expr1'),
            Tokens.Keyword('OFFSET'),
            Tokens.Identifier('expr2'),
          ],
        );
      });

      it('SELECT [result-column] LIMIT [expr1], [expr2]', () => {
        deepStrictEqual(
          tokenize(
            Nodes.SimpleSelectStmt(
              null,
              Nodes._SelectClause(
                null,
                [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
                [],
                null,
                null,
                [],
              ),
              Nodes._LimiterClause(
                [],
                Nodes._LimitClause(
                  Nodes._Identifier('expr1'),
                  Nodes._LimitTailClause(false, Nodes._Identifier('expr2')),
                ),
              ),
            ),
          ),
          [
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
            Tokens.Keyword('LIMIT'),
            Tokens.Identifier('expr1'),
            Tokens.Punctuator(','),
            Tokens.Identifier('expr2'),
          ],
        );
      });
    });

    describe('SqlStmt', () => {
      it('EXPLAIN [savepoint-stmt]', () => {
        deepStrictEqual(
          tokenize(
            Nodes.SqlStmt(
              Nodes.SavepointStmt(Nodes._Identifier('savepoint-name')),
            ),
          ),
          [
            Tokens.Keyword('EXPLAIN'),
            Tokens.Keyword('SAVEPOINT'),
            Tokens.Identifier('savepoint-name'),
          ],
        );
      });
    });

    describe('SqlStmtList', () => {
      it('', () => {
        deepStrictEqual(tokenize(Nodes.SqlStmtList([])), []);
      });

      it('[sql-stmt]', () => {
        deepStrictEqual(
          tokenize(
            Nodes.SqlStmtList([
              Nodes.SavepointStmt(Nodes._Identifier('savepoint-name')),
            ]),
          ),
          [Tokens.Keyword('SAVEPOINT'), Tokens.Identifier('savepoint-name')],
        );
      });

      it('[sql-stmt1]; [sql-stmt2]', () => {
        deepStrictEqual(
          tokenize(
            Nodes.SqlStmtList([
              Nodes.SavepointStmt(Nodes._Identifier('savepoint-name')),
              Nodes.SqlStmt(
                Nodes.RollbackStmt(Nodes._Identifier('savepoint-name')),
              ),
            ]),
          ),
          [
            Tokens.Keyword('SAVEPOINT'),
            Tokens.Identifier('savepoint-name'),
            Tokens.Punctuator(';'),
            Tokens.Keyword('EXPLAIN'),
            Tokens.Keyword('ROLLBACK'),
            Tokens.Keyword('TO'),
            Tokens.Identifier('savepoint-name'),
          ],
        );
      });
    });

    describe('TableConstraint', () => {
      it('CONSTRAINT name PRIMARY KEY ([indexed-column])', () => {
        deepStrictEqual(
          tokenize(
            Nodes.TableConstraint(
              Nodes._Identifier('name'),
              Nodes._PrimaryKeyConstraint(
                [
                  Nodes.IndexedColumn(
                    Nodes._Identifier('indexed-column'),
                    null,
                    null,
                  ),
                ],
                null,
              ),
            ),
          ),
          [
            Tokens.Keyword('CONSTRAINT'),
            Tokens.Identifier('name'),
            Tokens.Keyword('PRIMARY'),
            Tokens.Keyword('KEY'),
            Tokens.Punctuator('('),
            Tokens.Identifier('indexed-column'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('PRIMARY KEY ([indexed-column])', () => {
        deepStrictEqual(
          tokenize(
            Nodes.TableConstraint(
              null,
              Nodes._PrimaryKeyConstraint(
                [
                  Nodes.IndexedColumn(
                    Nodes._Identifier('indexed-column'),
                    null,
                    null,
                  ),
                ],
                null,
              ),
            ),
          ),
          [
            Tokens.Keyword('PRIMARY'),
            Tokens.Keyword('KEY'),
            Tokens.Punctuator('('),
            Tokens.Identifier('indexed-column'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('PRIMARY KEY ([indexed-column1], [indexed-column2])', () => {
        deepStrictEqual(
          tokenize(
            Nodes.TableConstraint(
              null,
              Nodes._PrimaryKeyConstraint(
                [
                  Nodes.IndexedColumn(
                    Nodes._Identifier('indexed-column1'),
                    null,
                    null,
                  ),
                  Nodes.IndexedColumn(
                    Nodes._Identifier('indexed-column2'),
                    null,
                    null,
                  ),
                ],
                null,
              ),
            ),
          ),
          [
            Tokens.Keyword('PRIMARY'),
            Tokens.Keyword('KEY'),
            Tokens.Punctuator('('),
            Tokens.Identifier('indexed-column1'),
            Tokens.Punctuator(','),
            Tokens.Identifier('indexed-column2'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('PRIMARY KEY ([indexed-column]) [conflict-clause]', () => {
        deepStrictEqual(
          tokenize(
            Nodes.TableConstraint(
              null,
              Nodes._PrimaryKeyConstraint(
                [
                  Nodes.IndexedColumn(
                    Nodes._Identifier('indexed-column'),
                    null,
                    null,
                  ),
                ],
                Nodes.ConflictClause('ROLLBACK'),
              ),
            ),
          ),
          [
            Tokens.Keyword('PRIMARY'),
            Tokens.Keyword('KEY'),
            Tokens.Punctuator('('),
            Tokens.Identifier('indexed-column'),
            Tokens.Punctuator(')'),
            Tokens.Keyword('ON'),
            Tokens.Keyword('CONFLICT'),
            Tokens.Keyword('ROLLBACK'),
          ],
        );
      });

      it('UNIQUE ([indexed-column])', () => {
        deepStrictEqual(
          tokenize(
            Nodes.TableConstraint(
              null,
              Nodes._UniqueConstraint(
                [
                  Nodes.IndexedColumn(
                    Nodes._Identifier('indexed-column'),
                    null,
                    null,
                  ),
                ],
                null,
              ),
            ),
          ),
          [
            Tokens.Keyword('UNIQUE'),
            Tokens.Punctuator('('),
            Tokens.Identifier('indexed-column'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('UNIQUE ([indexed-column1], [indexed-column2])', () => {
        deepStrictEqual(
          tokenize(
            Nodes.TableConstraint(
              null,
              Nodes._UniqueConstraint(
                [
                  Nodes.IndexedColumn(
                    Nodes._Identifier('indexed-column1'),
                    null,
                    null,
                  ),
                  Nodes.IndexedColumn(
                    Nodes._Identifier('indexed-column2'),
                    null,
                    null,
                  ),
                ],
                null,
              ),
            ),
          ),
          [
            Tokens.Keyword('UNIQUE'),
            Tokens.Punctuator('('),
            Tokens.Identifier('indexed-column1'),
            Tokens.Punctuator(','),
            Tokens.Identifier('indexed-column2'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('UNIQUE ([indexed-column]) [conflict-clause]', () => {
        deepStrictEqual(
          tokenize(
            Nodes.TableConstraint(
              null,
              Nodes._UniqueConstraint(
                [
                  Nodes.IndexedColumn(
                    Nodes._Identifier('indexed-column'),
                    null,
                    null,
                  ),
                ],
                Nodes.ConflictClause('ROLLBACK'),
              ),
            ),
          ),
          [
            Tokens.Keyword('UNIQUE'),
            Tokens.Punctuator('('),
            Tokens.Identifier('indexed-column'),
            Tokens.Punctuator(')'),
            Tokens.Keyword('ON'),
            Tokens.Keyword('CONFLICT'),
            Tokens.Keyword('ROLLBACK'),
          ],
        );
      });

      it('CHECK ([expr])', () => {
        deepStrictEqual(
          tokenize(
            Nodes.TableConstraint(
              null,
              Nodes._CheckConstraint(Nodes._Identifier('expr')),
            ),
          ),
          [
            Tokens.Keyword('CHECK'),
            Tokens.Punctuator('('),
            Tokens.Identifier('expr'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('FOREIGN KEY (column-name) [foreign-key-clause]', () => {
        deepStrictEqual(
          tokenize(
            Nodes.TableConstraint(
              null,
              Nodes._ForeignKeyConstraint(
                [Nodes._Identifier('column-name')],
                Nodes.ForeignKeyClause(
                  Nodes._Identifier('table-name'),
                  [Nodes._Identifier('column-name')],
                  [
                    Nodes._OnClause('UPDATE', 'RESTRICT'),
                    Nodes._OnClause('DELETE', 'RESTRICT'),
                  ],
                  null,
                ),
              ),
            ),
          ),
          [
            Tokens.Keyword('FOREIGN'),
            Tokens.Keyword('KEY'),
            Tokens.Punctuator('('),
            Tokens.Identifier('column-name'),
            Tokens.Punctuator(')'),
            Tokens.Keyword('REFERENCES'),
            Tokens.Identifier('table-name'),
            Tokens.Punctuator('('),
            Tokens.Identifier('column-name'),
            Tokens.Punctuator(')'),
            Tokens.Keyword('ON'),
            Tokens.Keyword('UPDATE'),
            Tokens.Keyword('RESTRICT'),
            Tokens.Keyword('ON'),
            Tokens.Keyword('DELETE'),
            Tokens.Keyword('RESTRICT'),
          ],
        );
      });

      it('FOREIGN KEY (column-name1, column-name2) [foreign-key-clause]', () => {
        deepStrictEqual(
          tokenize(
            Nodes.TableConstraint(
              null,
              Nodes._ForeignKeyConstraint(
                [
                  Nodes._Identifier('column-name1'),
                  Nodes._Identifier('column-name2'),
                ],
                Nodes.ForeignKeyClause(
                  Nodes._Identifier('table-name'),
                  [Nodes._Identifier('column-name')],
                  [],
                  null,
                ),
              ),
            ),
          ),
          [
            Tokens.Keyword('FOREIGN'),
            Tokens.Keyword('KEY'),
            Tokens.Punctuator('('),
            Tokens.Identifier('column-name1'),
            Tokens.Punctuator(','),
            Tokens.Identifier('column-name2'),
            Tokens.Punctuator(')'),
            Tokens.Keyword('REFERENCES'),
            Tokens.Identifier('table-name'),
            Tokens.Punctuator('('),
            Tokens.Identifier('column-name'),
            Tokens.Punctuator(')'),
          ],
        );
      });
    });

    describe('TableOrSubquery', () => {
      it('table-name', () => {
        deepStrictEqual(
          tokenize(
            Nodes.QualifiedTableName(
              Nodes._Identifier('table-name'),
              null,
              null,
            ),
          ),
          [Tokens.Identifier('table-name')],
        );
      });

      it('table-name AS table-alias', () => {
        deepStrictEqual(
          tokenize(
            Nodes.QualifiedTableName(
              Nodes._Identifier('table-name'),
              Nodes._Identifier('table-alias'),
              null,
            ),
          ),
          [
            Tokens.Identifier('table-name'),
            Tokens.Keyword('AS'),
            Tokens.Identifier('table-alias'),
          ],
        );
      });

      it('table-name AS table-alias INDEXED BY index-name', () => {
        deepStrictEqual(
          tokenize(
            Nodes.QualifiedTableName(
              Nodes._Identifier('table-name'),
              Nodes._Identifier('table-alias'),
              Nodes._Identifier('index-name'),
            ),
          ),
          [
            Tokens.Identifier('table-name'),
            Tokens.Keyword('AS'),
            Tokens.Identifier('table-alias'),
            Tokens.Keyword('INDEXED'),
            Tokens.Keyword('BY'),
            Tokens.Identifier('index-name'),
          ],
        );
      });

      it('table-name AS table-alias NOT INDEXED', () => {
        deepStrictEqual(
          tokenize(
            Nodes.QualifiedTableName(
              Nodes._Identifier('table-name'),
              Nodes._Identifier('table-alias'),
              false,
            ),
          ),
          [
            Tokens.Identifier('table-name'),
            Tokens.Keyword('AS'),
            Tokens.Identifier('table-alias'),
            Tokens.Keyword('NOT'),
            Tokens.Keyword('INDEXED'),
          ],
        );
      });

      it('schema-name.table-name', () => {
        deepStrictEqual(
          tokenize(
            Nodes.QualifiedTableName(
              Nodes._Path(
                Nodes._Identifier('schema-name'),
                Nodes._Identifier('table-name'),
              ),
              null,
              null,
            ),
          ),
          [
            Tokens.Identifier('schema-name'),
            Tokens.Punctuator('.'),
            Tokens.Identifier('table-name'),
          ],
        );
      });

      it('table-function-name([expr])', () => {
        deepStrictEqual(
          tokenize(
            Nodes._TableCallClause(
              Nodes._Identifier('table-function-name'),
              [Nodes._Identifier('expr')],
              null,
            ),
          ),
          [
            Tokens.Identifier('table-function-name'),
            Tokens.Punctuator('('),
            Tokens.Identifier('expr'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('schema-name.table-function-name([expr1], [expr2]) table-alias', () => {
        deepStrictEqual(
          tokenize(
            Nodes._TableCallClause(
              Nodes._Path(
                Nodes._Identifier('schema-name'),
                Nodes._Identifier('table-function-name'),
              ),
              [Nodes._Identifier('expr1'), Nodes._Identifier('expr2')],
              Nodes._Identifier('table-alias'),
            ),
          ),
          [
            Tokens.Identifier('schema-name'),
            Tokens.Punctuator('.'),
            Tokens.Identifier('table-function-name'),
            Tokens.Punctuator('('),
            Tokens.Identifier('expr1'),
            Tokens.Punctuator(','),
            Tokens.Identifier('expr2'),
            Tokens.Punctuator(')'),
            Tokens.Identifier('table-alias'),
          ],
        );
      });

      it('(SELECT 1)', () => {
        deepStrictEqual(
          tokenize(
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
          ),
          [
            Tokens.Punctuator('('),
            Tokens.Keyword('SELECT'),
            Tokens.Numeric('1'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('(SELECT 1) table-alias', () => {
        deepStrictEqual(
          tokenize(
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
              Nodes._Identifier('table-alias'),
            ),
          ),
          [
            Tokens.Punctuator('('),
            Tokens.Keyword('SELECT'),
            Tokens.Numeric('1'),
            Tokens.Punctuator(')'),
            Tokens.Identifier('table-alias'),
          ],
        );
      });

      it('((SELECT 1), table-name AS table-alias)', () => {
        deepStrictEqual(
          tokenize(
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
          ),
          [
            Tokens.Punctuator('('),
            Tokens.Punctuator('('),
            Tokens.Keyword('SELECT'),
            Tokens.Numeric('1'),
            Tokens.Punctuator(')'),
            Tokens.Punctuator(','),
            Tokens.Identifier('table-name'),
            Tokens.Keyword('AS'),
            Tokens.Identifier('table-alias'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('([join-clause])', () => {
        deepStrictEqual(
          tokenize(
            Nodes._TableQueryClause(
              Nodes.JoinClause([
                Nodes.QualifiedTableName(
                  Nodes._Identifier('table-name1'),
                  null,
                  null,
                ),
                Nodes._JoinCompound(
                  'NATURAL LEFT OUTER JOIN',
                  Nodes.QualifiedTableName(
                    Nodes._Identifier('table-name2'),
                    null,
                    null,
                  ),
                  Nodes.JoinConstraint(
                    Nodes._JoinOnClause(Nodes._Identifier('expr')),
                  ),
                ),
              ]),
            ),
          ),
          [
            Tokens.Punctuator('('),
            Tokens.Identifier('table-name1'),
            Tokens.Keyword('NATURAL'),
            Tokens.Keyword('LEFT'),
            Tokens.Keyword('OUTER'),
            Tokens.Keyword('JOIN'),
            Tokens.Identifier('table-name2'),
            Tokens.Keyword('ON'),
            Tokens.Identifier('expr'),
            Tokens.Punctuator(')'),
          ],
        );
      });
    });

    describe('TypeName', () => {
      it('name', () => {
        deepStrictEqual(tokenize(Nodes.TypeName(['TEXT'], [])), [
          Tokens.Keyword('TEXT'),
        ]);
      });

      it('name name', () => {
        deepStrictEqual(tokenize(Nodes.TypeName(['CHARACTER VARYING'], [])), [
          Tokens.Keyword('CHARACTER'),
          Tokens.Keyword('VARYING'),
        ]);
      });

      it('name([signed-number])', () => {
        deepStrictEqual(
          tokenize(Nodes.TypeName(['VARCHAR'], [Nodes._NumericLiteral(255)])),
          [
            Tokens.Keyword('VARCHAR'),
            Tokens.Punctuator('('),
            Tokens.Numeric('255'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('name([signed-number], [signed-number])', () => {
        deepStrictEqual(
          tokenize(
            Nodes.TypeName(
              ['DECIMAL'],
              [Nodes._NumericLiteral(10), Nodes._NumericLiteral(5)],
            ),
          ),
          [
            Tokens.Keyword('DECIMAL'),
            Tokens.Punctuator('('),
            Tokens.Numeric('10'),
            Tokens.Punctuator(','),
            Tokens.Numeric('5'),
            Tokens.Punctuator(')'),
          ],
        );
      });
    });

    describe('UpdateStmt', () => {
      it('UPDATE [qualified-table-name] SET column-name = [expr]', () => {
        deepStrictEqual(
          tokenize(
            Nodes.UpdateStmt(
              null,
              null,
              Nodes.QualifiedTableName(
                Nodes._Identifier('qualified-table-name'),
                null,
                null,
              ),
              [
                Nodes._SetClause(
                  Nodes._Identifier('column-name'),
                  Nodes._Identifier('expr'),
                ),
              ],
              null,
              null,
              null,
            ),
          ),
          [
            Tokens.Keyword('UPDATE'),
            Tokens.Identifier('qualified-table-name'),
            Tokens.Keyword('SET'),
            Tokens.Identifier('column-name'),
            Tokens.Punctuator('='),
            Tokens.Identifier('expr'),
          ],
        );
      });

      it('UPDATE [qualified-table-name] SET [column-name-list] = [expr]', () => {
        deepStrictEqual(
          tokenize(
            Nodes.UpdateStmt(
              null,
              null,
              Nodes.QualifiedTableName(
                Nodes._Identifier('qualified-table-name'),
                null,
                null,
              ),
              [
                Nodes._SetClause(
                  Nodes.ColumnNameList([
                    Nodes._Identifier('column-name1'),
                    Nodes._Identifier('column-name2'),
                  ]),
                  Nodes._Identifier('expr'),
                ),
              ],
              null,
              null,
              null,
            ),
          ),
          [
            Tokens.Keyword('UPDATE'),
            Tokens.Identifier('qualified-table-name'),
            Tokens.Keyword('SET'),
            Tokens.Punctuator('('),
            Tokens.Identifier('column-name1'),
            Tokens.Punctuator(','),
            Tokens.Identifier('column-name2'),
            Tokens.Punctuator(')'),
            Tokens.Punctuator('='),
            Tokens.Identifier('expr'),
          ],
        );
      });

      it('UPDATE OR ABORT [qualified-table-name] SET column-name = [expr]', () => {
        deepStrictEqual(
          tokenize(
            Nodes.UpdateStmt(
              null,
              'ABORT',
              Nodes.QualifiedTableName(
                Nodes._Identifier('qualified-table-name'),
                null,
                null,
              ),
              [
                Nodes._SetClause(
                  Nodes._Identifier('column-name'),
                  Nodes._Identifier('expr'),
                ),
              ],
              null,
              null,
              null,
            ),
          ),
          [
            Tokens.Keyword('UPDATE'),
            Tokens.Keyword('OR'),
            Tokens.Keyword('ABORT'),
            Tokens.Identifier('qualified-table-name'),
            Tokens.Keyword('SET'),
            Tokens.Identifier('column-name'),
            Tokens.Punctuator('='),
            Tokens.Identifier('expr'),
          ],
        );
      });

      it('UPDATE [qualified-table-name] SET column-name = [expr] FROM [table-or-subquery]', () => {
        deepStrictEqual(
          tokenize(
            Nodes.UpdateStmt(
              null,
              null,
              Nodes.QualifiedTableName(
                Nodes._Identifier('qualified-table-name'),
                null,
                null,
              ),
              [
                Nodes._SetClause(
                  Nodes._Identifier('column-name'),
                  Nodes._Identifier('expr'),
                ),
              ],
              [
                Nodes.QualifiedTableName(
                  Nodes._Identifier('table-or-subquery'),
                  null,
                  null,
                ),
              ],
              null,
              null,
            ),
          ),
          [
            Tokens.Keyword('UPDATE'),
            Tokens.Identifier('qualified-table-name'),
            Tokens.Keyword('SET'),
            Tokens.Identifier('column-name'),
            Tokens.Punctuator('='),
            Tokens.Identifier('expr'),
            Tokens.Keyword('FROM'),
            Tokens.Identifier('table-or-subquery'),
          ],
        );
      });

      it('UPDATE [qualified-table-name] SET column-name = [expr] FROM [join-clause]', () => {
        deepStrictEqual(
          tokenize(
            Nodes.UpdateStmt(
              null,
              null,
              Nodes.QualifiedTableName(
                Nodes._Identifier('qualified-table-name1'),
                null,
                null,
              ),
              [
                Nodes._SetClause(
                  Nodes._Identifier('column-name'),
                  Nodes._Identifier('expr'),
                ),
              ],
              Nodes.JoinClause([
                Nodes.QualifiedTableName(
                  Nodes._Identifier('table-name1'),
                  null,
                  null,
                ),
                Nodes._JoinCompound(
                  ',',
                  Nodes.QualifiedTableName(
                    Nodes._Identifier('table-name2'),
                    null,
                    null,
                  ),
                  null,
                ),
              ]),
              null,
              null,
            ),
          ),
          [
            Tokens.Keyword('UPDATE'),
            Tokens.Identifier('qualified-table-name1'),
            Tokens.Keyword('SET'),
            Tokens.Identifier('column-name'),
            Tokens.Punctuator('='),
            Tokens.Identifier('expr'),
            Tokens.Keyword('FROM'),
            Tokens.Identifier('table-name1'),
            Tokens.Punctuator(','),
            Tokens.Identifier('table-name2'),
          ],
        );
      });

      it('UPDATE [qualified-table-name] SET column-name = [expr] WHERE [expr]', () => {
        deepStrictEqual(
          tokenize(
            Nodes.UpdateStmt(
              null,
              null,
              Nodes.QualifiedTableName(
                Nodes._Identifier('qualified-table-name'),
                null,
                null,
              ),
              [
                Nodes._SetClause(
                  Nodes._Identifier('column-name'),
                  Nodes._Identifier('expr'),
                ),
              ],
              null,
              Nodes._WhereClause(Nodes._Identifier('expr')),
              null,
            ),
          ),
          [
            Tokens.Keyword('UPDATE'),
            Tokens.Identifier('qualified-table-name'),
            Tokens.Keyword('SET'),
            Tokens.Identifier('column-name'),
            Tokens.Punctuator('='),
            Tokens.Identifier('expr'),
            Tokens.Keyword('WHERE'),
            Tokens.Identifier('expr'),
          ],
        );
      });

      it(
        'WITH [common-table-expression] UPDATE [qualified-table-name] ' +
          'SET column-name = [expr]',
        () => {
          deepStrictEqual(
            tokenize(
              Nodes.UpdateStmt(
                Nodes.WithClause(false, [
                  Nodes.CommonTableExpression(
                    Nodes.CteTableName(
                      Nodes._Identifier('common-table-expression'),
                      [],
                    ),
                    Nodes.SelectStmt(
                      null,
                      [
                        Nodes._SelectClause(
                          null,
                          [
                            Nodes.ResultColumn(
                              Nodes._Identifier('result-column'),
                            ),
                          ],
                          [],
                          null,
                          null,
                          [],
                        ),
                      ],
                      null,
                    ),
                  ),
                ]),
                null,
                Nodes.QualifiedTableName(
                  Nodes._Identifier('qualified-table-name'),
                  null,
                  null,
                ),
                [
                  Nodes._SetClause(
                    Nodes._Identifier('column-name'),
                    Nodes._Identifier('expr'),
                  ),
                ],
                null,
                null,
                null,
              ),
            ),
            [
              Tokens.Keyword('WITH'),
              Tokens.Identifier('common-table-expression'),
              Tokens.Keyword('AS'),
              Tokens.Punctuator('('),
              Tokens.Keyword('SELECT'),
              Tokens.Identifier('result-column'),
              Tokens.Punctuator(')'),
              Tokens.Keyword('UPDATE'),
              Tokens.Identifier('qualified-table-name'),
              Tokens.Keyword('SET'),
              Tokens.Identifier('column-name'),
              Tokens.Punctuator('='),
              Tokens.Identifier('expr'),
            ],
          );
        },
      );
    });

    describe('UpsertClause', () => {
      it('ON CONFLICT DO NOTHING', () => {
        deepStrictEqual(tokenize(Nodes.UpsertClause(null, null)), [
          Tokens.Keyword('ON'),
          Tokens.Keyword('CONFLICT'),
          Tokens.Keyword('DO'),
          Tokens.Keyword('NOTHING'),
        ]);
      });

      it('ON CONFLICT ([indexed-column]) WHERE [expr] DO NOTHING', () => {
        deepStrictEqual(
          tokenize(
            Nodes.UpsertClause(
              Nodes._ColumnSelectorClause(
                [
                  Nodes.IndexedColumn(
                    Nodes._Identifier('indexed-column'),
                    null,
                    null,
                  ),
                ],
                Nodes._WhereClause(Nodes._Identifier('expr')),
              ),
              null,
            ),
          ),
          [
            Tokens.Keyword('ON'),
            Tokens.Keyword('CONFLICT'),
            Tokens.Punctuator('('),
            Tokens.Identifier('indexed-column'),
            Tokens.Punctuator(')'),
            Tokens.Keyword('WHERE'),
            Tokens.Identifier('expr'),
            Tokens.Keyword('DO'),
            Tokens.Keyword('NOTHING'),
          ],
        );
      });

      it('ON CONFLICT ([indexed-column1], [indexed-column2]) DO NOTHING', () => {
        deepStrictEqual(
          tokenize(
            Nodes.UpsertClause(
              Nodes._ColumnSelectorClause(
                [
                  Nodes.IndexedColumn(
                    Nodes._Identifier('indexed-column1'),
                    null,
                    null,
                  ),
                  Nodes.IndexedColumn(
                    Nodes._Identifier('indexed-column2'),
                    null,
                    null,
                  ),
                ],
                null,
              ),
              null,
            ),
          ),
          [
            Tokens.Keyword('ON'),
            Tokens.Keyword('CONFLICT'),
            Tokens.Punctuator('('),
            Tokens.Identifier('indexed-column1'),
            Tokens.Punctuator(','),
            Tokens.Identifier('indexed-column2'),
            Tokens.Punctuator(')'),
            Tokens.Keyword('DO'),
            Tokens.Keyword('NOTHING'),
          ],
        );
      });

      it('ON CONFLICT DO UPDATE SET column-name = [expr] WHERE [expr]', () => {
        deepStrictEqual(
          tokenize(
            Nodes.UpsertClause(
              null,
              Nodes._UpdateSetClause(
                [
                  Nodes._SetClause(
                    Nodes._Identifier('column-name'),
                    Nodes._Identifier('expr'),
                  ),
                ],
                Nodes._WhereClause(Nodes._Identifier('expr')),
              ),
            ),
          ),
          [
            Tokens.Keyword('ON'),
            Tokens.Keyword('CONFLICT'),
            Tokens.Keyword('DO'),
            Tokens.Keyword('UPDATE'),
            Tokens.Keyword('SET'),
            Tokens.Identifier('column-name'),
            Tokens.Punctuator('='),
            Tokens.Identifier('expr'),
            Tokens.Keyword('WHERE'),
            Tokens.Identifier('expr'),
          ],
        );
      });
    });

    describe('WindowDefn', () => {
      it('()', () => {
        deepStrictEqual(tokenize(Nodes.WindowDefn(null, [], [], null)), [
          Tokens.Punctuator('('),
          Tokens.Punctuator(')'),
        ]);
      });

      it('(base-window-name)', () => {
        deepStrictEqual(
          tokenize(
            Nodes.WindowDefn(
              Nodes._Identifier('base-window-name'),
              [],
              [],
              null,
            ),
          ),
          [
            Tokens.Punctuator('('),
            Tokens.Identifier('base-window-name'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('(PARTITION BY expr)', () => {
        deepStrictEqual(
          tokenize(
            Nodes.WindowDefn(null, [Nodes._Identifier('expr')], [], null),
          ),
          [
            Tokens.Punctuator('('),
            Tokens.Keyword('PARTITION'),
            Tokens.Keyword('BY'),
            Tokens.Identifier('expr'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('(ORDER BY ordering-term)', () => {
        deepStrictEqual(
          tokenize(
            Nodes.WindowDefn(
              null,
              [],
              [
                Nodes.OrderingTerm(
                  Nodes.IndexedColumn(
                    Nodes._Identifier('ordering-term'),
                    null,
                    null,
                  ),
                  null,
                ),
              ],
              null,
            ),
          ),
          [
            Tokens.Punctuator('('),
            Tokens.Keyword('ORDER'),
            Tokens.Keyword('BY'),
            Tokens.Identifier('ordering-term'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('([frame-spec])', () => {
        deepStrictEqual(
          tokenize(
            Nodes.WindowDefn(
              null,
              [],
              [],
              Nodes.FrameSpec(
                'RANGE',
                Nodes._FrameSpecBetweenClause(
                  'UNBOUNDED PRECEDING',
                  Nodes._FrameSpecExprClause(
                    Nodes._Identifier('expr'),
                    'PRECEDING',
                  ),
                ),
                null,
              ),
            ),
          ),
          [
            Tokens.Punctuator('('),
            Tokens.Keyword('RANGE'),
            Tokens.Keyword('BETWEEN'),
            Tokens.Keyword('UNBOUNDED'),
            Tokens.Keyword('PRECEDING'),
            Tokens.Keyword('AND'),
            Tokens.Identifier('expr'),
            Tokens.Keyword('PRECEDING'),
            Tokens.Punctuator(')'),
          ],
        );
      });
    });

    describe('WithClause', () => {
      it('WITH [cte-table-name] AS ([select-stmt])', () => {
        deepStrictEqual(
          tokenize(
            Nodes.WithClause(false, [
              Nodes.CommonTableExpression(
                Nodes.CteTableName(
                  Nodes._Identifier('common-table-expression'),
                  [],
                ),
                Nodes.SelectStmt(
                  null,
                  [
                    Nodes._SelectClause(
                      null,
                      [Nodes.ResultColumn(Nodes._Identifier('result-column'))],
                      [],
                      null,
                      null,
                      [],
                    ),
                  ],
                  null,
                ),
              ),
            ]),
          ),
          [
            Tokens.Keyword('WITH'),
            Tokens.Identifier('common-table-expression'),
            Tokens.Keyword('AS'),
            Tokens.Punctuator('('),
            Tokens.Keyword('SELECT'),
            Tokens.Identifier('result-column'),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it(
        'WITH RECURSIVE [cte-table-name] AS ([select-stmt]), ' +
          '[cte-table-name] AS ([select-stmt])',
        () => {
          deepStrictEqual(
            tokenize(
              Nodes.WithClause(true, [
                Nodes.CommonTableExpression(
                  Nodes.CteTableName(
                    Nodes._Identifier('common-table-expression1'),
                    [],
                  ),
                  Nodes.SelectStmt(
                    null,
                    [
                      Nodes._SelectClause(
                        null,
                        [
                          Nodes.ResultColumn(
                            Nodes._Identifier('result-column1'),
                          ),
                        ],
                        [],
                        null,
                        null,
                        [],
                      ),
                    ],
                    null,
                  ),
                ),
                Nodes.CommonTableExpression(
                  Nodes.CteTableName(
                    Nodes._Identifier('common-table-expression2'),
                    [],
                  ),
                  Nodes.SelectStmt(
                    null,
                    [
                      Nodes._SelectClause(
                        null,
                        [
                          Nodes.ResultColumn(
                            Nodes._Identifier('result-column2'),
                          ),
                        ],
                        [],
                        null,
                        null,
                        [],
                      ),
                    ],
                    null,
                  ),
                ),
              ]),
            ),
            [
              Tokens.Keyword('WITH'),
              Tokens.Keyword('RECURSIVE'),
              Tokens.Identifier('common-table-expression1'),
              Tokens.Keyword('AS'),
              Tokens.Punctuator('('),
              Tokens.Keyword('SELECT'),
              Tokens.Identifier('result-column1'),
              Tokens.Punctuator(')'),
              Tokens.Punctuator(','),
              Tokens.Identifier('common-table-expression2'),
              Tokens.Keyword('AS'),
              Tokens.Punctuator('('),
              Tokens.Keyword('SELECT'),
              Tokens.Identifier('result-column2'),
              Tokens.Punctuator(')'),
            ],
          );
        },
      );
    });

    describe('VacuumStmt', () => {
      it('VACUUM', () => {
        deepStrictEqual(tokenize(Nodes.VacuumStmt(null, null)), [
          Tokens.Keyword('VACUUM'),
        ]);
      });

      it('VACUUM schema-name INTO filename', () => {
        deepStrictEqual(
          tokenize(
            Nodes.VacuumStmt(
              Nodes._Identifier('schema-name'),
              Nodes._Identifier('filename'),
            ),
          ),
          [
            Tokens.Keyword('VACUUM'),
            Tokens.Identifier('schema-name'),
            Tokens.Keyword('INTO'),
            Tokens.Identifier('filename'),
          ],
        );
      });
    });

    describe('WindowFunctionInvocation', () => {
      it('window-func() OVER [window-defn]', () => {
        deepStrictEqual(
          tokenize(
            Nodes.WindowFunctionInvocation(
              Nodes._Identifier('window-func'),
              [],
              null,
              Nodes.OverClause(Nodes.WindowDefn(null, [], [], null)),
            ),
          ),
          [
            Tokens.Identifier('window-func'),
            Tokens.Punctuator('('),
            Tokens.Punctuator(')'),
            Tokens.Keyword('OVER'),
            Tokens.Punctuator('('),
            Tokens.Punctuator(')'),
          ],
        );
      });

      it('window-func() OVER window-name', () => {
        deepStrictEqual(
          tokenize(
            Nodes.WindowFunctionInvocation(
              Nodes._Identifier('window-func'),
              [],
              null,
              Nodes.OverClause(Nodes._Identifier('window-name')),
            ),
          ),
          [
            Tokens.Identifier('window-func'),
            Tokens.Punctuator('('),
            Tokens.Punctuator(')'),
            Tokens.Keyword('OVER'),
            Tokens.Identifier('window-name'),
          ],
        );
      });

      it('window-func() [filter-clause] OVER window-name', () => {
        deepStrictEqual(
          tokenize(
            Nodes.WindowFunctionInvocation(
              Nodes._Identifier('window-func'),
              [],
              Nodes.FilterClause(
                Nodes._WhereClause(Nodes._Identifier('filter-clause')),
              ),
              Nodes.OverClause(Nodes._Identifier('window-name')),
            ),
          ),
          [
            Tokens.Identifier('window-func'),
            Tokens.Punctuator('('),
            Tokens.Punctuator(')'),
            Tokens.Keyword('FILTER'),
            Tokens.Punctuator('('),
            Tokens.Keyword('WHERE'),
            Tokens.Identifier('filter-clause'),
            Tokens.Punctuator(')'),
            Tokens.Keyword('OVER'),
            Tokens.Identifier('window-name'),
          ],
        );
      });

      it('window-func(*) OVER window-name', () => {
        deepStrictEqual(
          tokenize(
            Nodes.WindowFunctionInvocation(
              Nodes._Identifier('window-func'),
              '*',
              null,
              Nodes.OverClause(Nodes._Identifier('window-name')),
            ),
          ),
          [
            Tokens.Identifier('window-func'),
            Tokens.Punctuator('('),
            Tokens.Punctuator('*'),
            Tokens.Punctuator(')'),
            Tokens.Keyword('OVER'),
            Tokens.Identifier('window-name'),
          ],
        );
      });

      it('window-func([expr]) OVER window-name', () => {
        deepStrictEqual(
          tokenize(
            Nodes.WindowFunctionInvocation(
              Nodes._Identifier('window-func'),
              [Nodes._Identifier('expr')],
              null,
              Nodes.OverClause(Nodes._Identifier('window-name')),
            ),
          ),
          [
            Tokens.Identifier('window-func'),
            Tokens.Punctuator('('),
            Tokens.Identifier('expr'),
            Tokens.Punctuator(')'),
            Tokens.Keyword('OVER'),
            Tokens.Identifier('window-name'),
          ],
        );
      });

      it('window-func([expr1], [expr2]) OVER window-name', () => {
        deepStrictEqual(
          tokenize(
            Nodes.WindowFunctionInvocation(
              Nodes._Identifier('window-func'),
              [Nodes._Identifier('expr1'), Nodes._Identifier('expr2')],
              null,
              Nodes.OverClause(Nodes._Identifier('window-name')),
            ),
          ),
          [
            Tokens.Identifier('window-func'),
            Tokens.Punctuator('('),
            Tokens.Identifier('expr1'),
            Tokens.Punctuator(','),
            Tokens.Identifier('expr2'),
            Tokens.Punctuator(')'),
            Tokens.Keyword('OVER'),
            Tokens.Identifier('window-name'),
          ],
        );
      });
    });
  });
});
