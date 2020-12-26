import Chai from 'chai';
import { Nodes } from '@robinblomberg/sqlite-ast';
import { compile, compileTokens } from './compile.js';
import * as Tokens from './tokens.js';

const KEYWORD = Tokens.Keyword('KEYWORD');
const IDENTIFIER = Tokens.Identifier('identifier');
const P_COMMA = Tokens.Punctuator(',');
const P_EQ = Tokens.Punctuator('=');
const P_LPAREN = Tokens.Punctuator('(');
const P_PLUS = Tokens.Punctuator('+');
const P_RPAREN = Tokens.Punctuator(')');

describe('@robinblomberg/sqlite-compiler', () => {
  describe('compileTokens', () => {
    describe('Keyword', () => {
      it('KEYWORD identifier"', () => {
        Chai.assert.strictEqual(
          compileTokens([KEYWORD, IDENTIFIER]),
          'KEYWORD identifier'
        );
      });

      it('KEYWORD KEYWORD', () => {
        Chai.assert.strictEqual(
          compileTokens([KEYWORD, KEYWORD]),
          'KEYWORD KEYWORD'
        );
      });

      it('KEYWORD (', () => {
        Chai.assert.strictEqual(
          compileTokens([KEYWORD, P_LPAREN]),
          'KEYWORD ('
        );
      });

      it('KEYWORD)', () => {
        Chai.assert.strictEqual(
          compileTokens([KEYWORD, P_RPAREN]),
          'KEYWORD)'
        );
      });

      it('KEYWORD,', () => {
        Chai.assert.strictEqual(
          compileTokens([KEYWORD, P_COMMA]),
          'KEYWORD,'
        );
      });

      it('KEYWORD =', () => {
        Chai.assert.strictEqual(
          compileTokens([KEYWORD, P_EQ]),
          'KEYWORD ='
        );
      });

      it('KEYWORD +', () => {
        Chai.assert.strictEqual(
          compileTokens([KEYWORD, P_PLUS]),
          'KEYWORD +'
        );
      });
    });

    describe('Identifier', () => {
      it('identifier KEYWORD', () => {
        Chai.assert.strictEqual(
          compileTokens([IDENTIFIER, KEYWORD]),
          'identifier KEYWORD'
        );
      });

      it('identifier,', () => {
        Chai.assert.strictEqual(
          compileTokens([IDENTIFIER, P_COMMA]),
          'identifier,'
        );
      });

      it('identifier(', () => {
        Chai.assert.strictEqual(
          compileTokens([IDENTIFIER, P_LPAREN]),
          'identifier('
        );
      });

      it('identifier)', () => {
        Chai.assert.strictEqual(
          compileTokens([IDENTIFIER, P_RPAREN]),
          'identifier)'
        );
      });

      it('identifier =', () => {
        Chai.assert.strictEqual(
          compileTokens([IDENTIFIER, P_EQ]),
          'identifier ='
        );
      });

      it('identifier +', () => {
        Chai.assert.strictEqual(
          compileTokens([IDENTIFIER, P_PLUS]),
          'identifier +'
        );
      });
    });

    describe('Punctuator (', () => {
      it('(KEYWORD', () => {
        Chai.assert.strictEqual(
          compileTokens([P_LPAREN, KEYWORD]),
          '(KEYWORD'
        );
      });

      it('(identifier', () => {
        Chai.assert.strictEqual(
          compileTokens([P_LPAREN, IDENTIFIER]),
          '(identifier'
        );
      });
    });

    describe('Punctuator ,', () => {
      it(', KEYWORD', () => {
        Chai.assert.strictEqual(
          compileTokens([P_COMMA, KEYWORD]),
          ', KEYWORD'
        );
      });

      it(', identifier', () => {
        Chai.assert.strictEqual(
          compileTokens([P_COMMA, IDENTIFIER]),
          ', identifier'
        );
      });
    });

    describe('Punctuator =', () => {
      it('= KEYWORD', () => {
        Chai.assert.strictEqual(
          compileTokens([P_EQ, KEYWORD]),
          '= KEYWORD'
        );
      });

      it('= identifier', () => {
        Chai.assert.strictEqual(
          compileTokens([P_EQ, IDENTIFIER]),
          '= identifier'
        );
      });
    });

    describe('Punctuator +', () => {
      it('+ KEYWORD', () => {
        Chai.assert.strictEqual(
          compileTokens([P_PLUS, KEYWORD]),
          '+ KEYWORD'
        );
      });

      it('+ identifier', () => {
        Chai.assert.strictEqual(
          compileTokens([P_PLUS, IDENTIFIER]),
          '+ identifier'
        );
      });
    });
  });

  describe('compile', () => {
    it('SELECT result-column GROUP BY expr1 HAVING expr2', () => {
      Chai.assert.strictEqual(
        compile(
          Nodes.SimpleSelectStmt(
            null,
            Nodes._SelectClause(
              null,
              [
                Nodes.ResultColumn(
                  Nodes._Identifier('result-column')
                )
              ],
              [],
              null,
              Nodes._GroupByClause(
                [
                  Nodes._Identifier('expr1')
                ],
                Nodes._Identifier('expr2')
              ),
              []
            ),
            null
          )
        ),
        'SELECT result-column GROUP BY expr1 HAVING expr2'
      );
    });

    it('UPDATE qualified-table-name SET column-name = expr FROM table-or-subquery', () => {
      Chai.assert.strictEqual(
        compile(
          Nodes.UpdateStmt(
            null,
            null,
            Nodes.QualifiedTableName(
              Nodes._Identifier('qualified-table-name'),
              null,
              null
            ),
            [
              Nodes._SetClause(
                Nodes._Identifier('column-name'),
                Nodes._Identifier('expr')
              )
            ],
            [
              Nodes.QualifiedTableName(
                Nodes._Identifier('table-or-subquery'),
                null,
                null
              )
            ],
            null,
            null
          )
        ),
        'UPDATE qualified-table-name SET column-name = expr FROM table-or-subquery'
      );
    });

    it('SELECT result-column FROM ((SELECT1), table-name AS table-alias)', () => {
      Chai.assert.strictEqual(
        compile(
          Nodes.SelectStmt(
            null,
            [
              Nodes._SelectClause(
                null,
                [
                  Nodes.ResultColumn(
                    Nodes._Identifier('result-column')
                  )
                ],
                [
                  Nodes._TableQueryClause(
                    [
                      Nodes._TableSelectClause(
                        Nodes.SelectStmt(
                          null,
                          [
                            Nodes._SelectClause(
                              null,
                              [
                                Nodes.ResultColumn(
                                  Nodes._NumericLiteral(1)
                                )
                              ],
                              [],
                              null,
                              null,
                              []
                            )
                          ],
                          null
                        ),
                        null
                      ),
                      Nodes.QualifiedTableName(
                        Nodes._Identifier('table-name'),
                        Nodes._Identifier('table-alias'),
                        null
                      )
                    ]
                  )
                ],
                null,
                null,
                []
              )
            ],
            null
          )
        ),
        'SELECT result-column FROM ((SELECT1), table-name AS table-alias)'
      );
    });
  });
});
