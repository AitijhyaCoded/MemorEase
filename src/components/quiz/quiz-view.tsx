
'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { GenerateQuizOutput } from '@/ai/flows/generate-quiz';
import { ArrowLeft, ArrowRight, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '../ui/progress';
import Flashcard from './flashcard';

type Quiz = GenerateQuizOutput;
type Question =
  | { type: 'mcq'; data: Quiz['mcqs'][0] }
  | { type: 'flashcard'; data: Quiz['flashcards'][0] }
  | { type: 'fill-in-the-blank'; data: Quiz['fillInTheBlanks'][0] };

export default function QuizView({ quiz }: { quiz: Quiz }) {
  const allQuestions = useMemo(() => {
    const mcqs: Question[] = quiz.mcqs.map(q => ({ type: 'mcq', data: q }));
    const flashcards: Question[] = quiz.flashcards.map(q => ({ type: 'flashcard', data: q }));
    const fillInTheBlanks: Question[] = quiz.fillInTheBlanks.map(q => ({ type: 'fill-in-the-blank', data: q }));
    // Shuffle questions
    return [...mcqs, ...flashcards, ...fillInTheBlanks].sort(() => Math.random() - 0.5); 
  }, [quiz]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = allQuestions[currentQuestionIndex];

  const handleAnswerChange = (value: string) => {
    setUserAnswers(prev => ({ ...prev, [currentQuestionIndex]: value }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < allQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };
  
  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setIsFinished(false);
  }

  const getScore = () => {
    let correct = 0;
    allQuestions.forEach((q, index) => {
      const userAnswer = userAnswers[index];
      let isCorrect = false;
      if (q.type === 'mcq') {
        isCorrect = userAnswer === q.data.answer;
      } else if (q.type === 'flashcard') {
        // Flashcards are not auto-graded for this simple quiz
      } else if (q.type === 'fill-in-the-blank') {
        isCorrect = userAnswer?.trim().toLowerCase() === q.data.answer.trim().toLowerCase();
      }
      if (isCorrect) {
        correct++;
      }
    });
    return {
      score: correct,
      total: allQuestions.filter(q => q.type !== 'flashcard').length, // only auto-gradable questions
    };
  };
  
  if (isFinished) {
    const { score, total } = getScore();
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quiz Complete!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-lg font-bold">Your Score</p>
            <p className="text-4xl font-bold text-primary">{score} / {total}</p>
            <Progress value={(score / total) * 100} className="mt-4" />
          </div>
          <h3 className="font-bold text-xl mt-6">Review Your Answers</h3>
           <div className="space-y-4 max-h-96 overflow-y-auto pr-4">
            {allQuestions.map((q, index) => {
              const userAnswer = userAnswers[index];
              let isCorrect: boolean | null = null;
              let correctAnswer = '';

              if (q.type === 'mcq') {
                isCorrect = userAnswer === q.data.answer;
                correctAnswer = q.data.answer;
              } else if (q.type === 'fill-in-the-blank') {
                isCorrect = userAnswer?.trim().toLowerCase() === q.data.answer.trim().toLowerCase();
                correctAnswer = q.data.answer;
              } else if (q.type === 'flashcard') {
                isCorrect = null; // not graded
              }

              return (
                <div key={index} className="p-4 border rounded-lg">
                  <p className="font-semibold">{index + 1}. {q.type === 'flashcard' ? q.data.front : q.type === 'mcq' ? q.data.question : q.data.sentence.replace('_____', `[${q.data.answer}]`)}</p>
                  
                  {q.type === 'flashcard' && <p className="text-sm mt-2"><b>Answer:</b> {q.data.back}</p>}
                  
                  {isCorrect !== null && (
                    <div className="mt-2 text-sm">
                      <p>Your answer: <span className={cn(isCorrect ? "text-green-500" : "text-red-500")}>{userAnswer || "No answer"}</span></p>
                      {!isCorrect && <p>Correct answer: <span className="text-green-500">{correctAnswer}</span></p>}
                      {isCorrect ? <CheckCircle className="inline h-4 w-4 text-green-500" /> : <XCircle className="inline h-4 w-4 text-red-500" />}
                    </div>
                  )}
                </div>
              );
            })}
           </div>
        </CardContent>
        <CardFooter>
            <Button onClick={handleRestart}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Take Again
            </Button>
        </CardFooter>
      </Card>
    );
  }

  const renderQuestion = () => {
    switch (currentQuestion.type) {
      case 'mcq':
        return (
          <>
            <CardTitle>{currentQuestion.data.question}</CardTitle>
            <CardContent className="mt-4">
              <RadioGroup value={userAnswers[currentQuestionIndex]} onValueChange={handleAnswerChange}>
                {currentQuestion.data.options.map((option, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`option-${i}`} />
                    <Label htmlFor={`option-${i}`}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </>
        );
      case 'flashcard':
        return <Flashcard front={currentQuestion.data.front} back={currentQuestion.data.back} />;
      case 'fill-in-the-blank':
        return (
          <>
            <CardTitle>Fill in the blank</CardTitle>
            <CardContent className="mt-4 space-y-4">
              <p className="text-lg flex flex-wrap items-center">
                <span>{currentQuestion.data.sentence.split('_____')[0]}</span>
                <Input
                    type="text"
                    value={userAnswers[currentQuestionIndex] || ''}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    className="inline-block w-48 mx-2"
                    placeholder="Your answer"
                />
                <span>{currentQuestion.data.sentence.split('_____')[1]}</span>
              </p>
            </CardContent>
          </>
        );
      default:
        return <p>Invalid question type</p>;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <Progress value={((currentQuestionIndex + 1) / allQuestions.length) * 100} className="w-full" />
        <p className="text-sm text-muted-foreground mt-2 text-right">
          Question {currentQuestionIndex + 1} of {allQuestions.length}
        </p>
      </CardHeader>
      
      {renderQuestion()}

      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handlePrev} disabled={currentQuestionIndex === 0}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        <Button onClick={handleNext}>
          {currentQuestionIndex === allQuestions.length - 1 ? 'Finish' : 'Next'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
