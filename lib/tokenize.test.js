import Chai from 'chai';
import { Nodes } from '@robinblomberg/sqlite-ast';
import { tokenize } from './tokenize.js';
import * as Tokens from './tokens.js';

describe('@robinblomberg/sqlite-compiler', () => {
  describe('.tokenize', () => {
    describe('AggregateFunctionInvocation', () => {
      it('should tokenize multiple arguments correctly', () => {
        Chai.assert.deepStrictEqual(
          tokenize(
            Nodes.AggregateFunctionInvocation(
              'AVG',
              Nodes._AggregateArgs(
                true,
                [
                  Nodes._ColumnPath(null, 'cost'),
                  Nodes._ColumnPath(null, 'x')
                ]
              ),
              null
            )
          ),
          [
            Tokens.Identifier('AVG'),
            Tokens.Punctuator('('),
            Tokens.Keyword('DISTINCT'),
            Tokens.Identifier('cost'),
            Tokens.Punctuator(','),
            Tokens.Identifier('x'),
            Tokens.Punctuator(')')
          ]
        );
      });

      it('should tokenize a filter clause correctly', () => {
        Chai.assert.deepStrictEqual(
          tokenize(
            Nodes.AggregateFunctionInvocation(
              'AVG',
              Nodes._AggregateArgs(
                true,
                [
                  Nodes._ColumnPath(null, 'cost')
                ]
              ),
              Nodes.FilterClause(
                Nodes._BinaryExpression(
                  Nodes._ColumnPath(
                    Nodes._Path(null, 'User'),
                    'age'
                  ),
                  '>',
                  Nodes._NumericLiteral(30)
                )
              )
            )
          ),
          [
            Tokens.Identifier('AVG'),
            Tokens.Punctuator('('),
            Tokens.Keyword('DISTINCT'),
            Tokens.Identifier('cost'),
            Tokens.Punctuator(')'),
            Tokens.Keyword('FILTER'),
            Tokens.Punctuator('('),
            Tokens.Keyword('WHERE'),
            Tokens.Identifier('User'),
            Tokens.Punctuator('.'),
            Tokens.Identifier('age'),
            Tokens.Punctuator('>'),
            Tokens.Numeric('30'),
            Tokens.Punctuator(')')
          ]
        );
      });
    });

    describe('AlterTableStmt', () => {
      it('should tokenize RENAME TO correctly', () => {
        Chai.assert.deepStrictEqual(
          tokenize(
            Nodes.AlterTableStmt(
              Nodes._Path(
                'public',
                'users'
              ),
              Nodes._RenameClause(
                null,
                'user'
              )
            )
          ),
          [
            Tokens.Keyword('ALTER'),
            Tokens.Keyword('TABLE'),
            Tokens.Identifier('public'),
            Tokens.Punctuator('.'),
            Tokens.Identifier('users'),
            Tokens.Keyword('RENAME'),
            Tokens.Keyword('TO'),
            Tokens.Identifier('user'),
            Tokens.Punctuator(';')
          ]
        );
      });

      it('should tokenize RENAME (COLUMN) TO correctly', () => {
        Chai.assert.deepStrictEqual(
          tokenize(
            Nodes.AlterTableStmt(
              Nodes._Path(
                null,
                'users'
              ),
              Nodes._RenameClause(
                'namme',
                'name'
              )
            )
          ),
          [
            Tokens.Keyword('ALTER'),
            Tokens.Keyword('TABLE'),
            Tokens.Identifier('users'),
            Tokens.Keyword('RENAME'),
            Tokens.Identifier('namme'),
            Tokens.Keyword('TO'),
            Tokens.Identifier('name'),
            Tokens.Punctuator(';')
          ]
        );
      });

      it('should tokenize ADD (COLUMN) correctly', () => {
        Chai.assert.deepStrictEqual(
          tokenize(
            Nodes.AlterTableStmt(
              Nodes._Path(
                null,
                'User'
              ),
              Nodes._AddClause(
                Nodes.ColumnDef(
                  'email',
                  'TEXT',
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
            Tokens.Identifier('User'),
            Tokens.Keyword('ADD'),
            Tokens.Identifier('email'),
            Tokens.Keyword('TEXT'),
            Tokens.Keyword('NOT'),
            Tokens.Keyword('NULL'),
            Tokens.Punctuator(';')
          ]
        );
      });
    });

    describe('AnalyzeStmt', () => {
      it('should tokenize ANALYZE statements correctly', () => {
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

      it('should tokenize ANALYZE (name) statements correctly', () => {
        Chai.assert.deepStrictEqual(
          tokenize(
            Nodes.AnalyzeStmt(
              Nodes._Path(
                'public',
                'Users'
              )
            )
          ),
          [
            Tokens.Keyword('ANALYZE'),
            Tokens.Identifier('public'),
            Tokens.Punctuator('.'),
            Tokens.Identifier('Users'),
            Tokens.Punctuator(';')
          ]
        );
      });
    });

    describe('AttachStmt', () => {
      it('should tokenize ATTACH statements correctly', () => {
        Chai.assert.deepStrictEqual(
          tokenize(
            Nodes.AttachStmt(
              Nodes._StringLiteral('c:\\sqlite\\db\\contacts.db'),
              'contacts'
            )
          ),
          [
            Tokens.Keyword('ATTACH'),
            Tokens.String('\'c:\\\\sqlite\\\\db\\\\contacts.db\''),
            Tokens.Keyword('AS'),
            Tokens.Identifier('contacts'),
            Tokens.Punctuator(';')
          ]
        );
      });
    });

    describe('BeginStmt', () => {
      it('should tokenize BEGIN statements correctly', () => {
        Chai.assert.deepStrictEqual(
          tokenize(
            Nodes.BeginStmt(null)
          ),
          [
            Tokens.Keyword('BEGIN'),
            Tokens.Punctuator(';')
          ]
        );
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
    });

    describe('ColumnConstraint', () => {
      it('should tokenize PRIMARY KEY clauses correctly', () => {
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
        Chai.assert.deepStrictEqual(
          tokenize(
            Nodes.ColumnConstraint(
              'pk',
              Nodes._PrimaryKeyClause(
                'DESC',
                Nodes.ConflictClause('FAIL'),
                true
              )
            )
          ),
          [
            Tokens.Keyword('CONSTRAINT'),
            Tokens.Identifier('pk'),
            Tokens.Keyword('PRIMARY'),
            Tokens.Keyword('KEY'),
            Tokens.Keyword('DESC'),
            Tokens.Keyword('ON'),
            Tokens.Keyword('CONFLICT'),
            Tokens.Keyword('FAIL'),
            Tokens.Keyword('AUTOINCREMENT')
          ]
        );
      });

      it('should tokenize NOT NULL clauses correctly', () => {
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

      it('should tokenize UNIQUE clauses correctly', () => {
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

      it('should tokenize CHECK clauses correctly', () => {
        Chai.assert.deepStrictEqual(
          tokenize(
            Nodes.ColumnConstraint(
              null,
              Nodes._CheckClause(
                Nodes._BinaryExpression(
                  Nodes._ColumnPath(
                    null,
                    'email'
                  ),
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

      it('should tokenize DEFAULT clauses correctly', () => {
        console.log(
          tokenize(
            Nodes.ColumnConstraint(
              null,
              Nodes._DefaultClause(
                Nodes._NumericLiteral(100)
              )
            )
          )
        );
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
        Chai.assert.deepStrictEqual(
          tokenize(
            Nodes.ColumnConstraint(
              null,
              Nodes._DefaultClause(
                Nodes._BinaryExpression(
                  Nodes._CallExpression(
                    'round',
                    [
                      Nodes._CallExpression(
                        'julianday',
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
    });

    describe('ConflictClause', () => {
      it('should tokenize ON CONFLICT correctly', () => {
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
  });
});
