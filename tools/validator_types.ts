/**
 * Gyeol Protocol v0.5.5 - Diagnostic Validator Types
 * Defines the strict schema and error codes for the multi-agent parsing pipeline.
 */

export type EpistemicMark = '봄' | '더' | '들' | '겠' | '늘' | '촉' | '면';
export type SpeechAct = '다' | '까' | '지' | '라' | '자' | '게';
export type ColorMark = 'R' | 'G' | 'B' | 'C' | 'M' | 'Y' | 'K';

export interface GyeolPacket {
  clauseNumber: string;
  addressee?: string;
  isUniversalAddress?: boolean;
  marks: {
    epistemic?: EpistemicMark;
    realisation?: '군';
    tense?: '었' | '을';
    speechAct: SpeechAct;
  };
  inkCredit?: number; // System-measured (0-9)
  content: string;
  confidence: {
    color: ColorMark;
    level: number; // Self-evaluated (0-9)
  };
  groundingRef?: string[];
}

export enum DiagnosticCode {
  // Syntax & Parsing Errors (E01-E10)
  E01_MISSING_MARK_BLOCK = 'E01',
  E02_UNCLOSED_BLOCK = 'E02',
  E03_MISSING_SPEECH_ACT = 'E03',
  E04_INVALID_SPEECH_ACT = 'E04',
  E05_UNKNOWN_MARK = 'E05',
  E06_MULTIPLE_GROUNDS = 'E06',
  E07_ASSERTION_NO_GROUND = 'E07',
  E08_INVALID_REALISATION = 'E08',
  E09_INVALID_TAG_ORDER = 'E09',
  E10_INVALID_NUMBER_RANGE = 'E10',

  // Security & Trust Errors (E14-E26)
  E14_SELF_REPORT_IN_INK = 'E14',
  E15_INVALID_SCRIPT_MIX = 'E15',
  E16_EMPTY_CONTENT = 'E16',
  E25_MISSING_DOT_SLOT = 'E25',
  E26_DEPRECATED_FORM = 'E26',

  // Epistemic & End-Group Errors (E27-E33)
  E27_CONFLICTING_CONFIDENCE = 'E27',
  E28_MULTIPLE_TENSES = 'E28',
  E29_MISPLACED_CONFIDENCE = 'E29',
  E30_DEPRECATED_NE = 'E30',
  E31_UNIVERSAL_DOT_ADDRESSEE = 'E31',
  E32_MALFORMED_END_GROUP = 'E32',
  E33_MISSING_COLOR_CONFIDENCE = 'E33',
}

export interface ValidationResult {
  isValid: boolean;
  packet?: GyeolPacket;
  errors: DiagnosticCode[];
  warnings: string[];
}
