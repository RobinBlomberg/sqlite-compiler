import Chai from 'chai';
import { Nodes } from '@robinblomberg/sqlite-ast';
import { tokenize } from './tokenize.js';
import * as Tokens from './tokens.js';

describe('@robinblomberg/sqlite-compiler', () => {
  describe('.tokenize', () => {
    describe('AggregateFunctionInvocation', () => {
      it('aggregate-func(DISTINCT [expr])', () => {
        Chai.assert.deepStrictEqual(
          tokenize(
            Nodes.AggregateFunctionInvocation(
              Nodes._Identifier('aggregate-func'),
              Nodes._AggregateArgs(
                true,
                [
                  Nodes._Identifier('expr')
                ]
              ),
              null
            )
          ),
          [
            Tokens.Identifier('aggregate-func'),
            Tokens.Punctuator('('),
            Tokens.Keyword('DISTINCT'),
            Tokens.Identifier('expr'),
            Tokens.Punctuator(')')
          ]
        );
      });

      it('aggregate-func([expr1], [expr2])', () => {
        Chai.assert.deepStrictEqual(
          tokenize(
            Nodes.AggregateFunctionInvocation(
              Nodes._Identifier('aggregate-func'),
              Nodes._AggregateArgs(
                false,
                [
                  Nodes._Identifier('expr1'),
                  Nodes._Identifier('expr2')
                ]
              ),
              null
            )
          ),
          [
            Tokens.Identifier('aggregate-func'),
            Tokens.Punctuator('('),
            Tokens.Identifier('expr1'),
            Tokens.Punctuator(','),
            Tokens.Identifier('expr2'),
            Tokens.Punctuator(')')
          ]
        );
      });

      it('aggregate-func(*)', () => {
        Chai.assert.deepStrictEqual(
          tokenize(
            Nodes.AggregateFunctionInvocation(
              Nodes._Identifier('aggregate-func'),
              '*',
              null
            )
          ),
          [
            Tokens.Identifier('aggregate-func'),
            Tokens.Punctuator('('),
            Tokens.Punctuator('*'),
            Tokens.Punctuator(')')
          ]
        );
      });

      it('aggregate-func()', () => {
        Chai.assert.deepStrictEqual(
          tokenize(
            Nodes.AggregateFunctionInvocation(
              Nodes._Identifier('aggregate-func'),
              null,
              null
            )
          ),
          [
            Tokens.Identifier('aggregate-func'),
            Tokens.Punctuator('('),
            Tokens.Punctuator(')')
          ]
        );
      });

      it('aggregate-func(DISTINCT [expr]) [filter-clause]', () => {
        Chai.assert.deepStrictEqual(
          tokenize(
            Nodes.AggregateFunctionInvocation(
              Nodes._Identifier('aggregate-func'),
              Nodes._AggregateArgs(
                true,
                [
                  Nodes._Identifier('expr')
                ]
              ),
              Nodes.FilterClause(
                Nodes._BinaryExpression(
                  Nodes._ColumnPath(
                    Nodes._Identifier('table-name'),
                    Nodes._Identifier('column-name')
                  ),
                  '>',
                  Nodes._NumericLiteral(30)
                )
              )
            )
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
            Tokens.Punctuator(')')
          ]
        );
      });
    });

    describe('AlterTableStmt', () => {
      it('ALTER TABLE schema-name.table-name RENAME TO new-table-name;', () => {
        Chai.assert.deepStrictEqual(
          tokenize(
            Nodes.AlterTableStmt(
              Nodes._Path(
                Nodes._Identifier('schema-name'),
                Nodes._Identifier('table-name')
              ),
              Nodes._RenameClause(
                null,
                Nodes._Identifier('new-table-name')
              )
            )
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
            Tokens.Punctuator(';')
          ]
        );
      });

      it('ALTER TABLE table-name RENAME column-name TO new-table-name;', () => {
        Chai.assert.deepStrictEqual(
          tokenize(
            Nodes.AlterTableStmt(
              Nodes._Identifier('table-name'),
              Nodes._RenameClause(
                Nodes._Identifier('column-name'),
                Nodes._Identifier('new-table-name')
              )
            )
          ),
          [
            Tokens.Keyword('ALTER'),
            Tokens.Keyword('TABLE'),
            Tokens.Identifier('table-name'),
            Tokens.Keyword('RENAME'),
            Tokens.Identifier('column-name'),
            Tokens.Keyword('TO'),
            Tokens.Identifier('new-table-name'),
            Tokens.Punctuator(';')
          ]
        );
      });

      it('ALTER TABLE table-name ADD [column-def];', () => {
        Chai.assert.deepStrictEqual(
          tokenize(
            Nodes.AlterTableStmt(
              Nodes._Identifier('table-name'),
              Nodes._AddClause(
                Nodes.ColumnDef(
                  Nodes._Identifier('column-name'),
                  Nodes.TypeName(
                    [
                      Nodes._Identifier('type-name')
                    ],
                    []
                  ),
                  [
                    Nodes.ColumnConstraint(
                      null,
                      Nodes._NotNullClause(null)
                    )
                  ]
                )
              )
            )
          ),
          [
            Tokens.Keyword('ALTER'),
            Tokens.Keyword('TABLE'),
            Tokens.Identifier('table-name'),
            Tokens.Keyword('ADD'),
            Tokens.Identifier('column-name'),
            Tokens.Identifier('type-name'),
            Tokens.Keyword('NOT'),
            Tokens.Keyword('NULL'),
            Tokens.Punctuator(';')
          ]
        );
      });
    });

    describe('AnalyzeStmt', () => {
      it('ANALYZE;', () => {
        Chai.assert.deepStrictEqual(
          tokenize(
            Nodes.AnalyzeStmt(null)
          ),
          [
            Tokens.Keyword('ANALYZE'),
            Tokens.Punctuator(';')
          ]
        );
      });

      it('ANALYZE schema-name;', () => {
        Chai.assert.deepStrictEqual(
          tokenize(
            Nodes.AnalyzeStmt(
              Nodes._Identifier('schema-name')
            )
          ),
          [
            Tokens.Keyword('ANALYZE'),
            Tokens.Identifier('schema-name'),
            Tokens.Punctuator(';')
          ]
        );
      });

      it('ANALYZE index-or-table-name;', () => {
        Chai.assert.deepStrictEqual(
          tokenize(
            Nodes.AnalyzeStmt(
              Nodes._Identifier('index-or-table-name')
            )
          ),
          [
            Tokens.Keyword('ANALYZE'),
            Tokens.Identifier('index-or-table-name'),
            Tokens.Punctuator(';')
          ]
        );
      });

      it('ANALYZE schema-name.table-or-index-name;', () => {
        Chai.assert.deepStrictEqual(
          tokenize(
            Nodes.AnalyzeStmt(
              Nodes._Path(
                Nodes._Identifier('schema-name'),
                Nodes._Identifier('table-or-index-name')
              )
            )
          ),
          [
            Tokens.Keyword('ANALYZE'),
            Tokens.Identifier('schema-name'),
            Tokens.Punctuator('.'),
            Tokens.Identifier('table-or-index-name'),
            Tokens.Punctuator(';')
          ]
        );
      });
    });

    describe('AttachStmt', () => {
      it('ATTACH [expr] AS schema-name;', () => {
        Chai.assert.deepStrictEqual(
          tokenize(
            Nodes.AttachStmt(
              Nodes._StringLiteral('c:\\sqlite\\db\\contacts.db'),
              Nodes._Identifier('schema-name')
            )
          ),
          [
            Tokens.Keyword('ATTACH'),
            Tokens.String('\'c:\\\\sqlite\\\\db\\\\contacts.db\''),
            Tokens.Keyword('AS'),
            Tokens.Identifier('schema-name'),
            Tokens.Punctuator(';')
          ]
        );
      });
    });

    describe('BeginStmt', () => {
      it('BEGIN;', () => {
        Chai.assert.deepStrictEqual(
          tokenize(
            Nodes.BeginStmt(null)
          ),
          [
            Tokens.Keyword('BEGIN'),
            Tokens.Punctuator(';')
          ]
        );
      });

      it('BEGIN DEFERRED;', () => {
        Chai.assert.deepStrictEqual(
          tokenize(
            Nodes.BeginStmt('DEFERRED')
          ),
          [
            Tokens.Keyword('BEGIN'),
            Tokens.Keyword('DEFERRED'),
            Tokens.Punctuator(';')
          ]
        );
      });

      it('BEGIN IMMEDIATE;', () => {
        Chai.assert.deepStrictEqual(
          tokenize(
            Nodes.BeginStmt('IMMEDIATE')
          ),
          [
            Tokens.Keyword('BEGIN'),
            Tokens.Keyword('IMMEDIATE'),
            Tokens.Punctuator(';')
          ]
        );
      });

      it('BEGIN EXCLUSIVE;', () => {
        Chai.assert.deepStrictEqual(
          tokenize(
            Nodes.BeginStmt('EXCLUSIVE')
          ),
          [
            Tokens.Keyword('BEGIN'),
            Tokens.Keyword('EXCLUSIVE'),
            Tokens.Punctuator(';')
          ]
        );
      });
    });

    describe('ColumnConstraint', () => {
      it('PRIMARY KEY', () => {
        Chai.assert.deepStrictEqual(
          tokenize(
            Nodes.ColumnConstraint(
              null,
              Nodes._PrimaryKeyClause(
                null,
                null,
                false
              )
            )
          ),
          [
            Tokens.Keyword('PRIMARY'),
            Tokens.Keyword('KEY')
          ]
        );
      });

      it('CONSTRAINT name PRIMARY KEY ASC/DESC [conflict-clause] AUTOINCREMENT', () => {
        Chai.assert.deepStrictEqual(
          tokenize(
            Nodes.ColumnConstraint(
              Nodes._Identifier('name'),
              Nodes._PrimaryKeyClause(
                'ASC',
                Nodes.ConflictClause('FAIL'),
                true
              )
            )
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
            Tokens.Keyword('AUTOINCREMENT')
          ]
        );
      });

      it('NOT NULL [conflict-clause]', () => {
        Chai.assert.deepStrictEqual(
          tokenize(
            Nodes.ColumnConstraint(
              null,
              Nodes._NotNullClause(null)
            )
          ),
          [
            Tokens.Keyword('NOT'),
            Tokens.Keyword('NULL')
          ]
        );
        Chai.assert.deepStrictEqual(
          tokenize(
            Nodes.ColumnConstraint(
              null,
              Nodes._NotNullClause(
                Nodes.ConflictClause('ROLLBACK')
              )
            )
          ),
          [
            Tokens.Keyword('NOT'),
            Tokens.Keyword('NULL'),
            Tokens.Keyword('ON'),
            Tokens.Keyword('CONFLICT'),
            Tokens.Keyword('ROLLBACK')
          ]
        );
      });

      it('UNIQUE [conflict-clause]', () => {
        Chai.assert.deepStrictEqual(
          tokenize(
            Nodes.ColumnConstraint(
              null,
              Nodes._UniqueClause(null)
            )
          ),
          [
            Tokens.Keyword('UNIQUE')
          ]
        );
        Chai.assert.deepStrictEqual(
          tokenize(
            Nodes.ColumnConstraint(
              null,
              Nodes._UniqueClause(
                Nodes.ConflictClause('ABORT')
              )
            )
          ),
          [
            Tokens.Keyword('UNIQUE'),
            Tokens.Keyword('ON'),
            Tokens.Keyword('CONFLICT'),
            Tokens.Keyword('ABORT')
          ]
        );
      });

      it('CHECK ([expr])', () => {
        Chai.assert.deepStrictEqual(
          tokenize(
            Nodes.ColumnConstraint(
              null,
              Nodes._CheckClause(
                Nodes._BinaryExpression(
                  Nodes._Identifier('email'),
                  'LIKE',
                  Nodes._StringLiteral(
                    '%er'
                  )
                )
              )
            )
          ),
          [
            Tokens.Keyword('CHECK'),
            Tokens.Punctuator('('),
            Tokens.Identifier('email'),
            Tokens.Keyword('LIKE'),
            Tokens.String('\'%er\''),
            Tokens.Punctuator(')')
          ]
        );
      });

      it('DEFAULT ([expr])', () => {
        Chai.assert.deepStrictEqual(
          tokenize(
            Nodes.ColumnConstraint(
              null,
              Nodes._DefaultClause(
                Nodes._BinaryExpression(
                  Nodes._CallExpression(
                    Nodes._Identifier('round'),
                    [
                      Nodes._CallExpression(
                        Nodes._Identifier('julianday'),
                        [
                          Nodes._StringLiteral('now')
                        ],
                        null,
                        null
                      )
                    ],
                    null,
                    null
                  ),
                  '+',
                  Nodes._NumericLiteral(10.5)
                )
              )
            )
          ),
          [
            Tokens.Keyword('DEFAULT'),
            Tokens.Punctuator('('),
            Tokens.Identifier('round'),
            Tokens.Punctuator('('),
            Tokens.Identifier('julianday'),
            Tokens.Punctuator('('),
            Tokens.String('\'now\''),
            Tokens.Punctuator(')'),
            Tokens.Punctuator(')'),
            Tokens.Punctuator('+'),
            Tokens.Numeric('10.5'),
            Tokens.Punctuator(')')
          ]
        );
      });

      it('DEFAULT [literal-value]', () => {
        Chai.assert.deepStrictEqual(
          tokenize(
            Nodes.ColumnConstraint(
              null,
              Nodes._DefaultClause(
                Nodes._StringLiteral('literal-value')
              )
            )
          ),
          [
            Tokens.Keyword('DEFAULT'),
            Tokens.String('\'literal-value\'')
          ]
        );
      });

      it('DEFAULT [signed-number]', () => {
        Chai.assert.deepStrictEqual(
          tokenize(
            Nodes.ColumnConstraint(
              null,
              Nodes._DefaultClause(
                Nodes._NumericLiteral(100)
              )
            )
          ),
          [
            Tokens.Keyword('DEFAULT'),
            Tokens.Numeric('100')
          ]
        );
      });

      it('COLLATE collation-name', () => {
        Chai.assert.deepStrictEqual(
          tokenize(
            Nodes.ColumnConstraint(
              null,
              Nodes._CollateClause(
                Nodes._Identifier('NOCASE')
              )
            )
          ),
          [
            Tokens.Keyword('COLLATE'),
            Tokens.Identifier('NOCASE')
          ]
        );
      });

      it('[foreign-key-clause]', () => {
        // See "ForeignKeyClause".
      });

      it('GENERATED ALWAYS AS ([expr])', () => {
        Chai.assert.deepStrictEqual(
          tokenize(
            Nodes.ColumnConstraint(
              null,
              Nodes._AsClause(
                true,
                Nodes._Identifier('expr'),
                null
              )
            )
          ),
          [
            Tokens.Keyword('GENERATED'),
            Tokens.Keyword('ALWAYS'),
            Tokens.Keyword('AS'),
            Tokens.Punctuator('('),
            Tokens.Identifier('expr'),
            Tokens.Punctuator(')')
          ]
        );
      });

      it('GENERATED ALWAYS AS ([expr]) STORED/VIRTUAL', () => {
        Chai.assert.deepStrictEqual(
          tokenize(
            Nodes.ColumnConstraint(
              null,
              Nodes._AsClause(
                true,
                Nodes._Identifier('expr'),
                'STORED'
              )
            )
          ),
          [
            Tokens.Keyword('GENERATED'),
            Tokens.Keyword('ALWAYS'),
            Tokens.Keyword('AS'),
            Tokens.Punctuator('('),
            Tokens.Identifier('expr'),
            Tokens.Punctuator(')'),
            Tokens.Keyword('STORED')
          ]
        );
      });

      it('AS ([expr]) STORED/VIRTUAL', () => {
        Chai.assert.deepStrictEqual(
          tokenize(
            Nodes.ColumnConstraint(
              null,
              Nodes._AsClause(
                false,
                Nodes._Identifier('expr'),
                'VIRTUAL'
              )
            )
          ),
          [
            Tokens.Keyword('AS'),
            Tokens.Punctuator('('),
            Tokens.Identifier('expr'),
            Tokens.Punctuator(')'),
            Tokens.Keyword('VIRTUAL')
          ]
        );
      });
    });

    describe('ConflictClause', () => {
      it('ON CONFLICT ROLLBACK/ABORT/FAIL/IGNORE/REPLACE', () => {
        Chai.assert.deepStrictEqual(
          tokenize(
            Nodes.ConflictClause('ROLLBACK')
          ),
          [
            Tokens.Keyword('ON'),
            Tokens.Keyword('CONFLICT'),
            Tokens.Keyword('ROLLBACK')
          ]
        );
      });
    });

    describe('ForeignKeyClause', () => {
      it('REFERENCES foreign-table', () => {
        Chai.assert.deepStrictEqual(
          tokenize(
            Nodes.ForeignKeyClause(
              Nodes._Identifier('foreign-table'),
              [],
              [],
              null
            )
          ),
          [
            Tokens.Keyword('REFERENCES'),
            Tokens.Identifier('foreign-table')
          ]
        );
      });
    });
  });
});
