import { Link, useParams } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Share2, Check, Lightbulb } from "lucide-react";

const mockInsightDetail = {
  id: "1",
  type: "Feedback",
  title: "Excellent Progress in Mathematics",
  content: "Your consistent performance in Mathematics is outstanding! You've maintained an A grade for three consecutive terms. This demonstrates not only your strong grasp of mathematical concepts but also your dedication to regular practice and study.",
  timestamp: "2024-01-15T10:30:00",
  metadata: {
    subject: "Mathematics",
    relatedReport: "Term 3 2024",
    confidence: 95,
  },
  recommendations: [
    "Continue with your current study schedule",
    "Consider exploring advanced topics like calculus",
    "Help peers who might be struggling with basic concepts",
    "Participate in mathematics competitions",
  ],
  relatedInsights: [
    { id: "2", title: "Study Technique for Chemistry", type: "Tips" },
    { id: "3", title: "Performance Trend Analysis", type: "Analysis" },
  ],
};

const InsightDetail = () => {
  const { id } = useParams();

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "feedback":
        return "bg-primary/10 text-primary";
      case "tips":
        return "bg-accent/10 text-accent";
      case "analysis":
        return "bg-success/10 text-success";
      case "recommendations":
        return "bg-warning/10 text-warning";
      case "motivation":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Link to="/insights">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className={getTypeColor(mockInsightDetail.type)} variant="outline">
                  {mockInsightDetail.type}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {new Date(mockInsightDetail.timestamp).toLocaleString()}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-foreground">
                {mockInsightDetail.title}
              </h1>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Check className="w-4 h-4 mr-2" />
              Mark Read
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-primary" />
              Insight Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-foreground leading-relaxed text-lg">
              {mockInsightDetail.content}
            </p>

            {mockInsightDetail.metadata && (
              <>
                <Separator />
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Subject</p>
                    <p className="font-semibold">{mockInsightDetail.metadata.subject}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Related Report</p>
                    <p className="font-semibold">{mockInsightDetail.metadata.relatedReport}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Confidence</p>
                    <p className="font-semibold text-success">
                      {mockInsightDetail.metadata.confidence}%
                    </p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Recommendations */}
        {mockInsightDetail.recommendations && (
          <Card>
            <CardHeader>
              <CardTitle>Recommended Actions</CardTitle>
              <CardDescription>
                Steps you can take based on this insight
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {mockInsightDetail.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Badge className="mt-1 bg-primary/20 text-primary">
                      {index + 1}
                    </Badge>
                    <span className="text-foreground">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Related Insights */}
        {mockInsightDetail.relatedInsights && mockInsightDetail.relatedInsights.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Related Insights</CardTitle>
              <CardDescription>
                You might also be interested in these
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {mockInsightDetail.relatedInsights.map((related) => (
                <Link key={related.id} to={`/insights/${related.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Badge className={getTypeColor(related.type)} variant="outline">
                        {related.type}
                      </Badge>
                      <span className="font-medium">{related.title}</span>
                    </div>
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default InsightDetail;
