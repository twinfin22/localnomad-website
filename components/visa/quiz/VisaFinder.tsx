'use client';

import { useReducer, useCallback } from 'react';
import { QuizProgress } from './QuizProgress';
import { QuizQuestion } from './QuizQuestion';
import { QuizResults } from './QuizResults';
import {
  calculateRecommendations,
  getConditionalQuestions,
} from '@/lib/visa/quiz-engine';
import type {
  QuizAnswers,
  VisaRecommendation,
  VisaGoal,
} from '@/lib/visa/types';
import questionsData from '@/data/quiz/questions.json';

// =============================================================================
// Types
// =============================================================================

interface QuizState {
  currentStep: number;
  answers: QuizAnswers;
  results: VisaRecommendation[] | null;
  showConditional: boolean;
}

type QuizAction =
  | { type: 'SET_ANSWER'; questionId: string; value: string | number | boolean }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'GO_TO_STEP'; step: number }
  | { type: 'CALCULATE_RESULTS' }
  | { type: 'RESET' };

// =============================================================================
// Reducer
// =============================================================================

const initialState: QuizState = {
  currentStep: 1,
  answers: {},
  results: null,
  showConditional: false,
};

function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'SET_ANSWER':
      const newAnswers = {
        ...state.answers,
        [action.questionId]: action.value,
      };

      // If we just answered the goal question, check for conditional questions
      if (action.questionId === 'goal') {
        const conditionalFields = getConditionalQuestions(action.value as VisaGoal);
        return {
          ...state,
          answers: newAnswers,
          showConditional: conditionalFields.length > 0,
        };
      }

      return { ...state, answers: newAnswers };

    case 'NEXT_STEP':
      // If on step 3 (goal) and there are conditional questions, go to step 4
      // Otherwise skip to results (step 5)
      if (state.currentStep === 3) {
        const conditionalFields = getConditionalQuestions(state.answers.goal);
        if (conditionalFields.length > 0) {
          return { ...state, currentStep: 4 };
        }
        // Skip conditional step, calculate results
        const results = calculateRecommendations(state.answers);
        return { ...state, currentStep: 5, results };
      }

      if (state.currentStep === 4) {
        // Calculate results after conditional questions
        const results = calculateRecommendations(state.answers);
        return { ...state, currentStep: 5, results };
      }

      return { ...state, currentStep: state.currentStep + 1 };

    case 'PREV_STEP':
      if (state.currentStep === 5) {
        // Going back from results
        const conditionalFields = getConditionalQuestions(state.answers.goal);
        if (conditionalFields.length > 0) {
          return { ...state, currentStep: 4, results: null };
        }
        return { ...state, currentStep: 3, results: null };
      }
      return { ...state, currentStep: Math.max(1, state.currentStep - 1) };

    case 'GO_TO_STEP':
      return { ...state, currentStep: action.step, results: null };

    case 'CALCULATE_RESULTS':
      const results = calculateRecommendations(state.answers);
      return { ...state, results, currentStep: 5 };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

// =============================================================================
// Component
// =============================================================================

export function VisaFinder() {
  const [state, dispatch] = useReducer(quizReducer, initialState);

  const handleAnswer = useCallback((questionId: string, value: string) => {
    dispatch({ type: 'SET_ANSWER', questionId, value });
  }, []);

  const handleNext = useCallback(() => {
    dispatch({ type: 'NEXT_STEP' });
  }, []);

  const handleBack = useCallback(() => {
    dispatch({ type: 'PREV_STEP' });
  }, []);

  const handleStepClick = useCallback((step: number) => {
    dispatch({ type: 'GO_TO_STEP', step });
  }, []);

  const handleRetake = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  // Get current question data
  const currentQuestion = getCurrentQuestion(state.currentStep, state.answers);
  const currentValue = currentQuestion
    ? (state.answers[currentQuestion.id as keyof QuizAnswers] as string) || null
    : null;

  // Determine if we can proceed
  const canGoNext = currentQuestion ? currentValue !== null : false;
  const totalSteps = state.showConditional ? 5 : 4;

  // Show results
  if (state.currentStep === 5 && state.results) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center py-8">
        <QuizProgress
          currentStep={5}
          totalSteps={5}
          onStepClick={handleStepClick}
        />
        <QuizResults
          recommendations={state.results}
          onRetakeQuiz={handleRetake}
        />
      </div>
    );
  }

  // Show question
  if (!currentQuestion) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading question...</p>
      </div>
    );
  }

  const isLastQuestion =
    (state.currentStep === 3 && !state.showConditional) ||
    state.currentStep === 4;

  return (
    <div className="min-h-[60vh] flex flex-col justify-center py-8">
      <QuizProgress
        currentStep={state.currentStep}
        totalSteps={totalSteps}
        onStepClick={handleStepClick}
      />
      <QuizQuestion
        title={currentQuestion.title}
        subtitle={currentQuestion.subtitle}
        options={currentQuestion.options}
        selectedValue={currentValue}
        onSelect={(value) => handleAnswer(currentQuestion.id, value)}
        onBack={handleBack}
        onNext={handleNext}
        canGoBack={state.currentStep > 1}
        canGoNext={canGoNext}
        isLastQuestion={isLastQuestion}
      />
    </div>
  );
}

// =============================================================================
// Helpers
// =============================================================================

interface QuestionData {
  id: string;
  title: string;
  subtitle?: string;
  options: Array<{
    value: string;
    label: string;
    description?: string;
    icon?: string;
  }>;
}

function getCurrentQuestion(
  step: number,
  answers: QuizAnswers
): QuestionData | null {
  // Steps 1-3 are from the main questions
  if (step <= 3) {
    const stepData = questionsData.steps.find((s) => s.step === step);
    if (!stepData) return null;
    return {
      id: stepData.id,
      title: stepData.title,
      subtitle: stepData.subtitle,
      options: stepData.options,
    };
  }

  // Step 4 is conditional based on goal
  if (step === 4 && answers.goal) {
    const conditionalQuestions =
      questionsData.conditionalQuestions[
        answers.goal as keyof typeof questionsData.conditionalQuestions
      ];
    if (conditionalQuestions && conditionalQuestions.length > 0) {
      // For simplicity, just show the first conditional question
      // In a full implementation, you might want to show all relevant ones
      const question = conditionalQuestions[0];
      return {
        id: question.id,
        title: question.title,
        subtitle: question.subtitle,
        options: question.options,
      };
    }
  }

  return null;
}
