import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, TrendingUp, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { performanceApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface PerformancePrediction {
  subject: string;
  current_grade?: string;
  current_gpa?: number;
  predicted_next_grade?: string;
  predicted_grade?: string;
  predicted_gpa?: number;
  confidence?: number;
  factors?: string[];
}

const PerformancePredictions = () => {
  const { toast } = useToast();
  const [predictions, setPredictions] = useState<PerformancePrediction[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPredictions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await performanceApi.getPredictions();
      setPredictions((data as PerformancePrediction[]) || []);
    } catch (error) {
      toast({
        title: "Error loading predictions",
        description: error instanceof Error ? error.message : "Failed to load performance predictions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadPredictions();
  }, [loadPredictions]);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-success";
    if (confidence >= 60) return "text-warning";
    return "text-destructive";
  };

  const getChangeIndicator = (current: number, predicted: number) => {
    if (predicted > current) return <TrendingUp className="w-4 h-4 text-success" />;
    if (predicted < current) return <AlertCircle className="w-4 h-4 text-destructive" />;
    return <CheckCircle className="w-4 h-4 text-muted-foreground" />;
  };

  // Convert grade strings to numeric values for chart
  const gradeToNumeric = (grade: string | number): number => {
    if (typeof grade === 'number') return grade;
    const gradeMap: Record<string, number> = {
      'A': 12, 'A-': 11, 'B+': 10, 'B': 9, 'B-': 8,
      'C+': 7, 'C': 6, 'C-': 5, 'D+': 4, 'D': 3, 'D-': 2, 'E': 1
    };
    return gradeMap[grade.toUpperCase()] || 0;
  };

  const chartData = predictions.map((pred: PerformancePrediction) => {
    const currentNumeric = typeof pred.current_grade === 'string' 
      ? gradeToNumeric(pred.current_grade) 
      : (pred.current_gpa || 0);
    const predictedNumeric = typeof pred.predicted_next_grade === 'string'
      ? gradeToNumeric(pred.predicted_next_grade)
      : (pred.predicted_gpa || 0);
    
    return {
      subject: pred.subject,
      current: currentNumeric,
      predicted: predictedNumeric,
    };
  });

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Link to="/performance">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Performance Predictions</h1>
              <p className="text-muted-foreground mt-1">
                AI-powered predictions for next term
              </p>
            </div>
          </div>
        </div>

        {/* Comparison Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Current vs Predicted GPA</CardTitle>
            <CardDescription>
              Compare your current grades with AI predictions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="subject" className="text-xs" />
                <YAxis domain={[0, 12]} className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="current" fill="hsl(var(--primary))" name="Current GPA" />
                <Bar dataKey="predicted" fill="hsl(var(--accent))" name="Predicted GPA" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Predictions Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Detailed Predictions</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : predictions.length === 0 ? (
              <Card className="py-12">
                <CardContent className="text-center space-y-4">
                  <h3 className="text-lg font-semibold">No predictions yet</h3>
                  <p className="text-muted-foreground">
                    Upload more reports to get performance predictions
                  </p>
                </CardContent>
              </Card>
            ) : (
              predictions.map((prediction: PerformancePrediction) => (
              <Card key={prediction.subject} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle>{prediction.subject}</CardTitle>
                    {getChangeIndicator(prediction.current_gpa || 0, prediction.predicted_gpa || 0)}
                  </div>
                  <CardDescription>Next term prediction</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Current</p>
                      <p className="text-2xl font-bold text-foreground">
                        {prediction.current_grade || prediction.current_gpa || "N/A"}
                      </p>
                    </div>
                    <div className="text-center px-4">
                      <p className="text-muted-foreground">→</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Predicted</p>
                      <p className="text-2xl font-bold text-primary">
                        {prediction.predicted_next_grade || prediction.predicted_grade || prediction.predicted_gpa || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Confidence Level</span>
                      <span className={`font-medium ${getConfidenceColor((prediction.confidence || 0) * 100)}`}>
                        {Math.round((prediction.confidence || 0) * 100)}%
                      </span>
                    </div>
                    <Progress value={(prediction.confidence || 0) * 100} />
                  </div>

                  {prediction.factors && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Key Factors:</p>
                      <div className="space-y-1">
                        {(Array.isArray(prediction.factors) ? prediction.factors : [prediction.factors]).map((factor: string, index: number) => (
                          <div key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="text-primary mt-1">•</span>
                            <span>{factor}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PerformancePredictions;
