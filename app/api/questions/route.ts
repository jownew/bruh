import fs from 'fs';
import { NextResponse } from 'next/server';
import path from 'path';

export interface Question {
  questionSet: string;
  part: string;
  partTitle: string;
  sectionPoints: number;
  questionNumber: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  correctOption: string;
  correctAnswer: string;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function shuffleOptions(q: Question): Question {
  const letters = ['A', 'B', 'C'] as const;
  const options = letters
    .map((letter) => ({ letter, text: q[`option${letter}` as const] }))
    .filter((opt) => opt.text !== '');

  const shuffled = shuffle(options);
  const newOptions: Record<'A' | 'B' | 'C', string> = { A: '', B: '', C: '' };
  let correctOption = q.correctOption;

  shuffled.forEach((opt, i) => {
    const letter = letters[i];
    newOptions[letter] = opt.text;
    if (opt.letter === q.correctOption) {
      correctOption = letter;
    }
  });

  return {
    ...q,
    optionA: newOptions.A,
    optionB: newOptions.B,
    optionC: newOptions.C,
    correctOption,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const questionSet = searchParams.get('questionSet');

  const csvPath = path.join(
    process.cwd(),
    'data',
    'structured_question_bank.csv',
  );
  const raw = fs.readFileSync(csvPath, 'utf-8');
  const lines = raw.split('\n').filter((l) => l.trim());
  const [, ...dataLines] = lines;

  const questions: Question[] = dataLines.map((line) => {
    const cols = parseCSVLine(line);
    return shuffleOptions({
      questionSet: cols[0] ?? '',
      part: cols[1] ?? '',
      partTitle: cols[2] ?? '',
      sectionPoints: parseInt(cols[3] ?? '0', 10),
      questionNumber: parseInt(cols[4] ?? '0', 10),
      questionText: cols[5] ?? '',
      optionA: cols[6] ?? '',
      optionB: cols[7] ?? '',
      optionC: cols[8] ?? '',
      correctOption: cols[9] ?? '',
      correctAnswer: cols[10] ?? '',
    });
  });

  const filtered = questionSet
    ? questions.filter((q) => q.questionSet === questionSet)
    : questions;

  const sets = [...new Set(questions.map((q) => q.questionSet))];

  return NextResponse.json({
    questions: shuffle(filtered).slice(0, 30),
    sets,
  });
}
