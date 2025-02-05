import {
  checkForILIKEClause,
  checkForWildcard,
  checkForWithClause,
  getErrorCondition,
  getWarningCondition,
} from 'components/interfaces/Settings/Logs/Logs.utils'
import { describe, test, expect } from 'vitest'

describe('checkForWithClause', () => {
  test('basic queries', () => {
    expect(checkForWithClause('SELECT * FROM table')).toBe(false)
    expect(checkForWithClause('SELECT * FROM table WITH clause')).toBe(true)
    expect(checkForWithClause('WITH test AS (SELECT * FROM table) SELECT * FROM test')).toBe(true)
    expect(checkForWithClause('SELECT * FROM withsomething')).toBe(false)
  })

  test('case sensitivity', () => {
    expect(checkForWithClause('with test AS (SELECT * FROM table) SELECT * FROM test')).toBe(true)
    expect(checkForWithClause('WiTh test AS (SELECT * FROM table) SELECT * FROM test')).toBe(true)
  })

  test('comments', () => {
    expect(checkForWithClause('SELECT * FROM table -- WITH clause')).toBe(false)
    expect(checkForWithClause('SELECT * FROM table /* WITH clause */')).toBe(false)
    expect(checkForWithClause('-- WITH clause\nSELECT * FROM table')).toBe(false)
    expect(checkForWithClause('/* WITH clause */\nSELECT * FROM table')).toBe(false)
  })

  test('string literals', () => {
    expect(checkForWithClause("SELECT 'WITH' FROM table")).toBe(false)
    expect(checkForWithClause("SELECT * FROM table WHERE column = 'WITH clause'")).toBe(false)
  })

  test('subqueries', () => {
    expect(
      checkForWithClause('SELECT * FROM (WITH subquery AS (SELECT 1) SELECT * FROM subquery)')
    ).toBe(true)
    expect(
      checkForWithClause(
        'SELECT * FROM table WHERE column IN (WITH subquery AS (SELECT 1) SELECT * FROM subquery)'
      )
    ).toBe(true)
  })
})

describe('checkForILIKEClause', () => {
  test('basic queries', () => {
    expect(checkForILIKEClause('SELECT * FROM table')).toBe(false)
    expect(checkForILIKEClause('SELECT * FROM table WHERE column ILIKE "%value%"')).toBe(true)
    expect(checkForILIKEClause('SELECT * FROM table WHERE column LIKE "%value%"')).toBe(false)
    expect(checkForILIKEClause('SELECT * FROM ilikesomething')).toBe(false)
  })

  test('case sensitivity', () => {
    expect(checkForILIKEClause('SELECT * FROM table WHERE column ilike "%value%"')).toBe(true)
    expect(checkForILIKEClause('SELECT * FROM table WHERE column IlIkE "%value%"')).toBe(true)
  })

  test('comments', () => {
    expect(checkForILIKEClause('SELECT * FROM table -- ILIKE clause')).toBe(false)
    expect(checkForILIKEClause('SELECT * FROM table /* ILIKE clause */')).toBe(false)
    expect(checkForILIKEClause('-- ILIKE clause\nSELECT * FROM table')).toBe(false)
    expect(checkForILIKEClause('/* ILIKE clause */\nSELECT * FROM table')).toBe(false)
  })

  test('string literals', () => {
    expect(checkForILIKEClause("SELECT 'ILIKE' FROM table")).toBe(false)
    expect(checkForILIKEClause("SELECT * FROM table WHERE column = 'ILIKE clause'")).toBe(false)
  })

  test('subqueries', () => {
    expect(
      checkForILIKEClause('SELECT * FROM (SELECT * FROM table WHERE column ILIKE "%value%")')
    ).toBe(true)
    expect(
      checkForILIKEClause(
        'SELECT * FROM table WHERE column IN (SELECT * FROM subtable WHERE column ILIKE "%value%")'
      )
    ).toBe(true)
  })
})

describe('checkForWildcard', () => {
  test('basic queries', () => {
    expect(checkForWildcard('SELECT * FROM table')).toBe(true)
    expect(checkForWildcard('SELECT column FROM table')).toBe(false)
  })

  test('comments', () => {
    expect(checkForWildcard('SELECT column FROM table -- *')).toBe(false)
    expect(checkForWildcard('SELECT column FROM table /* * */')).toBe(false)
    expect(checkForWildcard('-- *\nSELECT column FROM table')).toBe(false)
    expect(checkForWildcard('/* * */\nSELECT column FROM table')).toBe(false)
  })

  test('count(*)', () => {
    expect(checkForWildcard('SELECT count(*) FROM table')).toBe(false)
  })
})

describe('getErrorCondition', () => {
  test('edge_logs', () => {
    expect(getErrorCondition('edge_logs')).toBe('response.status_code >= 500')
  })

  test('postgres_logs', () => {
    expect(getErrorCondition('postgres_logs')).toBe("parsed.error_severity IN ('ERROR', 'FATAL', 'PANIC')")
  })

  test('auth_logs', () => {
    expect(getErrorCondition('auth_logs')).toBe("metadata.level = 'error' OR metadata.status >= 500")
  })

  test('function_edge_logs', () => {
    expect(getErrorCondition('function_edge_logs')).toBe('response.status_code >= 500')
  })

  test('function_logs', () => {
    expect(getErrorCondition('function_logs')).toBe("metadata.level IN ('error', 'fatal')")
  })
})

describe('getWarningCondition', () => {
  test('edge_logs', () => {
    expect(getWarningCondition('edge_logs')).toBe('response.status_code >= 400 AND response.status_code < 500')
  })

  test('postgres_logs', () => {
    expect(getWarningCondition('postgres_logs')).toBe("parsed.error_severity IN ('WARNING')")
  })

  test('auth_logs', () => {
    expect(getWarningCondition('auth_logs')).toBe("metadata.level = 'warning' OR (metadata.status >= 400 AND metadata.status < 500)")
  })

  test('function_edge_logs', () => {
    expect(getWarningCondition('function_edge_logs')).toBe('response.status_code >= 400 AND response.status_code < 500')
  })

  test('function_logs', () => {
    expect(getWarningCondition('function_logs')).toBe("metadata.level = 'warning'")
  })
})
