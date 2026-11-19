import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, Check, X, RotateCcw, ArrowRight } from "lucide-react";
import { pickQuestions } from "@/lib/foodQuiz";

export default function FoodFactsQuiz() {
  const [questions, setQuestions] = useState(() => pickQuestions());
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);

  const finished = index >= questions.length;
  const q = questions[index];
  const answered = selected !== null;

  const answer = (i) => {
    if (answered) return;
    setSelected(i);
    if (i === q.answer) setScore((s) => s + 1);
  };

  const next = () => {
    setSelected(null);
    setIndex((i) => i + 1);
  };

  const restart = () => {
    setQuestions(pickQuestions());
    setIndex(0);
    setSelected(null);
    setScore(0);
  };

  return (
    <Card>
      <CardContent className="p-4 md:p-5 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-heading text-base md:text-lg font-semibold flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Lightbulb className="w-4 h-4" />
            </span>
            Food Facts Quiz
          </h2>
          <span className="text-xs md:text-sm text-muted-foreground whitespace-nowrap">
            {finished ? `${score} of ${questions.length}` : `Question ${index + 1} of ${questions.length}`}
          </span>
        </div>

        {finished ? (
          <div className="space-y-3 text-center py-2">
            <div className="text-4xl">🍽️</div>
            <div className="font-heading text-lg font-semibold">
              {score} out of {questions.length}
            </div>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              {score === questions.length
                ? "Perfect round. You know your food facts."
                : score >= Math.ceil(questions.length / 2)
                ? "Solid round. A few bites of trivia left to try."
                : "Plenty of tasty facts still to discover."}
            </p>
            <Button variant="outline" onClick={restart}>
              <RotateCcw className="w-4 h-4 mr-1" /> Play again
            </Button>
          </div>
        ) : (
          <>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${(index / questions.length) * 100}%` }}
              />
            </div>

            <p className="font-medium text-sm md:text-base">{q.question}</p>

            <div className="space-y-2">
              {q.options.map((option, i) => {
                const isCorrect = i === q.answer;
                const isPicked = i === selected;
                let tone = "border-border bg-card hover:bg-muted/60";
                if (answered && isCorrect) tone = "border-green-600 bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-300";
                else if (answered && isPicked) tone = "border-destructive bg-destructive/10 text-destructive";
                else if (answered) tone = "border-border bg-card opacity-60";

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => answer(i)}
                    disabled={answered}
                    className={`w-full min-h-[44px] text-left rounded-xl border px-3 py-2.5 text-sm md:text-base flex items-center justify-between gap-2 transition-colors ${tone}`}
                  >
                    <span>{option}</span>
                    {answered && isCorrect && <Check className="w-4 h-4 shrink-0" />}
                    {answered && isPicked && !isCorrect && <X className="w-4 h-4 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {answered && (
              <div className="space-y-3">
                <p className="text-xs md:text-sm text-muted-foreground flex gap-2">
                  <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
                  {q.fact}
                </p>
                <Button className="w-full sm:w-auto" onClick={next}>
                  {index + 1 === questions.length ? "See score" : "Next question"}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}