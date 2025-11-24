import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  TrendingUp,
  Award,
  BookOpen,
  Upload,
  Brain,
  Compass,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { performanceApi, reportsApi, insightsApi, getCurrentUser } from "@/lib/api";
import { getCurrentUser as getAuthUser } from "@/lib/auth";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [insights, setInsights] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardData, reportsData, userData, insightsData] = await Promise.all([
        performanceApi.getDashboard().catch(() => null),
        reportsApi.getHistory(5).catch(() => []),
        getAuthUser().catch(() => null),
        insightsApi.getLearningTips(3).catch(() => []),
      ]);

      setDashboard(dashboardData);
      setReports(reportsData || []);
      setUser(userData);
      setInsights(insightsData || []);
    } catch (error) {
      toast({
        title: "Error loading dashboard",
        description: error instanceof Error ? error.message : "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user?.full_name || "Student"}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's an overview of your academic performance
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Overall GPA
              </CardTitle>
              <Award className="w-4 h-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {loading ? "..." : dashboard?.overall_gpa?.toFixed(2) || "0.00"}
              </div>
              <div className="flex items-center text-sm text-success mt-1">
                {dashboard?.overall_gpa && dashboard.overall_gpa > 0 && (
                  <>
                    <ArrowUpRight className="w-4 h-4 mr-1" />
                    <span>Current GPA</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Subjects
              </CardTitle>
              <BookOpen className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {loading ? "..." : dashboard?.total_subjects || 0}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Active this term</p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Strong Subjects
              </CardTitle>
              <TrendingUp className="w-4 h-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {loading ? "..." : dashboard?.strong_subjects?.length || 0}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Performing well</p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Weak Subjects
              </CardTitle>
              <ArrowDownRight className="w-4 h-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {loading ? "..." : dashboard?.weak_subjects?.length || 0}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Need attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Reports */}
          <Card className="lg:col-span-2 border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Recent Reports</CardTitle>
                <Button variant="ghost" size="sm" className="text-primary">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : reports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No reports yet. Upload your first report to get started.
                </div>
              ) : (
                reports.map((report: any) => (
                  <div
                    key={report.report_id}
                    onClick={() => navigate(`/reports/${report.report_id}`)}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">
                          {report.term} {report.year}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {Object.keys(report.grades_json || {}).length} subjects
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-foreground">
                        {report.overall_gpa?.toFixed(1) || "0.0"}
                      </div>
                      <Badge variant="default" className="mt-1">GPA</Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-start h-auto py-4" 
                variant="outline"
                onClick={() => navigate("/reports/upload")}
              >
                <Upload className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-semibold">Upload Report</div>
                  <div className="text-xs text-muted-foreground">Add your latest grades</div>
                </div>
              </Button>
              <Button 
                className="w-full justify-start h-auto py-4" 
                variant="outline"
                onClick={() => navigate("/flashcards/generate")}
              >
                <Brain className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-semibold">Generate Flashcards</div>
                  <div className="text-xs text-muted-foreground">Study smarter</div>
                </div>
              </Button>
              <Button 
                className="w-full justify-start h-auto py-4" 
                variant="outline"
                onClick={() => navigate("/career")}
              >
                <Compass className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-semibold">Career Recommendations</div>
                  <div className="text-xs text-muted-foreground">Explore your future</div>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Performance Trend & Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Subject Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : dashboard?.strong_subjects?.length > 0 ? (
                dashboard.strong_subjects.slice(0, 5).map((subject: any) => (
                  <div key={subject.performance_id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">{subject.subject}</span>
                      <Badge variant="outline">{subject.current_grade || "N/A"}</Badge>
                    </div>
                    <Progress value={subject.strength_score} className="h-2" />
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No subject data available
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Recent Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : insights.length > 0 ? (
                insights.slice(0, 3).map((insight: any) => (
                  <div
                    key={insight.insight_id}
                    onClick={() => navigate(`/insights/${insight.insight_id}`)}
                    className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <Badge className={cn("mb-2", "bg-primary/10 text-primary")}>
                      {insight.insight_type || "Tip"}
                    </Badge>
                    <p className="text-sm text-foreground">{insight.content || insight.title}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No insights available yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
