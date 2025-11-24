import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { careerApi } from "@/lib/api";

const quizSteps = [
  {
    title: "Your Interests",
    description: "Select all areas that interest you (choose at least 3)",
    type: "multi-select",
    options: [
      "Technology & Computing",
      "Healthcare & Medicine",
      "Engineering & Construction",
      "Arts & Design",
      "Business & Finance",
      "Education & Training",
      "Science & Research",
      "Law & Justice",
      "Environment & Agriculture",
      "Media & Communication",
    ],
  },
  {
    title: "Preferred Subjects",
    description: "Which subjects do you enjoy the most? (select up to 5)",
    type: "multi-select",
    options: [
      "Mathematics",
      "Biology",
      "Chemistry",
      "Physics",
      "English",
      "Kiswahili",
      "History",
      "Geography",
      "Computer Studies",
      "Business Studies",
    ],
  },
  {
    title: "Career Goals",
    description: "Tell us about your career aspirations and goals",
    type: "text",
    placeholder: "What do you hope to achieve in your career? What impact do you want to make?",
  },
  {
    title: "Work Environment",
    description: "What kind of work environment do you prefer?",
    type: "multi-select",
    options: [
      "Office-based work",
      "Remote/Work from home",
      "Fieldwork/Outdoor",
      "Laboratory",
      "Creative studio",
      "Hospital/Clinical",
      "Travel frequently",
      "Team collaboration",
      "Independent work",
    ],
  },
];

const CareerQuiz = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const progress = ((currentStep + 1) / quizSteps.length) * 100;
  const currentQuestion = quizSteps[currentStep];

  const handleMultiSelect = (option: string) => {
    const currentAnswers = answers[currentStep] || [];
    const newAnswers = currentAnswers.includes(option)
      ? currentAnswers.filter((a: string) => a !== option)
      : [...currentAnswers, option];
    
    setAnswers({ ...answers, [currentStep]: newAnswers });
  };

  const handleTextAnswer = (value: string) => {
    setAnswers({ ...answers, [currentStep]: value });
  };

  const handleNext = () => {
    if (currentStep < quizSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    // Convert work_environment array to comma-separated string
    const workEnvArray = answers[3] || [];
    const workEnvironment = Array.isArray(workEnvArray) 
      ? workEnvArray.join(", ") 
      : (typeof workEnvArray === "string" ? workEnvArray : "");

    const quizData = {
      interests: answers[0] || [],
      preferred_subjects: answers[1] || [],
      career_goals: answers[2] || "",
      work_environment: workEnvironment || undefined,
    };

    if (!quizData.interests.length || !quizData.preferred_subjects.length) {
      toast({
        title: "Incomplete quiz",
        description: "Please answer all questions before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await careerApi.quiz(quizData);
      toast({
        title: "Quiz Completed!",
        description: "Generating your personalized career recommendations...",
      });
      
      setTimeout(() => {
        navigate("/career");
      }, 1000);
    } catch (error) {
      toast({
        title: "Submission failed",
        description: error instanceof Error ? error.message : "Failed to submit quiz",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepValid = () => {
    const answer = answers[currentStep];
    if (currentQuestion.type === "multi-select") {
      return answer && answer.length >= (currentStep === 0 ? 3 : 1);
    }
    if (currentQuestion.type === "text") {
      return answer && answer.trim().length > 20;
    }
    return false;
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/career">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Career Discovery Quiz</h1>
            <p className="text-muted-foreground mt-1">
              Answer a few questions to get personalized career recommendations
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Step {currentStep + 1} of {quizSteps.length}
            </span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} />
        </div>

        {/* Question Card */}
        <Card>
          <CardHeader>
            <CardTitle>{currentQuestion.title}</CardTitle>
            <CardDescription>{currentQuestion.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentQuestion.type === "multi-select" && (
              <div className="grid gap-3 md:grid-cols-2">
                {currentQuestion.options?.map((option) => (
                  <div
                    key={option}
                    className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => handleMultiSelect(option)}
                  >
                    <Checkbox
                      checked={(answers[currentStep] || []).includes(option)}
                      onCheckedChange={() => handleMultiSelect(option)}
                    />
                    <label className="flex-1 cursor-pointer">{option}</label>
                  </div>
                ))}
              </div>
            )}

            {currentQuestion.type === "text" && (
              <Textarea
                placeholder={currentQuestion.placeholder}
                value={answers[currentStep] || ""}
                onChange={(e) => handleTextAnswer(e.target.value)}
                rows={6}
                className="resize-none"
              />
            )}

            {currentQuestion.type === "text" && (
              <p className="text-sm text-muted-foreground">
                {(answers[currentStep] || "").length} / 20 characters minimum
              </p>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <Button
            onClick={handleNext}
            disabled={!isStepValid() || isSubmitting}
          >
            {isSubmitting ? (
              <>Generating...</>
            ) : currentStep === quizSteps.length - 1 ? (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Get Recommendations
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CareerQuiz;
